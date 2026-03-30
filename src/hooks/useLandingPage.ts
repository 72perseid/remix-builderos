import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProjectContext } from '@/contexts/ProjectContext';
import { toast } from 'sonner';

export interface LandingPage {
  id: string;
  user_id: string;
  app_idea_id: string;
  slug: string;
  headline: string | null;
  subheadline: string | null;
  features: { title: string; description: string }[];
  cta_text: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  is_published: boolean;
  hero_image_url: string | null;
  problem_statement: string | null;
  target_audience: string | null;
  social_proof_text: string | null;
  how_it_works: { step: string; description: string }[];
  value_proposition: string | null;
  theme: string | null;
  created_at: string;
  updated_at: string;
}

export interface LandingPageSignup {
  id: string;
  landing_page_id: string;
  email: string;
  name: string | null;
  created_at: string;
}

function generateSlug(appName: string): string {
  return appName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 8);
}

export function useLandingPage() {
  const { user } = useAuth();
  const { selectedAppId, selectedApp } = useProjectContext();
  const queryClient = useQueryClient();

  const landingPageQuery = useQuery({
    queryKey: ['landing-page', user?.id, selectedAppId],
    queryFn: async () => {
      if (!user?.id || !selectedAppId) return null;
      const { data, error } = await (supabase as any)
        .from('landing_pages')
        .select('*')
        .eq('user_id', user.id)
        .eq('app_idea_id', selectedAppId)
        .maybeSingle();
      if (error) throw error;
      return data as LandingPage | null;
    },
    enabled: !!user?.id && !!selectedAppId,
  });

  const signupsQuery = useQuery({
    queryKey: ['landing-page-signups', landingPageQuery.data?.id],
    queryFn: async () => {
      if (!landingPageQuery.data?.id) return [];
      const { data, error } = await (supabase as any)
        .from('landing_page_signups')
        .select('*')
        .eq('landing_page_id', landingPageQuery.data.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as LandingPageSignup[];
    },
    enabled: !!landingPageQuery.data?.id,
  });

  const generateMutation = useMutation({
    mutationFn: async (content: {
      headline: string;
      subheadline: string;
      features: { title: string; description: string }[];
      cta_text: string;
      primary_color: string;
      secondary_color: string;
      hero_image_url?: string;
      problem_statement?: string;
      target_audience?: string;
      social_proof_text?: string;
      how_it_works?: { step: string; description: string }[];
      value_proposition?: string;
      theme?: string;
    }) => {
      if (!user?.id || !selectedAppId || !selectedApp) throw new Error('Missing context');

      const slug = generateSlug(selectedApp.app_name || 'app');
      
      const payload = {
        user_id: user.id,
        app_idea_id: selectedAppId,
        slug,
        headline: content.headline,
        subheadline: content.subheadline,
        features: content.features,
        cta_text: content.cta_text,
        primary_color: content.primary_color,
        secondary_color: content.secondary_color,
        logo_url: selectedApp.logo || null,
        is_published: false,
        hero_image_url: content.hero_image_url || null,
        problem_statement: content.problem_statement || null,
        target_audience: content.target_audience || null,
        social_proof_text: content.social_proof_text || null,
        how_it_works: content.how_it_works || [],
        value_proposition: content.value_proposition || null,
      };

      const existing = landingPageQuery.data;
      if (existing) {
        const { data, error } = await (supabase as any)
          .from('landing_pages')
          .update({ ...payload, slug: existing.slug })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data as LandingPage;
      } else {
        const { data, error } = await (supabase as any)
          .from('landing_pages')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data as LandingPage;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-page'] });
      toast.success('Landing page generated!');
    },
    onError: (err: any) => {
      toast.error('Failed to generate: ' + err.message);
    },
  });

  const togglePublish = useMutation({
    mutationFn: async (published: boolean) => {
      if (!landingPageQuery.data?.id) throw new Error('No landing page');
      const { error } = await (supabase as any)
        .from('landing_pages')
        .update({ is_published: published })
        .eq('id', landingPageQuery.data.id);
      if (error) throw error;
    },
    onSuccess: (_, published) => {
      queryClient.invalidateQueries({ queryKey: ['landing-page'] });
      toast.success(published ? 'Landing page published!' : 'Landing page unpublished');
    },
  });

  return {
    landingPage: landingPageQuery.data,
    loading: landingPageQuery.isLoading,
    signups: signupsQuery.data || [],
    signupsLoading: signupsQuery.isLoading,
    generate: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
    togglePublish: togglePublish.mutateAsync,
    refetch: landingPageQuery.refetch,
  };
}

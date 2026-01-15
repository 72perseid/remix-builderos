import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type AppIdea = Tables<'app_ideas'>;

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [appIdeas, setAppIdeas] = useState<AppIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchAppIdeas = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('app_ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching app ideas:', error);
      } else {
        setAppIdeas(data || []);
      }
    } catch (error) {
      console.error('Error fetching app ideas:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
      fetchAppIdeas();
    }
  }, [user?.id, fetchProfile, fetchAppIdeas]);

  const uploadProfileImage = useCallback(async (file: File) => {
    if (!user?.id) return { error: 'Not authenticated' };

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Delete existing avatar if any
      await supabase.storage.from('avatars').remove([filePath]);

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { error: uploadError.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update profile with new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        return { error: updateError.message };
      }

      setProfile(prev => prev ? { ...prev, profile_image: publicUrl } : null);
      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Upload exception:', error);
      return { error: 'Failed to upload image' };
    } finally {
      setUploading(false);
    }
  }, [user?.id]);

  const deleteProfileImage = useCallback(async () => {
    if (!user?.id || !profile?.profile_image) return { error: 'No image to delete' };

    setUploading(true);
    try {
      // Extract file path from URL
      const url = new URL(profile.profile_image);
      const pathParts = url.pathname.split('/avatars/');
      if (pathParts.length > 1) {
        const filePath = pathParts[1];
        await supabase.storage.from('avatars').remove([filePath]);
      }

      // Update profile to remove image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image: null, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        return { error: updateError.message };
      }

      setProfile(prev => prev ? { ...prev, profile_image: null } : null);
      return { success: true };
    } catch (error) {
      console.error('Delete exception:', error);
      return { error: 'Failed to delete image' };
    } finally {
      setUploading(false);
    }
  }, [user?.id, profile?.profile_image]);

  return {
    profile,
    appIdeas,
    loading,
    uploading,
    uploadProfileImage,
    deleteProfileImage,
    refreshProfile: fetchProfile,
    refreshAppIdeas: fetchAppIdeas,
  };
}

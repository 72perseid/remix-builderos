import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import type { LandingPage } from '@/hooks/useLandingPage';

export default function PublicLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data: page, isLoading, error } = useQuery({
    queryKey: ['public-landing-page', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await (supabase as any)
        .from('landing_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();
      if (error) throw error;
      return data as LandingPage | null;
    },
    enabled: !!slug,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !page) return;

    setSubmitting(true);
    try {
      const { error } = await (supabase as any)
        .from('landing_page_signups')
        .insert({
          landing_page_id: page.id,
          email: email.trim(),
          name: name.trim() || null,
        });
      if (error) throw error;
      setSubmitted(true);
      toast.success('Thanks for signing up!');
    } catch (err: any) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!page || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <Rocket className="w-12 h-12 mx-auto mb-4 text-slate-500" />
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-slate-400">This landing page doesn't exist or isn't published yet.</p>
        </div>
      </div>
    );
  }

  const features = Array.isArray(page.features) ? page.features : [];
  const primaryColor = page.primary_color || '#3B82F6';
  const bgColor = page.secondary_color || '#0F172A';

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        {page.logo_url && (
          <img src={page.logo_url} alt="Logo" className="w-16 h-16 mx-auto mb-8 rounded-xl object-cover" />
        )}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {page.headline}
        </h1>
        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10">
          {page.subheadline}
        </p>

        {/* Signup Form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2"
              style={{ focusRingColor: primaryColor } as any}
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-8 py-3 rounded-lg font-semibold text-white text-lg transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              {submitting ? 'Submitting...' : (page.cta_text || 'Join the Waitlist')}
            </button>
          </form>
        ) : (
          <div className="max-w-md mx-auto bg-white/10 rounded-xl p-8 border border-white/20">
            <Check className="w-12 h-12 mx-auto mb-4 text-green-400" />
            <h2 className="text-xl font-semibold text-white mb-2">You're on the list!</h2>
            <p className="text-white/60">We'll notify you when we launch.</p>
          </div>
        )}
      </div>

      {/* Features */}
      {features.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-white/60 text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center pb-8">
        <p className="text-white/30 text-xs">
          Built with BuilderOS
        </p>
      </div>
    </div>
  );
}

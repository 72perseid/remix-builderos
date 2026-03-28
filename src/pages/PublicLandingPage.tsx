import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, Rocket, ArrowRight, Zap, Target, Users, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import type { LandingPage } from '@/hooks/useLandingPage';

function SignupForm({ page, compact = false }: { page: LandingPage; compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const primaryColor = page.primary_color || '#3B82F6';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
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
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white/10 rounded-2xl p-8 border border-white/20 text-center max-w-md mx-auto">
        <Check className="w-12 h-12 mx-auto mb-4 text-green-400" />
        <h3 className="text-xl font-semibold text-white mb-2">You're on the list!</h3>
        <p className="text-white/60">We'll notify you when we launch.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${compact ? 'max-w-lg mx-auto' : 'max-w-md mx-auto'}`}>
      {!compact && (
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
        />
      )}
      <div className={compact ? 'flex gap-3' : 'space-y-3'}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full px-8 py-3 rounded-xl font-semibold text-white text-base transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 shadow-lg"
          style={{
            backgroundColor: primaryColor,
            boxShadow: `0 8px 32px ${primaryColor}40`,
            ...(compact ? { width: 'auto', whiteSpace: 'nowrap' as const } : {}),
          }}
        >
          {submitting ? 'Submitting...' : (page.cta_text || 'Join the Waitlist')}
        </button>
      </div>
    </form>
  );
}

export default function PublicLandingPage() {
  const { slug } = useParams<{ slug: string }>();

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
  const howItWorks = Array.isArray(page.how_it_works) ? page.how_it_works : [];
  const primaryColor = page.primary_color || '#3B82F6';
  const bgColor = page.secondary_color || '#0F172A';

  // Lighter variation for alternating sections
  const sectionBgAlt = `${bgColor}CC`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor }}>
      {/* Nav */}
      <nav className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50" style={{ backgroundColor: `${bgColor}E6` }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {page.logo_url && (
              <img src={page.logo_url} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
            )}
            <span className="text-white font-semibold text-lg">{page.headline?.split(' ').slice(0, 3).join(' ') || 'App'}</span>
          </div>
          <a
            href="#signup"
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            {page.cta_text || 'Get Started'}
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, ${primaryColor}30 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, ${primaryColor}15 0%, transparent 50%)`,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24">
          <div className={`grid ${page.hero_image_url ? 'lg:grid-cols-2' : ''} gap-12 items-center`}>
            <div className={page.hero_image_url ? '' : 'text-center max-w-3xl mx-auto'}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
                {page.headline}
              </h1>
              <p className="text-lg md:text-xl text-white/65 mb-8 leading-relaxed max-w-xl">
                {page.subheadline}
              </p>
              <div id="signup">
                <SignupForm page={page} />
              </div>
              {page.social_proof_text && (
                <p className="mt-6 text-sm text-white/40 flex items-center gap-2 justify-center lg:justify-start">
                  <Users className="w-4 h-4" />
                  {page.social_proof_text}
                </p>
              )}
            </div>
            {page.hero_image_url && (
              <div className="relative">
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-white/5 p-1">
                  <div className="flex items-center gap-1.5 px-3 py-2 bg-white/5 rounded-t-xl">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                  </div>
                  <img
                    src={page.hero_image_url}
                    alt="Product preview"
                    className="w-full rounded-b-xl object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      {page.problem_statement && (
        <section className="py-20 border-t border-white/5" style={{ backgroundColor: sectionBgAlt }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-6">
              <Target className="w-4 h-4" />
              The Problem
            </div>
            <p className="text-2xl md:text-3xl font-semibold text-white leading-relaxed mb-6">
              {page.problem_statement}
            </p>
            {page.target_audience && (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm">
                <Users className="w-4 h-4 text-white/40" />
                Built for <span className="text-white font-medium">{page.target_audience}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Value Proposition / Solution */}
      {page.value_proposition && (
        <section className="py-20 border-t border-white/5">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              The Solution
            </div>
            <p className="text-2xl md:text-3xl font-semibold text-white leading-relaxed">
              {page.value_proposition}
            </p>
          </div>
        </section>
      )}

      {/* How It Works */}
      {howItWorks.length > 0 && (
        <section className="py-20 border-t border-white/5" style={{ backgroundColor: sectionBgAlt }}>
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-white text-center mb-14">How It Works</h2>
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent hidden md:block" style={{ left: '23px' }} />
              <div className="space-y-8">
                {howItWorks.map((item, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <div
                      className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg shrink-0 shadow-lg"
                      style={{ backgroundColor: primaryColor, boxShadow: `0 4px 20px ${primaryColor}40` }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 bg-white/5 rounded-xl p-5 border border-white/10 hover:border-white/20 transition-colors">
                      <h3 className="text-lg font-semibold text-white mb-1">{item.step}</h3>
                      <p className="text-white/55 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      {features.length > 0 && (
        <section className="py-20 border-t border-white/5">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-white text-center mb-4">Features</h2>
            <p className="text-white/50 text-center mb-14 max-w-2xl mx-auto">Everything you need, nothing you don't.</p>
            <div className={`grid gap-6 ${features.length <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
              {features.map((f, i) => (
                <div
                  key={i}
                  className="group bg-white/[0.04] rounded-2xl p-6 border border-white/10 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <Zap className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-24 border-t border-white/5" style={{ backgroundColor: sectionBgAlt }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-white/50 mb-10 text-lg">
            Join the waitlist and be the first to know when we launch.
          </p>
          <SignupForm page={page} compact />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {page.logo_url && <img src={page.logo_url} alt="" className="w-5 h-5 rounded object-cover" />}
            <span className="text-white/30 text-sm">
              {page.headline?.split(' ').slice(0, 3).join(' ') || 'App'}
            </span>
          </div>
          <p className="text-white/20 text-xs">
            Built with BuilderOS
          </p>
        </div>
      </footer>
    </div>
  );
}

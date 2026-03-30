import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, Rocket, Zap, Target, Users, Shield, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { LandingPage } from '@/hooks/useLandingPage';
import { landingThemes, type LandingThemeId, type LandingThemeConfig } from '@/lib/landingPageThemes';

function SignupForm({ page, compact = false, theme }: { page: LandingPage; compact?: boolean; theme: LandingThemeConfig }) {
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
      <div className="p-8 text-center max-w-md mx-auto" style={{
        backgroundColor: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: theme.cardRadius,
      }}>
        <Check className="w-12 h-12 mx-auto mb-4" style={{ color: '#22C55E' }} />
        <h3 className="text-xl font-semibold mb-2" style={{ color: theme.textColor }}>You're on the list!</h3>
        <p style={{ color: theme.textMuted }}>We'll notify you when we launch.</p>
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
          className="w-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-current/30 transition-all"
          style={{
            backgroundColor: theme.inputBg,
            border: `1px solid ${theme.inputBorder}`,
            borderRadius: theme.buttonRadius,
            color: theme.inputText,
          }}
        />
      )}
      <div className={compact ? 'flex gap-3' : 'space-y-3'}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="flex-1 w-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-current/30 transition-all"
          style={{
            backgroundColor: theme.inputBg,
            border: `1px solid ${theme.inputBorder}`,
            borderRadius: theme.buttonRadius,
            color: theme.inputText,
          }}
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full px-8 py-3 font-semibold text-white text-base transition-all hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 shadow-lg"
          style={{
            backgroundColor: primaryColor,
            borderRadius: theme.buttonRadius,
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

  const themeId = ((page as any).theme as LandingThemeId) || 'modern';
  const theme = landingThemes[themeId] || landingThemes.modern;
  const features = Array.isArray(page.features) ? page.features : [];
  const howItWorks = Array.isArray(page.how_it_works) ? page.how_it_works : [];
  const primaryColor = page.primary_color || '#3B82F6';

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.bgColor }}>
      {/* Nav */}
      <nav className="border-b backdrop-blur-sm sticky top-0 z-50" style={{ backgroundColor: theme.navBg, borderColor: theme.footerBorder }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {page.logo_url && (
              <img src={page.logo_url} alt="Logo" className="w-8 h-8 object-cover" style={{ borderRadius: theme.borderRadius }} />
            )}
            <span className="font-semibold text-lg" style={{ color: theme.textColor }}>
              {page.headline?.split(' ').slice(0, 3).join(' ') || 'App'}
            </span>
          </div>
          <a
            href="#signup"
            className="px-5 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor, borderRadius: theme.buttonRadius }}
          >
            {page.cta_text || 'Get Started'}
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: theme.heroGradient(primaryColor) }}
        />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24">
          <div className={`grid ${page.hero_image_url && theme.heroLayout === 'split' ? 'lg:grid-cols-2' : ''} gap-12 items-center`}>
            <div className={page.hero_image_url && theme.heroLayout === 'split' ? '' : 'text-center max-w-3xl mx-auto'}>
              <h1
                className={`text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight ${theme.headingClass}`}
                style={{ color: theme.textColor }}
              >
                {page.headline}
              </h1>
              <p
                className={`text-lg md:text-xl mb-8 leading-relaxed max-w-xl ${theme.bodyClass}`}
                style={{ color: theme.textMuted }}
              >
                {page.subheadline}
              </p>
              <div id="signup">
                <SignupForm page={page} theme={theme} />
              </div>
              {page.social_proof_text && (
                <p className="mt-6 text-sm flex items-center gap-2 justify-center lg:justify-start" style={{ color: theme.textMuted }}>
                  <Users className="w-4 h-4" />
                  {page.social_proof_text}
                </p>
              )}
            </div>
            {page.hero_image_url && theme.heroLayout === 'split' && (
              <div className="relative">
                <div className="overflow-hidden border shadow-2xl p-1" style={{
                  borderRadius: theme.cardRadius,
                  borderColor: theme.cardBorder,
                  backgroundColor: theme.cardBg,
                }}>
                  {!theme.isLight && (
                    <div className="flex items-center gap-1.5 px-3 py-2" style={{ backgroundColor: theme.cardBg, borderRadius: `${theme.cardRadius} ${theme.cardRadius} 0 0` }}>
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                    </div>
                  )}
                  <img
                    src={page.hero_image_url}
                    alt="Product preview"
                    className="w-full object-cover"
                    style={{ borderRadius: theme.isLight ? theme.cardRadius : `0 0 ${theme.cardRadius} ${theme.cardRadius}` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      {page.problem_statement && (
        <section className="py-20" style={{ backgroundColor: theme.sectionAltBg, borderTop: `1px solid ${theme.footerBorder}` }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium mb-6"
              style={{
                backgroundColor: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#EF4444',
                borderRadius: '9999px',
              }}
            >
              <Target className="w-4 h-4" />
              The Problem
            </div>
            <p className={`text-2xl md:text-3xl font-semibold leading-relaxed mb-6 ${theme.headingClass}`} style={{ color: theme.textColor }}>
              {page.problem_statement}
            </p>
            {page.target_audience && (
              <div
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm"
                style={{
                  backgroundColor: theme.badgeBg,
                  border: `1px solid ${theme.badgeBorder}`,
                  color: theme.textMuted,
                  borderRadius: theme.cardRadius,
                }}
              >
                <Users className="w-4 h-4" style={{ color: theme.textMuted }} />
                Built for <span className="font-medium" style={{ color: theme.textColor }}>{page.target_audience}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Value Proposition / Solution */}
      {page.value_proposition && (
        <section className="py-20" style={{ borderTop: `1px solid ${theme.footerBorder}` }}>
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium mb-6"
              style={{
                backgroundColor: 'rgba(34,197,94,0.1)',
                border: '1px solid rgba(34,197,94,0.2)',
                color: '#22C55E',
                borderRadius: '9999px',
              }}
            >
              <Zap className="w-4 h-4" />
              The Solution
            </div>
            <p className={`text-2xl md:text-3xl font-semibold leading-relaxed ${theme.headingClass}`} style={{ color: theme.textColor }}>
              {page.value_proposition}
            </p>
          </div>
        </section>
      )}

      {/* How It Works */}
      {howItWorks.length > 0 && (
        <section className="py-20" style={{ backgroundColor: theme.sectionAltBg, borderTop: `1px solid ${theme.footerBorder}` }}>
          <div className="max-w-4xl mx-auto px-6">
            <h2 className={`text-3xl text-center mb-14 ${theme.headingClass}`} style={{ color: theme.textColor }}>How It Works</h2>
            <div className="space-y-8">
              {howItWorks.map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div
                    className="relative z-10 w-12 h-12 flex items-center justify-center font-bold text-white text-lg shrink-0 shadow-lg"
                    style={{
                      backgroundColor: primaryColor,
                      boxShadow: `0 4px 20px ${primaryColor}40`,
                      borderRadius: theme.cardRadius,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div
                    className="flex-1 p-5 transition-colors"
                    style={{
                      backgroundColor: theme.cardBg,
                      border: `1px solid ${theme.cardBorder}`,
                      borderRadius: theme.cardRadius,
                    }}
                  >
                    <h3 className="text-lg font-semibold mb-1" style={{ color: theme.textColor }}>{item.step}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      {features.length > 0 && (
        <section className="py-20" style={{ borderTop: `1px solid ${theme.footerBorder}` }}>
          <div className="max-w-5xl mx-auto px-6">
            <h2 className={`text-3xl text-center mb-4 ${theme.headingClass}`} style={{ color: theme.textColor }}>Features</h2>
            <p className="text-center mb-14 max-w-2xl mx-auto" style={{ color: theme.textMuted }}>Everything you need, nothing you don't.</p>
            <div className={`grid gap-6 ${features.length <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
              {features.map((f, i) => (
                <div
                  key={i}
                  className="group p-6 transition-all duration-300"
                  style={{
                    backgroundColor: theme.cardBg,
                    border: `1px solid ${theme.cardBorder}`,
                    borderRadius: theme.cardRadius,
                  }}
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${primaryColor}20`, borderRadius: theme.cardRadius }}
                  >
                    {themeId === 'ecommerce' ? (
                      <Star className="w-5 h-5" style={{ color: primaryColor }} />
                    ) : (
                      <Zap className="w-5 h-5" style={{ color: primaryColor }} />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: theme.textColor }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: theme.textMuted }}>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust badges for ecommerce theme */}
      {themeId === 'ecommerce' && (
        <section className="py-12" style={{ backgroundColor: theme.sectionAltBg, borderTop: `1px solid ${theme.footerBorder}` }}>
          <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-8">
            {[
              { icon: Shield, text: 'Secure & Private' },
              { icon: Zap, text: 'Fast Setup' },
              { icon: Star, text: 'Trusted by Users' },
              { icon: Users, text: '24/7 Support' },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-2 text-sm" style={{ color: theme.textMuted }}>
                <Icon className="w-4 h-4" style={{ color: primaryColor }} />
                {text}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="py-24" style={{ backgroundColor: theme.sectionAltBg, borderTop: `1px solid ${theme.footerBorder}` }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className={`text-3xl md:text-4xl mb-4 ${theme.headingClass}`} style={{ color: theme.textColor }}>
            Ready to get started?
          </h2>
          <p className="mb-10 text-lg" style={{ color: theme.textMuted }}>
            Join the waitlist and be the first to know when we launch.
          </p>
          <SignupForm page={page} compact theme={theme} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8" style={{ borderTop: `1px solid ${theme.footerBorder}` }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {page.logo_url && <img src={page.logo_url} alt="" className="w-5 h-5 object-cover" style={{ borderRadius: '4px' }} />}
            <span className="text-sm" style={{ color: theme.textMuted }}>
              {page.headline?.split(' ').slice(0, 3).join(' ') || 'App'}
            </span>
          </div>
          <p className="text-xs" style={{ color: theme.textMuted, opacity: 0.5 }}>
            Built with BuilderOS
          </p>
        </div>
      </footer>
    </div>
  );
}

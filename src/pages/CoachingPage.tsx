import { useState } from 'react';
import { CheckCircle2, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { z } from 'zod';
import logoIcon from '@/assets/logo-icon.png';

const supportFeatures = [
  'Async expert reviews of your plans',
  'Technical architecture guidance',
  'Practical implementation help',
  'Priority Discord support channel',
  'Best practices & code review',
];

const dfyFeatures = [
  'Everything in Support Pack',
  'Dedicated build partner',
  'Full project setup & deployment',
  'Custom integrations & API work',
  'Launch-ready in weeks, not months',
];

const pricingTiers = [
  { hours: 10, price: 1000, originalPrice: null, label: '10 Hours', perHour: 100, discount: null, popular: false },
  { hours: 20, price: 1800, originalPrice: 2000, label: '20 Hours', perHour: 90, discount: '10% off', popular: true },
  { hours: 40, price: 3600, originalPrice: 4000, label: '40 Hours', perHour: 90, discount: '10% off', popular: false },
];

type View = 'plans' | 'pricing' | 'form';

const leadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Please enter a valid email').max(255),
  message: z.string().trim().max(1000).optional(),
});

export default function CoachingPage() {
  const { user } = useAuth();
  const [view, setView] = useState<View>('plans');
  const [selectedTier, setSelectedTier] = useState<typeof pricingTiers[0] | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSelectSupportPack = () => setView('pricing');
  const handleSelectTier = (tier: typeof pricingTiers[0]) => {
    setSelectedTier(tier);
    setView('form');
  };
  const handleBack = () => {
    if (view === 'form') setView('pricing');
    else if (view === 'pricing') setView('plans');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = leadSchema.safeParse({ name, email, message: message || undefined });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const { error } = await supabase.from('leads' as any).insert({
      user_id: user?.id,
      name: result.data.name,
      email: result.data.email,
      package: 'support_pack',
      hours: selectedTier?.hours,
      message: result.data.message || null,
    } as any);

    setSubmitting(false);
    if (error) {
      toast.error('Something went wrong. Please try again.');
    } else {
      toast.success("We've received your request! We'll be in touch soon.");
      setView('plans');
      setName('');
      setMessage('');
      setSelectedTier(null);
    }
  };

  // Slide direction
  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
  };

  const direction = view === 'plans' ? -1 : 1;

  return (
    <div className="h-dvh flex flex-col overflow-hidden relative" style={{
      background: 'linear-gradient(135deg, #0a0d13, #0d1a2e, #0a0d13, #0d1a2e)',
      backgroundSize: '400% 400%',
      animation: 'gradient-flow 30s ease infinite',
    }}>
      <style>{`@keyframes gradient-flow { 0% { background-position: 0% 0%; } 50% { background-position: 100% 100%; } 100% { background-position: 0% 0%; } }`}</style>
      {/* Header */}
      <div className="relative z-10 px-6 py-10 text-center space-y-3 shrink-0">
        <img src={logoIcon} alt="Ambitious Labs" className="w-14 h-14 mx-auto" />
        <h1 className="text-2xl font-bold text-white">Expert Support</h1>
        <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
          Whether you need guidance or a full build partner, we've got you covered.
        </p>
      </div>

      {/* Back button */}
      {view !== 'plans' && (
        <div className="relative z-10 px-6 mb-2">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      )}

      {/* Content area */}
      <div className="relative z-10 flex-1 overflow-auto px-6 pb-6">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ── Plans view ── */}
          {view === 'plans' && (
            <motion.div
              key="plans"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6"
            >
              {/* Support Pack */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeIn' }}
              >
                <Card
                  className="relative overflow-hidden rounded-2xl p-6 flex flex-col backdrop-blur-sm transition-shadow duration-300 cursor-pointer bg-white/[0.04] border-white/10 hover:shadow-[0_0_25px_rgba(148,163,184,0.1)] h-full"
                  onClick={handleSelectSupportPack}
                >
                  <div className="space-y-4 flex-1">
                    <div>
                      <h2 className="text-xl font-bold text-white">Support Pack</h2>
                      <p className="text-sm text-blue-400 font-medium mt-0.5">Guided help when you need it</p>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Get expert guidance to accelerate your build. Includes async reviews, technical Q&A, hourly building help and strategic advice.
                    </p>
                    <ul className="space-y-2.5">
                      {supportFeatures.map(f => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-slate-200">
                          <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button className="mt-6 w-full gap-2 bg-white/10 hover:bg-white/15 text-white">
                    Get Support
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Card>
              </motion.div>

              {/* Done For You */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: 'easeIn' }}
              >
                <Card
                  className="relative overflow-hidden rounded-2xl p-6 flex flex-col backdrop-blur-sm transition-shadow duration-300 bg-blue-500/[0.08] border-blue-400/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_35px_rgba(59,130,246,0.3)] h-full"
                >
                  <div className="absolute top-3 right-3 bg-primary/20 text-primary text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    Popular
                  </div>
                  <div className="space-y-4 flex-1">
                    <div>
                      <h2 className="text-xl font-bold text-white">Done For You</h2>
                      <p className="text-sm text-blue-400 font-medium mt-0.5">We build it with you</p>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Hand off the heavy lifting. Our team takes your validated idea and builds it end-to-end alongside you.
                    </p>
                    <ul className="space-y-2.5">
                      {dfyFeatures.map(f => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-slate-200">
                          <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    className="mt-6 w-full gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => window.open('https://calendly.com', '_blank')}
                  >
                    Talk to Us
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* ── Pricing tiers view ── */}
          {view === 'pricing' && (
            <motion.div
              key="pricing"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-lg font-semibold text-white text-center mb-6">Choose your Support Pack</h2>
              <div className="grid sm:grid-cols-3 gap-5">
                {pricingTiers.map((tier, i) => (
                  <motion.div
                    key={tier.hours}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeIn' }}
                  >
                    <Card
                      onClick={() => handleSelectTier(tier)}
                      className={`relative overflow-hidden rounded-2xl p-6 flex flex-col backdrop-blur-sm transition-shadow duration-300 cursor-pointer h-full ${
                        tier.popular
                          ? 'bg-blue-500/[0.08] border-blue-400/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_35px_rgba(59,130,246,0.3)]'
                          : 'bg-white/[0.04] border-white/10 hover:shadow-[0_0_25px_rgba(148,163,184,0.1)]'
                      }`}
                    >
                      {/* Badge area — always takes space for alignment */}
                      <div className="flex items-center gap-2 mb-1 min-h-[22px]">
                        {tier.discount && (
                          <span className="inline-block text-xs font-medium text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                            {tier.discount}
                          </span>
                        )}
                      </div>
                      {tier.popular && (
                        <div className="absolute top-3 right-3 bg-primary/20 text-primary text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                          Popular
                        </div>
                      )}
                      <div className="space-y-3 flex-1">
                        <h3 className="text-lg font-bold text-white">{tier.label}</h3>
                        <div className="min-h-[18px]">
                          {tier.originalPrice && (
                            <p className="text-xs text-slate-500 line-through">${tier.originalPrice.toLocaleString()} USD</p>
                          )}
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-bold text-white">${tier.price.toLocaleString()}</span>
                          <span className="text-sm text-slate-400">USD</span>
                        </div>
                      </div>
                      <Button
                        className={`mt-5 w-full gap-2 ${
                          tier.popular
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-white/10 hover:bg-white/15 text-white'
                        }`}
                      >
                        Select
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Lead form view ── */}
          {view === 'form' && (
            <motion.div
              key="form"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="max-w-md mx-auto"
            >
              <Card className="rounded-2xl p-6 bg-white/[0.04] border-white/10 backdrop-blur-sm">
                <h2 className="text-lg font-bold text-white mb-1">Almost there!</h2>
                <p className="text-sm text-slate-400 mb-5">
                  You selected <span className="text-blue-400 font-medium">{selectedTier?.label}</span> — ${selectedTier?.price.toLocaleString()} USD. Fill in your details and we'll reach out.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="lead-name" className="text-slate-400 text-sm">Name</Label>
                    <Input
                      id="lead-name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your name"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500"
                      disabled={submitting}
                    />
                    {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lead-email" className="text-slate-400 text-sm">Email</Label>
                    <Input
                      id="lead-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500"
                      disabled={submitting}
                    />
                    {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lead-message" className="text-slate-400 text-sm">Message (optional)</Label>
                    <Textarea
                      id="lead-message"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Tell us about your project..."
                      rows={3}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500 resize-none"
                      disabled={submitting}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white gap-2"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                    ) : (
                      <>Submit Request <ArrowRight className="h-4 w-4" /></>
                    )}
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

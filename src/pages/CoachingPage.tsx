import { useState } from 'react';
import { CheckCircle2, ArrowRight, ArrowLeft, Loader2, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  { hours: 10, price: 1000, displayPrice: '$1K', originalPrice: null, label: '10 Hours', perHour: 100, discount: null },
  { hours: 20, price: 1800, displayPrice: '$1.8K', originalPrice: '$2K', label: '20 Hours', perHour: 90, discount: '10% off' },
  { hours: 40, price: 3600, displayPrice: '$3.6K', originalPrice: '$4K', label: '40 Hours', perHour: 90, discount: '10% off' },
];

type View = 'plans' | 'form';

const leadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Please enter a valid email').max(255),
  message: z.string().trim().max(1000).optional(),
});

export default function CoachingPage() {
  const { user } = useAuth();
  const [view, setView] = useState<View>('plans');
  const [selectedTierIndex, setSelectedTierIndex] = useState(1); // default to 20 hours
  const [name, setName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedTier = pricingTiers[selectedTierIndex];

  const handleSelectSupportPack = () => {
    setView('form');
  };

  const handleBack = () => {
    setView('plans');
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
    }
  };

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
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Expert Support</h1>
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
              className="max-w-4xl mx-auto flex flex-col-reverse lg:grid lg:grid-cols-5 gap-6"
            >
              {/* Support Pack — 2 cols */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeIn' }}
                className="lg:col-span-2"
              >
                <Card
                  className="relative overflow-hidden rounded-2xl p-7 flex flex-col backdrop-blur-sm transition-shadow duration-300 cursor-pointer bg-white/[0.04] border-white/10 hover:shadow-[0_0_25px_rgba(148,163,184,0.1)] h-full"
                  onClick={handleSelectSupportPack}
                >
                  <div className="space-y-5 flex-1">
                    <div>
                      <h2 className="text-2xl font-extrabold text-white tracking-tight">Support Pack</h2>
                      <p className="text-sm text-blue-400 font-medium mt-1">Guided help when you need it</p>
                    </div>

                    {/* Inline pricing */}
                    <div className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-white">{selectedTier.displayPrice}</span>
                        <span className="text-sm text-slate-400">USD</span>
                      </div>
                      {selectedTier.originalPrice && (
                        <p className="text-xs text-slate-500 line-through -mt-1">{selectedTier.originalPrice} USD</p>
                      )}
                      <Select
                        value={String(selectedTierIndex)}
                        onValueChange={(val) => setSelectedTierIndex(Number(val))}
                      >
                        <SelectTrigger className="w-full bg-white/5 border-white/10 text-white text-sm h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {pricingTiers.map((tier, i) => (
                            <SelectItem key={tier.hours} value={String(i)}>
                              {tier.label}{tier.discount ? ` (${tier.discount})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      Get expert guidance to accelerate your build. Includes async reviews, technical Q&A, hourly building help and strategic advice.
                    </p>

                    <ul className="space-y-3">
                      {supportFeatures.map(f => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-slate-200">
                          <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button className="mt-8 w-full gap-2 bg-white/10 hover:bg-white/15 text-white">
                    Get Support
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Card>
              </motion.div>

              {/* Done For You — 3 cols */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: 'easeIn' }}
                className="lg:col-span-3"
              >
                <Card
                  className="relative overflow-hidden rounded-2xl p-8 flex flex-col backdrop-blur-sm transition-shadow duration-300 bg-blue-500/[0.08] border-blue-400/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:shadow-[0_0_35px_rgba(59,130,246,0.3)] h-full"
                >
                  <div className="absolute top-3 right-3 bg-primary/20 text-primary text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    Popular
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 md:gap-8 flex-1">
                    {/* Content */}
                    <div className="space-y-5 flex-1">
                      <div>
                        <h2 className="text-2xl font-extrabold text-white tracking-tight">Done For You</h2>
                        <p className="text-sm text-blue-400 font-medium mt-1">We build it with you</p>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-medium text-slate-400">From</span>
                        <span className="text-4xl font-extrabold text-white">$10k</span>
                        <span className="text-sm text-slate-400">USD</span>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        Hand off the heavy lifting. Our team takes your validated idea and builds it end-to-end alongside you.
                      </p>

                      <ul className="space-y-3">
                        {dfyFeatures.map(f => (
                          <li key={f} className="flex items-start gap-2.5 text-sm text-slate-200">
                            <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Logo area — right on desktop/tablet, below on mobile */}
                    <div className="flex items-end justify-center shrink-0 order-2 sm:order-last">
                      <div className="w-24 h-24 sm:w-36 sm:h-36 md:w-[180px] md:h-[180px] rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center p-4 sm:p-5">
                        <img src={logoIcon} alt="Ambitious Labs" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  </div>

                  <Button
                    className="mt-8 w-full gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => window.open('https://calendly.com', '_blank')}
                  >
                    Talk to Us
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Card>
              </motion.div>
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
                <h2 className="text-xl font-extrabold text-white mb-1">Almost there!</h2>
                <p className="text-sm text-slate-400 mb-5">
                  You selected <span className="text-blue-400 font-medium">{selectedTier?.label}</span> — {selectedTier?.displayPrice} USD. Fill in your details and we'll reach out.
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

import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import logoIcon from '@/assets/logo-icon.png';

const plans = [
  {
    name: 'Support Pack',
    tagline: 'Guided help when you need it',
    description: 'Get expert guidance to accelerate your build. Includes async reviews, technical Q&A, and strategic advice.',
    features: [
      'Async expert reviews of your artifacts',
      'Technical architecture guidance',
      'Weekly check-in session (30 min)',
      'Priority Discord support channel',
      'Best practices & code review',
    ],
    cta: 'Get Support',
    highlighted: false,
  },
  {
    name: 'Done For You',
    tagline: 'We build it with you',
    description: 'Hand off the heavy lifting. Our team takes your validated idea and builds it end-to-end alongside you.',
    features: [
      'Everything in Support Pack',
      'Dedicated build partner',
      'Full project setup & deployment',
      'Custom integrations & API work',
      'Launch-ready in weeks, not months',
    ],
    cta: 'Talk to Us',
    highlighted: true,
  },
];

export default function CoachingPage() {
  return (
    <div className="h-dvh flex flex-col overflow-hidden relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <div className="relative z-10 px-6 py-10 text-center space-y-3 shrink-0">
        <img src={logoIcon} alt="Ambitious Labs" className="w-14 h-14 mx-auto" />
        <h1 className="text-2xl font-bold text-white">Expert Support</h1>
        <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
          Whether you need guidance or a full build partner, we've got you covered.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="relative z-10 flex-1 overflow-auto px-6 pb-6">
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden rounded-2xl p-6 flex flex-col backdrop-blur-sm ${
                plan.highlighted
                  ? 'bg-white/[0.06] border-primary/30'
                  : 'bg-white/[0.04] border-white/10'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-3 right-3 bg-primary/20 text-primary text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  Popular
                </div>
              )}

              <div className="space-y-4 flex-1">
                <div>
                  <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                  <p className="text-sm text-blue-400 font-medium mt-0.5">{plan.tagline}</p>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed">
                  {plan.description}
                </p>

                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className={`mt-6 w-full gap-2 ${
                  plan.highlighted
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-white/10 hover:bg-white/15 text-white'
                }`}
                onClick={() => window.open('https://calendly.com', '_blank')}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

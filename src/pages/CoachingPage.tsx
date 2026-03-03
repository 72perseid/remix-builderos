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
    <div className="h-dvh flex flex-col overflow-hidden">
      {/* Hero section with auth-page style background */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-hidden shrink-0">
        {/* Background logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src={logoIcon} alt="" className="w-64 h-64 object-contain opacity-[0.07]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 px-6 py-12 text-center space-y-3">
          <img src={logoIcon} alt="Ambitious Labs" className="w-14 h-14 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Expert Support</h1>
          <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
            Whether you need guidance or a full build partner, we've got you covered.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="flex-1 overflow-auto p-6 bg-[#0B0E14]">
        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden rounded-2xl p-6 flex flex-col ${
                plan.highlighted
                  ? 'bg-primary/5 border-primary/30'
                  : 'bg-card border-border'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-3 right-3 bg-primary/20 text-primary text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  Popular
                </div>
              )}

              <div className="space-y-4 flex-1">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{plan.name}</h2>
                  <p className="text-sm text-primary font-medium mt-0.5">{plan.tagline}</p>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {plan.description}
                </p>

                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className={`mt-6 w-full gap-2 ${
                  plan.highlighted
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    : 'bg-muted/50 hover:bg-muted text-foreground'
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

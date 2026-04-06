import { useEffect, useState } from 'react';
import { ArrowRight, Globe, Wrench, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import logoIcon from '@/assets/logo-icon.png';

interface Coach {
  id: string;
  name: string;
  image: string;
  description: string;
  book_for: string;
  skills: string;
  languages: string;
  rate_per_hour: number;
  booking_url: string;
  proceed_to_payment: string;
}

function parseJsonArray(val: string | null): string[] {
  if (!val) return [];
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
}

export default function OneOnOneCoachingPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('coaches' as any)
      .select('*')
      .then(({ data, error }) => {
        if (!error && data) setCoaches(data as unknown as Coach[]);
        setLoading(false);
      });
  }, []);

  const handleBook = (coach: Coach) => {
    const paymentUrl = coach.proceed_to_payment?.trim();
    if (!paymentUrl) return;
    const successUrl = `${window.location.origin}/booking-success?booking_url=${encodeURIComponent(coach.booking_url)}`;
    const separator = paymentUrl.includes('?') ? '&' : '?';
    window.open(`${paymentUrl}${separator}success_url=${encodeURIComponent(successUrl)}`, '_blank');
  };

  return (
    <div
      className="min-h-dvh flex flex-col relative"
      style={{
        background: 'linear-gradient(135deg, #0a0d13, #0d1a2e, #0a0d13, #0d1a2e)',
        backgroundSize: '400% 400%',
        animation: 'gradient-flow 30s ease infinite',
      }}
    >
      <style>{`@keyframes gradient-flow { 0% { background-position: 0% 0%; } 50% { background-position: 100% 100%; } 100% { background-position: 0% 0%; } }`}</style>

      {/* Header */}
      <div className="relative z-10 px-6 py-10 text-center space-y-3 shrink-0">
        <img src={logoIcon} alt="Ambitious Labs" className="w-14 h-14 mx-auto" />
        <h1 className="text-3xl font-extrabold text-white tracking-tight">1‑on‑1 Coaching</h1>
        <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
          Book a private session with one of our expert coaches.
        </p>
      </div>

      {/* Grid */}
      <div className="relative z-10 flex-1 px-6 pb-10">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="rounded-2xl p-8 bg-white/[0.04] border-white/10 space-y-4">
                  <Skeleton className="w-28 h-28 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-2/3 mx-auto" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-10 w-full mt-4" />
                </Card>
              ))
            : coaches.map((coach, i) => {
                const bookFor = parseJsonArray(coach.book_for);
                const skills = parseJsonArray(coach.skills);
                const languages = parseJsonArray(coach.languages);

                return (
                  <motion.div
                    key={coach.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
                  >
                    <Card className="relative overflow-hidden rounded-2xl p-8 flex flex-col backdrop-blur-sm transition-shadow duration-300 bg-blue-500/[0.08] border-blue-400/30 hover:shadow-[0_0_35px_rgba(59,130,246,0.3)] h-full">
                      {/* Image */}
                      <div className="flex justify-center mb-5">
                        <img
                          src={coach.image}
                          alt={coach.name}
                          className="w-28 h-28 rounded-full object-cover border-2 border-blue-400/30"
                        />
                      </div>

                      {/* Name & description */}
                      <h2 className="text-2xl font-extrabold text-white tracking-tight text-center">
                        {coach.name}
                      </h2>
                      <p className="text-sm text-slate-300 mt-2 text-center leading-relaxed">
                        {coach.description}
                      </p>

                      {/* Book for */}
                      {bookFor.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                          {bookFor.map((item) => (
                            <Badge
                              key={item}
                              variant="secondary"
                              className="text-[10px] bg-blue-500/20 text-blue-300 border-blue-400/20"
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              {item}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Skills */}
                      {skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                          {skills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="text-[10px] text-slate-300 border-white/10"
                            >
                              <Wrench className="w-3 h-3 mr-1" />
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Languages */}
                      {languages.length > 0 && (
                        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                          <Globe className="w-3.5 h-3.5" />
                          {languages.join(' · ')}
                        </div>
                      )}

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* Price & CTA */}
                      <div className="mt-6 space-y-3">
                        <div className="text-center">
                          <span className="text-3xl font-extrabold text-white">${coach.rate_per_hour}</span>
                          <span className="text-sm text-slate-400 ml-1">/hr</span>
                        </div>
                        <Button
                          className="w-full gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() => handleBook(coach)}
                        >
                          Book Session
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import logoHorizontal from '@/assets/logo-horizontal.png';
import logoIcon from '@/assets/logo-icon.png';

const emailSchema = z.string().email('Please enter a valid email');

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const { error: resetError } = await forgotPassword(email);
      if (resetError) {
        toast.error(resetError.message);
        setError(resetError.message);
      } else {
        setSent(true);
        toast.success('Password reset link sent! Check your email.');
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT COLUMN */}
      <div className="bg-[#0B0E14] flex flex-col items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center">
            <img src={logoHorizontal} alt="Ambitious Labs" className="h-10" />
          </div>

          {sent ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <h1 className="text-2xl font-bold text-white">Check your email</h1>
              <p className="text-slate-400">
                We sent a password reset link to <span className="text-white">{email}</span>.
              </p>
              <Link to="/login" className="text-sm text-blue-500 hover:text-blue-400 mt-4">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">Reset your password</h1>
                <p className="text-slate-400">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-400 text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-12 rounded-lg pl-10 focus:border-blue-500 focus:ring-blue-500/20"
                      disabled={isLoading}
                    />
                  </div>
                  {error && <p className="text-sm text-red-400">{error}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Remember your password?{' '}
                  <span className="text-blue-500 hover:text-blue-400">Log In</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="hidden lg:block relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={logoIcon} alt="Ambitious Labs" className="w-80 h-80 object-contain opacity-90" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
        <div className="absolute bottom-12 left-12 z-10">
          <div className="space-y-1">
            <h2 className="text-5xl font-bold text-white">Learn.</h2>
            <h2 className="text-5xl font-bold text-white">Launch.</h2>
            <h2 className="text-5xl font-bold text-blue-500">Earn.</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

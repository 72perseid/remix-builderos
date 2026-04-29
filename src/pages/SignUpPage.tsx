import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, User } from 'lucide-react';
import { z } from 'zod';
import logoHorizontal from '@/assets/logo-horizontal.png';
import logoIcon from '@/assets/logo-icon.png';

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormErrors = { firstName?: string; lastName?: string; email?: string; password?: string };

export default function SignUpPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [justSignedUp, setJustSignedUp] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const { user, signUp, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const { data: onboardingProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['auth-onboarding-check', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('onboarded')
        .eq('id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id && isAuthenticated,
  });

  useEffect(() => {
    if (justSignedUp) return;
    if (!loading && !profileLoading && isAuthenticated && onboardingProfile !== undefined) {
      if (onboardingProfile?.onboarded === false) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/project-board', { replace: true });
      }
    }
  }, [isAuthenticated, loading, profileLoading, onboardingProfile, navigate, justSignedUp]);

  const validateForm = () => {
    try {
      signUpSchema.parse({ firstName, lastName, email, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof FormErrors;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const { error } = await signUp(email, password, { first_name: firstName, last_name: lastName });
      if (error) {
        toast.error(error.message.includes('already registered')
          ? 'This email is already registered. Please sign in instead.'
          : error.message);
      } else {
        toast.success('Check your email to confirm your account!');
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0E14]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT COLUMN */}
      <div className="bg-[#0B0E14] flex flex-col items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center">
            <img src={logoHorizontal} alt="Ambitious Labs" className="h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Create your account</h1>
            <p className="text-slate-400">Start building your app ideas today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-400 text-sm">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-12 rounded-lg pl-10 focus:border-blue-500 focus:ring-blue-500/20"
                    disabled={isLoading}
                  />
                </div>
                {errors.firstName && <p className="text-sm text-red-400">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-slate-400 text-sm">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-12 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                  disabled={isLoading}
                />
                {errors.lastName && <p className="text-sm text-red-400">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-400 text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-12 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                disabled={isLoading}
              />
              {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-400 text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-12 rounded-lg pr-12 focus:border-blue-500 focus:ring-blue-500/20"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-500 hover:text-white hover:bg-slate-700/50"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account…
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Already have an account?{' '}
              <span className="text-blue-500 hover:text-blue-400">Log In</span>
            </Link>
          </div>
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

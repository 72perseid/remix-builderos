import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, User, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import logoHorizontal from '@/assets/logo-horizontal.png';
import logoIcon from '@/assets/logo-icon.png';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type FormErrors = { firstName?: string; lastName?: string; email?: string; password?: string };
type AuthView = 'login' | 'signup' | 'forgot';

export default function AuthPage() {
  const [view, setView] = useState<AuthView>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const { signIn, signUp, forgotPassword, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/project-board', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const switchView = (nextView: AuthView) => {
    setView(nextView);
    setErrors({});
  };

  const validateForm = () => {
    try {
      if (view === 'signup') {
        signUpSchema.parse({ firstName, lastName, email, password });
      } else if (view === 'forgot') {
        forgotSchema.parse({ email });
      } else {
        loginSchema.parse({ email, password });
      }
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
      if (view === 'signup') {
        const { error } = await signUp(email, password, { first_name: firstName, last_name: lastName });
        if (error) {
          toast.error(error.message.includes('already registered')
            ? 'This email is already registered. Please sign in instead.'
            : error.message);
        } else {
          toast.success('Check your email to confirm your account!');
        }
      } else if (view === 'forgot') {
        const { error } = await forgotPassword(email);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Password reset link sent! Check your email.');
          switchView('login');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message.includes('Invalid login credentials')
            ? 'Invalid email or password. Please try again.'
            : error.message);
        } else {
          toast.success('Welcome back!');
          navigate('/', { replace: true });
        }
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

  const headings: Record<AuthView, { title: string; sub: string }> = {
    login:  { title: 'Log in to your account',    sub: 'Welcome back! Please enter your details.' },
    signup: { title: 'Create your account',        sub: 'Start building your app ideas today.' },
    forgot: { title: 'Reset your password',        sub: "Enter your email and we'll send you a reset link." },
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* LEFT COLUMN */}
      <div className="bg-[#0B0E14] flex flex-col items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center">
            <img src={logoHorizontal} alt="Ambitious Labs" className="h-10" />
          </div>

          {/* Back button for forgot view */}
          {view === 'forgot' && (
            <button
              type="button"
              onClick={() => switchView('login')}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </button>
          )}

          {/* Headings */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">{headings[view].title}</h1>
            <p className="text-slate-400">{headings[view].sub}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields — Sign Up only */}
            {view === 'signup' && (
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
            )}

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

            {view !== 'forgot' && (
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
            )}

            {/* Forgot password link — login view only */}
            {view === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => switchView('forgot')}
                  className="text-sm text-slate-500 hover:text-blue-400 transition-colors"
                  disabled={isLoading}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {view === 'forgot' ? 'Sending…' : view === 'signup' ? 'Creating account…' : 'Logging in…'}
                </>
              ) : (
                view === 'forgot' ? 'Send Reset Link' : view === 'signup' ? 'Sign Up' : 'Log In'
              )}
            </Button>
          </form>

          {/* Footer Links */}
          {view !== 'forgot' && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => switchView(view === 'login' ? 'signup' : 'login')}
                className="text-sm text-slate-400 hover:text-white transition-colors"
                disabled={isLoading}
              >
                {view === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
                <span className="text-blue-500 hover:text-blue-400">
                  {view === 'signup' ? 'Log In' : 'Sign Up'}
                </span>
              </button>
            </div>
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

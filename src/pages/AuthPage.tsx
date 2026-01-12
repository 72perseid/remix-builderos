import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff, User } from 'lucide-react';
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

const founderCards: { name: string; tagline: string; position: string }[] = [];

function FounderCard({ name, tagline, className }: { name: string; tagline: string; className?: string }) {
  return (
    <div className={`bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 w-56 ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">{name.charAt(0)}</span>
        </div>
        <span className="text-white font-semibold text-sm">{name}</span>
      </div>
      <p className="text-slate-400 text-xs leading-relaxed">{tagline}</p>
    </div>
  );
}

type FormErrors = { firstName?: string; lastName?: string; email?: string; password?: string };

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  const { signIn, signUp, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const validateForm = () => {
    try {
      if (isSignUp) {
        signUpSchema.parse({ firstName, lastName, email, password });
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
      if (isSignUp) {
        const { error } = await signUp(email, password, { first_name: firstName, last_name: lastName });
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in instead.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Check your email to confirm your account!');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password. Please try again.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Welcome back!');
          navigate('/', { replace: true });
        }
      }
    } catch (error) {
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
      {/* LEFT COLUMN - Login Form */}
      <div className="bg-[#0B0E14] flex flex-col items-center justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center">
            <img src={logoHorizontal} alt="Ambitious Labs" className="h-10" />
          </div>

          {/* Headings */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">
              {isSignUp ? 'Create your account' : 'Log in to your account'}
            </h1>
            <p className="text-slate-400">
              {isSignUp 
                ? 'Start building your app ideas today.' 
                : 'Welcome back! Please enter your details.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Fields - Only show on Sign Up */}
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-400 text-sm">
                    First Name
                  </Label>
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
                  {errors.firstName && (
                    <p className="text-sm text-red-400">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-400 text-sm">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-12 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-400">{errors.lastName}</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-400 text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 h-12 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-400 text-sm">
                Password
              </Label>
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
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isSignUp ? 'Creating account...' : 'Logging in...'}
                </>
              ) : (
                isSignUp ? 'Sign Up' : 'Log In'
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="space-y-3 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
              }}
              className="text-sm text-slate-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              {isSignUp 
                ? 'Already have an account? ' 
                : "Don't have an account? "}
              <span className="text-blue-500 hover:text-blue-400">
                {isSignUp ? 'Log In' : 'Sign Up'}
              </span>
            </button>
            
            <div>
              <button
                type="button"
                className="text-sm text-slate-500 hover:text-slate-400 transition-colors"
                onClick={() => toast.info('Password reset coming soon!')}
              >
                Forgot Password?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Visual Showcase */}
      <div className="hidden lg:block relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-hidden">
        {/* Floating Cards */}
        <div className="absolute inset-0">
          {founderCards.map((card, index) => (
            <div
              key={card.name}
              className={`absolute ${card.position} transform hover:scale-105 transition-transform duration-300`}
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <FounderCard name={card.name} tagline={card.tagline} />
            </div>
          ))}
        </div>

        {/* Large Logo Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={logoIcon} alt="Ambitious Labs" className="w-80 h-80 object-contain opacity-90" />
        </div>

        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />

        {/* Typography Overlay */}
        <div className="absolute bottom-12 left-12 z-10">
          <div className="space-y-1">
            <h2 className="text-5xl font-bold text-white">Learn.</h2>
            <h2 className="text-5xl font-bold text-white">Launch.</h2>
            <h2 className="text-5xl font-bold text-blue-500">Earn.</h2>
          </div>
          <p className="mt-4 text-slate-400 text-lg">Meet some of our founders.</p>
        </div>
      </div>
    </div>
  );
}

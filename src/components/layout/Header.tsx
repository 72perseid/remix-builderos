import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  Lightbulb,
  TrendingUp,
  Database,
  Bot,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const navItems = [
  { path: '/', label: 'Kanban Board', icon: LayoutDashboard },
  { path: '/app-idea', label: 'My App Idea', icon: Lightbulb },
  { path: '/business-model', label: 'Business Model', icon: TrendingUp },
  { path: '/database-design', label: 'DB Design', icon: Database },
  { path: '/ai-kanban-assistant', label: 'AI Assistant', icon: Bot },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out successfully');
      navigate('/', { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-strong">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">B</span>
            </div>
            <span className="font-bold text-xl gradient-text hidden sm:block">BuilderOS</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <Button
                  variant={location.pathname === path ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    'gap-2 transition-all',
                    location.pathname === path && 'bg-secondary'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden xl:inline">{label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {user && (
              <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-[120px]">
                {user.email}
              </span>
            )}
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link key={path} to={path} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={location.pathname === path ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Button>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

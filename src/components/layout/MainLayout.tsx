import { ReactNode, useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Heart, Newspaper, Camera, BookOpen, Menu, X, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

interface MainLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/', icon: Heart, label: 'Início' },
  { href: '/noticias', icon: Newspaper, label: 'Vivências' },
  { href: '/galeria', icon: Camera, label: 'Galeria' },
  { href: '/nossa-historia', icon: BookOpen, label: 'Nossa História' },
  { href: '/admin', icon: Settings, label: 'Administrador' }
];

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading, signOut } = useAuth();
  const { couple, currentUser } = useTheme();

  // Get the icon color class based on the current user's persona
  const iconColorClass = currentUser?.persona === 'her' ? 'text-her' : 'text-him';

  // Redirect to login if not authenticated
  if (!isLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Heart className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-sidebar md:block">
        <div className="flex h-full flex-col">
          <Link to="/" className="flex items-center gap-2 border-b border-border px-6 py-5">
            <Heart className={cn("h-6 w-6", iconColorClass)} fill="currentColor" />
            <span className="font-display text-xl font-semibold tracking-wide">
              <span className="text-him">{couple.nameHim}</span> & <span className="text-her">{couple.nameHer}</span>
            </span>
          </Link>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  )}
                >
                  <item.icon className={cn("h-4 w-4", isActive && iconColorClass)} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-4">
            <div className="flex items-center justify-between">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Feito com <Heart className={cn("inline h-3 w-3", iconColorClass)} fill="currentColor" /> por nós dois
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background px-4 md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <Heart className={cn("h-5 w-5", iconColorClass)} fill="currentColor" />
          <span className="font-display text-lg font-semibold"><span className="text-him">{couple.nameHim}</span> & <span className="text-her">{couple.nameHer}</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-foreground/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform border-r border-border bg-sidebar transition-transform md:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive && iconColorClass)} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Button variant="outline" className="w-full" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 pt-16 md:ml-64 md:pt-0">
        {children}
      </main>
    </div>
  );
}

import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Newspaper, Camera, BookOpen, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/', icon: Heart, label: 'Início' },
  { href: '/noticias', icon: Newspaper, label: 'Notícias' },
  { href: '/galeria', icon: Camera, label: 'Galeria' },
  { href: '/nossa-historia', icon: BookOpen, label: 'Nossa História' },
];

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-sidebar-background md:block">
        <div className="flex h-full flex-col">
          <Link to="/" className="flex items-center gap-2 border-b border-border px-6 py-5">
            <Heart className="h-6 w-6 text-accent" fill="currentColor" />
            <span className="font-display text-xl font-semibold tracking-wide">Nós Dois</span>
          </Link>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
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
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-4 text-center text-xs text-muted-foreground">
            Feito com <Heart className="inline h-3 w-3 text-accent" fill="currentColor" /> por nós dois
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background px-4 md:hidden">
        <Link to="/" className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-accent" fill="currentColor" />
          <span className="font-display text-lg font-semibold">Nós Dois</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
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
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform border-r border-border bg-sidebar-background transition-transform md:hidden',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
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
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 pt-16 md:ml-64 md:pt-0">
        {children}
      </main>
    </div>
  );
}
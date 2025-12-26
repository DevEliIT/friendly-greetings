import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Heart className="h-5 w-5 text-accent" fill="currentColor" />
          <span className="font-display text-xl font-semibold tracking-wide">Nós Dois</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link 
            to="/" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Início
          </Link>
          <Link 
            to="/#nossa-historia" 
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Nossa História
          </Link>
        </nav>
      </div>
    </header>
  );
}

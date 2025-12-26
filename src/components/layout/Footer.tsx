import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50 py-8">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <span className="text-sm">Feito com</span>
          <Heart className="h-4 w-4 text-accent" fill="currentColor" />
          <span className="text-sm">por nós dois</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground/70">
          © {new Date().getFullYear()} - Todas as memórias reservadas
        </p>
      </div>
    </footer>
  );
}

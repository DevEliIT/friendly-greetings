import { cn } from '@/lib/utils';
import { Persona } from '@/types/blog';

interface PersonaToggleProps {
  activePersona: Persona;
  onPersonaChange: (persona: Persona) => void;
  himLabel?: string;
  herLabel?: string;
  className?: string;
}

export function PersonaToggle({ 
  activePersona, 
  onPersonaChange, 
  himLabel = "A versão dele",
  herLabel = "A versão dela",
  className 
}: PersonaToggleProps) {
  return (
    <div className={cn("flex rounded-lg bg-muted p-1", className)}>
      <button
        onClick={() => onPersonaChange('him')}
        className={cn(
          "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
          activePersona === 'him'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {himLabel}
      </button>
      <button
        onClick={() => onPersonaChange('her')}
        className={cn(
          "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
          activePersona === 'her'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {herLabel}
      </button>
    </div>
  );
}

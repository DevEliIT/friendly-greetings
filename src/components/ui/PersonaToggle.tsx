import { cn } from '@/lib/utils';
import { Persona } from '@/types/blog';
import { useTheme } from '@/hooks/useTheme';

interface PersonaToggleProps {
  activePersona: Persona;
  onPersonaChange: (persona: Persona) => void;
  className?: string;
}

export function PersonaToggle({ 
  activePersona, 
  onPersonaChange, 
  className 
}: PersonaToggleProps) {
  const { couple } = useTheme();
  
  return (
    <div className={cn("flex rounded-lg bg-muted p-1", className)}>
      <button
        onClick={() => onPersonaChange('him')}
        className={cn(
          "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
          activePersona === 'him'
            ? "bg-background text-him shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        A versão de {couple.nameHim}
      </button>
      <button
        onClick={() => onPersonaChange('her')}
        className={cn(
          "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
          activePersona === 'her'
            ? "bg-background text-her shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        A versão de {couple.nameHer}
      </button>
    </div>
  );
}

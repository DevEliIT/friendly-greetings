import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Theme = 'light' | 'dark';

interface ThemeColors {
  primaryHim: string;
  secondaryHim: string;
  primaryHer: string;
  secondaryHer: string;
  nameHim: string;
  nameHer: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: ThemeColors;
  isLoading: boolean;
}

const defaultColors: ThemeColors = {
  primaryHim: '220 70% 50%',
  secondaryHim: '220 60% 70%',
  primaryHer: '340 80% 55%',
  secondaryHer: '340 70% 75%',
  nameHim: 'Ele',
  nameHer: 'Ela',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme') as Theme;
      return stored || 'light';
    }
    return 'light';
  });

  const [colors, setColors] = useState<ThemeColors>(defaultColors);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchColors() {
      const keys = [
        'primary_him', 'secondary_him', 'primary_her', 'secondary_her',
        'name_him', 'name_her'
      ];

      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', keys);

      if (data) {
        const colorsMap: Record<string, string> = {};
        data.forEach(item => {
          colorsMap[item.key] = item.value || '';
        });

        setColors({
          primaryHim: colorsMap['primary_him'] || defaultColors.primaryHim,
          secondaryHim: colorsMap['secondary_him'] || defaultColors.secondaryHim,
          primaryHer: colorsMap['primary_her'] || defaultColors.primaryHer,
          secondaryHer: colorsMap['secondary_her'] || defaultColors.secondaryHer,
          nameHim: colorsMap['name_him'] || defaultColors.nameHim,
          nameHer: colorsMap['name_her'] || defaultColors.nameHer,
        });
      }

      setIsLoading(false);
    }

    fetchColors();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Apply custom colors as CSS variables (only in light mode)
  useEffect(() => {
    if (theme === 'light' && !isLoading) {
      const root = window.document.documentElement;
      // We'll apply persona-specific colors when needed
    }
  }, [theme, colors, isLoading]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

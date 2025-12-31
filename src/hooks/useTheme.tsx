import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Theme = 'light' | 'dark';

interface CoupleInfo {
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
  couple: CoupleInfo;
  isLoading: boolean;
}

const defaultCouple: CoupleInfo = {
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

  const [couple, setCouple] = useState<CoupleInfo>(defaultCouple);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      const keys = [
        'primary_him', 'secondary_him', 'primary_her', 'secondary_her',
        'name_him', 'name_her'
      ];

      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', keys);

      if (data) {
        const settingsMap: Record<string, string> = {};
        data.forEach(item => {
          settingsMap[item.key] = item.value || '';
        });

        setCouple({
          primaryHim: settingsMap['primary_him'] || defaultCouple.primaryHim,
          secondaryHim: settingsMap['secondary_him'] || defaultCouple.secondaryHim,
          primaryHer: settingsMap['primary_her'] || defaultCouple.primaryHer,
          secondaryHer: settingsMap['secondary_her'] || defaultCouple.secondaryHer,
          nameHim: settingsMap['name_him'] || defaultCouple.nameHim,
          nameHer: settingsMap['name_her'] || defaultCouple.nameHer,
        });
      }

      setIsLoading(false);
    }

    fetchSettings();
  }, []);

  // Apply theme class
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Apply custom couple colors as CSS variables (only in light mode)
  useEffect(() => {
    if (!isLoading) {
      const root = window.document.documentElement;
      
      if (theme === 'light') {
        root.style.setProperty('--color-him', couple.primaryHim);
        root.style.setProperty('--color-him-secondary', couple.secondaryHim);
        root.style.setProperty('--color-her', couple.primaryHer);
        root.style.setProperty('--color-her-secondary', couple.secondaryHer);
      } else {
        // Dark mode uses fixed colors for better readability
        root.style.removeProperty('--color-him');
        root.style.removeProperty('--color-him-secondary');
        root.style.removeProperty('--color-her');
        root.style.removeProperty('--color-her-secondary');
      }
    }
  }, [theme, couple, isLoading]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, couple, isLoading }}>
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

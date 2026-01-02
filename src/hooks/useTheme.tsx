import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

type Theme = 'light' | 'dark';
type Persona = 'him' | 'her' | null;

interface CoupleInfo {
  primaryHim: string;
  secondaryHim: string;
  primaryHer: string;
  secondaryHer: string;
  nameHim: string;
  nameHer: string;
}

interface CurrentUserInfo {
  id: string;
  persona: Persona;
  name: string;
  primaryColor: string;
  secondaryColor: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  couple: CoupleInfo;
  currentUser: CurrentUserInfo | null;
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
  const [currentUser, setCurrentUser] = useState<CurrentUserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user persona
  async function fetchUserPersona(userId: string): Promise<Persona> {
    const { data } = await supabase
      .from('user_personas')
      .select('persona')
      .eq('user_id', userId)
      .maybeSingle();
    
    return data?.persona as Persona || null;
  }

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

      let coupleData = defaultCouple;
      
      if (data) {
        const settingsMap: Record<string, string> = {};
        data.forEach(item => {
          settingsMap[item.key] = item.value || '';
        });

        coupleData = {
          primaryHim: settingsMap['primary_him'] || defaultCouple.primaryHim,
          secondaryHim: settingsMap['secondary_him'] || defaultCouple.secondaryHim,
          primaryHer: settingsMap['primary_her'] || defaultCouple.primaryHer,
          secondaryHer: settingsMap['secondary_her'] || defaultCouple.secondaryHer,
          nameHim: settingsMap['name_him'] || defaultCouple.nameHim,
          nameHer: settingsMap['name_her'] || defaultCouple.nameHer,
        };

        setCouple(coupleData);
      }

      return coupleData;
    }

    async function init() {
      const coupleData = await fetchSettings();
      
      // Check current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const persona = await fetchUserPersona(user.id);
        
        if (persona) {
          setCurrentUser({
            id: user.id,
            persona,
            name: persona === 'him' ? coupleData.nameHim : coupleData.nameHer,
            primaryColor: persona === 'him' ? coupleData.primaryHim : coupleData.primaryHer,
            secondaryColor: persona === 'him' ? coupleData.secondaryHim : coupleData.secondaryHer,
          });
        } else {
          setCurrentUser({
            id: user.id,
            persona: null,
            name: '',
            primaryColor: coupleData.primaryHim,
            secondaryColor: coupleData.secondaryHim,
          });
        }
      }

      setIsLoading(false);
    }

    init();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      } else if (session?.user) {
        setTimeout(() => {
          fetchUserPersona(session.user.id).then(persona => {
            if (persona) {
              setCurrentUser({
                id: session.user.id,
                persona,
                name: persona === 'him' ? couple.nameHim : couple.nameHer,
                primaryColor: persona === 'him' ? couple.primaryHim : couple.primaryHer,
                secondaryColor: persona === 'him' ? couple.secondaryHim : couple.secondaryHer,
              });
            }
          });
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Apply theme class
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Apply user-specific colors as CSS primary (only in light mode)
  useEffect(() => {
    if (!isLoading) {
      const root = window.document.documentElement;
      
      if (theme === 'light' && currentUser?.persona) {
        // Apply the logged-in user's colors as the primary app colors
        root.style.setProperty('--primary', currentUser.primaryColor);
        root.style.setProperty('--primary-foreground', '0 0% 100%');
        
        // Also set the him/her colors for reference
        root.style.setProperty('--color-him', couple.primaryHim);
        root.style.setProperty('--color-him-secondary', couple.secondaryHim);
        root.style.setProperty('--color-her', couple.primaryHer);
        root.style.setProperty('--color-her-secondary', couple.secondaryHer);
      } else {
        // Dark mode or no persona - use default primary
        root.style.removeProperty('--primary');
        root.style.removeProperty('--primary-foreground');
        root.style.removeProperty('--color-him');
        root.style.removeProperty('--color-him-secondary');
        root.style.removeProperty('--color-her');
        root.style.removeProperty('--color-her-secondary');
      }
    }
  }, [theme, currentUser, couple, isLoading]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, couple, currentUser, isLoading }}>
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

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemePreset = 'obsidian-gold' | 'midnight-emerald' | 'deep-sapphire' | 'stealth-crimson';

export interface ThemeOption {
  id: ThemePreset;
  name: string;
  subtitle: string;
  description: string;
  accentColor: string;
  swatches: string[];
}

export const THEME_PRESETS: ThemeOption[] = [
  {
    id: 'obsidian-gold',
    name: 'Obsidian Gold',
    subtitle: 'Cyber Luxury & Warm Amber',
    description: 'Deep obsidian slate (#080C14) paired with burnished gold & warm amber accents. Zero white, high executive clarity.',
    accentColor: '#F59E0B',
    swatches: ['#080C14', '#121C30', '#F59E0B', '#D97706'],
  },
  {
    id: 'midnight-emerald',
    name: 'Midnight Emerald',
    subtitle: 'Executive Wealth & Mint Matrix',
    description: 'Abyss deep forest black (#050E0B) with luminous mint emerald accents. Crisp, ultra-clean high finance aesthetic.',
    accentColor: '#10B981',
    swatches: ['#050E0B', '#0E231B', '#10B981', '#34D399'],
  },
  {
    id: 'deep-sapphire',
    name: 'Deep Sapphire',
    subtitle: 'Velvet Cobalt & Cyber Sky',
    description: 'Midnight oceanic graphite (#060A14) with electric royal sapphire & ice sky highlights. Modern enterprise tech.',
    accentColor: '#38BDF8',
    swatches: ['#060A14', '#0F1C38', '#38BDF8', '#4F46E5'],
  },
  {
    id: 'stealth-crimson',
    name: 'Stealth Crimson',
    subtitle: 'Smoked Carbon & Flame Rose',
    description: 'Pure stealth matte carbon (#0C0D10) with vivid crimson flame accents. Dramatic and sharp.',
    accentColor: '#F43F5E',
    swatches: ['#0C0D10', '#1A1C22', '#F43F5E', '#FB7185'],
  },
];

interface ThemeContextType {
  theme: 'dark'; // Always dark (Zero-White)
  isDarkMode: boolean; // Always true
  currentPreset: ThemePreset;
  presets: ThemeOption[];
  setPreset: (preset: ThemePreset) => void;
  toggleTheme: () => void;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_PRESET_KEY = 'apex_crm_zero_white_preset';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPreset, setCurrentPresetState] = useState<ThemePreset>(() => {
    try {
      const stored = localStorage.getItem(THEME_PRESET_KEY) as ThemePreset | null;
      if (stored && THEME_PRESETS.some((p) => p.id === stored)) {
        return stored;
      }
    } catch {
      // fallback
    }
    return 'obsidian-gold'; // Default recommended zero-white luxury theme
  });

  useEffect(() => {
    const root = document.documentElement;
    // Ensure dark class is permanent
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
    root.setAttribute('data-theme', currentPreset);

    try {
      localStorage.setItem(THEME_PRESET_KEY, currentPreset);
    } catch {
      // ignore
    }
  }, [currentPreset]);

  // Cycle through presets on toggle
  const toggleTheme = () => {
    const currentIndex = THEME_PRESETS.findIndex((p) => p.id === currentPreset);
    const nextIndex = (currentIndex + 1) % THEME_PRESETS.length;
    setCurrentPresetState(THEME_PRESETS[nextIndex].id);
  };

  const setPreset = (preset: ThemePreset) => {
    setCurrentPresetState(preset);
  };

  const setTheme = (val: string) => {
    if (THEME_PRESETS.some((p) => p.id === val)) {
      setCurrentPresetState(val as ThemePreset);
    } else {
      toggleTheme();
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: 'dark',
        isDarkMode: true,
        currentPreset,
        presets: THEME_PRESETS,
        setPreset,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

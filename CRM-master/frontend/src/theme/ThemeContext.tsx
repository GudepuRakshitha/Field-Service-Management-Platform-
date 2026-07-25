import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'marvel';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const THEME_CYCLE: Theme[] = ['dark', 'light', 'marvel'];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('keystone_theme');
    if (saved === 'light' || saved === 'marvel') return saved;
    return 'dark';
  });

  useEffect(() => {
    localStorage.setItem('keystone_theme', theme);
    const root = document.documentElement;
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'marvel');
    // Add the current theme class
    if (theme !== 'dark') {
      root.classList.add(theme);
    } else {
      root.classList.add('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const idx = THEME_CYCLE.indexOf(prev);
      return THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

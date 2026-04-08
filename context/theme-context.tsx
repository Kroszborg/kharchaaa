import { Colors, LightColors, type ThemeColors } from '@/constants/theme';
import { useUIStore } from '@/store';
import React, { createContext, useContext } from 'react';

const ThemeContext = createContext<ThemeColors>(Colors as unknown as ThemeColors);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const themeMode = useUIStore(s => s.themeMode);
  const colors = (themeMode === 'light' ? LightColors : Colors) as unknown as ThemeColors;
  return (
    <ThemeContext.Provider value={colors}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useColors(): ThemeColors {
  return useContext(ThemeContext);
}

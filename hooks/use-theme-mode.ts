import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, LightColors, type ColorScheme, type ThemeColors } from '@/constants/theme';
import { useUIStore } from '@/store';

const THEME_KEY = 'kh_theme_mode';

export function useThemeMode(): {
  mode: ColorScheme;
  colors: ThemeColors;
  toggle: () => void;
} {
  const mode = useUIStore(s => s.themeMode);
  const setThemeMode = useUIStore(s => s.setThemeMode);

  const toggle = () => {
    const next: ColorScheme = mode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    AsyncStorage.setItem(THEME_KEY, next).catch(() => {});
  };

  return {
    mode,
    colors: (mode === 'light' ? LightColors : Colors) as ThemeColors,
    toggle,
  };
}

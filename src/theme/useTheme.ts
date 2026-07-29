import { useThemeStore } from '../store/theme.store';
import { lightColors, darkColors } from './colors';

export const useTheme = () => {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const setDarkMode = useThemeStore((state) => state.setDarkMode);

  const theme = isDarkMode ? darkColors : lightColors;

  return {
    theme,
    colors: theme,
    isDarkMode,
    toggleTheme,
    setDarkMode,
  };
};

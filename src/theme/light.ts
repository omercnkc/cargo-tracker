import { lightColors } from './colors';
import { spacing } from './spacing';
import { radius } from './radius';
import { typography } from './typography';

export const lightTheme = {
  colors: lightColors,
  spacing,
  radius,
  typography,
  isDark: false,
};

export type Theme = typeof lightTheme;

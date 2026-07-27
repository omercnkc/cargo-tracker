// Base colors and specific palette extracted from the design system
export const palette = {
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',

  // Material Design 3 Extracted Colors
  onBackground: '#0b1c30',
  onTertiaryContainer: '#27c38a',
  onError: '#ffffff',
  onPrimary: '#ffffff',
  secondaryFixedDim: '#ffb95f',
  outline: '#757682',
  onPrimaryFixed: '#00164e',
  inverseSurface: '#213145',
  onPrimaryFixedVariant: '#264191',
  tertiaryFixedDim: '#4edea3',
  onTertiaryFixedVariant: '#005236',
  surfaceVariant: '#d3e4fe',
  surface: '#f8f9ff',
  secondaryContainer: '#fea619',
  onPrimaryContainer: '#90a8ff',
  errorContainer: '#ffdad6',
  background: '#f8f9ff',
  inverseOnSurface: '#eaf1ff',
  surfaceBright: '#f8f9ff',
  surfaceContainerHighest: '#d3e4fe',
  surfaceTint: '#4059aa',
  tertiaryFixed: '#6ffbbe',
  inversePrimary: '#b6c4ff',
  onSurfaceVariant: '#444651',
  secondary: '#855300',
  primaryFixed: '#dce1ff',
  onSecondaryContainer: '#684000',
  tertiaryContainer: '#004a31',
  secondaryFixed: '#ffddb8',
  primary: '#00236f',
  onSecondaryFixedVariant: '#653e00',
  surfaceContainerHigh: '#dce9ff',
  onErrorContainer: '#93000a',
  surfaceDim: '#cbdbf5',
  surfaceContainerLowest: '#ffffff',
  tertiary: '#00311f',
  primaryContainer: '#1e3a8a',
  surfaceContainer: '#e5eeff',
  error: '#ba1a1a',
  primaryFixedDim: '#b6c4ff',
  onSecondaryFixed: '#2a1700',
  onSecondary: '#ffffff',
  onSurface: '#0b1c30',
  onTertiary: '#ffffff',
  surfaceContainerLow: '#eff4ff',
  onTertiaryFixed: '#002113',
  outlineVariant: '#c5c5d3',

  // Legacy status backgrounds/texts for backward compatibility
  statusInTransitBg: '#ffedd5',
  statusDeliveredBg: '#dcfce7',
  statusAlertBg: '#fee2e2',
  statusPendingBg: '#eff4ff',
  statusInTransitText: '#9a3412',
  statusDeliveredText: '#166534',
  statusAlertText: '#991b1b',
  statusPendingText: '#1e3a8a',
};

// Light theme colors mapping
export const lightColors = {
  ...palette,
  text: palette.onSurface,
  textVariant: palette.onSurfaceVariant,
  
  status: {
    inTransit: {
      background: palette.statusInTransitBg,
      text: palette.statusInTransitText,
    },
    delivered: {
      background: palette.statusDeliveredBg,
      text: palette.statusDeliveredText,
    },
    alert: {
      background: palette.statusAlertBg,
      text: palette.statusAlertText,
    },
    pending: {
      background: palette.statusPendingBg,
      text: palette.statusPendingText,
    },
  },
};

// Dark theme colors placeholder (Fallback for now, uses same palette structure)
export const darkColors = {
  ...lightColors,
  background: '#121212',
  surface: '#1e1e1e',
  surfaceContainer: '#2c2c2c',
  surfaceContainerLowest: '#121212',
  text: '#ffffff',
  textVariant: '#a1a1aa',
  outline: '#3f3f46',
  onBackground: '#ffffff',
  onSurface: '#ffffff',
  onSurfaceVariant: '#a1a1aa',
};

export default lightColors;

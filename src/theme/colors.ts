// Base colors and specific palette extracted from the design system
export const palette = {
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',

  // Material Design 3 Extracted Colors (Light Theme Base)
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

  // Legacy status backgrounds/texts
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

// Premium Midnight Dark Theme Palette
export const darkColors = {
  ...palette,
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',

  background: '#0b0f19',
  surface: '#111827',
  surfaceContainer: '#1f2937',
  surfaceContainerLow: '#161e2e',
  surfaceContainerLowest: '#111827',
  surfaceContainerHigh: '#2d3748',
  surfaceContainerHighest: '#374151',
  surfaceVariant: '#1f2937',
  surfaceBright: '#1f2937',
  surfaceDim: '#0b0f19',

  primary: '#60a5fa',
  onPrimary: '#0f172a',
  primaryContainer: '#2563eb',
  onPrimaryContainer: '#dbeafe',
  primaryFixed: '#3b82f6',
  primaryFixedDim: '#93c5fd',
  onPrimaryFixed: '#dbeafe',
  onPrimaryFixedVariant: '#93c5fd',

  secondary: '#fbbf24',
  onSecondary: '#451a03',
  secondaryContainer: '#b45309',
  onSecondaryContainer: '#fef3c7',
  secondaryFixed: '#451a03',
  secondaryFixedDim: '#78350f',
  onSecondaryFixed: '#fef3c7',
  onSecondaryFixedVariant: '#fde68a',

  tertiary: '#34d399',
  onTertiary: '#064e3b',
  tertiaryContainer: '#047857',
  onTertiaryContainer: '#a7f3d0',
  tertiaryFixed: '#064e3b',
  tertiaryFixedDim: '#047857',
  onTertiaryFixed: '#a7f3d0',
  onTertiaryFixedVariant: '#6ee7b7',

  error: '#f87171',
  onError: '#450a0a',
  errorContainer: '#991b1b',
  onErrorContainer: '#fca5a5',

  onBackground: '#f8fafc',
  onSurface: '#f1f5f9',
  onSurfaceVariant: '#94a3b8',
  outline: '#475569',
  outlineVariant: '#334155',
  inverseSurface: '#1e293b',
  inverseOnSurface: '#f8fafc',
  inversePrimary: '#1d4ed8',

  text: '#f1f5f9',
  textVariant: '#94a3b8',

  status: {
    inTransit: {
      background: '#451a03',
      text: '#fde68a',
    },
    delivered: {
      background: '#064e3b',
      text: '#6ee7b7',
    },
    alert: {
      background: '#7f1d1d',
      text: '#fca5a5',
    },
    pending: {
      background: '#1e3a8a',
      text: '#93c5fd',
    },
  },
};

export default lightColors;

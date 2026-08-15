// ========================================
// THE RIDES CLUB — Design System
// Brand tokens adapted for React Native
// ========================================

export const Colors = {
  // Primary palette (from website)
  yellow: '#FEC60F',
  yellowDark: '#D59F00',
  yellowLight: '#FFECA0',

  red: '#D04D44',
  redDark: '#A62E26',
  redLight: '#FCE8E6',

  blue: '#3043E4',
  blueDark: '#1A28A8',
  blueLight: '#E7EAFE',

  // Neutrals
  white: '#FFFFFF',
  cream: '#FFFDF9',
  ink: '#141414',
  inkMuted: '#555555',
  inkLight: '#888888',
  border: '#E5E5E5',
  borderDark: '#333333',
  cardBg: '#FFFFFF',

  // Dark mode
  darkBg: '#0D0D0D',
  darkSurface: '#1A1A1A',
  darkSurfaceElevated: '#252525',
  darkBorder: '#333333',
  darkText: '#F5F5F5',
  darkTextMuted: '#999999',
};

// Light & Dark theme configurations
export const Themes = {
  light: {
    background: Colors.cream,
    surface: Colors.white,
    surfaceElevated: Colors.white,
    text: Colors.ink,
    textSecondary: Colors.inkMuted,
    textMuted: Colors.inkLight,
    border: Colors.border,
    tabBar: Colors.white,
    tabBarBorder: Colors.border,
    tabBarActive: Colors.red,
    tabBarInactive: Colors.inkMuted,
    statusBar: 'dark',
    headerBg: Colors.white,
    primary: Colors.red,
    accent: Colors.yellow,
  },
  dark: {
    background: Colors.darkBg,
    surface: Colors.darkSurface,
    surfaceElevated: Colors.darkSurfaceElevated,
    text: Colors.darkText,
    textSecondary: Colors.darkTextMuted,
    textMuted: '#666666',
    border: Colors.darkBorder,
    tabBar: Colors.darkSurface,
    tabBarBorder: Colors.darkBorder,
    tabBarActive: Colors.yellow,
    tabBarInactive: '#666666',
    statusBar: 'light',
    headerBg: Colors.darkSurface,
    primary: Colors.yellow,
    accent: Colors.red,
  },
};

export const Typography = {
  // Display / headers — Outfit
  displayLarge: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  displaySmall: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 20,
    lineHeight: 26,
  },
  heading: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 18,
    lineHeight: 24,
  },

  // Body — Inter
  bodyLarge: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  button: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
    lineHeight: 20,
  },
  tabLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    lineHeight: 12,
  },
};

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};

export default { Colors, Themes, Typography, Spacing, Radius, Shadows };

import {
  MD3LightTheme as PaperLightTheme,
  MD3DarkTheme as PaperDarkTheme,
  adaptNavigationTheme,
} from 'react-native-paper';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';

const {LightTheme: LightNavTheme, DarkTheme: DarkNavTheme} =
  adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
  });

// Common theme configuration
const commonTheme = {
  animation: {
    scale: 1.0,
  },
  transition: {
    duration: 200,
    easing: {
      // Standard curve
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      // Accelerated curve
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      // Decelerated curve
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },
};

// Light Theme
const lightColors = {
  primary: '#6200ee',
  onPrimary: '#ffffff',
  primaryContainer: '#e0dbff',
  onPrimaryContainer: '#1d0061',
  secondary: '#5d5d5d',
  onSecondary: '#ffffff',
  secondaryContainer: '#e1e1e1',
  onSecondaryContainer: '#1a1c1e',
  background: '#fefbff',
  onBackground: '#1c1b1f',
  surface: '#fefbff',
  onSurface: '#1c1b1f',
  surfaceVariant: '#e7e0ec',
  onSurfaceVariant: '#49454f',
  error: '#b00020',
  onError: '#ffffff',
  elevation: {
    level0: 'transparent',
    level1: '#f7f2fa',
    level2: '#f3edf7',
    level3: '#eeeaf4',
    level4: '#ede8f2',
    level5: '#e9e5f0',
  },
};

// Dark Theme
const darkColors = {
  primary: '#bb86fc',
  onPrimary: '#000000',
  primaryContainer: '#3700b3',
  onPrimaryContainer: '#e0dbff',
  secondary: '#a4a4a4',
  onSecondary: '#333333',
  secondaryContainer: '#4a4a4a',
  onSecondaryContainer: '#e1e1e1',
  background: '#121212',
  onBackground: '#e6e1e5',
  surface: '#1e1e1e',
  onSurface: '#e6e1e5',
  surfaceVariant: '#49454f',
  onSurfaceVariant: '#cac4d0',
  error: '#cf6679',
  onError: '#000000',
  elevation: {
    level0: 'transparent',
    level1: '#272727',
    level2: '#2d2d2d',
    level3: '#333333',
    level4: '#393939',
    level5: '#3f3f3f',
  },
};

// Create theme variants
export const PaperTheme = {
  light: {
    ...PaperLightTheme,
    ...commonTheme,
    colors: {
      ...PaperLightTheme.colors,
      ...lightColors,
    },
  },
  dark: {
    ...PaperDarkTheme,
    ...commonTheme,
    colors: {
      ...PaperDarkTheme.colors,
      ...darkColors,
    },
  },
} as const;

export const NavigationTheme = {
  light: {
    ...LightNavTheme,
    colors: {
      ...LightNavTheme.colors,
      ...lightColors,
      card: lightColors.surface,
      border: lightColors.surfaceVariant,
      notification: lightColors.primary,
    },
  },
  dark: {
    ...DarkNavTheme,
    colors: {
      ...DarkNavTheme.colors,
      ...darkColors,
      card: darkColors.surface,
      border: darkColors.surfaceVariant,
      notification: darkColors.primary,
    },
  },
} as const;

export type AppTheme = typeof PaperTheme.light & {
  isDark: boolean;
};

export type NavTheme = typeof NavigationTheme.light & {
  dark: boolean;
};

export type ThemeType = 'light' | 'dark';

export const getTheme = (themeType: ThemeType): AppTheme => ({
  ...PaperTheme[themeType],
  isDark: themeType === 'dark',
});

export const getNavigationTheme = (themeType: ThemeType): NavTheme => ({
  ...NavigationTheme[themeType],
});

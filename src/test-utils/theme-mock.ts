import { AppTheme, NavTheme } from "../theme/theme";

const mockColors = {
  primary: "#6200ee",
  onPrimary: "#ffffff",
  primaryContainer: "#e0dbff",
  onPrimaryContainer: "#1d0061",
  secondary: "#5d5d5d",
  onSecondary: "#ffffff",
  secondaryContainer: "#e1e1e1",
  onSecondaryContainer: "#1a1c1e",
  background: "#fefbff",
  onBackground: "#1c1b1f",
  surface: "#fefbff",
  onSurface: "#1c1b1f",
  surfaceVariant: "#e7e0ec",
  onSurfaceVariant: "#49454f",
  error: "#b00020",
  onError: "#ffffff",
  elevation: {
    level0: "transparent",
    level1: "#f7f2fa",
    level2: "#f3edf7",
    level3: "#eeeaf4",
    level4: "#ede8f2",
    level5: "#e9e5f0",
  },
};

export const mockTheme: AppTheme = {
  ...require("react-native-paper").MD3LightTheme,
  colors: mockColors,
  isDark: false,
  roundness: 4,
  animation: {
    scale: 1.0,
  },
  transition: {
    duration: 200,
    easing: {
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    },
  },
};

export const mockDarkTheme: AppTheme = {
  ...mockTheme,
  ...require("react-native-paper").MD3DarkTheme,
  isDark: true,
  colors: {
    ...mockTheme.colors,
    primary: "#bb86fc",
    onPrimary: "#000000",
    background: "#121212",
    onBackground: "#e6e1e5",
    surface: "#1e1e1e",
    onSurface: "#e6e1e5",
  },
};

export const mockNavigationTheme: NavTheme = {
  dark: false,
  colors: {
    ...mockColors,
    primary: mockColors.primary,
    background: mockColors.background,
    card: mockColors.surface,
    text: mockColors.onSurface,
    border: mockColors.surfaceVariant,
    notification: mockColors.primary,
  },
  fonts: {
    regular: {
      fontFamily: "System",
      fontWeight: "400" as const,
    },
    medium: {
      fontFamily: "System",
      fontWeight: "500" as const,
    },
    bold: {
      fontFamily: "System",
      fontWeight: "700" as const,
    },
    heavy: {
      fontFamily: "System",
      fontWeight: "900" as const,
    },
  },
};

export const mockDarkNavigationTheme: NavTheme = {
  dark: true,
  colors: {
    ...mockDarkTheme.colors,
    primary: mockDarkTheme.colors.primary,
    background: mockDarkTheme.colors.background,
    card: mockDarkTheme.colors.surface,
    text: mockDarkTheme.colors.onSurface,
    border: mockDarkTheme.colors.surfaceVariant,
    notification: mockDarkTheme.colors.primary,
  },
  fonts: {
    regular: {
      fontFamily: "System",
      fontWeight: "400" as const,
    },
    medium: {
      fontFamily: "System",
      fontWeight: "500" as const,
    },
    bold: {
      fontFamily: "System",
      fontWeight: "700" as const,
    },
    heavy: {
      fontFamily: "System",
      fontWeight: "900" as const,
    },
  },
};

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ThemeType,
  getTheme,
  getNavigationTheme,
  AppTheme,
  NavTheme,
} from '@/theme/theme';
import {useUserProfile} from '@/hooks/useUserProfile';

const THEME_STORAGE_KEY = '@app_theme';

export type ThemeContextType = {
  theme: ThemeType;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
  paperTheme: AppTheme;
  navTheme: NavTheme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {data: userProfile, updateProfile} = useUserProfile();
  const systemColorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setThemeState] = useState<ThemeType>('light'); // Default to light theme

  // Load theme from storage on initial render
  useEffect(() => {
    const loadTheme = async () => {
      try {
        // First try to get theme from user profile
        if (userProfile?.preferences?.theme) {
          setThemeState(userProfile.preferences.theme as ThemeType);
          return;
        }

        // Then try to get from AsyncStorage
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (
          storedTheme &&
          (storedTheme === 'light' || storedTheme === 'dark')
        ) {
          setThemeState(storedTheme);
          return;
        }

        // Fallback to system theme
        if (systemColorScheme) {
          setThemeState(systemColorScheme as ThemeType);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [userProfile?.preferences?.theme, systemColorScheme]);

  const setTheme = useCallback(
    async (newTheme: ThemeType) => {
      setThemeState(newTheme);

      // Save to AsyncStorage immediately for fast access
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } catch (error) {
        console.error('Failed to save theme to storage:', error);
      }

      // Update user profile in the background
      try {
        updateProfile({
          preferences: {
            ...userProfile?.preferences,
            theme: newTheme,
          },
        });
      } catch (error) {
        console.error('Failed to update theme preference:', error);
      }
    },
    [userProfile?.preferences, updateProfile],
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      toggleTheme,
      setTheme,
      paperTheme: getTheme(theme),
      navTheme: getNavigationTheme(theme),
    }),
    [theme, setTheme, toggleTheme],
  );

  // Don't render children until theme is loaded to prevent flash
  if (isLoading) {
    return null; // Or a loading indicator
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

// This is a convenience hook that can be used in any component to get the current theme
export const useAppTheme = () => {
  const {paperTheme, navTheme, isDark} = useThemeContext();
  return {theme: paperTheme, navTheme, isDark};
};

// This is a convenience hook to get the toggle function
export const useToggleTheme = () => {
  const {toggleTheme} = useThemeContext();
  return toggleTheme;
};

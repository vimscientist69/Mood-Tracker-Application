import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeType, getTheme, getNavigationTheme } from '@/theme/theme';
import { useUserProfile } from '@/hooks/useUserProfile';

type ThemeContextType = {
  theme: ThemeType;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
  paperTheme: ReturnType<typeof getTheme>;
  navTheme: ReturnType<typeof getNavigationTheme>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: userProfile, updateProfile } = useUserProfile();
  const systemColorScheme = useColorScheme();
  
  // Default to dark theme if no preference is set
  const [theme, setThemeState] = useState<ThemeType>(
    () => (userProfile?.preferences?.theme as ThemeType) || 'dark'
  );

  // Update theme when user preference changes
  useEffect(() => {
    if (userProfile?.preferences?.theme) {
      setThemeState(userProfile.preferences.theme as ThemeType);
    } else if (systemColorScheme) {
      // Fallback to system theme if no user preference is set
      setThemeState(systemColorScheme as ThemeType);
    }
  }, [userProfile?.preferences?.theme, systemColorScheme]);

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    // Update user profile with the new theme preference
    try {
      await updateProfile({
        preferences: {
          ...userProfile?.preferences,
          theme: newTheme,
        },
      });
    } catch (error) {
      console.error('Failed to update theme preference:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const paperTheme = getTheme(theme);
  const navTheme = getNavigationTheme(theme);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
        paperTheme,
        navTheme,
      }}
    >
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
  const { paperTheme, navTheme, isDark } = useThemeContext();
  return { theme: paperTheme, navTheme, isDark };
};

// This is a convenience hook to get the toggle function
export const useToggleTheme = () => {
  const { toggleTheme } = useThemeContext();
  return toggleTheme;
};

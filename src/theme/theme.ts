import { MD3DarkTheme as PaperDarkTheme, MD3Theme, adaptNavigationTheme } from 'react-native-paper';
import {
    DarkTheme as NavigationDarkTheme,
    DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';

const { DarkTheme } = adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
});

// Defines the theme for React Native Paper
export const AppPaperTheme: MD3Theme = {
    ...PaperDarkTheme,
    colors: {
        ...PaperDarkTheme.colors,
        primary: '#bb86fc',
        background: '#121212',
        surface: '#1e1e1e',
        elevation: {
            level0: 'transparent',
            level1: '#272727',
            level2: '#2d2d2d',
            level3: '#333333',
            level4: '#393939',
            level5: '#3f3f3f',
        }
    },
};

// Defines the theme for React Navigation
export const AppNavigationTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        primary: '#bb86fc',
        background: '#121212',
        card: '#1e1e1e',
        text: '#ffffff',
        border: '#272727',
    },
};

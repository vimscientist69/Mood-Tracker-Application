import { mockNavigationTheme, mockTheme } from '@/test-utils/theme-mock';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

// Mock Clerk
jest.mock('@clerk/clerk-expo', () => ({
  useSignIn: jest.fn(() => ({
    signIn: {
      create: jest.fn(),
    },
    setActive: jest.fn(),
    isLoaded: true,
  })),
  useSignUp: jest.fn(() => ({
    signUp: {
      create: jest.fn(),
      prepareEmailAddressVerification: jest.fn(),
      attemptEmailAddressVerification: jest.fn(),
    },
    setActive: jest.fn(),
    isLoaded: true,
  })),
  useAuth: jest.fn(() => ({
    isSignedIn: false,
    isLoaded: true,
  })),
  ClerkProvider: ({children}: any) => children,
  ClerkLoaded: ({children}: any) => children,
}));

// Mock Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Safe Area
// jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

// Suppress specific library warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  const msg = args.join(' ');
  if (msg.includes('An update to') && msg.includes('not wrapped in act')) {
    return;
  }
  originalConsoleError(...args);
};

jest.mock('./src/context/ThemeContext', () => ({
  useAppTheme: jest.fn().mockImplementation(() => ({
    theme: mockTheme,
    navTheme: mockNavigationTheme,
    isDark: false,
  })),
  useToggleTheme: jest.fn()
}));
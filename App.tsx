import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';
import { tokenCache } from './src/utils/tokenCache';
import { TripleTapDetector } from './src/components/TripleTapDetector';
import { DebugMenu } from './src/components/DebugMenu';
import { ThemeProvider } from '@/context/ThemeContext';
import { useAppTheme } from '@/context/ThemeContext';

const queryClient = new QueryClient();
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
  );
}

export default function App() {
  const [debugMenuVisible, setDebugMenuVisible] = useState(false);

  // Wrap the app with ThemeProvider to provide theme context
  const AppContent = () => {
    const { theme } = useAppTheme();
    
    return (
      <PaperProvider theme={theme}>
        {__DEV__ && (
          <DebugMenu
            visible={debugMenuVisible}
            onClose={() => setDebugMenuVisible(false)}
          />
        )}
        {__DEV__ ? (
          <TripleTapDetector onTripleTap={() => setDebugMenuVisible(true)}>
            <RootNavigator />
          </TripleTapDetector>
        ) : (
          <RootNavigator />
        )}
      </PaperProvider>
    );
  };

  return (
    <SafeAreaProvider>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </QueryClientProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}

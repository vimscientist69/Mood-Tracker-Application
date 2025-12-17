import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { ThemeProvider } from '@/context/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type Options = Omit<RenderOptions, 'wrapper'> & {
  theme?: 'light' | 'dark';
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PaperProvider>
          {children}
        </PaperProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export const renderWithTheme = (
  component: React.ReactElement,
  options: Options = {}
) => {
  return render(component, {
    wrapper: AllTheProviders,
    ...options,
  });
};

export * from '@testing-library/react-native';
export { renderWithTheme as render };

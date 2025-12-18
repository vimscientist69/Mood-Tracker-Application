// theme-test-utils.tsx
import React from "react";
import { render } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import {
  mockTheme,
  mockDarkTheme,
  mockNavigationTheme,
  mockDarkNavigationTheme,
} from "./theme-mock";

type ThemeType = "light" | "dark";

export const renderWithTheme = (
  component: React.ReactElement,
  options: { themeType?: ThemeType; withNavigation?: boolean } = {},
) => {
  const { themeType = "light", withNavigation = false } = options;
  const theme = themeType === "dark" ? mockDarkTheme : mockTheme;
  const navTheme =
    themeType === "dark" ? mockDarkNavigationTheme : mockNavigationTheme;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <PaperProvider theme={theme}>
      {withNavigation ? (
        <NavigationContainer theme={navTheme}>{children}</NavigationContainer>
      ) : (
        children
      )}
    </PaperProvider>
  );

  return render(component, { wrapper: Wrapper });
};

export * from "@testing-library/react-native";
export { renderWithTheme as render };

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "@clerk/clerk-expo";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { AuthNavigator } from "./AuthNavigator";
import { MainNavigator } from "./MainNavigator";
import { useAppTheme } from "@/context/ThemeContext";

export const RootNavigator = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { navTheme } = useAppTheme();

  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {isSignedIn ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

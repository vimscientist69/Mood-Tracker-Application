import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainTabNavigator } from "./MainTabNavigator";
import { LogMoodScreen } from "../screens/main/LogMoodScreen";

const Stack = createNativeStackNavigator();

export const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={MainTabNavigator} />
      <Stack.Screen
        name="LogMood"
        component={LogMoodScreen}
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Log Mood",
          // Customize header for modal if needed (e.g., close button)
          // Default Native Stack modal header usually has a pull-down or close action on iOS
        }}
      />
    </Stack.Navigator>
  );
};

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {MaterialCommunityIcons} from '@expo/vector-icons'; // Using Expo's vector icons
import {useAppTheme} from '../context/ThemeContext';
import {HomeScreen} from '../screens/main/HomeScreen';
import {AnalyticsScreen} from '../screens/main/AnalyticsScreen';
import {SettingsScreen} from '../screens/main/SettingsScreen';

const Tab = createBottomTabNavigator();

const HomeIcon = ({color, size}: {color: string; size: number}) => (
  <MaterialCommunityIcons name="home" color={color} size={size} />
);

const AnalyticsIcon = ({color, size}: {color: string; size: number}) => (
  <MaterialCommunityIcons name="chart-bar" color={color} size={size} />
);

const SettingsIcon = ({color, size}: {color: string; size: number}) => (
  <MaterialCommunityIcons name="cog" color={color} size={size} />
);

export const MainTabNavigator = () => {
  const {theme} = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.elevation.level2,
          borderTopColor: theme.colors.outline,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: HomeIcon,
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: AnalyticsIcon,
          tabBarLabel: 'Analytics',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: SettingsIcon,
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

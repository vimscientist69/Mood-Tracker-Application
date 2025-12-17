import React from 'react';
import {View, StyleSheet, Animated, Easing} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Button,
  Text,
  List,
  Switch,
  Avatar,
  Divider,
  useTheme,
} from 'react-native-paper';
import {useClerk, useUser} from '@clerk/clerk-expo';
import {useUserProfile} from '@/hooks/useUserProfile';
import {SPACING} from '@/theme/styleConstants';
import {useToggleTheme, useAppTheme} from '@/context/ThemeContext';

const ListIconTheme = (props: any) => (
  <List.Icon {...props} icon="theme-light-dark" />
);

export const SettingsScreen = () => {
  const {signOut} = useClerk();
  const {user} = useUser();
  const theme = useTheme();
  const {data: userProfile} = useUserProfile();
  const toggleTheme = useToggleTheme();
  const {isDark} = useAppTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleThemeToggle = () => {
    // Add a nice scale animation when toggling theme
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
    ]).start();
    
    // Toggle the theme after starting the animation
    toggleTheme();
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.background,
          opacity: fadeAnim,
        }
      ]}
    >
      <View style={styles.header}>
        {user?.imageUrl ? (
          <Avatar.Image size={80} source={{uri: user.imageUrl}} />
        ) : (
          <Avatar.Text
            size={80}
            label={userProfile?.displayName?.charAt(0) || 'U'}
          />
        )}
        <Text variant="headlineSmall" style={styles.name}>
          {userProfile?.displayName || 'User'}
        </Text>
        <Text variant="bodyMedium" style={styles.email}>
          {userProfile?.email}
        </Text>
      </View>

      <List.Section>
        <List.Subheader>Preferences</List.Subheader>
        <List.Item
          title="Dark Mode"
          left={ListIconTheme}
          // eslint-disable-next-line react/no-unstable-nested-components
          right={props => (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Switch 
                {...props} 
                value={isDark} 
                onValueChange={handleThemeToggle} 
              />
            </Animated.View>
          )}
        />
      </List.Section>

      <Divider />

      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={() => signOut()}
          textColor={theme.colors.error}
          style={styles.logoutButton}>
          Sign Out
        </Button>
        <Text variant="bodySmall" style={styles.version}>
          Version 2.0.0
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  name: {
    marginTop: SPACING.lg,
    fontWeight: 'bold',
  },
  email: {
    opacity: 0.6,
  },
  footer: {
    padding: SPACING.lg,
    marginTop: 'auto',
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    borderColor: '#ff000050',
  },
  version: {
    marginTop: SPACING.lg,
    opacity: 0.4,
  },
});

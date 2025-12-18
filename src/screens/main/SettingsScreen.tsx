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
  Surface,
} from 'react-native-paper';
import {useClerk, useUser} from '@clerk/clerk-expo';
import {useUserProfile} from '@/hooks/useUserProfile';
import {
  responsive as r,
  responsiveSpacing as rs,
  responsiveFontSizes,
  isTablet,
  isDesktop,
} from '@/utils/responsive';
import {useToggleTheme, useAppTheme} from '@/context/ThemeContext';

const ListIconTheme = (props: any) => (
  <List.Icon {...props} icon="theme-light-dark" />
);

const DarkThemeToggleSwitch = (props: any) => (
  <Animated.View
    style={{
      transform: [{scale: props.scaleAnim}],
      justifyContent: 'center',
    }}>
    <Switch
      {...props}
      value={props.isDark}
      onValueChange={props.handleThemeToggle}
    />
  </Animated.View>
);

export const SettingsScreen = () => {
  const {signOut} = useClerk();
  const {user} = useUser();
  const {theme} = useAppTheme();
  const {data: userProfile} = useUserProfile();
  const toggleTheme = useToggleTheme();
  const {isDark} = useAppTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  // Responsive values
  const avatarSize = isTablet ? 120 : 80;
  const containerMaxWidth = 800;

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
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
      }}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            opacity: fadeAnim,
          },
        ]}>
        <View
          style={[
            styles.contentContainer,
            isDesktop && {
              maxWidth: containerMaxWidth,
              alignSelf: 'center',
              width: '100%',
            },
          ]}>
          <Surface
            style={[
              styles.headerContainer,
              {
                backgroundColor: theme.colors.surface,
                elevation: 2,
                borderRadius: r.borderRadius.large,
                margin: isTablet ? rs.xl : rs.lg,
                padding: isTablet ? rs.xxl : rs.xl,
              },
            ]}>
            <View style={styles.header}>
              {user?.imageUrl ? (
                <Avatar.Image size={avatarSize} source={{uri: user.imageUrl}} />
              ) : (
                <Avatar.Text
                  size={avatarSize}
                  label={userProfile?.displayName?.charAt(0) || 'U'}
                  style={{backgroundColor: theme.colors.primary}}
                  color={theme.colors.onPrimary}
                  labelStyle={{fontSize: avatarSize * 0.4}}
                />
              )}
              <View style={styles.headerTextContainer}>
                <Text
                  variant={isTablet ? 'headlineMedium' : 'headlineSmall'}
                  style={[styles.name, {marginTop: isTablet ? rs.lg : rs.md}]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {userProfile?.displayName || 'User'}
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[styles.email, {marginTop: rs.xs}]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {userProfile?.email}
                </Text>
              </View>
            </View>
          </Surface>

          <View
            style={[
              styles.settingsContainer,
              {paddingHorizontal: isTablet ? rs.xxl : rs.lg},
            ]}>
            <List.Section style={styles.section}>
              <List.Subheader
                style={[
                  styles.sectionHeader,
                  {fontSize: responsiveFontSizes.md},
                ]}>
                Preferences
              </List.Subheader>
              <Surface
                style={[
                  styles.settingItem,
                  {
                    backgroundColor: theme.colors.surface,
                    borderRadius: r.borderRadius.medium,
                    elevation: 1,
                  },
                ]}>
                <View style={{overflow: 'hidden'}}>
                  <List.Item
                    title="Dark Mode"
                    titleStyle={{fontSize: responsiveFontSizes.md}}
                    left={ListIconTheme}
                    right={() =>
                      DarkThemeToggleSwitch({
                        scaleAnim,
                        isDark,
                        handleThemeToggle,
                      })
                    }
                    style={styles.listItem}
                  />
                </View>
              </Surface>
            </List.Section>

            <Divider style={[styles.divider, {marginVertical: rs.xl}]} />

            <View style={styles.footer}>
              <Button
                mode="outlined"
                onPress={() => signOut()}
                textColor={theme.colors.error}
                style={[
                  styles.logoutButton,
                  {
                    width: isTablet ? '60%' : '100%',
                    maxWidth: 400,
                    alignSelf: 'center',
                  },
                ]}
                contentStyle={{
                  height: isTablet ? 48 : 44,
                }}
                labelStyle={{
                  fontSize: responsiveFontSizes.md,
                }}>
                Sign Out
              </Button>
              <Text
                variant="bodySmall"
                style={[
                  styles.version,
                  {
                    marginTop: isTablet ? rs.xl : rs.lg,
                    fontSize: responsiveFontSizes.sm,
                  },
                ]}>
                Version 2.0.0
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  headerContainer: {
    marginTop: isTablet ? rs.xxl : rs.xl,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerTextContainer: {
    alignItems: 'center',
    marginTop: rs.lg,
    maxWidth: '100%',
    paddingHorizontal: rs.md,
  },
  name: {
    fontWeight: '600',
    textAlign: 'center',
  },
  email: {
    opacity: 0.7,
    textAlign: 'center',
    maxWidth: '100%',
  },
  settingsContainer: {
    flex: 1,
    paddingBottom: rs.xl,
  },
  section: {
    marginTop: rs.xl,
  },
  sectionHeader: {
    paddingLeft: rs.sm,
    marginBottom: rs.sm,
    fontWeight: '600',
  },
  settingItem: {
    borderRadius: r.borderRadius.medium,
  },
  listItem: {
    paddingHorizontal: rs.md,
  },
  divider: {
    marginHorizontal: rs.lg,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: rs.xl,
  },
  logoutButton: {
    borderColor: 'rgba(255, 0, 0, 0.2)',
    borderRadius: r.borderRadius.medium,
  },
  version: {
    opacity: 0.5,
  },
});

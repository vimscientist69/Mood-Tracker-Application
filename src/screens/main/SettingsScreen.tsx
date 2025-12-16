import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
    Button,
    Text,
    List,
    Switch,
    Avatar,
    Divider,
    useTheme,
} from 'react-native-paper';
import { useClerk, useUser } from '@clerk/clerk-expo';
import { useUserProfile } from '../../hooks/useUserProfile';

export const SettingsScreen = () => {
    const { signOut } = useClerk();
    const { user } = useUser();
    const theme = useTheme();
    const { data: userProfile, updateProfile } = useUserProfile();

    const isDark = userProfile?.preferences?.theme === 'dark';

    const toggleTheme = () => {
        updateProfile({
            preferences: {
                ...userProfile?.preferences,
                theme: isDark ? 'light' : 'dark',
            },
        });
    };

    return (
        <View
            style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.header}>
                {user?.imageUrl ? (
                    <Avatar.Image size={80} source={{ uri: user.imageUrl }} />
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
                    left={props => <List.Icon {...props} icon="theme-light-dark" />}
                    right={() => <Switch value={isDark} onValueChange={toggleTheme} />}
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    name: {
        marginTop: 16,
        fontWeight: 'bold',
    },
    email: {
        opacity: 0.6,
    },
    footer: {
        padding: 16,
        marginTop: 'auto',
        alignItems: 'center',
    },
    logoutButton: {
        width: '100%',
        borderColor: '#ff000050',
    },
    version: {
        marginTop: 16,
        opacity: 0.4,
    },
});

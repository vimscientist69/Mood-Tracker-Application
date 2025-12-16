import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAuth, useClerk } from '@clerk/clerk-expo';

export const SettingsScreen = () => {
    const { signOut } = useClerk();

    return (
        <View style={styles.container}>
            <Text variant="headlineMedium">Settings</Text>
            <Button mode="contained" onPress={() => signOut()} style={{ marginTop: 20 }}>
                Sign Out
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

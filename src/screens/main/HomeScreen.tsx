import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuth } from '@clerk/clerk-expo';

export const HomeScreen = () => {
    const { signOut } = useAuth(); // Temp for testing

    return (
        <View style={styles.container}>
            <Text variant="headlineMedium">Home Dashboard</Text>
            <Text variant="bodyMedium">Calendar will go here</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
});

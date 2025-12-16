import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text, Button} from 'react-native-paper';
import {useClerk} from '@clerk/clerk-expo';

const HomeScreen = () => {
  const {signOut} = useClerk();
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Welcome back!</Text>
      <Text>You are signed in.</Text>
      <Button mode="contained" onPress={() => signOut()}>
        Sign Out
      </Button>
    </View>
  );
};

export const MainNavigator = () => {
  // Placeholder for Tab Navigator
  return <HomeScreen />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
});

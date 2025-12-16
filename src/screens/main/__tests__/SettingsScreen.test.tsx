import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {SettingsScreen} from '../SettingsScreen';
import {Provider as PaperProvider} from 'react-native-paper';

// Mock dependencies
const mockSignOut = jest.fn();
jest.mock('@clerk/clerk-expo', () => ({
  useClerk: () => ({signOut: mockSignOut}),
  useUser: () => ({user: {imageUrl: 'test-url', fullName: 'Test User'}}),
}));

const mockUpdateProfile = jest.fn();
jest.mock('../../../hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    data: {
      displayName: 'Test User',
      email: 'test@example.com',
      preferences: {theme: 'light'},
    },
    updateProfile: mockUpdateProfile,
  }),
}));

describe('SettingsScreen', () => {
  it('renders correctly', () => {
    const {getByText} = render(
      <PaperProvider>
        <SettingsScreen />
      </PaperProvider>,
    );

    expect(getByText('Preferences')).toBeTruthy();
    // Header says userName.
    expect(getByText('Test User')).toBeTruthy();
    expect(getByText('Sign Out')).toBeTruthy();
  });

  it('handles sign out', () => {
    const {getByText} = render(
      <PaperProvider>
        <SettingsScreen />
      </PaperProvider>,
    );

    fireEvent.press(getByText('Sign Out'));
    expect(mockSignOut).toHaveBeenCalled();
  });
});

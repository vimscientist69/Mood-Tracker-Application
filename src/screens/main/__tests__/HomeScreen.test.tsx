import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {HomeScreen} from '../HomeScreen';
import {Provider as PaperProvider} from 'react-native-paper';

// Mock dependencies
jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => ({signOut: jest.fn()}),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../../../hooks/useMoodLogs', () => ({
  useMoodLogs: () => ({
    logs: [
      {date: '2025-01-01', moodRating: 5, tags: ['Happy']},
      {date: '2025-01-02', moodRating: 3, tags: ['Neutral']},
    ],
    isLoading: false,
  }),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    const useNavigation = require('@react-navigation/native').useNavigation;
    useNavigation.mockReturnValue({navigate: jest.fn()});
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders correctly', () => {
    const {getByText} = render(
      <PaperProvider>
        <HomeScreen />
      </PaperProvider>,
    );

    expect(getByText('Your Mood Calendar')).toBeTruthy();
  });

  it('navigates to LogMood on FAB press', () => {
    const navigate = jest.fn();
    const useNavigation = require('@react-navigation/native').useNavigation;
    useNavigation.mockReturnValue({navigate});

    const {getByText} = render(
      <PaperProvider>
        <HomeScreen />
      </PaperProvider>,
    );

    fireEvent.press(getByText('Check In')); // FAB label is inferred from icon sometimes, but here it has a label prop? No, FAB.Group has label. Regular FAB has label?
    // Wait, FAB implementation in HomeScreen uses label="Check In".
    // Let's check HomeScreen.tsx implementation.
    // Yes: <FAB label="Check In" ... />

    expect(navigate).toHaveBeenCalledWith('LogMood');
  });
});

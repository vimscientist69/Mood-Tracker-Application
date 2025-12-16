import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';
import { Provider as PaperProvider } from 'react-native-paper';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('@clerk/clerk-expo', () => ({
    useAuth: () => ({ signOut: jest.fn() }),
}));

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));

jest.mock('react-native-calendars', () => {
    const React = require('react');
    const { View, Button } = require('react-native');
    return {
        Calendar: (props: any) => (
            <View testID="calendar">
                <Button
                    title="Press Future Date"
                    onPress={() => props.onDayPress({ dateString: '2025-12-25' })}
                />
                <Button
                    title="Press Past Date"
                    onPress={() => props.onDayPress({ dateString: '2023-01-01' })}
                />
            </View>
        ),
    };
});

jest.mock('../../../hooks/useMoodLogs', () => ({
    useMoodLogs: () => ({
        logs: [
            { date: '2025-01-01', moodRating: 5, tags: ['Happy'] },
            { date: '2025-01-02', moodRating: 3, tags: ['Neutral'] },
        ],
        isLoading: false,
    }),
}));

describe('HomeScreen', () => {
    beforeEach(() => {
        const useNavigation = require('@react-navigation/native').useNavigation;
        useNavigation.mockReturnValue({ navigate: jest.fn() });
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('renders correctly', () => {
        const { getByText } = render(
            <PaperProvider>
                <HomeScreen />
            </PaperProvider>,
        );

        expect(getByText('Your Mood Calendar')).toBeTruthy();
    });

    it('navigates to LogMood on FAB press', () => {
        const navigate = jest.fn();
        const useNavigation = require('@react-navigation/native').useNavigation;
        useNavigation.mockReturnValue({ navigate });

        const { getByText } = render(
            <PaperProvider>
                <HomeScreen />
            </PaperProvider>,
        );

        fireEvent.press(getByText('Check In'));
        jest.runAllTimers(); // Advance timers to allow any pending updates (e.g., from Icon animations) to complete

        expect(navigate).toHaveBeenCalledWith('LogMood');
    });

    it('shows alert and blocks navigation for future dates', () => {
        const navigate = jest.fn();
        const useNavigation = require('@react-navigation/native').useNavigation;
        useNavigation.mockReturnValue({ navigate });

        // Mock Date to a fixed PAST date ("Today" is 2023-01-01)
        const mockDate = new Date('2023-01-01T12:00:00Z');
        jest.useFakeTimers().setSystemTime(mockDate);

        // Spy on Alert
        jest.spyOn(Alert, 'alert');

        const { getByText } = render(
            <PaperProvider>
                <HomeScreen />
            </PaperProvider>,
        );

        // Press Future Date (2025-12-25 > 2023-01-01)
        fireEvent.press(getByText('Press Future Date'));
        expect(Alert.alert).toHaveBeenCalledWith('Future Date', expect.any(String));
        expect(navigate).not.toHaveBeenCalled();

        // Clear mocks
        (Alert.alert as jest.Mock).mockClear();
        navigate.mockClear();

        // Press Past Date (2023-01-01 <= 2023-01-01) - In our mock button it is exactly 2023-01-01, wait logic says > today. 
        // Logic: if day.dateString > today. 
        // Today is 2023-01-01. 2023-01-01 is NOT > 2023-01-01. So it should navigate.
        fireEvent.press(getByText('Press Past Date'));
        expect(Alert.alert).not.toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledWith('LogMood', expect.anything());
    });
});

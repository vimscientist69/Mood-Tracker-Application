import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LogMoodScreen } from '../LogMoodScreen';
import { Provider as PaperProvider } from 'react-native-paper';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ goBack: jest.fn() }),
}));

const mockCreateLog = jest.fn();

jest.mock('../../../hooks/useMoodLogs', () => ({
    useMoodLogs: () => ({
        createLog: mockCreateLog,
        isCreating: false,
    }),
}));

describe('LogMoodScreen', () => {
    beforeEach(() => {
        mockCreateLog.mockClear();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it('renders correctly', () => {
        const { getByText, getByPlaceholderText } = render(
            <PaperProvider>
                <LogMoodScreen />
            </PaperProvider>,
        );

        expect(getByText('How are you feeling?')).toBeTruthy();
        expect(getByText('Mood (1-5)')).toBeTruthy();
        expect(getByPlaceholderText('Write a thought...')).toBeTruthy();
    });

    it('submits the form with default values', async () => {
        // We need to wrap in act probably, but RNTL handles simple interactions
        const { getByText } = render(
            <PaperProvider>
                <LogMoodScreen />
            </PaperProvider>,
        );

        fireEvent.press(getByText('Save Mood'));

        await waitFor(() => {
            expect(mockCreateLog).toHaveBeenCalled();
        });
    });
});

import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import {LogMoodScreen} from '../LogMoodScreen';
import {Provider as PaperProvider} from 'react-native-paper';
import {Alert} from 'react-native';

// Mock dependencies
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockSetOptions = jest.fn();
const mockUseRoute = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
    setOptions: mockSetOptions,
  }),
  useRoute: () => mockUseRoute(),
}));

const mockCreateLog = jest.fn();
const mockUpdateLog = jest.fn();
const mockDeleteLog = jest.fn();

jest.mock('../../../hooks/useMoodLogs', () => ({
  useMoodLogs: () => ({
    createLog: mockCreateLog,
    updateLog: mockUpdateLog,
    deleteLog: mockDeleteLog,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  }),
}));

describe('LogMoodScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Default: Create Mode (no params)
    mockUseRoute.mockReturnValue({params: {}});
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders correctly in Create Mode', () => {
    const {getByText, getByPlaceholderText} = render(
      <PaperProvider>
        <LogMoodScreen />
      </PaperProvider>,
    );

    expect(getByText('How are you feeling?')).toBeTruthy();
    expect(getByText('Save Mood')).toBeTruthy();
  });

  it('submits the form in Create Mode', async () => {
    const {getByText} = render(
      <PaperProvider>
        <LogMoodScreen />
      </PaperProvider>,
    );

    fireEvent.press(getByText('Save Mood'));

    await waitFor(() => {
      expect(mockCreateLog).toHaveBeenCalled();
    });
  });

  it('renders correctly in Edit Mode and updates log', async () => {
    const initialLog = {
      date: '2023-10-27',
      moodRating: 5,
      tags: ['Happy'],
      note: 'Great day!',
    };
    mockUseRoute.mockReturnValue({params: {initialLog}});

    const {getByText, getByPlaceholderText} = render(
      <PaperProvider>
        <LogMoodScreen />
      </PaperProvider>,
    );

    expect(getByText('Update your entry')).toBeTruthy();
    expect(getByText('Update Mood')).toBeTruthy();
    // Check if note is pre-filled
    const noteInput = getByPlaceholderText('Write a thought...');
    expect(noteInput.props.value).toBe('Great day!');

    fireEvent.press(getByText('Update Mood'));

    await waitFor(() => {
      // Check that updateLog was called with form data matching initialLog (plus any changes if we made any)
      expect(mockUpdateLog).toHaveBeenCalledWith(
        expect.objectContaining({
          moodRating: 5,
          tags: ['Happy'],
          note: 'Great day!',
          date: '2023-10-27',
        }),
        expect.anything(),
      );
    });
  });

  it('handles Delete action', async () => {
    const initialLog = {
      date: '2023-10-27',
      moodRating: 5,
      tags: [],
    };
    mockUseRoute.mockReturnValue({params: {initialLog}});

    jest.spyOn(Alert, 'alert');

    const {getByTestId} = render(
      <PaperProvider>
        <LogMoodScreen />
      </PaperProvider>,
    );

    fireEvent.press(getByTestId('delete-button'));

    expect(Alert.alert).toHaveBeenCalled();
    // Simulate confirming alert
    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const deleteButton = alertButtons.find((b: any) => b.text === 'Delete');
    deleteButton.onPress();

    expect(mockDeleteLog).toHaveBeenCalledWith('2023-10-27', expect.anything());
  });
});

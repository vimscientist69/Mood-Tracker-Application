import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { DebugMenu } from '../DebugMenu';
import { useAuth } from '@clerk/clerk-expo';
import { useQueryClient } from '@tanstack/react-query';
import { deleteAllMoodData, populateRandomMoodData } from '../../utils/debugUtils';
import alert from '../alert';

// Mock dependencies
jest.mock('@clerk/clerk-expo');
jest.mock('@tanstack/react-query');
jest.mock('../../utils/debugUtils');
jest.mock('../alert');

describe('DebugMenu', () => {
  const mockOnClose = jest.fn();
  const mockUserId = 'test-user-123';
  const mockInvalidateQueries = jest.fn();

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    (useAuth as jest.Mock).mockReturnValue({ userId: mockUserId });
    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: mockInvalidateQueries,
    });
    (deleteAllMoodData as jest.Mock).mockResolvedValue(undefined);
    (populateRandomMoodData as jest.Mock).mockResolvedValue(5);
    (alert as jest.Mock).mockImplementation((title, message, buttons) => {
      // For testing, we'll just call the first button's onPress if it exists
      if (buttons && buttons[0] && buttons[0].onPress) {
        buttons[0].onPress();
      }
    });
  });

  it('renders correctly when visible', () => {
    const { getByText } = render(
      <DebugMenu visible={true} onClose={mockOnClose} />
    );

    expect(getByText('Debug Menu')).toBeTruthy();
    expect(getByText('Delete All Mood Data')).toBeTruthy();
    expect(getByText('Generate Test Mood Data')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = render(
      <DebugMenu visible={false} onClose={mockOnClose} />
    );

    expect(queryByText('Debug Menu')).toBeNull();
  });

  it('calls onClose when backdrop is pressed', () => {
    const { getByTestId } = render(
      <DebugMenu visible={true} onClose={mockOnClose} />
    );

    // Simulate pressing the backdrop
    const backdrop = getByTestId('debug-menu-backdrop');
    fireEvent.press(backdrop);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows confirmation when delete button is pressed', async () => {
    const { getByText } = render(
      <DebugMenu visible={true} onClose={mockOnClose} />
    );

    const deleteButton = getByText('Delete All Mood Data');
    await act(async () => {
      fireEvent.press(deleteButton);
    });

    expect(alert).toHaveBeenCalledWith(
      'Delete All Mood Data',
      expect.any(String),
      expect.any(Array)
    );
  });

  it('calls deleteAllMoodData when confirmed', async () => {
    // Mock the alert to call the confirm button's onPress
    (alert as jest.Mock).mockImplementationOnce((title, message, buttons) => {
      if (buttons && buttons[1] && buttons[1].onPress) {
        buttons[1].onPress();
      }
    });

    const { getByText } = render(
      <DebugMenu visible={true} onClose={mockOnClose} />
    );

    const deleteButton = getByText('Delete All Mood Data');
    await act(async () => {
      fireEvent.press(deleteButton);
    });

    expect(deleteAllMoodData).toHaveBeenCalledWith(mockUserId);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['mood_logs'] });
  });

  it('shows error when delete fails', async () => {
    const errorMessage = 'Test error';
    (deleteAllMoodData as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
    
    // Mock the alert to call the confirm button's onPress
    (alert as jest.Mock).mockImplementationOnce((title, message, buttons) => {
      if (buttons && buttons[1] && buttons[1].onPress) {
        buttons[1].onPress();
      }
    });

    const { getByText } = render(
      <DebugMenu visible={true} onClose={mockOnClose} />
    );

    const deleteButton = getByText('Delete All Mood Data');
    await act(async () => {
      fireEvent.press(deleteButton);
    });

    expect(alert).toHaveBeenCalledWith('Error', expect.stringContaining(errorMessage));
  });

  it('calls populateRandomMoodData when populate button is pressed', async () => {
    const { getByText } = render(
      <DebugMenu visible={true} onClose={mockOnClose} />
    );

    const populateButton = getByText('Generate Test Mood Data');
    await act(async () => {
      fireEvent.press(populateButton);
    });

    expect(populateRandomMoodData).toHaveBeenCalledWith(mockUserId);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['mood_logs'] });
  });

  it('shows error when populate fails', async () => {
    const errorMessage = 'Populate error';
    (populateRandomMoodData as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const { getByText } = render(
      <DebugMenu visible={true} onClose={mockOnClose} />
    );

    const populateButton = getByText('Generate Test Mood Data');
    await act(async () => {
      fireEvent.press(populateButton);
    });

    expect(alert).toHaveBeenCalledWith('Error', expect.stringContaining(errorMessage));
  });
});

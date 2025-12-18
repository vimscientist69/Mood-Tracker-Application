import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { TripleTapDetector } from '../TripleTapDetector';

describe('TripleTapDetector', () => {
  const mockOnTripleTap = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <TripleTapDetector onTripleTap={mockOnTripleTap}>
        <Text>Test Content</Text>
      </TripleTapDetector>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('triggers onTripleTap after three quick taps', () => {
    const { getByText } = render(
      <TripleTapDetector onTripleTap={mockOnTripleTap}>
        <Text>Tap me</Text>
      </TripleTapDetector>
    );

    const pressable = getByText('Tap me');
    
    // First tap
    fireEvent.press(pressable);
    // Second tap
    fireEvent.press(pressable);
    // Third tap
    fireEvent.press(pressable);

    expect(mockOnTripleTap).toHaveBeenCalledTimes(1);
  });

  it('does not trigger onTripleTap for two taps', () => {
    const { getByText } = render(
      <TripleTapDetector onTripleTap={mockOnTripleTap}>
        <Text>Tap me</Text>
      </TripleTapDetector>
    );

    const pressable = getByText('Tap me');
    
    // First tap
    fireEvent.press(pressable);
    // Second tap
    fireEvent.press(pressable);

    expect(mockOnTripleTap).not.toHaveBeenCalled();
  });

  it('resets tap count after timeout', () => {
    const { getByText } = render(
      <TripleTapDetector onTripleTap={mockOnTripleTap}>
        <Text>Tap me</Text>
      </TripleTapDetector>
    );

    const pressable = getByText('Tap me');
    
    // First tap
    fireEvent.press(pressable);
    // Second tap
    fireEvent.press(pressable);
    
    // Fast-forward time to just before timeout
    jest.advanceTimersByTime(400);
    
    // Third tap should still trigger triple tap
    fireEvent.press(pressable);
    expect(mockOnTripleTap).toHaveBeenCalledTimes(1);
    
    // Reset mocks for the next test
    mockOnTripleTap.mockClear();
    
    // Fast-forward past the timeout
    jest.advanceTimersByTime(200);
    
    // Now taps should be reset
    fireEvent.press(pressable);
    fireEvent.press(pressable);
    expect(mockOnTripleTap).not.toHaveBeenCalled();
  });

  it('handles multiple triple tap sequences', () => {
    const { getByText } = render(
      <TripleTapDetector onTripleTap={mockOnTripleTap}>
        <Text>Tap me</Text>
      </TripleTapDetector>
    );

    const pressable = getByText('Tap me');
    
    // First triple tap
    fireEvent.press(pressable);
    fireEvent.press(pressable);
    fireEvent.press(pressable);
    
    // Second triple tap
    fireEvent.press(pressable);
    fireEvent.press(pressable);
    fireEvent.press(pressable);

    expect(mockOnTripleTap).toHaveBeenCalledTimes(2);
  });
});

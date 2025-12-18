import React from 'react';
import { render, act } from '@testing-library/react-native';
import { ConfettiCelebration } from '../animations/ConfettiCelebration';

// Mock the ConfettiCannon component
jest.mock('react-native-confetti-cannon', () => {
  const { View } = require('react-native');
  const React = require('react');
  
  return React.forwardRef(({ autoStart, onAnimationEnd, ...props }: any, ref: any) => {
    // Mock the start method
    React.useImperativeHandle(ref, () => ({
      start: () => {
        if (onAnimationEnd) {
          setTimeout(onAnimationEnd, 100); // Simulate animation end
        }
      },
      stop: () => {},
    }));
    
    return <View testID="confetti-cannon" {...props} />;
  });
});

describe('ConfettiCelebration', () => {
  const onComplete = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('does not render when isVisible is false', () => {
    const { queryByTestId } = render(
      <ConfettiCelebration isVisible={false} onComplete={onComplete} />
    );
    
    expect(queryByTestId('confetti-cannon')).toBeNull();
  });
  
  it('renders when isVisible is true', () => {
    const { getByTestId } = render(
      <ConfettiCelebration isVisible={true} onComplete={onComplete} />
    );
    
    expect(getByTestId('confetti-cannon')).toBeTruthy();
  });
  
  it('calls onComplete after animation completes', () => {
    render(
      <ConfettiCelebration isVisible={true} onComplete={onComplete} />
    );
    
    // Fast-forward time to trigger the animation end
    act(() => {
      jest.advanceTimersByTime(6000); // Slightly more than the 5000ms timeout
    });
    
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
  
  it('uses default count and origin when not provided', () => {
    const { getByTestId } = render(
      <ConfettiCelebration isVisible={true} />
    );
    
    const confetti = getByTestId('confetti-cannon');
    expect(confetti.props.count).toBe(200);
    expect(confetti.props.origin).toEqual({ x: expect.any(Number), y: -10 });
  });
  
  it('uses custom count and origin when provided', () => {
    const customOrigin = { x: 100, y: 200 };
    const { getByTestId } = render(
      <ConfettiCelebration 
        isVisible={true} 
        count={100} 
        origin={customOrigin} 
      />
    );
    
    const confetti = getByTestId('confetti-cannon');
    expect(confetti.props.count).toBe(100);
    expect(confetti.props.origin).toBe(customOrigin);
  });
  
  it('cleans up timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    
    const { unmount } = render(
      <ConfettiCelebration isVisible={true} onComplete={onComplete} />
    );
    
    unmount();
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});

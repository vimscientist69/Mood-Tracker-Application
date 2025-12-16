import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {SignInScreen} from '../SignInScreen';
import {useSignIn} from '@clerk/clerk-expo';

// Type the mock to access jest methods
const mockedUseSignIn = useSignIn as jest.Mock;

describe('SignInScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Reset mock implementation before each test
    mockedUseSignIn.mockReturnValue({
      signIn: {
        create: jest.fn(),
      },
      setActive: jest.fn(),
      isLoaded: true,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders correctly', () => {
    const {getByText, getByTestId} = render(<SignInScreen />);

    expect(getByText('Welcome Back')).toBeTruthy();
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
  });

  it('shows error on empty submission', async () => {
    const {getByText, getByTestId} = render(<SignInScreen />);

    fireEvent.press(getByTestId('sign-in-button'));

    // Advance timers to allow validation to fire
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(getByText('Invalid email address')).toBeTruthy();
      expect(
        getByText('Password must be a minimum of 8 characters'),
      ).toBeTruthy();
    });
  });

  it('calls signIn.create on valid submission', async () => {
    const signInCreateMock = jest
      .fn()
      .mockResolvedValue({createdSessionId: 'sess_123'});
    const setActiveMock = jest.fn().mockResolvedValue(true);

    mockedUseSignIn.mockReturnValue({
      isLoaded: true,
      signIn: {
        create: signInCreateMock,
      },
      setActive: setActiveMock,
    });

    const {getByTestId} = render(<SignInScreen />);

    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.press(getByTestId('sign-in-button'));

    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(signInCreateMock).toHaveBeenCalledWith({
        identifier: 'test@example.com',
        password: 'password123',
      });
      expect(setActiveMock).toHaveBeenCalledWith({session: 'sess_123'});
    });
  });
});

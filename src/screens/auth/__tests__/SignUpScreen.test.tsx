import React from 'react';
import {render, fireEvent, waitFor, act} from '@testing-library/react-native';
import {SignUpScreen} from '../SignUpScreen';
import {useSignUp} from '@clerk/clerk-expo';

const mockedUseSignUp = useSignUp as jest.Mock;

describe('SignUpScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockedUseSignUp.mockReturnValue({
      signUp: {
        create: jest.fn(),
        prepareEmailAddressVerification: jest.fn(),
      },
      setActive: jest.fn(),
      isLoaded: true,
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders correctly', () => {
    const {getByText, getByTestId} = render(<SignUpScreen />);

    expect(getByText('Create Account')).toBeTruthy();
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
    expect(getByTestId('confirm-password-input')).toBeTruthy();
  });

  it('shows error on password mismatch', async () => {
    const {getByText, getByTestId} = render(<SignUpScreen />);

    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.changeText(getByTestId('confirm-password-input'), 'password456');

    fireEvent.press(getByTestId('sign-up-button'));

    act(() => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(getByText("Passwords don't match")).toBeTruthy();
    });
  });

  it('calls signUp.create on valid submission', async () => {
    const signUpCreateMock = jest
      .fn()
      .mockResolvedValue({status: 'missing_requirements'});
    const prepareVerificationMock = jest.fn().mockResolvedValue({});

    mockedUseSignUp.mockReturnValue({
      isLoaded: true,
      signUp: {
        create: signUpCreateMock,
        prepareEmailAddressVerification: prepareVerificationMock,
      },
    });

    const {getByTestId} = render(<SignUpScreen />);

    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), 'password123');
    fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');

    fireEvent.press(getByTestId('sign-up-button'));

    act(() => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(signUpCreateMock).toHaveBeenCalledWith({
        emailAddress: 'test@example.com',
        password: 'password123',
      });
      expect(prepareVerificationMock).toHaveBeenCalled();
    });
  });
});

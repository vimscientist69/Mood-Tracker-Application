import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { ForgotPasswordScreen } from "../ForgotPasswordScreen";
import { useSignIn } from "@clerk/clerk-expo";

const mockedUseSignIn = useSignIn as jest.Mock;

describe("ForgotPasswordScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockedUseSignIn.mockReturnValue({
      signIn: {
        create: jest.fn(),
      },
      isLoaded: true,
    });
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("renders correctly", () => {
    const { getByText, getByTestId } = render(<ForgotPasswordScreen />);

    expect(getByText("Reset Password")).toBeTruthy();
    expect(getByTestId("email-input")).toBeTruthy();
    expect(getByTestId("send-reset-button")).toBeTruthy();
  });

  it("shows error on invalid email", async () => {
    const { getByText, getByTestId } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(getByTestId("email-input"), "invalid-email");
    fireEvent.press(getByTestId("send-reset-button"));

    act(() => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(getByText("Invalid email address")).toBeTruthy();
    });
  });

  it("calls signIn.create on valid submission", async () => {
    const signInCreateMock = jest.fn().mockResolvedValue({});

    mockedUseSignIn.mockReturnValue({
      isLoaded: true,
      signIn: {
        create: signInCreateMock,
      },
    });

    const { getByText, getByTestId } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(getByTestId("email-input"), "test@example.com");
    fireEvent.press(getByTestId("send-reset-button"));

    act(() => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(signInCreateMock).toHaveBeenCalledWith({
        strategy: "reset_password_email_code",
        identifier: "test@example.com",
      });
      expect(getByText("Check your email")).toBeTruthy(); // Checks for success message
    });
  });
});

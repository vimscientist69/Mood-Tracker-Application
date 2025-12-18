import React from "react";
import { fireEvent } from "@testing-library/react-native";
import { SettingsScreen } from "../SettingsScreen";
import { renderWithTheme } from "../../../test-utils/theme-test-utils";

// Mock dependencies
const mockSignOut = jest.fn();
jest.mock("@clerk/clerk-expo", () => ({
  useClerk: () => ({ signOut: mockSignOut }),
  useUser: () => ({ user: { imageUrl: "test-url", fullName: "Test User" } }),
}));

jest.mock("../../../hooks/useUserProfile", () => ({
  useUserProfile: () => ({
    data: {
      displayName: "Test User",
      email: "test@example.com",
      preferences: { theme: "light" },
    },
  }),
}));

describe("SettingsScreen", () => {
  it("renders correctly", () => {
    const { getByText } = renderWithTheme(<SettingsScreen />);
    expect(getByText("Preferences")).toBeTruthy();
    expect(getByText("Test User")).toBeTruthy();
    expect(getByText("Sign Out")).toBeTruthy();
  });

  it("handles sign out", () => {
    const { getByText } = renderWithTheme(<SettingsScreen />);
    fireEvent.press(getByText("Sign Out"));
    expect(mockSignOut).toHaveBeenCalled();
  });
});

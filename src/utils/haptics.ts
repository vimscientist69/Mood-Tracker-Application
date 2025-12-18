import { Platform } from "react-native";

// Web-safe haptic feedback simulation
const triggerWebHaptic = () => {
  if (navigator && "vibrate" in navigator) {
    // Use the Vibration API if available
    navigator.vibrate(10);
  }
};

// Native haptic feedback
let nativeHaptic: any = null;
if (Platform.OS !== "web") {
  try {
    nativeHaptic = require("react-native-haptic-feedback").default;
  } catch (error) {
    console.warn("Haptic feedback not available", error);
  }
}

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const triggerHaptic = (type?: any) => {
  try {
    if (Platform.OS === "web") {
      triggerWebHaptic();
    } else if (nativeHaptic) {
      nativeHaptic.trigger(type || "impactMedium", options);
    }
  } catch (error) {
    console.warn("Haptic feedback error:", error);
  }
};

export const HapticFeedback = {
  selection: () => triggerHaptic("selection"),
  impactLight: () => triggerHaptic("impactLight"),
  impactMedium: () => triggerHaptic("impactMedium"),
  impactHeavy: () => triggerHaptic("impactHeavy"),
  notificationSuccess: () => triggerHaptic("notificationSuccess"),
  notificationWarning: () => triggerHaptic("notificationWarning"),
  notificationError: () => triggerHaptic("notificationError"),
};

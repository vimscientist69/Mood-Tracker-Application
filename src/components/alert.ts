import { Alert, Platform, AlertButton } from "react-native";

type AlertButtonType = AlertButton & {
  style?: "default" | "cancel" | "destructive";
  onPress?: (value?: string) => void;
};

const alert = (
  title: string,
  message?: string,
  buttons: AlertButtonType[] = [{ text: "OK" }],
) => {
  if (Platform.OS === "web") {
    // Fallback to native alert for web if needed
    if (buttons.length === 1 && buttons[0].text === "OK") {
      window.alert([title, message].filter(Boolean).join("\n"));
      return;
    }
    const result = window.confirm([title, message].filter(Boolean).join("\n"));
    if (result) {
      const confirmOption = buttons.find(({ style }) => style !== "cancel");
      confirmOption?.onPress?.();
    } else {
      const cancelOption = buttons.find(({ style }) => style === "cancel");
      cancelOption?.onPress?.();
    }
  } else {
    // Use React Native's native alert for mobile
    Alert.alert(title, message, buttons);
  }
};

export default alert;

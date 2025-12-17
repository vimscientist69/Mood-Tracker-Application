import { Alert, Platform, AlertButton } from 'react-native';

type AlertOptions = {
  cancelable?: boolean;
  onDismiss?: () => void;
  userInterfaceStyle?: 'light' | 'dark';
};

type AlertButtonType = AlertButton & {
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: (value?: string) => void;
};

const alertPolyfill = (
  title: string,
  description?: string,
  options?: AlertButtonType[],
  extra?: AlertOptions
): void => {
  const result = window.confirm([title, description].filter(Boolean).join('\n'));

  if (result) {
    const confirmOption = options?.find(({ style }) => style !== 'cancel');
    confirmOption?.onPress?.();
  } else {
    const cancelOption = options?.find(({ style }) => style === 'cancel');
    cancelOption?.onPress?.();
  }
};

const alert = Platform.OS === 'web' ? alertPolyfill : Alert.alert;

export default alert as {
  (
    title: string,
    message?: string,
    buttons?: AlertButtonType[],
    options?: AlertOptions
  ): void;
  (
    title: string,
    message?: string,
    buttons?: AlertButtonType[],
    options?: AlertOptions & { cancelable?: boolean }
  ): void;
};
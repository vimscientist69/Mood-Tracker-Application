import React from "react";
import { StyleSheet, Animated, ViewStyle, StyleProp } from "react-native";

// Skeleton Loader Component
export const SkeletonLoader: React.FC<{ style?: StyleProp<ViewStyle> }> = ({
  style,
}) => {
  const pulseAnim = React.useRef(new Animated.Value(0.5)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View style={[styles.skeleton, { opacity: pulseAnim }, style]} />
  );
};

// Fade In View Component
export const FadeInView: React.FC<{
  children: React.ReactNode;
  duration?: number;
}> = ({ children, duration = 300 }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, duration]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>{children}</Animated.View>
  );
};

// Scale Button Component
export const ScaleButton: React.FC<{
  children: React.ReactElement<{ onPress?: () => void }>;
  onPress: () => void;
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ children, onPress, scaleTo = 0.95, style }) => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    Animated.spring(scaleValue, {
      toValue: scaleTo,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }
    });
    onPress();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }] }, style]}>
      {React.cloneElement(children, {
        onPress: animatePress,
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#E1E1E1",
    borderRadius: 4,
  },
});

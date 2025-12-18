import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

export const ConfettiCelebration: React.FC<{
  isVisible: boolean;
  onComplete?: () => void;
  count?: number;
  origin?: { x: number; y: number };
}> = ({ isVisible, onComplete, count = 200, origin }) => {
  const confettiRef = useRef<ConfettiCannon>(null);

  useEffect(() => {
    if (isVisible && confettiRef.current) {
      confettiRef.current.start();
      const timer = setTimeout(() => {
        onComplete?.();
      }, 5000); // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) {
    return null;
  }

  const { width } = Dimensions.get("window");

  return (
    <View 
      style={[
        StyleSheet.absoluteFill, 
        { 
          zIndex: 9999, // Ensure it's above other elements
          elevation: 9999, // For Android
          pointerEvents: 'none',
        }
      ]}
    >
      <ConfettiCannon
        ref={confettiRef}
        count={count}
        origin={origin || { x: width / 2, y: 0 }}
        explosionSpeed={300}
        fallSpeed={3500}
        fadeOut
        autoStart={false}
        colors={["#FF5252", "#FFD740", "#69F0AE", "#40C4FF", "#E040FB"]}
      />
    </View>
  );
};

import React, {useRef, ReactNode} from 'react';
import {Pressable, StyleSheet} from 'react-native';

interface TripleTapDetectorProps {
  children: ReactNode;
  onTripleTap: () => void;
}

/**
 * A wrapper component that detects triple-tap gestures
 * Triggers callback when user taps 3 times within 500ms
 */
export const TripleTapDetector: React.FC<TripleTapDetectorProps> = ({
  children,
  onTripleTap,
}) => {
  const tapTimestamps = useRef<number[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePress = () => {
    const now = Date.now();
    const TAP_TIMEOUT = 500; // milliseconds

    // Add current tap timestamp
    tapTimestamps.current.push(now);

    // Filter out taps older than TAP_TIMEOUT
    tapTimestamps.current = tapTimestamps.current.filter(
      timestamp => now - timestamp < TAP_TIMEOUT,
    );

    // Check if we have 3 taps within the time window
    if (tapTimestamps.current.length >= 3) {
      // Triple tap detected!
      onTripleTap();
      tapTimestamps.current = []; // Reset

      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else {
      // Set timeout to reset tap count
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        tapTimestamps.current = [];
        timeoutRef.current = null;
      }, TAP_TIMEOUT);
    }
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

import React, { useEffect, useRef } from "react";
import { View, Animated, Text, StyleSheet } from "react-native";

const ProgressBar = ({
  step,
  totalSteps,
  showText = true,
}: {
  step: number;
  totalSteps: number;
  showText?: boolean;
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Ensure step is at least 0 and does not exceed totalSteps
  const safeStep = Math.min(Math.max(0, step), totalSteps);

  // Calculate percentage progress correctly
  const progress = (safeStep / totalSteps) * 100;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 500, // Smooth animation
      useNativeDriver: false,
    }).start();
  }, [progress]); // Run animation when `progress` changes

  const widthInterpolation = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View className="px-2" style={styles.container}>
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progress, { width: widthInterpolation }]}>
          {safeStep > 0 && ( // Hide dot when step is 0
            <View style={styles.dot}>
              <View style={styles.innerDot} />
            </View>
          )}
        </Animated.View>
      </View>

      {showText && (
        <Text className="text-[1rem] text-primary-500 font-NunitoBold pt-2">
          Step {safeStep} of {totalSteps}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  progressBar: {
    width: "100%",
    height: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
  },
  progress: {
    height: "100%",
    backgroundColor: "#D30309",
    borderRadius: 5,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D30309",
    marginRight: -6,
    alignItems: "center",
    justifyContent: "center",
  },
  innerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFF",
  },
});

export default ProgressBar;

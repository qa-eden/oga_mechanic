import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Image } from "react-native";
import * as SplashScreen from "expo-splash-screen";

export default function AnimatedSplash({ onAnimationEnd }: { onAnimationEnd: () => void }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Keep the splash screen visible while we run our animation
    SplashScreen.preventAutoHideAsync();

    Animated.sequence([
      Animated.delay(500), // Optional: wait a bit
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      SplashScreen.hideAsync();
      onAnimationEnd();
    });
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ scale }] }]}>
      <Image
        source={require("../assets/images/adaptive-icon.png")}
        style={{ width: 120, height: 120 }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
});

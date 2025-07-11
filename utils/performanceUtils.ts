import { Dimensions, Platform } from "react-native"

// Performance configuration based on device capabilities
export const getPerformanceConfig = () => {
  const { width, height } = Dimensions.get("window")
  const isLowEndDevice = width < 375 || height < 667 // iPhone SE and below
  const isAndroid = Platform.OS === "android"

  return {
    // Reduce animations on low-end devices
    enableComplexAnimations: !isLowEndDevice,
    animationDuration: isLowEndDevice ? 200 : 400,
    enableStaggeredAnimations: !isLowEndDevice,
    maxSimultaneousAnimations: isLowEndDevice ? 2 : 4,

    // Android-specific optimizations
    useNativeDriver: true,
    enableShadows: !isAndroid || !isLowEndDevice,

    // FlatList optimizations
    removeClippedSubviews: true,
    maxToRenderPerBatch: isLowEndDevice ? 2 : 4,
    windowSize: isLowEndDevice ? 3 : 5,
  }
}

// Animation presets
export const animationPresets = {
  fast: { duration: 200, tension: 150, friction: 10 },
  normal: { duration: 400, tension: 100, friction: 8 },
  slow: { duration: 600, tension: 80, friction: 6 },
}

// Performance monitoring
export const logPerformance = (animationName: string, startTime: number) => {
  const endTime = Date.now()
  const duration = endTime - startTime

  if (__DEV__ && duration > 16) {
    // 16ms = 60fps threshold
    console.warn(`Animation "${animationName}" took ${duration}ms (may cause frame drops)`)
  }
}

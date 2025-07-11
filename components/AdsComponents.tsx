"use client"

import { View, Text, ImageBackground, TouchableOpacity, Animated, StyleSheet, Dimensions, Platform } from "react-native"
import { useRef, useEffect, memo } from "react"
import { LinearGradient } from "expo-linear-gradient"
import { icons } from "@/constants"
import type { AdsProps } from "@/types/type"

const { width: screenWidth } = Dimensions.get("window")

interface EnhancedAdsProps extends AdsProps {
  adWidth?: number
  onPress?: () => void
  badge?: string
  badgeColor?: string
  buttonText?: string
  animationDelay?: number
  disabled?: boolean
  containerStyle?: any
}

const AdsComponents = memo(
  ({
    image,
    title,
    description,
    adWidth = screenWidth - 40, // Default full width minus padding
    onPress,
    badge = "",
    badgeColor = "#D30309",
    buttonText = "Explore",
    animationDelay = 0,
    disabled = false,
    containerStyle,
  }: EnhancedAdsProps) => {
    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current
    const scaleAnim = useRef(new Animated.Value(0.95)).current
    const slideAnim = useRef(new Animated.Value(30)).current

    useEffect(() => {
      const animationSequence = Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          delay: animationDelay,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          delay: animationDelay,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          delay: animationDelay + 200,
          useNativeDriver: true,
        }),
      ])

      animationSequence.start()

      // Cleanup function
      return () => {
        animationSequence.stop()
      }
    }, [animationDelay])

    const handlePress = () => {
      if (!disabled && onPress) {
        // Add press animation
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.98,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start()

        onPress()
      }
    }

    return (
      <Animated.View
        style={[
          styles.container,
          {
            width: adWidth,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
          containerStyle,
        ]}
        className="bg-red-500"
      >
        <TouchableOpacity
        
          activeOpacity={0.95}
          onPress={handlePress}
          disabled={disabled}
          style={styles.touchable}
          accessibilityRole="button"
          accessibilityLabel={`${title}. ${description}`}
          accessibilityHint="Double tap to explore this promotion"
        >
          <ImageBackground
            source={image}
            style={styles.imageBackground}
            resizeMode="cover"
            imageStyle={styles.imageStyle}
          >
            {/* Enhanced Gradient Overlay */}
            <LinearGradient
              colors={[
                "rgba(0,0,0,0.85)",
                "rgba(0,0,0,0.65)",
                "rgba(0,0,0,0.35)",
                "rgba(0,0,0,0.15)",
                "rgba(0,0,0,0.0)",
              ]}
              style={styles.gradientOverlay}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
            >
              {/* Badge */}
              {badge && (
                <View style={[styles.badge, { backgroundColor: "#fff" }]}>
                  <Text style={[styles.badgeText, { color: badgeColor }]}>{badge}</Text>
                </View>
              )}

              {/* Content Container */}
              <Animated.View
                style={[
                  styles.contentContainer,
                  {
                    transform: [{ translateY: slideAnim }],
                  },
                ]}
              >
                {/* Title */}
                <Text style={styles.title} numberOfLines={2}>
                  {title}
                </Text>

                {/* Description */}
                <Text style={styles.description} numberOfLines={3}>
                  {description}
                </Text>

                {/* Action Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.actionButton, disabled && styles.disabledButton]}
                  onPress={handlePress}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityLabel={buttonText}
                >
                  <icons.explore width={18} height={18} color="#222" />
                  <Text style={styles.buttonText}>{buttonText}</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Loading State Overlay */}
              {disabled && (
                <View style={styles.loadingOverlay}>
                  <View style={styles.loadingIndicator} />
                </View>
              )}
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
      </Animated.View>
    )
  },
)

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#e5e7eb",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  touchable: {
    flex: 1,
  },
  imageBackground: {
    flex: 1,
    justifyContent: "center",
  },
  imageStyle: {
    borderRadius: 24,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  badge: {
    position: "absolute",
    top: 20,
    left: 24,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  badgeText: {
    fontWeight: "bold",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  contentContainer: {
    maxWidth: screenWidth * 0.7,
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
    lineHeight: 32,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 15,
    marginBottom: 20,
    lineHeight: 22,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  actionButton: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#222",
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fff",
    borderTopColor: "transparent",
  },
})

AdsComponents.displayName = "AdsComponents"

export default AdsComponents

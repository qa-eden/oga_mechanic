import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Image,
  Animated,
  type ImageSourcePropType,
  type ImageResizeMode,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { routes } from "@/constants/routes";
import CustomButton from "@/components/CustomButton";
import { images, icons } from "@/constants";
import { useEffect, useRef, useState } from "react";
import React from "react";
import type { ComponentType } from "react";
import { useRoles } from "@/hooks/useRoles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from "react-native";
import LoadingOverlay from "@/components/LoadingOverlay";

type RenderImageProps = {
  source: ImageSourcePropType | ComponentType<any>;
  width: number;
  height: number;
  resizeMode?: ImageResizeMode;
};

const RenderImage = ({
  source,
  width,
  height,
  resizeMode = "contain",
}: RenderImageProps) =>
  typeof source === "function" ? (
    React.createElement(source, { width, height })
  ) : (
    <Image
      source={typeof source === "string" ? { uri: source } : source}
      style={{ width, height }}
      resizeMode={resizeMode}
    />
  );

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const bgWidth = Math.round(screenWidth * 0.92); // 92% of screen width for padding
const overlayImgWidth = Math.round(screenWidth * 0.85); // 85% of screen width for overlay
const overlayImgHeight = Math.round(screenHeight * 0.32); // 32% of screen height for overlay

// Slides for overlays and text
const slides = [
  {
    key: "1",
    header: "DRIVE, EARN & REPEAT",
    text: "Turn your Car into an Income Stream by giving People Safe, Reliable Rides Whenever suits You.",
  },
  {
    key: "2",
    header: "KEEP YOUR CAR RUNNING",
    text: "Our Trusted Mechanics are just a tap away offering Reliable Diagnostics, Quick Repairs.",
  },
  {
    key: "3",
    header: "BUY AND SELL CARS",
    text: "Either you’re Buying or Selling, our Platform Connects you with Verified Transparent Prices,",
  },
  {
    key: "4",
    header: "FAST, RELIABLE, DELIVERY",
    text: "Get your Packages, Meals, and Essentials Delivered without Stress.",
  },
  // Add more slides if needed
];

// Background slides - duplicate the background image 4 times
const backgroundSlides = [
  { key: "bg1", source: images.welcomeImg1 },
  { key: "bg2", source: images.welcomeImg2 },
  { key: "bg3", source: images.welcomeImg3 },
  { key: "bg4", source: images.welcomeImg4 },
];

const Welcome = () => {
  // Animation refs
  const logoAnim = useRef(new Animated.Value(0)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const bgFlatListRef = useRef<FlatList>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const overlayFadeAnim = useRef(new Animated.Value(1)).current;
  const overlayScaleAnim = useRef(new Animated.Value(0.98)).current;

  const { 
    refetch: refetchRoles
  } = useRoles();
  // Navigation handlers with debouncing
  const handleSignUp = async () => {
    if (isNavigating) return;
    try {
      setIsNavigating(true);
      // Mark that user has seen welcome screen
      await AsyncStorage.setItem('has_seen_welcome', 'true');
      router.replace(routes?.signUp as any);
    } catch (error) {
      setIsNavigating(false);
    }
  };

  const handleSignIn = async () => {
    if (isNavigating) return;
    try {
      setIsNavigating(true);
      // Mark that user has seen welcome screen
      await AsyncStorage.setItem('has_seen_welcome', 'true');
      router.replace(routes?.signIn as any);
    } catch (error) {
      setIsNavigating(false);
    }
  };

  // Reset navigation state after timeout
  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isNavigating]);

  // Infinite auto-slide animation
  useEffect(() => {
    if (!flatListRef.current || !bgFlatListRef.current) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const nextIndex = (prev + 1) % slides.length;
        
        // Scroll both FlatLists simultaneously
        flatListRef.current?.scrollToOffset({
          offset: nextIndex * bgWidth,
          animated: true,
        });
        
        bgFlatListRef.current?.scrollToOffset({
          offset: nextIndex * bgWidth,
          animated: true,
        });
        
        return nextIndex;
      });
    }, 7000); // slower slide (7 seconds)
    return () => clearInterval(interval);
  }, [slides.length, bgWidth]);

  // Fade-in animation for overlay image
  useEffect(() => {
    overlayFadeAnim.setValue(0.5); // Start from 0.5 instead of 0
    Animated.timing(overlayFadeAnim, {
      toValue: 1,
      duration: 800, // Faster, less ghostly
      useNativeDriver: true,
    }).start();
  }, [activeIndex]);

  useEffect(() => {
    // Animate all elements in parallel for faster button appearance
    Animated.parallel([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(imageAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1">
        <View style={{ flex: 1, flexDirection: "column" }}>
          {/* Header with Logo */}
          <Animated.View
            style={{
              alignItems: "flex-start",
              opacity: logoAnim,
              transform: [
                {
                  translateY: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
              marginTop: 24,
              marginLeft: 16,
            }}
          >
            <icons.logoBlack width={150} height={60} />
          </Animated.View>

          {/* Main Content - flex: 1 for vertical centering */}
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {/* Headline - swipes with overlay */}
            <View style={{ marginBottom: 16, width: "90%" }}>
              <Text
                style={{
                  fontSize: 23,
                  fontFamily: "Nunito-ExtraBold",
                  color: "#000",
                  marginBottom: 8,
                }}
                className="line-clamp-1"
              >
                {slides[activeIndex]?.header}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: "Nunito-Medium",
                  color: "#666",
                }}
                className="clamp-2 line-clamp-2"
              >
                {slides[activeIndex]?.text}
              </Text>
            </View>

            {/* Main Image Section with Overlay */}
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <View
                style={{
                  width: bgWidth,
                  height: Math.round(screenHeight * 0.45),
                  position: "relative",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Sliding background - 4 duplicated images */}
                <FlatList
                  ref={bgFlatListRef}
                  data={backgroundSlides}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.key}
                  scrollEnabled={false} // Disable direct scrolling, controlled by overlay FlatList
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: bgWidth,
                    height: Math.round(screenHeight * 0.45),
                  }}
                  contentContainerStyle={{
                    alignItems: "center",
                  }}
                  renderItem={({ item }) => (
                    <View
                      style={{
                        width: bgWidth,
                        height: Math.round(screenHeight * 0.45),
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <RenderImage
                        source={item.source}
                        width={bgWidth}
                        height={Math.round(screenHeight )}
                        resizeMode="cover"
                      />
                    </View>
                  )}
                />

                {/* Swiping overlays */}
                <FlatList
                  ref={flatListRef}
                  data={slides}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: bgWidth,
                    height: Math.round(screenHeight * 0.45),
                  }}
                  contentContainerStyle={{
                    alignItems: "center",
                  }}
                  onMomentumScrollEnd={(e) => {
                    const index = Math.round(
                      e.nativeEvent.contentOffset.x / bgWidth
                    );
                    setActiveIndex(index);
                    
                    // Sync background FlatList with overlay FlatList
                    bgFlatListRef.current?.scrollToOffset({
                      offset: index * bgWidth,
                      animated: true,
                    });
                  }}
                  renderItem={({ item, index }) => (
                    <View
                      style={{
                        width: bgWidth,
                        height: Math.round(screenHeight * 0.45),
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* No overlay images - just background slides */}
                    </View>
                  )}
                />
              </View>

              {/* Pagination dots below the image section */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  marginBottom: 6,
                  marginTop: 8,
                }}
              >
                {slides.map((_, i) => (
                  <View
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      margin: 2,
                      backgroundColor:
                        i === activeIndex ? "#D30309" : "#E5E7EB",
                    }}
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Bottom Buttons - pinned to bottom */}
          <Animated.View
            style={{
              opacity: buttonAnim,
              transform: [
                {
                  translateY: buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
              ],
              width: "100%",
              paddingHorizontal: 30,
              paddingBottom: 10,
            }}
            className={"bg-[#fafafa] p-4"}
          >
            <CustomButton
              title={isNavigating ? "Loading..." : "Sign up"}
              className="py-5 mb-3 mt-2 shadow-lg"
              onPress={handleSignUp}
              disabled={isNavigating}
            />
            <CustomButton
              onPress={handleSignIn}
              title={isNavigating ? "Loading..." : "Sign in"}
              bgVariant="dangerborder"
              textVariant="dangerborder"
              className="py-5 my-2 shadow-sm"
              disabled={isNavigating}
            />
          </Animated.View>
        </View>
        
        {/* Loading Overlay */}
        <LoadingOverlay
          visible={isNavigating}
          title="Loading..."
          subtitle="Please wait a moment"
        />
      </SafeAreaView>
    </View>
  );
};

export default Welcome;

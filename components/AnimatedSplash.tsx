import React, { useEffect, useRef } from "react";
import { View, Animated, Image, Text } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { icons } from "@/constants";
import { TruckIcon, WrenchScrewdriverIcon, ShieldCheckIcon } from "react-native-heroicons/outline";

export default function AnimatedSplash({ onAnimationEnd }: { onAnimationEnd: () => void }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Keep the splash screen visible while we run our animation
    SplashScreen.preventAutoHideAsync();

    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Animation complete, but don't hide splash - let auth check control when to hide
      onAnimationEnd();
    });
  }, []);

  return (
    <Animated.View 
      className="absolute inset-0 bg-primary-500 z-50"
      style={{ opacity, transform: [{ scale }] }}
    >
      {/* Main Content */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Logo */}
        <Animated.View 
          className="mb-12"
          style={{ 
            opacity: textOpacity, 
            transform: [{ scale: textScale }] 
          }}
        >
          <View className=" rounded-2xl p-4 shadow-xl">
            <Image
              source={require("../assets/icons/box_logo.png")}
              className="w-28 h-28"
              resizeMode="contain"
            />
          </View>
        </Animated.View>
        
        {/* Main Text */}
        <Animated.View 
          className="items-center"
          style={{ 
            opacity: textOpacity, 
            transform: [{ scale: textScale }] 
          }}
        >
          <Text className="text-5xl font-bold text-white text-center tracking-wider mb-1">EVERYTHING</Text>
          <Text className="text-5xl font-bold text-white text-center tracking-wider">AUTOMOBILE</Text>
          {/* <View className="w-20 h-0.5 bg-white/40 rounded-full mt-4"></View> */}
        </Animated.View>
      </View>
      
      {/* Bottom Features */}
      <View className="bg-green-700 px-6 py-8">
        <View className="flex-row justify-around">
          <View className="items-center flex-1">
            <View className="bg-white/15 rounded-xl p-3 mb-3">
              <TruckIcon size={28} color="#F0FDF4" />
            </View>
            <Text className="text-sm text-green-50 font-semibold text-center">Auto Services</Text>
          </View>
          <View className="items-center flex-1">
            <View className="bg-white/15 rounded-xl p-3 mb-3">
              <WrenchScrewdriverIcon size={28} color="#F0FDF4" />
            </View>
            <Text className="text-sm text-green-50 font-semibold text-center">Expert Mechanics</Text>
          </View>
          <View className="items-center flex-1">
            <View className="bg-white/15 rounded-xl p-3 mb-3">
              <ShieldCheckIcon size={28} color="#F0FDF4" />
            </View>
            <Text className="text-sm text-green-50 font-semibold text-center">Trusted & Secure</Text>
          </View>
        </View>
      </View>

      {/* Logo Section */}
      <View className="bg-white py-8 items-center justify-center">
        <View className="bg-gray-50 rounded-xl p-3">
          <icons.logoBlack width={160} height={80} />
        </View>
      </View>
    </Animated.View>
  );
}
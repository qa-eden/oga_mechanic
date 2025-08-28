"use client";

import { View, Text, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { mechanicRoutes, routes } from "@/constants/routes";
import { icons } from "@/constants";
import { useRef, useEffect } from "react";
import CustomButton from "@/components/CustomButton";

const MechanicWelcome = () => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView className="flex-1 h-screen bg-white" edges={["top"]}>
      <StatusBar style="dark" />

      <View className="flex-1 px-6">
        {/* Logo Section - Centered */}
        <View className="flex-1 justify-center items-center">
          <Animated.View
            style={{
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            }}
            className="items-center"
          >
            <icons.splash width={180} height={90} />

            {/* Subtitle */}
            <Text className="text-lg text-gray-500 font-NunitoMedium text-center leading-relaxed mt-6">
              Let fix some cars,{"\n"}connect with car drivers
            </Text>
          </Animated.View>
        </View>

        {/* Action Buttons */}
        <View className="mt-auto pb-[5rem]">
          {/* Log In Button */}

          <CustomButton
            onPress={() => router?.replace(routes?.signIn as any)}
            title="Log in"
            
            className="py-5 shadow-sm"
          />
          <CustomButton
            title="Sign up"
            bgVariant="dangerborder"
            textVariant="dangerborder"
            className="py-5 my-3"
            onPress={() => router?.replace(mechanicRoutes?.step1 as any)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MechanicWelcome;

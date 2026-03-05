"use client";

import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AnimatedPageContainer from "@/components/AnimatedPageContainer";

const MechanicService = () => {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <AnimatedPageContainer animationType="fadeInDown" duration={500}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl font-NunitoBold">Service Screen</Text>
          <Text className="text-gray-600 mt-2">Coming soon...</Text>
        </View>
      </AnimatedPageContainer>
    </SafeAreaView>
  );
};

export default MechanicService; 
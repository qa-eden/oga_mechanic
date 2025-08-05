"use client";

import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const MechanicService = () => {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <View className="flex-1 items-center justify-center">
        <Text className="text-xl font-NunitoBold">Service Screen</Text>
        <Text className="text-gray-600 mt-2">Coming soon...</Text>
      </View>
    </SafeAreaView>
  );
};

export default MechanicService; 
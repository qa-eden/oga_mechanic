import { View, ImageBackground, ScrollView } from "react-native";
import React from "react";
import { images } from "@/constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";

const LoginLayout = () => {
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1">
        {/* Background Image */}
        <ImageBackground
          source={images?.loginBackground}
          className="h-[25vh]"
          resizeMode="cover"
        />

        <SafeAreaView className="absolute top-[5%] left-0 right-0 bottom-0">
          <Slot />
        </SafeAreaView>
      </SafeAreaView>
    </View>
  );
};

export default LoginLayout;

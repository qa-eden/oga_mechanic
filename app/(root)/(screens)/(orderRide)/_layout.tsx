import { View } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { Slot } from "expo-router";

const OrderRideLayout = () => {
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Slot />
    </View>
  );
};

export default OrderRideLayout;

import { View, Text, ScrollView } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { Slot } from "expo-router";

const OrderRideLayout = () => {
  return (
    <ScrollView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Slot />
    </ScrollView>
  );
};

export default OrderRideLayout;

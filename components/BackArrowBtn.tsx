import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { icons } from "@/constants";
import { router } from "expo-router";

const BackArrowBtn = ({ onPress }: { onPress?: () => void }) => {
  return (
    <TouchableOpacity
      onPress={() => {
        onPress || router?.back();
      }}
      className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm"
    >
      <icons.backBtn />
    </TouchableOpacity>
  );
};

export default BackArrowBtn;
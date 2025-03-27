import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { icons, images } from "@/constants";
import { SunIcon, MoonIcon, CloudIcon } from "react-native-heroicons/outline";

const getTimeOfDay = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return { label: "Morning", icon: <SunIcon size={24} color="orange" /> };
  } else if (hour >= 12 && hour < 18) {
    return { label: "Afternoon", icon: <CloudIcon size={24} color="gold" /> };
  } else {
    return { label: "Evening", icon: <MoonIcon size={24} color="blue" /> };
  }
};

const Navbar = () => {
  const { label, icon } = getTimeOfDay();

  return (
    <View className="flex-row justify-between items-center">
      <View className="flex flex-row items-center gap-2">
        <View className="w-[45px] h-[45px] bg-[#EBEBEB] flex justify-center items-center rounded-full">
          <Image
            source={images.dummyProfile}
            className="w-[40px] h-[40px] rounded-full"
          />
        </View>

        <View>
          <View className="flex flex-row items-center gap-1">
            <Text className="font-NunitoBold text-[1.2rem]">Hi, Okorie</Text>
            {icon}
          </View>
          <Text className="text-[12px] text-text-100 pt-[.1rem]">
            Everything your car needs is here.
          </Text>
        </View>
      </View>

      <TouchableOpacity className="w-[45px] h-[45px] bg-primary-100 flex justify-center items-center rounded-full">
        <icons.bell />
      </TouchableOpacity>
    </View>
  );
};

export default Navbar;

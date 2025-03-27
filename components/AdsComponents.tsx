import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { images, icons } from "@/constants"; // Assuming you have an `images` constant
import { AdsProps } from "@/types/type";

const AdsComponents = ({ image, title, description }: AdsProps) => {
  return (
    <View className="w-full h-[170px] bg-gray-200 rounded-[1rem] overflow-hidden">
      <ImageBackground
        source={image} // Replace with your image
        className="w-full h-full justify-center"
        resizeMode="cover"
      >
        {/* Gradient Background */}
        <LinearGradient
          colors={["black", "rgba(0,0,0,0.03)"]} // Black to Transparent
          className="absolute top-0 bottom-0 rounded-[1rem] self-start ml-4"
          style={{
            width: "50%", // Adjust width for better effect
            borderRadius: 8,
          }}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        >
          <View className="justify-center h-full pl-3">
            <Text className="text-white text-[1.3rem] font-NunitoBold">
              {title}
            </Text>
            <Text className="text-white text-[13px] py-3">{description}</Text>

            <TouchableOpacity className="bg-white w-[100px] justify-center flex flex-row items-center gap-2 px-2 py-2 rounded-[.7rem] mt-2">
              <icons.explore />
              <Text className="font-NunitoBold">Explore </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

export default AdsComponents;

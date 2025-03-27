import { View, Text } from "react-native";
import React from "react";
import BackArrowBtn from "./BackArrowBtn";
import { icons } from "@/constants";

const UserAuthHeader = () => {
  return (
    <View className="">
      <View className="flex flex-row justify-between mt-2">
        <View className="w-[10%] ">
          <BackArrowBtn />
        </View>
        <icons.splash />
        <View className="w-[10%]"></View>
      </View>

      
    </View>
  );
};

export default UserAuthHeader;

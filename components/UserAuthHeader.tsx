import { View, Text } from "react-native";
import React from "react";
import BackArrowBtn from "./BackArrowBtn";
import { icons } from "@/constants";

const UserAuthHeader = ({
  header,
  onPress,
}: {
  header?: string;
  onPress?: () => void;
}) => {
  return (
    <View className="">
      <View className="flex flex-row justify-between items-center mt-2">
        <View className="w-[10%] ">
          <BackArrowBtn onPress={onPress} />
        </View>
        {header ? (
          <Text className="text-[1.4rem] font-NunitoBold">{header}</Text>
        ) : (
          <View className="w-[100px] items-center justify-center">
            <icons.splash width={120} height={80} />
          </View>
        )}
        <View className="w-[10%]"></View>
      </View>
    </View>
  );
};

export default UserAuthHeader;

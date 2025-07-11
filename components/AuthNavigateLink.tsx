import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { AuthNavigateLinkProps } from "@/types/type";

const AuthNavigateLink = ({
  text,
  textLink,
  containerClassName,
  onPress,
}: AuthNavigateLinkProps) => {
  return (
    <View
      className={`flex justify-center items-center flex-row gap-2 ${containerClassName}`}
    >
      <Text className="text-text-100 text-[1.15rem]">{text}</Text>
      <TouchableOpacity onPress={onPress}>
        <Text className="text-primary-500 font-NunitoBold text-[1.2rem]">
          {textLink}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthNavigateLink;

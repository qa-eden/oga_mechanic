import { View, Text } from "react-native";
import React from "react";
import { HeaderAndDescTextCenterProps } from "@/types/type";

const HeaderAndDescTextCenter = ({
  header,
  text1,
}: HeaderAndDescTextCenterProps) => {
  return (
    <View className="flex items-center justify-center py-4 px-[4rem]">
      <Text className="text-center text-[27px] font-NunitoSemiBold ">
        {header}
      </Text>
      <Text className="text-center text-[15px] py-3 text-text-100">
        {text1}
      </Text>
    </View>
  );
};

export default HeaderAndDescTextCenter;

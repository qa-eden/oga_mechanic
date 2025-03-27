import { View, Text } from "react-native";
import React from "react";
import { HeaderAndDescTextCenterProps } from "@/types/type";

const HeaderAndDescTextCenter = ({
  header,
  text1,
  containerStyle,
  headerStyle,
  textStyle,
}: HeaderAndDescTextCenterProps) => {
  return (
    <View
      className={`flex items-center justify-center py-4 px-[4rem] ${containerStyle}`}
    >
      <Text
        className={`text-center text-[27px] font-NunitoSemiBold ${headerStyle}`}
      >
        {header}
      </Text>
      <Text
        className={`text-center text-[15px] py-3 text-text-100 ${textStyle}`}
      >
        {text1}
      </Text>
    </View>
  );
};

export default HeaderAndDescTextCenter;

import { View, Text } from "react-native";
import React from "react";
import { HeaderAndDescTextCenterProps } from "@/types/type";
import clsx from "clsx";

const HeaderAndDescTextCenter = ({
  header,
  text1,
  containerStyle,
  headerStyle,
  textStyle,
}: HeaderAndDescTextCenterProps) => {
  return (
    <View
      className={clsx(
        "flex items-center justify-center py-4 px-[4rem]",
        containerStyle
      )}
    >
      <Text
        className={clsx(
          "text-center text-[30px] font-NunitoSemiBold",
          headerStyle
        )}
      >
        {header}
      </Text>
      <Text
        className={clsx(
          "text-center text-[17px] py-3 text-text-100",
          textStyle
        )}
      >
        {text1}
      </Text>
    </View>
  );
};

export default HeaderAndDescTextCenter;

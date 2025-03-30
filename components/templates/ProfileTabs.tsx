import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { icons } from "@/constants";

interface Props {
  containerStyles?: string;
  text?: string;
  activeOpacity?: number;
  iconRight?: React.ReactNode;
  iconLeft?: React.ComponentType<{ width: number; height: number }>;
  onPress?: () => void;
}

const ProfileTabs = ({ 
  containerStyles = "", 
  iconRight, 
  iconLeft: IconLeft, 
  text = "",
  activeOpacity,
  onPress 
}: Props) => {
  return (
    <TouchableOpacity
      className={`flex-row justify-between items-center bg-white py-3 ${containerStyles}`}
      onPress={onPress}
      activeOpacity={activeOpacity}
    >
      <View className="flex-row items-center gap-2">
        {IconLeft && (
          <IconLeft width={40} height={40} />
        )}
        <Text className="text-[1.2rem]">{text}</Text>
      </View>

      <View>
        {iconRight ? (
          iconRight
        ) : (
          <icons.rightArrow width={25} height={25} />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ProfileTabs;
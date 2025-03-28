import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

interface Props {
  link?: string;
  name?: string;
  onPress?: () => void;
}

const SectionHeader = ({ link, name, onPress }: Props) => {
  return (
    <View className="flex flex-row justify-between items-center">
      <Text className="text-[#101828] font-NunitoBold text-[1.1rem]">
        {name}
      </Text>
      <TouchableOpacity onPress={onPress} className="text-[#667085]">
        <Text>{link || "See All"}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SectionHeader;

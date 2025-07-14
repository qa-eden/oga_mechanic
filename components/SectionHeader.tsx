import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React from "react";

interface Props {
  link?: string;
  name?: string;
  onPress?: () => void;
  isLoading?: boolean;
}

const SectionHeader = ({ link, name, onPress, isLoading = false }: Props) => {
  return (
    <View className="flex flex-row justify-between items-center">
      <Text className="text-[#101828] font-NunitoBold text-[1.1rem]">
        {name}
      </Text>
      <TouchableOpacity 
        onPress={onPress} 
        className="text-[#667085] flex-row items-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#667085" />
        ) : (
          <Text>{link || "See All"}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default SectionHeader;

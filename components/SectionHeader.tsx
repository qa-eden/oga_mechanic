import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React from "react";
import { ChevronRightIcon } from "react-native-heroicons/outline";

interface Props {
  link?: string;
  name?: string;
  onPress?: () => void;
  isLoading?: boolean;
}

const SectionHeader = ({ link, name, onPress, isLoading = false }: Props) => {
  return (
    <View className="flex flex-row justify-between items-center">
      <Text className="text-[#101828] font-NunitoBold text-[1.2rem]">
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
          <View className="flex-row items-center">
            <Text className="text-primary-500 text-[1.1rem] font-semibold flex-row gap-4 items-center">{link || "See All"} </Text>
            <ChevronRightIcon size={18} color={"#D30309"} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default SectionHeader;

import React from "react";
import { TouchableOpacity, View, Text } from "react-native";

interface SearchSuggestionProps {
  item: { id: string; title: string; type: string; price: string };
  onSelect: (item: any) => void;
}

const SearchSuggestion: React.FC<SearchSuggestionProps> = React.memo(({ item, onSelect }) => (
  <TouchableOpacity
    onPress={() => onSelect(item)}
    className="flex-row items-center justify-between py-3 px-4 border-b border-gray-100"
    activeOpacity={0.7}
  >
    <View className="flex-row items-center flex-1">
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
          item.type === "Car" ? "bg-blue-100" : "bg-orange-100"
        }`}
      >
        <Text className="text-lg">{item.type === "Car" ? "🚗" : "🔧"}</Text>
      </View>
      <View className="flex-1">
        <Text className="font-NunitoBold text-base text-gray-900">
          {item.title}
        </Text>
        <Text className="text-sm text-gray-500">{item.type}</Text>
      </View>
    </View>
    <Text className="font-NunitoBold text-primary-600">{item.price}</Text>
  </TouchableOpacity>
));

export default SearchSuggestion; 
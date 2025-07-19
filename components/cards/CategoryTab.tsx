import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface CategoryTabProps {
  item: string;
  selectedCategory: string;
  onSelect: (category: string) => void;
}

const CategoryTab: React.FC<CategoryTabProps> = React.memo(({ item, selectedCategory, onSelect }) => (
  <TouchableOpacity
    onPress={() => onSelect(item)}
    className={`w-[100px] flex-row justify-center py-3 rounded-[.5rem] ${
      selectedCategory === item ? "bg-primary-500" : "bg-gray-100"
    }`}
    activeOpacity={0.7}
  >
    <Text
      className={`font-NunitoBold text-[1.1rem] ${
        selectedCategory === item ? "text-white" : "text-gray-600"
      }`}
    >
      {item}
    </Text>
  </TouchableOpacity>
));

export default CategoryTab; 
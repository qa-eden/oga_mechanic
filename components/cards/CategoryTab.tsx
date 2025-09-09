import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface CategoryTabProps {
  item: { name: string; id: number | null };
  selectedCategory: string;
  onSelect: (category: string, categoryId: number | null) => void;
}

const CategoryTab: React.FC<CategoryTabProps> = React.memo(({ item, selectedCategory, onSelect }) => (
  <TouchableOpacity
    onPress={() => onSelect(item.name, item.id)}
    className={`w-[100px] flex-row justify-center py-3 rounded-[.5rem] ${
      selectedCategory === item.name ? "bg-primary-500" : "bg-gray-100"
    }`}
    activeOpacity={0.7}
  >
    <Text
      className={`font-NunitoBold text-[1.1rem] ${
        selectedCategory === item.name ? "text-white" : "text-gray-600"
      }`}
    >
      {item.name}
    </Text>
  </TouchableOpacity>
));

export default CategoryTab; 
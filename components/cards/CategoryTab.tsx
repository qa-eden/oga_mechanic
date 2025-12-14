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
    className={`px-5 py-2.5 rounded-full mr-2 border ${
      selectedCategory === item.name 
        ? "bg-primary-500 border-primary-500" 
        : "bg-white border-gray-200"
    }`}
    activeOpacity={0.7}
  >
    <Text
      className={`font-NunitoBold text-sm ${
        selectedCategory === item.name ? "text-white" : "text-gray-600"
      }`}
    >
      {item.name}
    </Text>
  </TouchableOpacity>
));

export default CategoryTab; 
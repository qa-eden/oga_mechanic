import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface ProductDescriptionProps {
  description?: string;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({
  description,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150;
  const shouldTruncate = description && description.length > maxLength;
  const displayText =
    shouldTruncate && !isExpanded
      ? `${description.slice(0, maxLength)}...`
      : description;

  if (!description) {
    return (
      <View
        className="bg-white rounded-2xl p-4 mx-4 mb-3 border border-gray-100"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text className="text-base font-NunitoBold text-gray-900 mb-2">
          Description
        </Text>
        <Text className="text-sm text-gray-500 italic">
          No description available for this product.
        </Text>
      </View>
    );
  }

  return (
    <View
      className="bg-white rounded-2xl p-4 mx-4 mb-3 border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Text className="text-base font-NunitoBold text-gray-900 mb-2">
        Description
      </Text>
      <Text className="text-sm text-gray-700 leading-6">{displayText}</Text>
      {shouldTruncate && (
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          className="mt-2"
        >
          <Text className="text-sm font-NunitoBold text-primary-500">
            {isExpanded ? "Show less" : "Read more"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ProductDescription;


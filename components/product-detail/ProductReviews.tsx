import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Rating from "@/components/Rating";

interface ProductReviewsProps {
  rating?: number;
  reviewCount?: number;
  onViewAll?: () => void;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({
  rating,
  reviewCount = 0,
  onViewAll,
}) => {
  // Safely handle null/undefined rating
  const safeRating = rating ?? 0;
  const displayRating = typeof safeRating === 'number' ? safeRating : 0;

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
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-NunitoBold text-gray-900">
          Customer Reviews
        </Text>
        {reviewCount > 0 && (
          <TouchableOpacity onPress={onViewAll}>
            <Text className="text-sm text-primary-500 font-NunitoMedium">
              View All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-row items-center mb-3">
        <Text className="text-3xl font-NunitoExtraBold text-gray-900 mr-2">
          {displayRating.toFixed(1)}
        </Text>
        <View className="mr-3">
          <Rating rating={displayRating} size={16} />
        </View>
        <Text className="text-sm text-gray-500">
          {reviewCount > 0 ? `(${reviewCount} reviews)` : "No reviews yet"}
        </Text>
      </View>

      {reviewCount === 0 && (
        <View className="bg-gray-50 rounded-xl p-4">
          <Text className="text-sm text-gray-500 text-center">
            Be the first to review this product!
          </Text>
        </View>
      )}
    </View>
  );
};

export default ProductReviews;


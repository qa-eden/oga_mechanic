import React from 'react';
import { View, Text } from 'react-native';
import { ChartBarIcon } from 'react-native-heroicons/solid';

interface RatingData {
  stars: number;
  count: number;
  percentage: number;
  color: string;
}

interface CustomerReviewCardProps {
  totalReviews: string;
  averageRating: number;
  ratingData: RatingData[];
  title?: string;
  icon?: string;
}

const CustomerReviewCard: React.FC<CustomerReviewCardProps> = ({
  totalReviews,
  averageRating,
  ratingData,
  title = "Customer's Review",
  icon = <ChartBarIcon size={20} color="#D30309" />
}) => {
  return (
    <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
      <View className="flex-row items-center mb-4 gap-4">
        <View className="p-2 bg-red-100 rounded items-center justify-center">
          <Text className="text-primary text-xs">{icon}</Text>
        </View>
        <Text className="text-lg font-NunitoBold text-gray-900">
          {title}
        </Text>

      </View>

      <View className="flex-row items-center mb-6">
        <View className="mr-4">
          <Text className="text-3xl font-NunitoExtraBold text-gray-900">
            {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
          </Text>
          <Text className="text-sm text-gray-500 font-NunitoMedium">
            {totalReviews} {parseInt(totalReviews) === 1 ? 'review' : 'reviews'}
          </Text>
        </View>
        <View className="flex-row">
          {[1, 2, 3, 4, 5].map((star) => (
            <Text 
              key={star} 
              className={`text-lg ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ⭐
            </Text>
          ))}
        </View>
      </View>

      {/* Horizontal Bar Chart */}
      {parseInt(totalReviews) > 0 ? (
        <View className="flex-row h-3 rounded-full overflow-hidden mb-4">
          {ratingData.map((item, index) => (
            <View
              key={item.stars}
              className={`${item.color}`}
              style={{ 
                width: `${item.percentage}%`,
                minWidth: item.percentage > 0 ? 2 : 0,
              }}
            />
          ))}
        </View>
      ) : (
        <View className="h-3 rounded-full bg-gray-200 mb-4" />
      )}

      {/* Star Ratings with Colors */}
      <View className="flex-row justify-between mb-2">
        {ratingData.map((item) => (
          <View key={item.stars} className="flex-row items-center">
            <Text className={`${item.color.replace('bg-', 'text-')} text-sm mr-1`}>★</Text>
            <Text className="text-sm text-gray-600">({item.stars})</Text>
          </View>
        ))}
      </View>

      {/* Review Counts */}
      <View className="flex-row justify-between">
        {ratingData.map((item) => (
          <Text key={item.stars} className="text-sm text-gray-600">
            {item.count}
          </Text>
        ))}
      </View>
    </View>
  );
};

export default CustomerReviewCard;

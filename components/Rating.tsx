import { View } from "react-native";
import React from "react";
import { icons } from "@/constants";

interface RatingProps {
  rating: number;
  totalStars?: number;
  size?: number;
}

const Rating: React.FC<RatingProps> = ({
  rating,
  totalStars = 5,
  size = 15,
}) => {
  return (
    <View className="flex-row items-center">
      {[...Array(totalStars)].map((_, index) =>
        index < rating ? (
          <icons.filledStar key={index} width={size} height={size} />
        ) : (
          <icons.unfillStar key={index} width={size} height={size} />
        )
      )}
    </View>
  );
};

export default Rating;

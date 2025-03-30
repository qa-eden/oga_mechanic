import { View, Text, Image, TouchableOpacity, Platform } from "react-native";
import { SvgProps } from "react-native-svg";
import { FC } from "react";
import Rating from "../Rating";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import { icons } from "@/constants";

interface Props {
  Images: string | FC<SvgProps>;
  rating?: number;
  name?: string;
  address?: string;
  reviewCount?: number;
  price?: number;
  love?: boolean;
  showLove?: boolean;
  onPress?: () => void;
}

const Card1 = ({
  Images,
  rating,
  name,
  address,
  price,
  reviewCount,
  showLove,
  onPress,
}: Props) => {
  return (
    <TouchableOpacity
      className="flex-1 w-full mt-4 overflow-hidden border border-gray-300 rounded-lg bg-white relative"
      onPress={onPress}
      activeOpacity={0.7} // Adds a visual feedback on press
      touchSoundDisabled={false} // Enables default touch sound
      style={{
        // Adds shadow for better depth on iOS and Android
        ...Platform.select({
          ios: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          android: {
            elevation: 3,
          },
        }),
      }}
    >
      {showLove && (
        <TouchableOpacity className="flex flex-row  items-center absolute top-3 right-3 p-1 rounded-full z-50">
          <icons.love width={18} height={18} />
        </TouchableOpacity>
      )}

      <Images />

      <View className="flex flex-col p-2">
        <Text
          className="text-base font-NunitoBold text-[#101828] "
          numberOfLines={1}
        >
          {name}
        </Text>
        {address && (
          <Text className="text-xs font-Nunito text-black-100">{address}</Text>
        )}

        {rating && (
          <View className="flex flex-row items-center my-2">
            <Rating rating={rating ?? 0} />
            <Text className="text-md font-NunitoSemiBold pl-2 text-text-100">
              {rating} ({reviewCount})
            </Text>
          </View>
        )}

        {price && (
          <View className="flex flex-row items-center justify-between pb-2">
            <NairaCurrency
              value={price ?? 0}
              prefix="NGN"
              className="text-lg font-NunitoBold text-[#101828]"
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default Card1;

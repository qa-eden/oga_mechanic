import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import CustomButton from "@/components/CustomButton";
import AndroidNavBarSpacer from "@/components/AndroidNavBarSpacer";
import { HeartIcon } from "react-native-heroicons/outline";
import { HeartIcon as HeartIconSolid } from "react-native-heroicons/solid";

interface ProductActionBarProps {
  isInCart: boolean;
  isFavorite: boolean;
  quantity: number;
  maxStock: number;
  isAddingToCart: boolean;
  isRemovingFromCart: boolean;
  isUpdatingQuantity: boolean;
  isTogglingFavorite: boolean;
  showFavoriteSuccess: boolean;
  onAddToCart: () => void;
  onRemoveFromCart: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onToggleFavorite: () => void;
}

const ProductActionBar: React.FC<ProductActionBarProps> = ({
  isInCart,
  isFavorite,
  quantity,
  maxStock,
  isAddingToCart,
  isRemovingFromCart,
  isUpdatingQuantity,
  isTogglingFavorite,
  showFavoriteSuccess,
  onAddToCart,
  onRemoveFromCart,
  onIncrement,
  onDecrement,
  onToggleFavorite,
}) => {
  return (
    <View
      className="bg-white border-t border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
      }}
    >
      <View className="px-4 py-3 flex-row items-center space-x-3">
        {/* Favorite Button */}
        <TouchableOpacity
          onPress={onToggleFavorite}
          disabled={isTogglingFavorite}
          className={`w-12 h-12 rounded-xl items-center justify-center ${
            showFavoriteSuccess
              ? "bg-green-100"
              : isFavorite
              ? "bg-red-50"
              : "bg-gray-100"
          }`}
          style={{
            opacity: isTogglingFavorite ? 0.6 : 1,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              },
              android: {
                elevation: 2,
              },
            }),
          }}
        >
          {isTogglingFavorite ? (
            <ActivityIndicator size="small" color="#D30309" />
          ) : showFavoriteSuccess ? (
            <Text className="text-lg text-green-500 font-NunitoBold">✓</Text>
          ) : isFavorite ? (
            <HeartIconSolid size={24} color="#EF4444" />
          ) : (
            <HeartIcon size={24} color="#6B7280" />
          )}
        </TouchableOpacity>

        {/* Main Action Area */}
        <View className="flex-1">
          {isInCart ? (
            <View className="space-y-2">
              {/* Quantity Controls */}
              <View className="flex-row items-center bg-gray-50 rounded-xl overflow-hidden border border-gray-200 mb-2">
                <TouchableOpacity
                  onPress={onDecrement}
                  disabled={isUpdatingQuantity || quantity <= 1}
                  className="flex-1 py-3 items-center bg-gray-100"
                  style={{
                    opacity: isUpdatingQuantity || quantity <= 1 ? 0.4 : 1,
                  }}
                  activeOpacity={0.7}
                >
                  <Text className="text-2xl font-NunitoBold text-gray-700">
                    −
                  </Text>
                </TouchableOpacity>

                <View className="flex-1 py-3 items-center border-x border-gray-200 bg-white">
                  {isUpdatingQuantity ? (
                    <ActivityIndicator size="small" color="#D30309" />
                  ) : (
                    <Text className="text-lg font-NunitoBold text-gray-900">
                      {quantity}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={onIncrement}
                  disabled={isUpdatingQuantity || quantity >= maxStock}
                  className="flex-1 py-3 items-center bg-gray-100"
                  style={{
                    opacity: isUpdatingQuantity || quantity >= maxStock ? 0.4 : 1,
                  }}
                  activeOpacity={0.7}
                >
                  <Text className="text-2xl font-NunitoBold text-gray-700">
                    +
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Remove Button */}
              <CustomButton
                title="Remove from Cart"
                onPress={onRemoveFromCart}
                disabled={isRemovingFromCart}
                loading={isRemovingFromCart}
                loadingText="Removing"
                className="bg-gray-800"
              />
            </View>
          ) : (
            <CustomButton
              title="Add to Cart"
              onPress={onAddToCart}
              disabled={isAddingToCart || maxStock === 0}
              loading={isAddingToCart}
              loadingText="Adding"
            />
          )}
        </View>

      </View>

      <AndroidNavBarSpacer backgroundColor="white" extraHeight={4} />
    </View>
  );
};

export default ProductActionBar;


import React, { memo, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Image, ActivityIndicator } from "react-native";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import { TrashIcon, CheckIcon, PlusIcon, MinusIcon, PhotoIcon } from "react-native-heroicons/outline";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image: any;
  originalPrice?: number;
  discount?: number;
}

interface CartItemCardProps {
  item: CartItem;
  index: number;
  isSelected: boolean;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  bounceAnim: Animated.Value;
  isLoading?: boolean;
  onSelect: (id: number) => void;
  onRemove: (id: number) => void;
  onUpdateQuantity: (id: number, change: number) => void;
  onPress?: () => void;
}

const CartItemCard = memo(({
  item,
  index,
  isSelected,
  fadeAnim,
  slideAnim,
  bounceAnim,
  isLoading = false,
  onSelect,
  onRemove,
  onUpdateQuantity,
  onPress,
}: CartItemCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  return (
  <Animated.View
    style={{
      opacity: fadeAnim,
      transform: [{ translateX: slideAnim }],
    }}
    className="mx-5 mb-2 border border-gray-200 rounded-xl"
  >
    <View
      className="bg-white rounded-xl overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      <View className="flex-row items-center p-2">
        {/* Select Button */}
        <TouchableOpacity
          onPress={() => onSelect(item.id)}
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: isSelected ? "#111" : "#fff",
            borderWidth: 2,
            borderColor: "#111",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 8,
          }}
        >
          {isSelected && <CheckIcon size={14} color="#fff" />}
        </TouchableOpacity>

        {/* Clickable Product Section */}
        <TouchableOpacity 
          onPress={onPress}
          className="flex-1 flex-row items-center"
          activeOpacity={0.7}
          disabled={!onPress}
        >
          {/* Product Image */}
          <View className="w-[70px] rounded-[1rem] h-[80px] overflow-hidden flex items-center justify-center mr-3 bg-gray-100">
            {!item.image || imageError ? (
              // Placeholder when no image or error
              <View className="w-full h-full items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200">
                <View className="w-10 h-10 bg-white rounded-full items-center justify-center mb-1">
                  <PhotoIcon size={20} color="#9CA3AF" />
                </View>
                <Text className="text-[10px] text-gray-400 font-NunitoMedium">No Image</Text>
              </View>
            ) : typeof item.image === "function" ? (
              <item.image width={70} height={80} />
            ) : (
              <>
                <Image
                  source={typeof item.image === "string" ? { uri: item.image } : item.image}
                  style={{ width: 70, height: 80, resizeMode: "cover" }}
                  onError={() => setImageError(true)}
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                />
                {imageLoading && (
                  <View className="absolute w-full h-full items-center justify-center bg-gray-100">
                    <ActivityIndicator size="small" color="#D30309" />
                  </View>
                )}
              </>
            )}
          </View>

          {/* Product Info */}
          <View className="flex-1 mr-2">
            <Text
              className="text-sm font-NunitoBold text-gray-900 mb-1"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>
            <Text className="text-xs text-green-600 font-NunitoMedium">
              ✓ {item.stock} in stock
            </Text>

            {/* Price */}
            <View className="flex-row items-center mt-1">
              <NairaCurrency
                value={item.price}
                className="text-sm font-NunitoBold text-gray-900"
              />
              {item.originalPrice && (
                <Text className="text-xs text-gray-400 line-through ml-2">
                  ₦{item.originalPrice.toLocaleString()}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Controls */}
        <View className="items-end">
          {/* Remove Button */}
          <TouchableOpacity
            onPress={() => onRemove(item.id)}
            className="w-8 h-8 bg-red-50 rounded-full items-center justify-center mb-5"
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.5 : 1 }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <TrashIcon size={18} color="#EF4444" />
            )}
          </TouchableOpacity>

          {/* Quantity Controls */}
          <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
            <View className="flex-row items-center bg-gray-100 rounded-full">
              <TouchableOpacity
                onPress={() => onUpdateQuantity(item.id, -1)}
                className="w-8 h-8 bg-gray-400 rounded-full items-center justify-center"
                disabled={item.quantity <= 1 || isLoading}
                style={{ opacity: item.quantity <= 1 || isLoading ? 0.5 : 1 }}
              >
                <MinusIcon color={"#fff"} />
              </TouchableOpacity>
              
              {isLoading ? (
                <View className="mx-2 min-w-[16px] items-center justify-center">
                  <ActivityIndicator size="small" color="#D30309" />
                </View>
              ) : (
                <Text className="mx-2 text-sm font-NunitoBold text-gray-900 min-w-[16px] text-center">
                  {item.quantity}
                </Text>
              )}
              
              <TouchableOpacity
                onPress={() => onUpdateQuantity(item.id, 1)}
                className="w-8 h-8 bg-primary-500 rounded-full items-center justify-center"
                disabled={item.quantity >= item.stock || isLoading}
                style={{ opacity: item.quantity >= item.stock || isLoading ? 0.5 : 1 }}
              >
                <PlusIcon color={"#fff"} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </View>
    </View>
  </Animated.View>
  );
});

export default CartItemCard; 

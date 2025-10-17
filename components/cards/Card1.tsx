"use client";

import { View, Text, TouchableOpacity, Platform, Animated, Image, ActivityIndicator } from "react-native";
import type { SvgProps } from "react-native-svg";
import { type FC, useRef, memo } from "react";
import Rating from "../Rating";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";
// import { icons } from "@/constants";
import { router } from "expo-router";
import { routes } from "@/constants/routes";
import { HeartIcon } from "react-native-heroicons/outline";
import { useToggleFavorite } from "@/hooks/useProducts";
import { showToast } from "@/utils/toastUtils";

interface Props {
  Images: FC<SvgProps> | number | { uri: string };
  rating?: number;
  name?: string;
  address?: string;
  reviewCount?: number;
  price?: number;
  love?: boolean;
  showLove?: boolean;
  onPress?: () => void;
  onLovePress?: () => void;
  isLoading?: boolean;
  containerStyle?: string;
  productId?: number | string;
  isFavorite?: boolean;
}

const Card1 = memo(({
  Images,
  rating,
  name,
  address,
  price,
  reviewCount,
  showLove = false,
  love = false,
  onPress,
  onLovePress,
  isLoading = false,
  containerStyle,
  productId,
  isFavorite = false,
}: Props) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;

  // Favorite API hook
  const toggleFavoriteMutation = useToggleFavorite();

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handleLovePress = async () => {
    // Trigger heart animation
    Animated.sequence([
      Animated.timing(heartAnim, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Call custom onLovePress if provided, otherwise use API
    if (onLovePress) {
      onLovePress();
    } else if (productId) {
      try {
        await toggleFavoriteMutation.mutateAsync({
          productId: productId.toString(),
          isCurrentlyFavorited: isFavorite
        });

        // Show success toast
        if (isFavorite) {
          showToast.success('Removed from favorites');
        } else {
          showToast.success('Added to favorites');
        }
      } catch (error) {
        console.error('❌ Card favorite error:', error);
        showToast.error('Failed to update favorites. Please try again.');
      }
    }
  };

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to product detail page
      router.push({
        pathname: routes?.ProductDetail,
        params: {
          productId: productId,
          name: name,
          price: price || 0,
        },
      });
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        className={`w-full bg-white rounded-2xl overflow-hidden border border-gray-300 mt-4 ${containerStyle}`}
        onPress={handleCardPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={isLoading}
        style={{
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
            },
            android: {
              elevation: 3,
            },
          }),
        }}
      >
        {/* Image Container */}
        <View className="relative">
          <View className="w-full h-[140px] bg-black rounded-t-2xl justify-center items-center overflow-hidden">
            {isLoading ? (
              <View className="w-full h-full bg-gray-300 animate-pulse" />
            ) : (
              typeof Images === "function" ? (
                <Images className="w-full h-full object-cover" />
              ) : (
                <Image
                  source={typeof Images === "string" ? { uri: Images } : Images}
                  // style={{ width: 100, height: 100, resizeMode: "contain" }}
                  className="w-full h-full object-cover"
                />
              )
            )}
          </View>

          {/* Love/Favorite Button */}
          {showLove && (
            <Animated.View
              style={{ transform: [{ scale: heartAnim }] }}
              className="absolute top-3 right-3"
            >
              <TouchableOpacity
                onPress={handleLovePress}
                disabled={toggleFavoriteMutation.isPending}
                className={`w-8 h-8 rounded-full items-center justify-center ${isFavorite ? 'bg-red-100' : 'bg-black/20'
                  }`}
                style={{
                  opacity: toggleFavoriteMutation.isPending ? 0.6 : 1,
                  ...Platform.select({
                    ios: {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                    },
                    android: {
                      elevation: 4,
                    },
                  }),
                }}
              >
                {toggleFavoriteMutation.isPending ? (
                  <ActivityIndicator size="small" className="text-primary-500" />
                ) : isFavorite ? (
                  <HeartIcon
                    color="red"
                    size={20}
                    fill="red"
                  />
                ) : (
                  <HeartIcon
                    color="white"
                    size={20}
                    fill="none"
                  />
                )}
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>

        {/* Content */}
        <View className="p-3 space-y-2">
          {/* Title */}
          <Text
            className="text-base font-NunitoBold text-gray-900 leading-tight"
            numberOfLines={1}
          >
            {name || "Loading..."}
          </Text>

          {/* Rating */}
          {rating && rating > 0 && (
            <View className="flex-row items-center space-x-1">
              <Rating rating={rating} size={12} />
              <Text className="text-sm font-NunitoMedium text-gray-700 ml-1">
                {rating.toFixed(1)} ({reviewCount || 0})
              </Text>
            </View>
          )}

          {/* Address/Location */}
          {address && typeof address === 'string' && (
            <View className="flex-row items-center bg-gray-50 rounded-lg px-2 py-1.5">
              <View className="w-4 h-4 bg-primary-100 rounded-full items-center justify-center mr-2">
                <Text className="text-xs text-primary-600">📍</Text>
              </View>
              <Text className="text-xs text-gray-600 font-NunitoMedium flex-1" numberOfLines={1}>
                {address}
              </Text>
            </View>
          )}

          {/* Price */}
          {price && price > 0 && (
            <View className="pt-1">
              <NairaCurrency
                value={price}
                className="text-lg font-NunitoBold text-gray-900"
              />
            </View>
          )}

          {/* Loading State */}
          {isLoading && (
            <View className="space-y-2">
              <View className="h-4 bg-gray-200 rounded animate-pulse" />
              <View className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
              <View className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default Card1;

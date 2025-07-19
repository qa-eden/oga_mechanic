"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Linking,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { icons, images } from "@/constants";
import Rating from "@/components/Rating";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import CustomButton from "@/components/CustomButton";
import React from "react";
import CartIconBtn from "@/components/CartIconBtn";
import BackArrowBtn from "@/components/BackArrowBtn";
import { routes } from "@/constants/routes";
import { useCart } from "@/contexts/CartContext";
import AddToCartButton from "@/components/AddToCartButton";

const { width: screenWidth } = Dimensions.get("window");

// Mock product data - in real app, this would come from API
const productData = {
  id: 1,
  name: "Toyota Corolla",
  price: 7000,
  rating: 5.0,
  reviewCount: 30,
  stock: 12,
  seller: {
    name: "Micheal Adenuga",
    phone: "08056432765",
    avatar: images.dummyProfile,
    rating: 5.0,
    reviewCount: 30,
    shippingSpeed: "Excellent",
  },
  description: `I'm a certified auto mechanic with over 10 years of hands-on experience fixing cars of all kinds — from compact rides to heavy-duty SUVs. I specialize in engine repair, brake systems, and vehicle diagnostics. Whether it's a funny noise, a breakdown, or a routine checkup, I'm here to help. I also sell quality spare parts and can come to your location if needed.`,
  delivery: {
    estimatedDays: "2-3 days",
    shippingFeeLocal: 700,
    shippingFeeOutside: 7000,
  },
};

const ProductDetail = () => {
  const params = useLocalSearchParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addToCart, isInCart, getItemQuantity } = useCart();

  const handleCall = () => {
    Linking.openURL(`tel:${productData.seller.phone}`);
  };

  const cartItem = {
    id: productData.id,
    name: productData.name,
    price: productData.price,
    stock: productData.stock,
    image: "sparePart", // Using the spare part image
    originalPrice: productData.price * 1.2, // Mock original price
    discount: 15, // Mock discount
  };

  const handleChatSeller = () => {
    // Chat seller logic
    console.log("Chat seller");
    router.push(routes?.chatSeller);
  };

  const renderImageThumbnail = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => (
    <TouchableOpacity
      onPress={() => setSelectedImageIndex(index)}
      className={`w-fit h-fit rounded-xl overflow-hidden mr-3 ${
        selectedImageIndex === index
          ? "border-2 border-primary-500"
          : "border border-gray-200"
      }`}
    >
      <images.ProductImg
        width={100}
        height={55}
        style={{ flex: 1 }}
        className="object-contain"
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <BackArrowBtn />
        <Text className="text-[1.3rem] font-NunitoBold text-gray-900">
          Buy spare parts
        </Text>

        <CartIconBtn />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Main Product Image */}
        <View className="px-5 pt-4">
          <View className="w-full h-fit bg-gray-100 rounded-2xl overflow-hidden items-center justify-center">
            {typeof images.ProductImg === "function" ? (
              <images.ProductImg
                className="object-cover h-full w-full"
              />
            ) : (
              <Image
                source={
                  typeof images.ProductImg === "string"
                    ? { uri: images.ProductImg }
                    : images.ProductImg
                }
                className="object-cover h-full w-full"
              />
            )}
          </View>

          {/* Image Thumbnails */}
          <View className="mt-4">
            <FlatList
              data={["sparePart", "sparePart"]}
              renderItem={renderImageThumbnail}
              keyExtractor={(item, index) => String(index)}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>

        {/* Seller Info */}
        <View className="px-5 py-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full overflow-hidden mr-3">
              <Image
                source={productData.seller.avatar}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <View className="flex-1">
              <Text className="text-base font-NunitoBold text-gray-900">
                {productData.seller.name}
              </Text>
              <TouchableOpacity
                onPress={handleCall}
                className="flex-row items-center mt-1"
              >
                <icons.redPhone width={14} height={14} />
                <Text className="text-sm text-gray-600 ml-1">
                  {productData.seller.phone}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Product Info */}
        <View className="px-5 pb-4">
          <Text className="text-2xl font-NunitoExtraBold text-gray-900 mb-2">
            {productData.name}
          </Text>

          <NairaCurrency
            value={productData.price}
            className="text-3xl font-NunitoExtraBold text-primary-700 mb-3"
          />

          <View className="flex-row items-center mb-3">
            <Rating rating={productData.rating} size={20} />
            <Text className="text-lg font-NunitoBold text-gray-700 ml-2">
              {productData.rating.toFixed(1)} ({productData.reviewCount})
            </Text>
          </View>

          <Text className="text-base text-green-600 font-NunitoBold">
            Available: {productData.stock} in stock
          </Text>
        </View>

        {/* Description */}
        <View className="px-5 pb-4">
          <Text className="text-xl font-NunitoExtraBold text-gray-900 mb-3">
            Description
          </Text>
          <Text className="text-base text-gray-700 leading-7">
            {productData.description}
          </Text>
        </View>

        {/* Seller Performance */}
        <View className="px-5 pb-4">
          <Text className="text-xl font-NunitoExtraBold text-gray-900 mb-3">
            Seller performance
          </Text>

          <View className="mb-3">
            <Text className="text-sm text-gray-600 mb-1">Rating</Text>
            <View className="flex-row items-center">
              <Rating rating={productData.seller.rating} size={18} />
              <Text className="text-base font-NunitoBold text-gray-700 ml-2">
                {productData.seller.rating.toFixed(1)} (
                {productData.seller.reviewCount})
              </Text>
            </View>
          </View>

          <View>
            <Text className="text-base text-gray-600 mb-1">Shipping speed</Text>
            <Text className="text-base font-NunitoBold text-gray-900">
              {productData.seller.shippingSpeed}
            </Text>
          </View>
        </View>

        {/* Delivery Info */}
        <View className="px-5 pb-6">
          <Text className="text-xl font-NunitoExtraBold text-gray-900 mb-3">
            Delivery info
          </Text>

          <View className="mb-3">
            <Text className="text-base text-gray-600 mb-1">
              Estimated delivery
            </Text>
            <Text className="text-base font-NunitoBold text-gray-900">
              {productData.delivery.estimatedDays}
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-base text-gray-600 mb-2">Shipping fee</Text>
            <Text className="text-base text-gray-900 mb-1">
              NGN {productData.delivery.shippingFeeLocal.toLocaleString()}{" "}
              within your region
            </Text>
            <Text className="text-base text-gray-900">
              NGN {productData.delivery.shippingFeeOutside.toLocaleString()}{" "}
              outside your region
            </Text>
          </View>
        </View>

        {/* Bottom spacing for fixed buttons */}
        <View className="h-40 pb-[1rem]" />
      </ScrollView>

      {/* Fixed Bottom Actions */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-4 pb-10">
        <AddToCartButton
          item={cartItem}
          className="mb-3"
          size="large"
          variant="primary"
        />

        <CustomButton
          title="Chat seller"
          onPress={handleChatSeller}
          bgVariant="secondary"
          textVariant="secondary"
        />
      </View>
    </SafeAreaView>
  );
};

export default ProductDetail;

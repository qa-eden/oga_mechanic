import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import React, { memo, useMemo } from 'react';
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRightIcon } from "react-native-heroicons/outline";
import { ShieldCheckIcon } from "react-native-heroicons/solid";
import { AdsProps } from "@/types/type";

const AdsComponents = memo(
  ({
    image,
    title,
    description,
    onPress,
    price,
    currency = "NGN",
    year,
    repairHistoryCount = 0,
    isBidding = false,
  }: AdsProps) => {
    const formattedPrice = useMemo(() => {
      if (!price) return null;
      const numPrice = typeof price === "string" ? parseFloat(price) : price;
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 0,
      }).format(numPrice);
    }, [price, currency]);

    // Common text shadow for readability
    const textShadow = {
      textShadowColor: 'rgba(0, 0, 0, 0.9)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 6,
    };

    return (
      <TouchableOpacity
        className="w-full h-[185px] bg-gray-200 rounded-[1.5rem] overflow-hidden"
        onPress={onPress}
        activeOpacity={0.9}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.15,
          shadowRadius: 15,
          elevation: 8,
        }}
      >
        <ImageBackground
          source={image}
          className="w-full h-full"
          resizeMode="cover"
        >
          {/* Enhanced Gradient Overlay for Text Readability */}
          <LinearGradient
            colors={["rgba(0,0,0,0.9)", "rgba(0,0,0,0.4)", "rgba(0,0,0,0.1)"]}
            className="absolute inset-0 w-full h-full"
            start={{ x: 0, y: 0.8 }}
            end={{ x: 0.8, y: 0.1 }}
          />

          <View className="flex-1 justify-between p-5">
            {/* Top Row: Badges */}
            <View className="flex-row items-center gap-2">
              {isBidding && (
                <View className="bg-primary-500 px-3 py-1.5 rounded-full flex-row items-center shadow-lg">
                  <View className="w-2 h-2 bg-white rounded-full mr-1.5" />
                  <Text className="text-[10px] font-NunitoExtraBold text-white uppercase tracking-widest">
                    Live Bidding
                  </Text>
                </View>
              )}
              {repairHistoryCount > 0 && (
                <View className="bg-green-600 px-3 py-1.5 rounded-full flex-row items-center shadow-lg">
                  <ShieldCheckIcon size={12} color="white" />
                  <Text className="text-[10px] font-NunitoExtraBold text-white uppercase tracking-widest ml-1.5">
                    Verified History
                  </Text>
                </View>
              )}
            </View>

            {/* Middle: Info */}
            <View className="mt-auto">
              <View className="flex-row items-center gap-2 mb-1.5">
                {year && (
                  <Text 
                    className="text-white text-xs font-NunitoExtraBold bg-black/30 px-1.5 py-0.5 rounded"
                    style={textShadow}
                  >
                    {year}
                  </Text>
                )}
                <Text
                  className="text-white text-xl font-NunitoExtraBold"
                  numberOfLines={1}
                  style={textShadow}
                >
                  {title}
                </Text>
              </View>

              <Text 
                className="text-gray-200 text-xs font-NunitoBold mb-3 leading-4" 
                numberOfLines={2}
                style={textShadow}
              >
                {description}
              </Text>

              {/* Bottom Row: Price & CTA */}
              <View className="flex-row items-center justify-between mt-1">
                <View>
                  <Text 
                    className="text-gray-300 text-[9px] uppercase font-NunitoExtraBold mb-0.5 tracking-tighter"
                    style={textShadow}
                  >
                    {isBidding ? "Current Bid" : "Buy Now"}
                  </Text>
                  <Text 
                    className="text-white text-[20px] font-NunitoExtraBold"
                    style={textShadow}
                  >
                    {formattedPrice || "Contact Seller"}
                  </Text>
                </View>

                <View className="bg-white px-5 py-2.5 rounded-2xl flex-row items-center shadow-xl active:opacity-80">
                  <Text className="text-black font-NunitoExtraBold text-[13px] mr-1.5">
                    Details
                  </Text>
                  <ArrowRightIcon size={16} color="#000" strokeWidth={2.5} />
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    );
  }
);

export default AdsComponents;

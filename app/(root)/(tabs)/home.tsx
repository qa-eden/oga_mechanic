import {
  FlatList,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Navbar from "@/components/Navbar";
import AdsComponents from "@/components/AdsComponents";
import { Ads, CarsList, MechanicsList, SpareParts, icons } from "@/constants";
import Card1 from "@/components/cards/Card1";
import SectionHeader from "@/components/SectionHeader";
import { router } from "expo-router";
import { LAYOUT } from "@/constants/units";

const { width: screenWidth } = Dimensions.get("window");

const HomePage = () => {
  const { SCROLL_PADDING_BOTTOM, CARD_GAP, CARD_PADDING, CONTAINER_PADDING } = LAYOUT;
  const [activeAdIndex, setActiveAdIndex] = useState(0);

  // Calculate card width to show 2 full cards + 1 partial card (20-30% visible)
  const CARD_WIDTH = Math.floor((screenWidth - 35 - 32) / 2.15); // 40px padding, 32px gap, 2.3 cards visible

  // Create infinite loop data
  const infiniteAds = [...Ads, ...Ads, ...Ads];

  const renderAdItem = ({ item, index }: { item: any; index: number }) => (
    <View style={{ width: screenWidth, paddingHorizontal: 20 }}>
      <AdsComponents
        image={item.image}
        title={item.title}
        description={item.description}
        adWidth={screenWidth - 50} // Full width minus padding
        animationDelay={index * 100}
        onPress={() => console.log(`Ad ${index + 1} pressed`)}
      />
    </View>
  )

  const renderAdDotIndicator = () => (
    <View
      style={{
        position: "absolute",
        bottom: 8,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {Ads.map((_, i) => (
        <View
          key={i}
          style={{
            width: i === activeAdIndex ? 24 : 8,
            height: 8,
            borderRadius: 4,
            marginHorizontal: 4,
          }}
          className={i === activeAdIndex ? "bg-primary-500" : "bg-primary-200"}
        />
      ))}
    </View>
  );

  const handleAdMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    const actualIndex = index % Ads.length;
    setActiveAdIndex(actualIndex);
  };

  return (
    <SafeAreaView className="bg-gray-50 flex-1" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: SCROLL_PADDING_BOTTOM, // Increased padding for better spacing
        }}
        className={`${CONTAINER_PADDING}`}
      >
        <Navbar />

        {/* Enhanced Ads Section */}
        <View className="h-64 pt-6 mb-6">
          <FlatList
            data={infiniteAds}
            renderItem={renderAdItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleAdMomentumScrollEnd}
            snapToAlignment="start"
            snapToInterval={screenWidth}
            decelerationRate="fast"
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
          />
          {renderAdDotIndicator()}
        </View>

        {/* Enhanced Search Section */}
        <View className="flex-row justify-between items-center mb-8 bg-white border border-gray-200 px-5 py-2 rounded-[1.2rem] shadow-sm">
          <TouchableOpacity
            onPress={() => router.push("/enterAddressForRide")}
            className="flex-row items-center gap-4 py-2 border-r pr-6 border-gray-200 flex-1"
          >
            <icons.search className="w-6 h-6 text-gray-600" />
            <Text className="text-gray-700 font-NunitoMedium">
              Where are you going today?
            </Text>
          </TouchableOpacity>
          <View className="flex-row bg-primary-100 rounded-[1rem] p-3 ml-4">
            <icons.calender className="w-8 h-8 text-primary-600" />
            <Text className="text-primary-600 pl-2 font-NunitoBold">Later</Text>
          </View>
        </View>

        {/* Enhanced Mechanics Section */}
        <View className="mb-8">
          <SectionHeader name="Top Mechanics" />
          <FlatList
            data={MechanicsList}
            renderItem={({ item }) => (
              <View style={{ width: CARD_WIDTH }}>
                <Card1
                  Images={item.image}
                  rating={item?.rating}
                  name={item?.name}
                  reviewCount={item?.reviewCount}
                />
              </View>
            )}
            keyExtractor={(item) => String(item.id)}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            snapToAlignment="start"
            snapToInterval={CARD_WIDTH + CARD_GAP}
            decelerationRate="fast"
            contentContainerStyle={{
              paddingHorizontal: CARD_PADDING,
              gap: CARD_GAP,
            }}
          />
        </View>

        {/* Enhanced Cars Section */}
        <View className="mb-8">
          <SectionHeader name="Best Selling Cars" />
          <FlatList
            data={CarsList}
            renderItem={({ item }) => (
              <View style={{ width: CARD_WIDTH }}>
                <Card1
                  Images={item.image}
                  rating={item?.rating}
                  name={item?.name}
                  price={item?.price}
                  reviewCount={item?.reviewCount}
                  showLove={true}
                />
              </View>
            )}
            keyExtractor={(item) => String(item.id)}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            snapToAlignment="start"
            snapToInterval={CARD_WIDTH + CARD_GAP}
            decelerationRate="fast"
            contentContainerStyle={{
              paddingHorizontal: CARD_PADDING,
              gap: CARD_GAP,
            }}
          />
        </View>

        {/* Enhanced Spare Parts Section */}
        <View className="mb-8">
          <SectionHeader name="Best Selling Spare Parts" />
          <FlatList
            data={SpareParts}
            renderItem={({ item }) => (
              <View style={{ width: CARD_WIDTH }}>
                <Card1
                  Images={item.image}
                  rating={item?.rating}
                  name={item?.name}
                  reviewCount={item?.reviewCount}
                  price={item?.price}
                  showLove={true}
                />
              </View>
            )}
            keyExtractor={(item) => String(item.id)}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            snapToAlignment="start"
            snapToInterval={CARD_WIDTH + CARD_GAP}
            decelerationRate="fast"
            contentContainerStyle={{
              paddingHorizontal: CARD_PADDING,
              gap: CARD_GAP,
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomePage;

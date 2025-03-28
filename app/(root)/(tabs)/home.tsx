import { FlatList, View, ScrollView, Text } from "react-native";
import React, { useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Navbar from "@/components/Navbar";
import AdsComponents from "@/components/AdsComponents";
import Swiper from "react-native-swiper";
import { Ads, CarsList, MechanicsList, icons } from "@/constants";
import Card1 from "@/components/cards/Card1";
import SectionHeader from "@/components/SectionHeader";

const HomePage = () => {
  const swiperRef = useRef<Swiper>(null);
  const CARD_WIDTH = 250; // Approximate width of your card
  const CARD_GAP = 10;

  return (
    <SafeAreaView className="bg-white flex-1 px-5 pt-2" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100, // Adjust this value to ensure content is above tab bar
        }}
      >
        <Navbar />

        <View className="h-60 pt-5">
          <Swiper
            ref={swiperRef}
            loop={true}
            autoplay={true}
            autoplayTimeout={30}
            autoplayDirection={true}
            showsPagination={true}
            dot={
              <View className="w-[8px] h-[8px] mx-1 bg-primary-200 rounded-full" />
            }
            activeDot={
              <View className="w-[10px] h-[10px] mx-1 bg-primary-500 rounded-full" />
            }
            paginationStyle={{ bottom: 0 }}
            scrollEnabled={true}
            index={0}
            height={240}
            horizontal={true}
            loadMinimal={true}
            loadMinimalSize={1}
            removeClippedSubviews={false}
            renderPagination={(index, total) => (
              <View
                style={{
                  position: "absolute",
                  bottom: 5,
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
                      width: i === index ? 20 : 8,
                      height: 8,
                      borderRadius: 4,
                      marginHorizontal: 3,
                    }}
                    className={
                      i === index ? "bg-primary-500" : "bg-primary-200"
                    }
                  />
                ))}
              </View>
            )}
          >
            {Ads.map((item, index) => (
              <View key={index} className="px-0">
                <AdsComponents
                  image={item.image}
                  title={item.title}
                  description={item.description}
                />
              </View>
            ))}
          </Swiper>
        </View>

        <View className="flex-row justify-between items-center my-4 border border-primary-200 px-4 py-1 rounded-[.6rem]">
          <View className="flex-row items-center gap-5 py-3 border-r pr-[2rem] border-primary-200">
            <icons.search className="w-6 h-6" />
            <Text>Where are you going today ?</Text>
          </View>
          <View className="flex-row bg-primary-100 rounded-[.6rem] p-2 ">
            <icons.calender className="w-10 h-10" />
            <Text className="text-primary-500 pl-1">Later</Text>
          </View>
        </View>

        <View className="my-4">
          <SectionHeader name="Top Mechanics" />
          <FlatList
            data={MechanicsList}
            renderItem={({ item }) => (
              <Card1
                Images={item.image}
                rating={item?.rating}
                name={item?.name}
                reviewCount={item?.reviewCount}
                // showLove={true}
              />
            )}
            keyExtractor={(item) => String(item.id)}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            snapToAlignment="start"
            snapToInterval={CARD_WIDTH + CARD_GAP}
            decelerationRate="fast"
            contentContainerStyle={{
              gap: 10,
            }}
          />
        </View>

        <View className="my-4">
          <SectionHeader name="Best Selling Cars" />
          <FlatList
            data={CarsList}
            renderItem={({ item }) => (
              <Card1
                Images={item.image}
                rating={item?.rating}
                name={item?.name}
                reviewCount={item?.reviewCount}
                showLove={true}
              />
            )}
            keyExtractor={(item) => String(item.id)}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            snapToAlignment="start"
            snapToInterval={CARD_WIDTH + CARD_GAP}
            decelerationRate="fast"
            contentContainerStyle={{
              gap: 10,
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomePage;

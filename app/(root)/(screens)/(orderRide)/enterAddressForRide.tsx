"use client";

import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import UserAuthHeader from "@/components/UserAuthHeader";
import { OrderRideOptions } from "@/constants";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import { CalendarIcon, ChevronRightIcon, ClockIcon } from "react-native-heroicons/solid";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";

const EnterAddressForRide = () => {
  const [currentOption, setCurrentOption] = useState(OrderRideOptions[0]);

  const handleLocationInputPress = (type: "from" | "to") => {
    router.push({
      pathname: "/(root)/(screens)/(orderRide)/location-selection",
      params: { type },
    });
  };

  return (
    <SafeAreaView className="px-5 pt-2" edges={["top"]}>
      <View className="">
        <UserAuthHeader header="Order a ride" />

        <View className="flex-row justify-between items-center my-4 border border-primary-200 px-4 py-1 rounded-[.6rem]">
          <TouchableOpacity
            onPress={() => handleLocationInputPress("to")}
            className="flex-row items-center gap-5 py-3 border-r pr-[2rem] border-primary-200"
          >
            <MagnifyingGlassIcon/>
            <Text>Where are you going today ?</Text>
          </TouchableOpacity>
          <View className="flex-row items-center bg-primary-100 rounded-[.6rem] p-2 ">
            <CalendarIcon size={16} color={"#A80207"} />
            <Text className="text-primary-500 pl-1">Later</Text>
          </View>
        </View>

        <View className="">
          <FlatList
            scrollEnabled={false} // Disables horizontal scroll
            data={OrderRideOptions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setCurrentOption(item)}
                className={`flex-1 rounded-xl items-center shadow-sm justify-center ${
                  currentOption.id === item.id
                    ? "bg-primary-100 shadow-primary-500"
                    : "shadow-gray-100 bg-white shadow-sm"
                }`}
                style={{
                  elevation: 3, // for Android shadow
                  height: 100, // fixed height for consistent layout
                }}
              >
                <View className="bg-primary-50 rounded-full ">
                  <item.image width={60} height={60} color="#2563EB" />
                </View>

                <Text
                  className={` font-semibold text-center pt-2 ${
                    currentOption.id === item.id
                      ? "text-primary-500"
                      : "text-gray-500"
                  }`}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            numColumns={3}
            columnWrapperStyle={{
              justifyContent: "space-between",
              gap: 12,
            }}
            contentContainerStyle={{
              paddingHorizontal: 2,
              paddingVertical: 7,
            }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews={true}
          />
        </View>

        <View className="mt-6">
          <Text className="py-2 font-NunitoBold text-text-100">From</Text>
          <TouchableOpacity
            onPress={() => handleLocationInputPress("from")}
            className="flex-row items-center justify-between border border-gray-300 rounded-[.8rem] p-4"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-2">
              <View className="bg-primary-50 border border-primary-200 rounded-[.4rem] p-2">
                <ClockIcon color={"#D30309"} size={20}/>
              </View>
              <View>
                <Text className="font-NunitoBold text-[1.06rem]">
                  Campus Mini Stadium
                </Text>
                <Text className="text-text-100 text-[.9rem]">
                  102273 Lagos Island, Lagos
                </Text>
              </View>
            </View>
            <ChevronRightIcon size={20} />
          </TouchableOpacity>
        </View>

        <View className="my-6">
          <Text className="py-2 font-NunitoBold text-text-100">To</Text>
          <TouchableOpacity
            onPress={() => handleLocationInputPress("to")}
            className="flex-row items-center justify-between border border-gray-300 rounded-[.8rem] p-4"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-2">
              <View className="bg-primary-50 border border-primary-200 rounded-[.4rem] p-2">
              <ClockIcon color={"#D30309"} size={20}/>
              </View>
              <View>
                <Text className="font-NunitoBold text-[1.06rem]">
                  Viva Cinema
                </Text>
                <Text className="text-text-100 text-[.9rem]">
                  22 Simbiat Abiola Way, Lagos
                </Text>
              </View>
            </View>
            <ChevronRightIcon size={20} />
          </TouchableOpacity>
        </View>

        <View>
          <InputField
            label="Offer your fare"
            placeholder="Enter amount"
            keyboardType="numeric"
          />
        </View>

        <View className="mt-8">
          <CustomButton title="Choose a ride" />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EnterAddressForRide;

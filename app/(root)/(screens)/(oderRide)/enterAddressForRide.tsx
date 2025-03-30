import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import UserAuthHeader from "@/components/UserAuthHeader";
import { icons, OrderRideOptions } from "@/constants";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";

const EnterAddressForRide = () => {
  const [currentOption, setCurrentOption] = useState(OrderRideOptions[0]);

  return (
    <SafeAreaView className="px-5 pt-2" edges={["top"]}>
      <View className="">
        <UserAuthHeader header="Order a ride" />

        <View className="flex-row justify-between items-center my-4 border border-primary-200 px-4 py-1 rounded-[.6rem]">
          <View
            // onPress={() => router.push("/enterAddressForRide")}
            className="flex-row items-center gap-5 py-3 border-r pr-[2rem] border-primary-200"
          >
            <icons.search className="w-6 h-6" />
            <Text>Where are you going today ?</Text>
          </View>
          <View className="flex-row bg-primary-100 rounded-[.6rem] p-2 ">
            <icons.calender className="w-10 h-10" />
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
          />
        </View>

        <View className="mt-6">
          <Text className="py-2 font-NunitoBold text-text-100">From</Text>
          <View className="flex-row items-center justify-between border border-gray-300 rounded-[.8rem] p-4">
            <View className="flex-row items-center gap-2">
              <View className="bg-primary-50 border border-primary-200 rounded-[.4rem] p-2">
                <icons.time width={20} height={20} />
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
            <icons.rightArrow width={20} height={20} />
          </View>
        </View>
        <View className="my-6">
          <Text className="py-2 font-NunitoBold text-text-100">To</Text>
          <View className="flex-row items-center justify-between border border-gray-300 rounded-[.8rem] p-4">
            <View className="flex-row items-center gap-2">
              <View className="bg-primary-50 border border-primary-200 rounded-[.4rem] p-2">
                <icons.time width={20} height={20} />
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
            <icons.rightArrow width={20} height={20} />
          </View>
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

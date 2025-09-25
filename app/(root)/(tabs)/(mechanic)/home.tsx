"use client";

import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { BellIcon } from "react-native-heroicons/outline";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import { images } from "@/constants";
import OrderCard, { Order } from "@/components/OrderCard";
import CustomerReviewCard from "@/components/CustomerReviewCard";
import { router } from "expo-router";
import Navbar from "@/components/Navbar";

const { width } = Dimensions.get("window");

const MechanicHome = () => {
  const consultations = [
    {
      id: 1,
      name: "Yvonne Ede",
      email: "yvonnede@email.com",
      avatar: images?.user1,
    },
    {
      id: 2,
      name: "Azeez Babatunde",
      email: "azeez@email.com",
      avatar: images?.user1,
    },
    {
      id: 3,
      name: "Tomiwa Bamigboye",
      email: "tomiwa@email.com",
      avatar: images?.user1,
    },
    {
      id: 4,
      name: "Funmilayo Shomefun",
      email: "funmi@email.com",
      avatar: images?.user1,
    },
  ];

  const currentOrders: Order[] = [
    {
      id: "1",
      clientName: "Susan Sheidu",
      phoneNumber: "09087654322",
      carType: "Mercedes Benz",
      carIssue: "Bad engine response",
    },
    {
      id: "2",
      clientName: "David Wilson",
      phoneNumber: "08076543210",
      carType: "BMW X5",
      carIssue: "Transmission repair",
    },
    {
      id: "3",
      clientName: "Sarah Connor",
      phoneNumber: "08065432109",
      carType: "Audi A4",
      carIssue: "Air conditioning not working",
    },
  ];

  const handleAccept = (orderId: string) => {
    console.log("Accept order:", orderId);
    // Handle accept logic here
  };

  const handleDecline = (orderId: string) => {
    console.log("Decline order:", orderId);
    // Handle decline logic here
  };

  const ratingData = [
    { stars: 5, count: 900, percentage: 90, color: "bg-green-500" },
    { stars: 4, count: 50, percentage: 5, color: "bg-blue-500" },
    { stars: 3, count: 25, percentage: 2.5, color: "bg-purple-500" },
    { stars: 2, count: 15, percentage: 1.5, color: "bg-orange-500" },
    { stars: 1, count: 15, percentage: 1.5, color: "bg-red-500" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Navbar />

        <View className="py-4">
          {/* Let's fix some cars card */}
          <View className="rounded-2xl mb-6 overflow-hidden">
            <ImageBackground
              source={images?.mechanic_ads}
              className="w-full h-[150px] bg-cover bg-center"
              resizeMode="cover"
            >
              <View className="bg-black/40 flex-1 justify-center items-start p-6">
                <View className="items-start">
                  <Text className="text-white text-[1.4rem] font-NunitoBold mb-2 text-start">
                    Let's fix some cars
                  </Text>
                  <Text className="text-gray-300 text-md font-NunitoMedium text-start">
                    Connecting with car owners
                  </Text>
                  {/* <TouchableOpacity className="bg-white px-4 py-2 rounded-full self-start flex-row items-center space-x-2 gap-2">
                    <EyeIcon size={17} />
                    <Text className="text-black font-NunitoBold">View all consultation</Text>
                  </TouchableOpacity> */}
                </View>
              </View>
            </ImageBackground>
          </View>

          {/* Key Metrics Header */}
          <Text className="text-lg font-NunitoBold text-gray-900 mb-2">
            Key Metrics
          </Text>

          {/* Metrics */}
          <View className="flex-row gap-4 space-x-4 mb-4">
            <View className="flex-1 gradient-to-t from-[#C9E6E5] to-[#B1E5FB] bg-[#B1E5FB] rounded-[.4rem] p-4 ">
              <Text className="text-gray-600 text-sm font-NunitoMedium mb-4">
                Today's Earning
              </Text>
              <NairaCurrency
                value={500000}
                className="text-2xl font-NunitoBold text-gray-900"
              />
            </View>
            <View className="flex-1 gradient-to-r from-[#D7CFF1] to-[#D3C8E4] bg-[#D3C8E4] rounded-[.4rem] p-4">
              <Text className="text-gray-600 text-sm font-NunitoMedium mb-4">
                Total Consultation
              </Text>
              <Text className="text-2xl font-NunitoBold text-gray-900">500</Text>
            </View>
          </View>

          {/* Customer Reviews */}
          <CustomerReviewCard
            totalReviews="1K"
            averageRating={4.7}
            ratingData={ratingData}
          />

          {/* New Consultations */}
          <View >
            <View className="flex-row items-center justify-between my-4">
              <Text className="text-lg font-NunitoBold text-gray-900">
                Recent Current Orders
              </Text>
              <TouchableOpacity onPress={() => router?.push("./order")}>
                <Text className="text-red-600 font-NunitoBold">View All</Text>
              </TouchableOpacity>
            </View>

           <View className="">
             {currentOrders.slice(0, 3).map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                type="current"
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            ))}
           </View>
          </View>

          {/* <View className="h-10" /> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MechanicHome;

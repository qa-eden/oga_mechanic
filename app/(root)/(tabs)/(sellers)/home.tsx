"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { CalendarIcon, ChevronDownIcon, ChevronRightIcon } from "react-native-heroicons/outline";
// import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import { router } from "expo-router";
import Navbar from "@/components/Navbar";
import CustomerReviewCard from "@/components/CustomerReviewCard";
import OrderItemCard from "@/components/cards/OrderItemCard";
import { useMerchantAnalytics } from "@/hooks/useMerchantAnalytics";

const SellerHome = () => {
  const [showDrawer, setShowDrawer] = useState(false);

  // Fetch merchant analytics data
  const { data: analyticsData, isLoading, error } = useMerchantAnalytics();

  // Transform analytics data to match OrderItem interface with new design fields
  const recentOrders = analyticsData?.recent_orders?.map(order => ({
    id: order.id,
    productName: order.product_name,
    orderDate: order.order_date,
    price: order.price,
    status: order.status,
    quantity: 1, // Default quantity
    image: null, // Will show placeholder if no image
    deliveryDate: order.order_date, // Use order date as delivery date
    paymentStatus: order.status.toLowerCase() === 'delivered' ? 'Paid' : order.status,
  })) || [
    {
      id: "1",
      productName: "Toyota Corolla Tire",
      orderDate: "03-02-2025",
      price: 45000.00,
      status: "Delivered",
      quantity: 1,
      image: null,
      deliveryDate: "May 30, 2025",
      paymentStatus: "Paid",
    },
    {
      id: "2",
      productName: "Honda Civic Brake Pads",
      orderDate: "02-02-2025",
      price: 25000.00,
      status: "Processing",
      quantity: 2,
      image: null,
      deliveryDate: "June 1, 2025",
      paymentStatus: "Paid",
    },
    {
      id: "3",
      productName: "Ford Focus Air Filter",
      orderDate: "01-02-2025",
      price: 15000.00,
      status: "Delivered",
      quantity: 1,
      image: null,
      deliveryDate: "May 28, 2025",
      paymentStatus: "Paid",
    },
  ];

  const ratingData = analyticsData?.customer_ratings || [
    { stars: 5, count: 900, percentage: 90, color: 'bg-green-500' },
    { stars: 4, count: 50, percentage: 5, color: 'bg-purple-500' },
    { stars: 3, count: 25, percentage: 2.5, color: 'bg-blue-500' },
    { stars: 2, count: 15, percentage: 1.5, color: 'bg-yellow-500' },
    { stars: 1, count: 15, percentage: 1.5, color: 'bg-red-500' },
  ];

  // Extract analytics data with fallbacks
  const totalSales = analyticsData?.total_sales || 90.2;
  const totalOrders = analyticsData?.total_orders || 132;
  const totalProducts = analyticsData?.total_products || 5;

  // Debug: Log analytics data (not rendered)
  React.useEffect(() => {
    if (analyticsData) {
      console.log('📊 Merchant Analytics Data:', analyticsData);
    }
    if (error) {
      console.error('❌ Merchant Analytics Error:', error);
    }
    if (isLoading) {
      console.log('⏳ Loading merchant analytics...');
    }
  }, [analyticsData, error, isLoading]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>

        <Navbar />

        <View className=" py-4">
          {/* Total Sales Section */}
          <View className=" mb-2 mt-2">
            <Text className="text-sm text-gray-600 font-NunitoMedium mb-2">
              Total Sales
            </Text>
            <View className="flex-row items-end justify-between">
              <Text className="text-3xl font-NunitoBold text-gray-900">
                ₦{analyticsData?.total_revenue?.toLocaleString() || '90,200.00'}
              </Text>
              <TouchableOpacity
                className="flex-row items-center border border-gray-300  bg-gray-100 px-3 py-2 rounded-[.4rem]"
                onPress={() => setShowDrawer(true)}
              >
                <CalendarIcon size={16} color="#0A6DEE" />
                <Text className="text-sm text-[#0A6DEE] font-NunitoMedium ml-2">
                  Last 7 days
                </Text>
                <ChevronDownIcon size={16} color="#0A6DEE" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Key Metrics Cards - Full Width */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-[#B1E5FB] rounded-xl p-4">
            <Text className="text-gray-600 text-sm font-NunitoMedium mb-2">
              Orders
            </Text>
            <Text className="text-2xl font-NunitoBold text-gray-800">
              {analyticsData?.total_orders || 132}
            </Text>
          </View>
          <View className="flex-1 bg-[#D3C8E4] rounded-xl p-4">
            <Text className="text-gray-600 text-sm font-NunitoMedium mb-2">
              Products sold
            </Text>
            <Text className="text-2xl font-NunitoBold text-gray-800">
              {analyticsData?.total_products || 5}
            </Text>
          </View>
        </View>

        <View className="">
          {/* Customer Reviews */}
          <CustomerReviewCard
            totalReviews="1K"
            averageRating={5}
            ratingData={ratingData}
          />

          {/* Recent Orders */}
          <View className="">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-NunitoBold text-gray-900">
                Recent Orders
              </Text>
              <TouchableOpacity className="flex-row items-center gap-1"
                onPress={() => router.push("/(root)/(tabs)/(sellers)/?tab=orders" as any)}
              >
                <Text className="text-primary-500 font-NunitoMedium flex-row text-lg items-center">See All</Text>
                <ChevronRightIcon size={20} color="#D30309" />
              </TouchableOpacity>
            </View>

            {recentOrders.map((order) => (
              <OrderItemCard
                key={order.id}
                order={order}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Drawer Modal */}
      <Modal
        visible={showDrawer}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDrawer(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setShowDrawer(false)}
        >
          <Pressable className="bg-white rounded-t-3xl p-6 max-h-96">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
            <Text className="text-lg font-NunitoBold text-gray-900 mb-4">
              Select Time Period
            </Text>

            {['Last 7 days', 'Last 30 days', 'Last 3 months', 'Last year', 'All time'].map((period, index) => (
              <TouchableOpacity
                key={index}
                className="py-4 border-b border-gray-100 last:border-b-0"
                onPress={() => {
                  setShowDrawer(false);
                  // Handle period selection here
                }}
              >
                <Text className="text-base font-NunitoMedium text-gray-900">
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default SellerHome
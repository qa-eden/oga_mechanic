"use client";

import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
  ActivityIndicator
} from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/constants";
import { routes } from "@/constants/routes";
import { ArrowLeftIcon, ShoppingBagIcon, ExclamationCircleIcon } from "react-native-heroicons/outline";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { productsAPI } from "@/lib/api/products";
import LoadingSpinner from "@/components/LoadingSpinner";
import { StatusBar } from "expo-status-bar";
import Animated, { FadeInDown } from "react-native-reanimated";

// Order Card Component
const OrderCard = ({ item, onPress }: { item: any, onPress: (order: any) => void }) => {
    // Determine status color
    const getStatusColor = (status: string) => {
        switch(status.toLowerCase()) {
            case 'completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'paid': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        }
    };

    const statusStyle = getStatusColor(item.status || 'pending');
    
    // Format date
    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };

    // Calculate total items
    const itemCount = item.items?.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0) || 0;

    return (
        <Animated.View entering={FadeInDown.springify().damping(15)}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onPress(item)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4"
            >
                <View className="flex-row justify-between items-start mb-3">
                    <View>
                        <Text className="text-sm text-gray-400 font-NunitoMedium mb-1">
                            Order #{item.order_id?.substring(0, 8) || item.id?.substring(0, 8)}
                        </Text>
                        <Text className="text-lg font-NunitoBold text-gray-900">
                            ₦{item.total_amount?.toLocaleString() || '0.00'}
                        </Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full border ${statusStyle.split(' ')[0]} ${statusStyle.split(' ')[2]}`}>
                        <Text className={`text-xs font-NunitoBold ${statusStyle.split(' ')[1]}`}>
                            {item.status?.toUpperCase() || 'PENDING'}
                        </Text>
                    </View>
                </View>
                
                <View className="flex-row items-center justify-between pt-3 border-t border-gray-50">
                    <View className="flex-row items-center">
                        <ShoppingBagIcon size={16} color="#9CA3AF" />
                        <Text className="text-sm text-gray-500 font-NunitoMedium ml-1">
                            {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                        </Text>
                    </View>
                    <Text className="text-sm text-gray-500 font-NunitoMedium">
                        {formatDate(item.created_at)}
                    </Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const MyOrders = () => {
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const filterTabs = [
      "All", "Pending", "Paid", "Shipped", "Completed", "Cancelled"
  ];

  // Fetch orders from API
  const {
    data: ordersData,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ["userOrders", selectedStatus],
    queryFn: () => productsAPI.getUserOrders(selectedStatus),
    staleTime: 5 * 60 * 1000, 
    retry: 2,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Handle both array response and wrapped response
  const orders = Array.isArray(ordersData) 
    ? ordersData 
    : ((ordersData as any)?.data || []);

  const handleOrderPress = (order: any) => {
    router.push({ pathname: routes.orderDetail, params: { id: order.id || order.order_id } });
  };

  const renderOrderCard = ({ item }: { item: any }) => (
    <OrderCard item={item} onPress={handleOrderPress} />
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white border-b border-gray-100 z-10">
          <View className="flex-row items-center px-5 py-4">
            <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3"
            >
                <ArrowLeftIcon size={20} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-xl font-NunitoBold text-gray-900">
                My Orders
            </Text>
          </View>
          
          {/* Status Filters */}
          <FlatList
            horizontal
            data={filterTabs}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 15 }}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
                <TouchableOpacity
                    onPress={() => setSelectedStatus(item)}
                    className={`mr-3 px-4 py-2 rounded-full border ${
                        selectedStatus === item
                            ? "bg-primary-500 border-primary-500"
                            : "bg-white border-gray-200"
                    }`}
                >
                    <Text
                        className={`font-NunitoBold text-sm ${
                            selectedStatus === item ? "text-white" : "text-gray-600"
                        }`}
                    >
                        {item}
                    </Text>
                </TouchableOpacity>
            )}
          />
      </View>

      {/* Orders List */}
      <View className="flex-1">
        {isLoading && !isRefetching ? (
            <LoadingSpinner
                message="Loading your orders..."
                size="medium"
            />
        ) : error ? (
            <View className="flex-1 justify-center items-center px-5">
                <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-4">
                    <ExclamationCircleIcon size={32} color="#EF4444" />
                </View>
                <Text className="text-lg font-NunitoBold text-gray-900 mb-2">
                    Couldn't load orders
                </Text>
                <TouchableOpacity onPress={() => refetch()} className="py-2 px-6 bg-gray-100 rounded-full mt-2">
                    <Text className="font-NunitoBold text-gray-700">Try Again</Text>
                </TouchableOpacity>
            </View>
        ) : orders.length > 0 ? (
          <FlatList
            data={orders}
            renderItem={renderOrderCard}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            contentContainerStyle={{
              padding: 20,
              paddingBottom: 100,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#D30309']}
                tintColor="#D30309"
              />
            }
          />
        ) : (
          <View className="flex-1 justify-center items-center px-5">
            <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
              <ShoppingBagIcon size={40} color="#9CA3AF" />
            </View>
            <Text className="text-xl font-NunitoBold text-gray-900 mb-2">
              No orders found
            </Text>
            <Text className="text-gray-500 text-center leading-6">
              {selectedStatus !== 'All' 
                ? `You don't have any ${selectedStatus.toLowerCase()} orders.`
                : "You haven't placed any orders yet."}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default MyOrders;

"use client";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { productsAPI } from "@/lib/api/products";
import { 
    ArrowLeftIcon, 
    MapPinIcon, 
    CreditCardIcon, 
    ShoppingBagIcon,
    ChatBubbleLeftEllipsisIcon,
    ClipboardDocumentIcon
} from "react-native-heroicons/outline";
import { XCircleIcon, StarIcon } from "react-native-heroicons/solid";
import LoadingSpinner from "@/components/LoadingSpinner";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Clipboard from 'expo-clipboard';
import { useState } from "react";
import CustomAlert from "@/components/CustomAlert";
import ProductReviewModal from "@/components/modals/ProductReviewModal";
import OrderItemModal from "@/components/modals/OrderItemModal";

import CustomButton from "@/components/CustomButton";
import { routes } from "@/constants/routes";

const OrderDetails = () => {
  const { id } = useLocalSearchParams();
  const [copiedId, setCopiedId] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Review State
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<any>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Alert State
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{title: string, message: string, type: 'success' | 'error' | 'info' | 'warning'}>({
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };
  
  // Fetch order details
  const {
    data: orderResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orderDetail", id],
    queryFn: () => productsAPI.getOrderById(id as string),
    enabled: !!id,
  });

  // Extract order data from response
  const order = Array.isArray(orderResponse?.data) 
    ? orderResponse?.data[0] 
    : orderResponse?.data;
  
  const handleReviewPress = (item: any) => {
    setReviewProduct(item.product);
    setReviewModalVisible(true);
  };

  const submitReview = async (rating: number, comment: string) => {
    if (!reviewProduct?.id) return;
    
    setIsSubmittingReview(true);
    try {
        const payload = {
            requestType: "inbound", // Default request type
            data: { rating, comment }
        };
        const res = await productsAPI.createProductReview(reviewProduct.id, payload);
        
        if (res.status === true) {
             showAlert("Success", "Review submitted successfully!", "success");
             setReviewModalVisible(false);
        } else {
             showAlert("Error", res.message || "Failed to submit review.", "error");
        }
    } catch (err: any) {
        console.error("Review submission error:", err);
        showAlert("Error", err.response?.data?.message || err.message || "Failed to submit review", "error");
    } finally {
        setIsSubmittingReview(false);
    }
  };

  const copyOrderId = async () => {
    if (order?.id) {
        await Clipboard.setStringAsync(order.id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'completed' || s === 'delivered') return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' };
    if (s === 'paid' || s === 'processing') return { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
    if (s === 'shipped') return { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' };
    if (s === 'cancelled') return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' };
    return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
  };

  const handleItemPress = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading order details..." size="medium" />;
  }

  if (error || !order) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="px-5 py-4 border-b border-gray-100 flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3">
              <ArrowLeftIcon size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-xl font-NunitoExtraBold text-gray-900">Order Details</Text>
        </View>
        <View className="flex-1 justify-center items-center px-5">
            <View className="w-24 h-24 bg-red-50 rounded-full items-center justify-center mb-6">
                <XCircleIcon size={48} color="#EF4444" />
            </View>
          <Text className="text-xl font-NunitoBold text-gray-900 mb-2">Failed to load order</Text>
          <Text className="text-gray-500 text-center mb-6 px-10">We couldn't retrieve the details for this order.</Text>
          <TouchableOpacity onPress={() => refetch()} className="py-3 px-8 bg-black rounded-full shadow-md">
            <Text className="font-NunitoBold text-white text-base">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const styles = getStatusStyle(order.status || 'pending');

  return (
    <SafeAreaView className="flex-1 bg-gray-50/50" edges={["top"]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-100 flex-row items-center shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4">
          <ArrowLeftIcon size={20} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-NunitoExtraBold text-gray-900">Order Receipt</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Status Card */}
        <Animated.View entering={FadeInDown.duration(600)} className="bg-white p-6 mb-4 shadow-sm">
            <View className="flex-row justify-between items-start mb-6">
                <View>
                    <Text className="text-[10px] text-gray-400 font-NunitoExtraBold uppercase tracking-[2px] mb-2">Current Status</Text>
                    <View className={`px-4 py-1.5 rounded-full border ${styles.bg} ${styles.border}`}>
                        <Text className={`text-[11px] font-NunitoExtraBold ${styles.text} uppercase tracking-wider`}>
                            {order.status || 'PENDING'}
                        </Text>
                    </View>
                </View>
                <View className="items-end">
                     <Text className="text-[10px] text-gray-400 font-NunitoExtraBold uppercase tracking-[2px] mb-2">Total Paid</Text>
                     <Text className="text-2xl font-NunitoExtraBold text-primary-600">
                        ₦{parseFloat(order.total_amount)?.toLocaleString()}
                    </Text>
                </View>
            </View>
            
            <View className="flex-row items-center justify-between pt-5 border-t border-gray-100">
                <View>
                    <Text className="text-gray-400 text-[10px] font-NunitoBold uppercase mb-1">Order Identifier</Text>
                    <TouchableOpacity onPress={copyOrderId} className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <Text className="text-gray-900 font-NunitoExtraBold text-xs mr-2">
                            #{order.id?.substring(0, 12).toUpperCase()}
                        </Text>
                        <ClipboardDocumentIcon size={14} color={copiedId ? "#10B981" : "#9CA3AF"} />
                    </TouchableOpacity>
                </View>
                <View className="items-end">
                    <Text className="text-gray-400 text-[10px] font-NunitoBold uppercase mb-1">Order Date</Text>
                    <Text className="text-gray-900 font-NunitoExtraBold text-sm">
                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                </View>
            </View>
        </Animated.View>

        {/* Track Order Button Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} className="px-5 mb-6">
            <CustomButton 
                title="Track Live Order Status"
                onPress={() => router.push({
                    pathname: routes.orderTracking,
                    params: { id: id }
                })}
                bgVariant="primary"
                className="shadow-md shadow-primary-200"
            />
        </Animated.View>

        {/* Order Items */}
        <View className="px-5">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-NunitoExtraBold text-gray-900">Ordered Items</Text>
                <View className="bg-gray-200 px-2 py-0.5 rounded-md">
                    <Text className="text-[10px] font-NunitoBold text-gray-600">{order.items?.length || 0} TOTAL</Text>
                </View>
            </View>
            
            {order.items?.map((item: any, index: number) => (
                <Animated.View 
                    key={index} 
                    entering={FadeInDown.delay(300 + index * 100).duration(600)}
                    className="mb-4"
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleItemPress(item)}
                    className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100/50 flex-row"
                  >
                    <View className="w-20 h-24 bg-gray-50 rounded-2xl mr-4 items-center justify-center overflow-hidden shadow-inner">
                        {item.product?.images?.[0]?.image ? (
                            <Image 
                                source={{ uri: item.product.images[0].image }} 
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <ShoppingBagIcon size={32} color="#D1D5DB" />
                        )}
                    </View>
                    
                    <View className="flex-1 justify-between py-1">
                        <View>
                            <Text className="text-sm font-NunitoExtraBold text-gray-900 leading-tight mb-1" numberOfLines={2}>
                                {item.product?.name || 'Product Item'}
                            </Text>
                            <Text className="text-[10px] text-gray-400 font-NunitoBold uppercase">
                                Unit Price: ₦{parseFloat(item.price)?.toLocaleString()}
                            </Text>
                        </View>
                        
                        <View className="flex-row justify-between items-end mt-2">
                            <View className="bg-gray-50 px-2 py-1 rounded-lg">
                                <Text className="text-gray-500 text-[10px] font-NunitoBold">
                                    QTY: <Text className="text-gray-900">{item.quantity}</Text>
                                </Text>
                            </View>
                            <Text className="text-base font-NunitoExtraBold text-gray-900">
                                ₦{((item.quantity || 1) * parseFloat(item.price || "0")).toLocaleString()}
                            </Text>
                        </View>

                        {order.status?.toLowerCase() === 'completed' && (
                            <TouchableOpacity 
                                onPress={(e) => { e.stopPropagation(); handleReviewPress(item); }}
                                className="mt-3 py-2 bg-amber-50 rounded-xl items-center justify-center flex-row border border-amber-100"
                            >
                                <StarIcon size={14} color="#F59E0B" />
                                <Text className="ml-1.5 text-xs font-NunitoExtraBold text-amber-600">Leave Review</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                  </TouchableOpacity>
                </Animated.View>
            ))}
        </View>

        {/* Info Cards */}
        <View className="px-5 flex-row gap-4 mb-4">
             {order.address && (
                <View className="flex-1 bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm">
                    <View className="w-9 h-9 bg-blue-50 rounded-2xl items-center justify-center mb-4">
                        <MapPinIcon size={18} color="#2563EB" />
                    </View>
                    <Text className="text-[10px] text-gray-400 font-NunitoExtraBold uppercase tracking-wider mb-2">Delivery Address</Text>
                    <Text className="text-xs font-NunitoBold text-gray-800 leading-relaxed" numberOfLines={3}>
                        {order.address}
                    </Text>
                </View>
             )}

             <View className="flex-1 bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm">
                <View className="w-9 h-9 bg-purple-50 rounded-2xl items-center justify-center mb-4">
                    <CreditCardIcon size={18} color="#7C3AED" />
                </View>
                <Text className="text-[10px] text-gray-400 font-NunitoExtraBold uppercase tracking-wider mb-2">Payment Method</Text>
                <Text className="text-xs font-NunitoBold text-gray-800 leading-relaxed">
                    {order.payment_method ? order.payment_method.replace('_', ' ') : 'Online Secured Payment'}
                </Text>
             </View>
        </View>

        {/* Summary Details */}
        <Animated.View entering={FadeInDown.delay(600).duration(600)} className="mx-5 p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm mb-8">
            <Text className="text-lg font-NunitoExtraBold text-gray-900 mb-6">Payment Summary</Text>
            
            <View className="space-y-4">
                <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-gray-400 font-NunitoBold">Item Subtotal</Text>
                    <Text className="text-sm font-NunitoExtraBold text-gray-900">
                        ₦{parseFloat(order.total_amount)?.toLocaleString()}
                    </Text>
                </View>
                
                {order.shipping_fee && parseFloat(order.shipping_fee) > 0 && (
                    <View className="flex-row justify-between items-center">
                        <Text className="text-sm text-gray-400 font-NunitoBold">Delivery Fee</Text>
                        <Text className="text-sm font-NunitoExtraBold text-gray-900">+₦{parseFloat(order.shipping_fee).toLocaleString()}</Text>
                    </View>
                )}

                <View className="h-px bg-gray-50 w-full my-2" />
                
                <View className="flex-row justify-between items-center">
                    <Text className="text-base font-NunitoExtraBold text-gray-900">Grand Total</Text>
                    <Text className="text-2xl font-NunitoExtraBold text-primary-600">
                        ₦{parseFloat(order.total_amount)?.toLocaleString()}
                    </Text>
                </View>
            </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700).duration(600)} className="mx-5">
            <TouchableOpacity 
                activeOpacity={0.8}
                className="flex-row items-center justify-center py-5 bg-gray-100 rounded-3xl"
            >
                <ChatBubbleLeftEllipsisIcon size={20} color="#4B5563" />
                <Text className="ml-3 font-NunitoExtraBold text-gray-600 text-sm">Customer Support Center</Text>
            </TouchableOpacity>
        </Animated.View>

      </ScrollView>

      {/* Modals & Alerts */}
      <OrderItemModal visible={modalVisible} item={selectedItem} onClose={() => setModalVisible(false)} />
      <ProductReviewModal visible={reviewModalVisible} productName={reviewProduct?.name} onClose={() => setReviewModalVisible(false)} onSubmit={submitReview} isLoading={isSubmittingReview} />
      <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} onClose={() => setAlertVisible(false)} />
    </SafeAreaView>
  );
};

export default OrderDetails;

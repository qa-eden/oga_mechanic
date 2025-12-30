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

  // ... (helper functions)

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
            data: {
                rating,
                comment
            }
        };
        const res = await productsAPI.createProductReview(reviewProduct.id, payload);
        
        if (res.status === true) {
             showAlert("Success", "Review submitted successfully!", "success");
             setReviewModalVisible(false);
             // Optionally refetch if needed to update UI state
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


  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyOrderId = async () => {
    if (order?.id) {
        await Clipboard.setStringAsync(order.id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-green-700 bg-green-100 border-green-200';
      case 'paid': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'shipped': return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'cancelled': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    }
  };

  const handleItemPress = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  if (isLoading) {
    return (
      <LoadingSpinner message="Loading order details..." size="medium" />
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="px-5 py-4 border-b border-gray-100 flex-row items-center">
            <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3"
            >
            <ArrowLeftIcon size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-xl font-NunitoExtraBold text-gray-900">Order Details</Text>
        </View>
        <View className="flex-1 justify-center items-center px-5">
            <View className="w-24 h-24 bg-red-50 rounded-full items-center justify-center mb-6">
                <XCircleIcon size={48} color="#EF4444" />
            </View>
          <Text className="text-xl font-NunitoBold text-gray-900 mb-2">Failed to load order</Text>
          <Text className="text-gray-500 text-center mb-6 px-10">We couldn't retrieve the details for this order. Please check your connection.</Text>
          <TouchableOpacity onPress={() => refetch()} className="py-3 px-8 bg-black rounded-full shadow-md">
            <Text className="font-NunitoBold text-white text-base">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusColor(order.status || 'pending');

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-100 flex-row items-center sticky top-0 z-10 shadow-sm">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3"
        >
          <ArrowLeftIcon size={20} color="#1F2937" />
        </TouchableOpacity>
        <View className="flex-1">
            <Text className="text-xl font-NunitoExtraBold text-gray-900">Order Details</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Status Banner */}
        <Animated.View entering={FadeInDown.duration(500)} className="bg-white p-6 mb-3">
            <View className="flex-row justify-between items-start mb-4">
                <View>
                    <Text className="text-gray-500 font-NunitoMedium text-sm mb-1">Status</Text>
                    <View className={`px-4 py-1.5 rounded-full border self-start ${statusStyle.split(' ')[1]} ${statusStyle.split(' ')[2]}`}>
                        <Text className={`text-xs font-NunitoBold ${statusStyle.split(' ')[0]} uppercase tracking-wider`}>
                            {order.status || 'PENDING'}
                        </Text>
                    </View>
                </View>
                <View className="items-end">
                     <Text className="text-gray-500 font-NunitoMedium text-sm mb-1">Total Amount</Text>
                     <Text className="text-xl font-NunitoExtraBold text-primary-600">
                        ₦{parseFloat(order.total_amount)?.toLocaleString()}
                    </Text>
                </View>
            </View>
            
            <View className="flex-row items-center justify-between pt-4 border-t border-gray-100">
                <View>
                    <Text className="text-gray-500 text-xs font-NunitoMedium mb-0.5">Order ID</Text>
                    <TouchableOpacity 
                        onPress={copyOrderId}
                        className="flex-row items-center"
                    >
                        <Text className="text-gray-900 font-NunitoBold text-sm mr-2 select-all">
                            #{order.id?.substring(0, 8)}...
                        </Text>
                        <ClipboardDocumentIcon size={14} color={copiedId ? "#10B981" : "#9CA3AF"} />
                        {copiedId && <Text className="text-[10px] text-green-500 ml-1 font-NunitoBold">Copied!</Text>}
                    </TouchableOpacity>
                </View>
                <View className="items-end">
                    <Text className="text-gray-500 text-xs font-NunitoMedium mb-0.5">Date Placed</Text>
                    <Text className="text-gray-900 font-NunitoBold text-sm">
                        {new Date(order.created_at).toLocaleDateString()}
                    </Text>
                </View>
            </View>
        </Animated.View>

        {/* Order Items */}
        <View className="mb-3">
            <View className="px-5 mb-2">
                <Text className="text-base font-NunitoBold text-gray-500 uppercase tracking-wide">Items ({order.items?.length || 0})</Text>
            </View>
            
            {order.items?.map((item: any, index: number) => (
                <Animated.View 
                    key={index} 
                    entering={FadeInDown.delay(index * 100).duration(500)}
                    className="mx-4 mb-3"
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleItemPress(item)}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
                  >
                    <View className="flex-row">
                        {/* Product Image */}
                        <View className="w-20 h-20 bg-gray-50 rounded-xl mr-4 items-center justify-center border border-gray-100 overflow-hidden">
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
                        
                        {/* Details */}
                        <View className="flex-1 justify-between py-0.5">
                            <View>
                                {/* Category Badge */}
                               {item.product?.category?.name && (
                                   <View className="bg-gray-100 self-start px-2 py-0.5 rounded-md mb-1.5">
                                       <Text className="text-[10px] font-NunitoBold text-gray-600">
                                           {item.product.category.name}
                                       </Text>
                                   </View>
                               )}
                                <Text className="text-base font-NunitoBold text-gray-900 leading-5 mb-1" numberOfLines={2}>
                                    {item.product?.name || 'Product Item'}
                                </Text>
                                {/* Merchant Name (if appropriate) */}
                                {item.product?.merchant_email && (
                                    <Text className="text-[10px] text-gray-400 mb-1">
                                        Sold by: {item.product.merchant_email.split('@')[0]}
                                    </Text>
                                )}
                            </View>
                            
                            <View className="flex-row justify-between items-center mt-2">
                                <Text className="text-gray-500 text-sm font-NunitoMedium">
                                    Qty: <Text className="text-gray-900 font-NunitoBold">{item.quantity}</Text>
                                </Text>
                                <Text className="text-base font-NunitoExtraBold text-primary-600">
                                    ₦{parseFloat(item.price)?.toLocaleString()}
                                </Text>
                            </View>

                            {/* Review Button for Completed Orders */}
                            {order.status?.toLowerCase() === 'completed' && (
                                <TouchableOpacity 
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        handleReviewPress(item);
                                    }}
                                    className="mt-3 py-2 bg-gray-50 border border-gray-200 rounded-lg items-center justify-center flex-row"
                                >
                                    <StarIcon size={14} color="#F59E0B" />
                                    <Text className="ml-1.5 text-xs font-NunitoBold text-gray-700">Leave a Review</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    
                    {/* Compatibility Info (if exists) */}
                    {item.product?.vehicle_compatibility?.length > 0 && (
                        <View className="mt-3 pt-3 border-t border-gray-50">
                            <Text className="text-xs text-gray-500 font-NunitoMedium mb-1">Compatible with:</Text>
                            <View className="flex-row flex-wrap gap-1">
                                {item.product.vehicle_compatibility.slice(0, 2).map((comp: any, i: number) => (
                                    <View key={i} className="bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                        <Text className="text-[10px] text-gray-600 font-NunitoBold">
                                            {comp.make_name} {comp.model_name}
                                        </Text>
                                    </View>
                                ))}
                                {item.product.vehicle_compatibility.length > 2 && (
                                    <Text className="text-[10px] text-gray-400 self-center ml-1">
                                        +{item.product.vehicle_compatibility.length - 2} more
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
            ))}
        </View>

        {/* Info Grid */}
        <View className="px-4 flex-row gap-3 mb-4">
             {/* Conditionally render Shipping if available */}
             {order.address && (
                <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center mb-3">
                        <MapPinIcon size={16} color="#2563EB" />
                    </View>
                    <Text className="text-xs text-gray-400 font-NunitoBold uppercase mb-1">Delivery To</Text>
                    <Text className="text-sm font-NunitoBold text-gray-900 leading-tight">
                        {order.address}
                    </Text>
                </View>
             )}

             {/* Payment Info */}
             <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <View className="w-8 h-8 bg-purple-50 rounded-full items-center justify-center mb-3">
                    <CreditCardIcon size={16} color="#7C3AED" />
                </View>
                <Text className="text-xs text-gray-400 font-NunitoBold uppercase mb-1">Payment</Text>
                <Text className="text-sm font-NunitoBold text-gray-900 leading-tight">
                    {order.payment_method ? order.payment_method.replace('_', ' ') : 'Online Payment'}
                </Text>
             </View>
        </View>

        {/* Order Summary Card */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} className="bg-white mx-4 p-5 rounded-3xl border border-gray-100 shadow-sm mb-6">
            <Text className="text-base font-NunitoExtraBold text-gray-900 mb-4">Payment Summary</Text>
            
            <View className="flex-row justify-between mb-3">
                <Text className="text-sm text-gray-500 font-NunitoMedium">Subtotal</Text>
                <Text className="text-sm font-NunitoBold text-gray-900">
                    ₦{parseFloat(order.total_amount)?.toLocaleString()}
                </Text>
            </View>
            
            {order.shipping_fee && parseFloat(order.shipping_fee) > 0 && (
                <View className="flex-row justify-between mb-3">
                    <Text className="text-sm text-gray-500 font-NunitoMedium">Shipping Fee</Text>
                    <Text className="text-sm font-NunitoBold text-gray-900">
                        +₦{parseFloat(order.shipping_fee).toLocaleString()}
                    </Text>
                </View>
            )}

            {order.discount && parseFloat(order.discount) > 0 && (
                 <View className="flex-row justify-between mb-3">
                    <Text className="text-sm text-green-600 font-NunitoMedium">Discount</Text>
                    <Text className="text-sm font-NunitoBold text-green-600">
                        -₦{parseFloat(order.discount).toLocaleString()}
                    </Text>
                </View>
            )}

            <View className="h-px bg-gray-100 my-3" />
            
            <View className="flex-row justify-between items-center">
                <Text className="text-base font-NunitoExtraBold text-gray-900">Total Paid</Text>
                <Text className="text-xl font-NunitoExtraBold text-primary-600">
                    ₦{parseFloat(order.total_amount)?.toLocaleString()}
                </Text>
            </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(400).duration(500)} className="mx-4 mb-8">
            <TouchableOpacity 
                activeOpacity={0.8}
                className="flex-row items-center justify-center py-4 bg-gray-100 rounded-2xl"
            >
                <ChatBubbleLeftEllipsisIcon size={20} color="#4B5563" />
                <Text className="ml-2 font-NunitoBold text-gray-700">Need Help with this Order?</Text>
            </TouchableOpacity>
        </Animated.View>

      </ScrollView>

      {/* Item Detail Modal */}
      <OrderItemModal 
        visible={modalVisible}
        item={selectedItem}
        onClose={() => setModalVisible(false)}
      />

      {/* Product Review Modal */}
      <ProductReviewModal
        visible={reviewModalVisible}
        productName={reviewProduct?.name}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={submitReview}
        isLoading={isSubmittingReview}
      />

      {/* Custom Alert */}
      <CustomAlert 
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertVisible(false)}
      />

    </SafeAreaView>
  );
};

export default OrderDetails;

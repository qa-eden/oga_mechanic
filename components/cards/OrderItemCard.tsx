import React from 'react';
import { View, Text, Image } from 'react-native';
import { CalendarIcon, CreditCardIcon, ClockIcon } from 'react-native-heroicons/outline';

interface OrderItem {
  id: string;
  productName: string;
  orderDate: string;
  price: number;
  status: string;
  quantity?: number;
  image?: string | null;
  deliveryDate?: string;
  paymentStatus?: string;
}

interface OrderItemCardProps {
  order: OrderItem;
}

const OrderItemCard: React.FC<OrderItemCardProps> = ({ order }) => {
  // Add safety checks for order data
  if (!order) {
    return null;
  }

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'completed':
      case 'paid':
        return 'text-green-600';
      case 'pending':
      case 'processing':
        return 'text-yellow-600';
      case 'cancelled':
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row">
        {/* Left Section - Product Info (35% width) */}
        <View className="mr-4" style={{ width: '35%' }}>
          {/* Product Image */}
          <View className="w-full h-16 bg-gray-100 rounded-lg mb-3 items-center justify-center">
            {order.image ? (
              <Image 
                source={{ uri: order.image }} 
                className="w-full h-full rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-gray-200 rounded-lg items-center justify-center">
                <Text className="text-gray-400 text-xs">No Image</Text>
              </View>
            )}
          </View>
          
          {/* Product Name */}
          <Text className="text-gray-900 text-start font-NunitoBold text-base mb-1" numberOfLines={1}>
            {order.productName || 'Unknown Product'}
          </Text>
          
          {/* Quantity */}
          <Text className="text-gray-500 text-start text-sm font-NunitoMedium">
            {order.quantity || 1} piece{(order.quantity || 1) > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Right Section - Order Details (65% width) */}
        <View style={{ width: '65%' }}>
          {/* Date Delivered */}
          <View className="flex-row items-center mb-3">
            <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3">
              <CalendarIcon size={12} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-sm font-NunitoMedium">
                Date delivered: {order.deliveryDate || order.orderDate || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Payment Status */}
          <View className="flex-row items-center mb-3">
            <View className="w-6 h-6 bg-green-100 rounded-full items-center justify-center mr-3">
              <CreditCardIcon size={12} color="#10B981" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-sm font-NunitoMedium">
                Payment: ₦{(order.price || 0).toLocaleString()} • 
                <Text className={`${getPaymentStatusColor(order.paymentStatus || order.status || 'unknown')} ml-1`}>
                  {order.paymentStatus || (order.status && order.status.toLowerCase() === 'delivered' ? 'Paid' : order.status || 'Unknown')}
                </Text>
              </Text>
            </View>
          </View>

          {/* Order Status */}
          <View className="flex-row items-center">
            <View className="w-6 h-6 bg-orange-100 rounded-full items-center justify-center mr-3">
              <ClockIcon size={12} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 text-sm font-NunitoMedium">
                Status: 
                <Text className={`${getStatusColor(order.status || 'unknown')} ml-1 capitalize`}>
                  {order.status || 'Unknown'}
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default OrderItemCard;

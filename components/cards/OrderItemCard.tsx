import React from 'react';
import { View, Text } from 'react-native';
import { ShoppingBagIcon } from 'react-native-heroicons/outline';

interface OrderItem {
  id: string;
  productName: string;
  orderDate: string;
  price: number;
  status: string;
}

interface OrderItemCardProps {
  order: OrderItem;
  iconColor?: string;
  iconBgColor?: string;
  statusColor?: string;
}

const OrderItemCard: React.FC<OrderItemCardProps> = ({
  order,
  iconColor = "#0A6DEE",
  iconBgColor = "bg-blue-50",
  statusColor = "text-green-700"
}) => {
  return (
    <View key={order.id} className="flex-row items-center py-4 border-b border-gray-300">
      <View className={`p-3 ${iconBgColor} rounded-full items-center justify-center mr-3`}>
        <Text className="text-sm">
          <ShoppingBagIcon size={20} color={iconColor} />
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-NunitoMedium text-[1.1rem] capitalize clamp-1">
          {order.productName}
        </Text>
        <Text className="text-gray-500 text-sm">
          {order.orderDate}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-gray-900 font-NunitoBold text-[1.1rem]">
          ₦{order.price.toLocaleString()}
        </Text>
        <Text className={`${statusColor} text-sm font-NunitoMedium`}>
          {order.status}
        </Text>
      </View>
    </View>
  );
};

export default OrderItemCard;

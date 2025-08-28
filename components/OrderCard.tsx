import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export interface Order {
  id: string;
  clientName: string;
  phoneNumber: string;
  carType: string;
  carIssue: string;
  status?: "current" | "ongoing" | "completed" | "declined";
}

interface OrderCardProps {
  order: Order;
  type: "current" | "ongoing" | "completed";
  onAccept?: (orderId: string) => void;
  onDecline?: (orderId: string) => void;
  onMarkComplete?: (orderId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  type,
  onAccept,
  onDecline,
  onMarkComplete,
}) => {
  const getStatusColor = () => {
    switch (order.status || type) {
      case "ongoing":
        return "text-blue-600";
      case "completed":
        return "text-green-600";
      case "declined":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusText = () => {
    switch (order.status || type) {
      case "ongoing":
        return "Ongoing";
      case "completed":
        return "Completed";
      case "declined":
        return "Declined";
      default:
        return "";
    }
  };

  const getCardBorderStyle = () => {
    // if (order.status === "ongoing" || (type === "ongoing" && !order.status)) {
    //   return "border-blue-500 border-2";
    // }
    return "border-gray-200";
  };

  const renderButtons = () => {
    if (type === "current") {
      return (
        <View className="flex-row space-x-3 gap-3">
          <TouchableOpacity
            onPress={() => onAccept?.(order.id)}
            className="flex-1 bg-green-100 border border-[#00984C] rounded-[.4rem] py-3"
          >
            <Text className="text-green-700 font-NunitoSemiBold text-center">
              ✓ Accept
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onDecline?.(order.id)}
            className="flex-1 bg-red-100 border border-[#E10000] rounded-[.4rem] py-3"
          >
            <Text className="text-[#E10000] font-NunitoSemiBold text-center">
              ✗ Decline
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (type === "ongoing") {
      return (
        <TouchableOpacity
          onPress={() => onMarkComplete?.(order.id)}
          className="bg-green-100 border border-green-300 rounded-[.4rem] py-3"
        >
          <Text className="text-green-700 font-NunitoSemiBold text-center">
            ✓ Mark as completed
          </Text>
        </TouchableOpacity>
      );
    }

    // For completed orders, no buttons needed
    return null;
  };

  return (
    <View
      key={order.id}
      className={`bg-white mb-4 p-4 rounded-[.4rem] border ${getCardBorderStyle()}`}
    >
      {/* Header with client name and status */}
      <View className="flex-row justify-between items-start mb-3">
        <Text className="text-base font-NunitoSemiBold text-gray-800 flex-1">
          Client name: <Text className="font-NunitoBold">{order.clientName}</Text>
        </Text>
        {getStatusText() && (
          <Text className={`text-sm font-NunitoBold ${getStatusColor()}`}>
            {getStatusText()}
          </Text>
        )}
      </View>

      <Text className="text-sm text-gray-600 mb-2">
        Phone number: {order.phoneNumber}
      </Text>

      <Text className="text-sm text-gray-600 mb-2">
        Car type: <Text className="font-NunitoSemiBold">{order.carType}</Text>
      </Text>

      <Text className="text-sm text-gray-600 mb-4">
        Car Issue: <Text className="font-NunitoSemiBold">{order.carIssue}</Text>
      </Text>

      {renderButtons()}
    </View>
  );
};

export default OrderCard;

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { routes } from '@/constants/routes';
import { 
  UserIcon, 
  TruckIcon, 
  CalendarIcon, 
  MapPinIcon,
  ChevronRightIcon
} from 'react-native-heroicons/outline';

interface MechanicOrder {
  id: string;
  mechanicName: string;
  mechanicImage?: string;
  serviceType: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  problemDescription: string;
  serviceAddress: string;
  preferredDate: string;
  preferredTimeSlot: string;
  status: 'pending' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  schedule?: boolean;
  notes?: string;
  estimatedCost?: string | number | null;
}

interface MechanicOrderCardProps {
  order: MechanicOrder;
  onPress?: (orderId: string) => void;
}

const MechanicOrderCard: React.FC<MechanicOrderCardProps> = ({ order, onPress }) => {
  const estimatedCostValue =
    order.estimatedCost != null && !Number.isNaN(Number(order.estimatedCost))
      ? Number(order.estimatedCost)
      : null;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500', label: 'Processing' };
      case 'accepted':
        return { color: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500', label: 'Accepted' };
      case 'in_progress':
        return { color: 'text-purple-600', bg: 'bg-purple-50', dot: 'bg-purple-500', label: 'Active' };
      case 'completed':
        return { color: 'text-green-600', bg: 'bg-green-50', dot: 'bg-green-500', label: 'Resolved' };
      case 'cancelled':
      case 'declined':
        return { color: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500', label: 'Cancelled' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50', dot: 'bg-gray-400', label: status };
    }
  };

  const status = getStatusConfig(order.status);

  const handlePress = () => {
    if (onPress) {
      onPress(order.id);
    } else {
      router.push({
        pathname: routes.trackMechanicOrder,
        params: { orderId: order.id },
      });
    }
  };

  return (
    <TouchableOpacity
      className="mb-5"
      activeOpacity={0.9}
      onPress={handlePress}
    >
      <View className="bg-white rounded-[32px] overflow-hidden border border-gray-50 shadow-sm">
        <View className="p-6">
          {/* Header Section */}
          <View className="flex-row items-start justify-between mb-6">
            <View className="flex-row items-center flex-1">
              <View className="w-14 h-14 rounded-2xl bg-gray-50 items-center justify-center mr-4 border border-gray-100 overflow-hidden">
                {order.mechanicImage ? (
                  <Image
                    source={{ uri: order.mechanicImage }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <UserIcon size={28} color="#D1D5DB" />
                )}
              </View>
              
              <View className="flex-1">
                <Text className="text-lg font-NunitoExtraBold text-gray-900 mb-0.5" numberOfLines={1}>
                  {order.status === 'pending' && (order.mechanicName === 'Unknown Mechanic' || !order.mechanicName) 
                    ? 'Finding Specialist...' 
                    : order.mechanicName}
                </Text>
                <Text className="text-[10px] font-NunitoExtraBold text-gray-400 uppercase tracking-widest">
                  {order.serviceType.replace('_', ' ')}
                </Text>
              </View>
            </View>
            
            <View className={`${status.bg} px-3 py-1.5 rounded-xl flex-row items-center`}>
              <View className={`w-1.5 h-1.5 rounded-full ${status.dot} mr-2`} />
              <Text className={`text-[9px] font-NunitoExtraBold uppercase tracking-tighter ${status.color}`}>
                {status.label}
              </Text>
            </View>
          </View>

          {/* Details Bar */}
          <View className="flex-row items-center justify-between mb-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
            <View className="flex-1 flex-row items-center">
              <TruckIcon size={16} color="#9CA3AF" />
              <Text className="text-xs font-NunitoBold text-gray-600 ml-2" numberOfLines={1}>
                {order.vehicleMake} {order.vehicleModel}
              </Text>
            </View>
            <View className="w-px h-4 bg-gray-200 mx-3" />
            <View className="flex-row items-center">
              <CalendarIcon size={16} color="#9CA3AF" />
              <Text className="text-xs font-NunitoBold text-gray-600 ml-2">
                {order.schedule ? new Date(order.preferredDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Instant'}
              </Text>
            </View>
          </View>

          {/* Location */}
          <View className="flex-row items-center mb-6 px-1">
            <MapPinIcon size={16} color="#111827" />
            <Text className="text-xs font-NunitoMedium text-gray-400 ml-2.5 flex-1" numberOfLines={1}>
              {order.serviceAddress}
            </Text>
          </View>

          {/* Footer Action */}
          <View className="flex-row items-center justify-between pt-5 border-t border-gray-50">
            {estimatedCostValue != null ? (
              <View>
                <Text className="text-[10px] font-NunitoExtraBold text-gray-400 uppercase tracking-widest mb-1">Budget</Text>
                <Text className="text-xl font-NunitoExtraBold text-gray-900">
                  ₦{estimatedCostValue.toLocaleString()}
                </Text>
              </View>
            ) : (
              <View />
            )}
            
            <View className="bg-gray-900 flex-row items-center px-6 py-3.5 rounded-2xl shadow-lg shadow-gray-200">
              <Text className="text-xs font-NunitoExtraBold text-white uppercase tracking-widest mr-2">Status</Text>
              <ChevronRightIcon size={14} color="#FFFFFF" strokeWidth={3} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MechanicOrderCard;
export type { MechanicOrder };
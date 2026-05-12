import React from 'react';
import { View, Text } from 'react-native';
import { UserIcon, TruckIcon, MapPinIcon } from 'react-native-heroicons/outline';
import OgaMapView, { Marker } from '@/components/OgaMapView';

interface OrderMapViewProps {
  status: string;
  request: any;
  mechanicLocation: { latitude: number, longitude: number } | null;
}

const OrderMapView: React.FC<OrderMapViewProps> = ({ status, request, mechanicLocation }) => {
  if (!(status === 'accepted' || status === 'in_transit' || status === 'arrived') || !request.service_latitude || !request.service_longitude) {
    return null;
  }

  return (
    <View className="rounded-2xl overflow-hidden h-64 mb-5 border-2 border-gray-100 shadow-sm">
      <OgaMapView
        initialRegion={{
          latitude: request.service_latitude,
          longitude: request.service_longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        style={{ flex: 1 }}
      >
        {/* Destination Marker (User) */}
        <Marker 
          type="user"
          coordinate={{ latitude: request.service_latitude, longitude: request.service_longitude }}
        >
          <View className="bg-red-500 p-2 rounded-full border-2 border-white shadow-md">
            <UserIcon size={20} color="#FFFFFF" />
          </View>
        </Marker>

        {/* Current Position Marker (Mechanic) */}
        {mechanicLocation && (
          <Marker type="van" coordinate={mechanicLocation}>
            <View className="bg-gray-900 p-2 rounded-full border-2 border-white shadow-md">
              <TruckIcon size={20} color="#FFFFFF" />
            </View>
          </Marker>
        )}
      </OgaMapView>
      <View className="absolute bottom-3 left-3 right-3 bg-white/95 p-3 rounded-lg border border-gray-100 flex-row items-center">
        <MapPinIcon size={16} color="#6B7280" />
        <Text className="text-xs font-NunitoMedium text-gray-600 ml-2 flex-1" numberOfLines={1}>
          Destination: {request.service_address || 'Customer Location'}
        </Text>
      </View>
    </View>
  );
};

export default OrderMapView;

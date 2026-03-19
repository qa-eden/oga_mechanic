import React from "react";
import { View, Text } from "react-native";

interface MapSectionProps {
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  userLocation?: { latitude: number; longitude: number } | null;
  pickupLocation?: { latitude: number; longitude: number; name?: string } | null;
  destinationLocation?: { latitude: number; longitude: number; name?: string } | null;
  driverLocation?: { latitude: number; longitude: number };
  driverName?: string;
  driverVehicle?: string;
  driverRating?: number;
  renderOverlays?: React.ReactNode;
}

const MapSection: React.FC<MapSectionProps> = ({
  region,
  userLocation,
  pickupLocation,
  destinationLocation,
  driverLocation,
  driverName,
  driverVehicle,
  driverRating,
  renderOverlays,
}) => {
  return (
    <View className="flex-1 relative">
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <Text className="text-lg font-bold text-gray-600 mb-2">Map View (Web not supported)</Text>
        <Text className="text-sm text-gray-500 text-center">
          Region: {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
        </Text>
        {userLocation && (
          <Text className="text-sm text-gray-500 mt-2">
            User: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Text>
        )}
        {driverLocation && (
          <Text className="text-sm text-gray-500 mt-1">
            Driver: {driverLocation.latitude.toFixed(4)}, {driverLocation.longitude.toFixed(4)}
          </Text>
        )}
      </View>
      {/* Custom overlays (landmarks, patterns, etc.) */}
      {renderOverlays}
    </View>
  );
};

export default MapSection;

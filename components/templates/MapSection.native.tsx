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

const MapSection: React.FC<MapSectionProps> = ({ renderOverlays }) => {
  return (
    <View className="flex-1 relative bg-gray-200 justify-center items-center">
      <Text className="text-gray-500 font-NunitoMedium">Map is temporarily disabled.</Text>
      {renderOverlays}
    </View>
  );
};

export default MapSection;
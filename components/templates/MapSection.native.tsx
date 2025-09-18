import React from "react";
import { View, Text } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";

interface MapSectionProps {
  region: Region;
  userLocation?: { latitude: number; longitude: number } | null;
  driverLocation?: { latitude: number; longitude: number };
  driverName?: string;
  driverVehicle?: string;
  driverRating?: number;
  renderOverlays?: React.ReactNode;
}

const MapSection: React.FC<MapSectionProps> = ({
  region,
  userLocation,
  driverLocation,
  driverName,
  driverVehicle,
  driverRating,
  renderOverlays,
}) => {
  return (
    <View className="flex-1 relative">
      <MapView
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        region={region}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="Pickup location"
            pinColor="blue"
          />
        )}

        {/* Driver Location Marker */}
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title={driverName}
            description={driverVehicle && driverRating ? `${driverVehicle} • ⭐ ${driverRating}` : undefined}
          >
            <View className="w-12 h-12 bg-white rounded-full items-center justify-center border-2 border-red-500">
              <View className="w-8 h-8 bg-gray-200 rounded items-center justify-center">
                <Text className="text-xs">🚗</Text>
              </View>
            </View>
          </Marker>
        )}
      </MapView>
      {/* Custom overlays (landmarks, patterns, etc.) */}
      {renderOverlays}
    </View>
  );
};

export default MapSection; 
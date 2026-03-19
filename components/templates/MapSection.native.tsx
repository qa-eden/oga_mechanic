import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import Mapbox, { Camera, MarkerView, UserLocation, ShapeSource, LineLayer } from "@rnmapbox/maps";
import { ENV_CONFIG } from '@/config/env';
import { getMapboxRoute, LocationCoordinate } from "@/lib/mapHelpers";

// Set access token
Mapbox.setAccessToken(ENV_CONFIG.MAPBOX_ACCESS_TOKEN);

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
  const [routeData, setRouteData] = useState<any>(null);
  const cameraRef = useRef<Camera>(null);

  // Fetch route when points change
  useEffect(() => {
    if (pickupLocation?.latitude && destinationLocation?.latitude) {
      const fetchRoute = async () => {
        const route = await getMapboxRoute(
          { latitude: pickupLocation.latitude, longitude: pickupLocation.longitude },
          { latitude: destinationLocation.latitude, longitude: destinationLocation.longitude }
        );
        if (route) {
          setRouteData(route);
          
          // Auto-fit bounds
          const padding = 60;
          cameraRef.current?.fitBounds(
            [Math.max(pickupLocation.longitude, destinationLocation.longitude), Math.max(pickupLocation.latitude, destinationLocation.latitude)],
            [Math.min(pickupLocation.longitude, destinationLocation.longitude), Math.min(pickupLocation.latitude, destinationLocation.latitude)],
            [padding, padding, padding, padding],
            1000
          );
        }
      };
      fetchRoute();
    }
  }, [pickupLocation, destinationLocation]);

  return (
    <View className="flex-1 relative">
      <Mapbox.MapView
        style={{ flex: 1 }}
        styleURL={Mapbox.StyleURL.Street}
      >
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: [region.longitude, region.latitude],
            zoomLevel: 12,
          }}
          centerCoordinate={[region.longitude, region.latitude]}
          animationDuration={1000}
        />

        {/* Route Polyline */}
        {routeData && (
          <ShapeSource id="route-source" shape={routeData}>
            <LineLayer 
              id="route-layer" 
              style={{
                lineColor: '#2563EB',
                lineWidth: 5,
                lineOpacity: 0.8,
                lineJoin: 'round',
                lineCap: 'round',
              }} 
            />
          </ShapeSource>
        )}

        {/* Pickup Marker */}
        {pickupLocation && (
          <MarkerView 
            id="pickup-marker" 
            coordinate={[pickupLocation.longitude, pickupLocation.latitude]}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View className="items-center">
              <View className="bg-primary-600 px-3 py-1 rounded-full mb-1 shadow-sm">
                <Text className="text-white text-[10px] font-bold">Pickup</Text>
              </View>
              <View className="w-5 h-5 bg-white rounded-full items-center justify-center shadow-lg border-2 border-primary-600">
                 <View className="w-2 h-2 bg-primary-600 rounded-full" />
              </View>
            </View>
          </MarkerView>
        )}

        {/* Destination Marker */}
        {destinationLocation && (
          <MarkerView 
            id="destination-marker" 
            coordinate={[destinationLocation.longitude, destinationLocation.latitude]}
            anchor={{ x: 0.5, y: 1 }}
          >
           <View className="items-center">
              <View className="bg-green-600 px-3 py-1 rounded-full mb-1 shadow-sm">
                <Text className="text-white text-[10px] font-bold">10 min</Text>
              </View>
              <View className="w-6 h-6 bg-green-600 rounded-full items-center justify-center shadow-lg border-2 border-white">
                 <View className="w-2 h-2 bg-white rounded-full" />
              </View>
           </View>
          </MarkerView>
        )}

        {/* Custom Driver Location Marker with car icon */}
        {driverLocation && (
          <MarkerView 
            id="driver-location"
            coordinate={[driverLocation.longitude, driverLocation.latitude]}
          >
            <View className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-xl border border-gray-100">
               <Text className="text-lg">🚗</Text>
            </View>
          </MarkerView>
        )}

        {/* User Location */}
        {userLocation && (
          <UserLocation visible={true} />
        )}
      </Mapbox.MapView>
      {renderOverlays}
    </View>
  );
};

export default MapSection;
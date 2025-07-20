import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { ClockIcon, ChevronRightIcon } from 'react-native-heroicons/solid';
import { MapPinIcon } from 'react-native-heroicons/outline';
import * as Location from 'expo-location';
import { useLocation } from '@/contexts/LocationContext';

interface LocationPickerProps {
  type: 'from' | 'to';
  onLocationPress: (type: 'from' | 'to') => void;
  showCurrentLocation?: boolean;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  type, 
  onLocationPress, 
  showCurrentLocation = type === 'from' 
}) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { state, setFromLocation, setToLocation } = useLocation();
  
  const location = type === 'from' ? state.fromLocation : state.toLocation;
  const setLocation = type === 'from' ? setFromLocation : setToLocation;

  const handleCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to use your current location.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const locationData = {
          name: address.name || address.street || "Current Location",
          address: [
            address.street,
            address.city,
            address.region,
            address.country
          ].filter(Boolean).join(', ') || "Your current location",
        };

        setLocation(locationData);
        console.log("Current location set:", locationData);
      } else {
        // Fallback if reverse geocoding fails
        const locationData = {
          name: "Current Location",
          address: `Lat: ${currentLocation.coords.latitude.toFixed(4)}, Lng: ${currentLocation.coords.longitude.toFixed(4)}`,
        };

        setLocation(locationData);
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please try again or select a location manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  const getPlaceholderText = () => {
    if (type === 'from') {
      return {
        title: "Select pickup location",
        subtitle: "Where are you starting from?"
      };
    } else {
      return {
        title: "Select destination",
        subtitle: "Where are you going?"
      };
    }
  };

  const placeholder = getPlaceholderText();

  return (
    <View className="mt-6">
      <View className="flex-row items-center justify-between py-2">
        <Text className="font-NunitoBold text-text-100 capitalize">{type}</Text>
        {showCurrentLocation && (
          <TouchableOpacity
            onPress={handleCurrentLocation}
            disabled={isGettingLocation}
            className={`flex-row items-center px-3 py-1 rounded-full ${
              isGettingLocation ? 'bg-gray-100' : 'bg-blue-50'
            }`}
            activeOpacity={0.7}
          >
            <MapPinIcon size={14} color={isGettingLocation ? "#9CA3AF" : "#3B82F6"} />
            <Text className={`text-sm font-NunitoMedium ml-1 ${
              isGettingLocation ? 'text-gray-400' : 'text-blue-600'
            }`}>
              {isGettingLocation ? 'Getting...' : 'Pick Current Location'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity
        onPress={() => onLocationPress(type)}
        className="flex-row items-center justify-between border border-gray-300 rounded-[.8rem] p-4"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center gap-2">
          <View className="bg-primary-50 border border-primary-200 rounded-[.4rem] p-2">
            <ClockIcon color={"#D30309"} size={20} />
          </View>
          <View>
            <Text className="font-NunitoBold text-[1.06rem]">
              {location.name || placeholder.title}
            </Text>
            <Text className="text-text-100 text-[.9rem]">
              {location.address || placeholder.subtitle}
            </Text>
          </View>
        </View>
        <ChevronRightIcon size={20} />
      </TouchableOpacity>
    </View>
  );
};

export default LocationPicker; 
"use client";

import { View, Text, FlatList, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { useState, useCallback, useMemo, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import BackArrowBtn from "@/components/BackArrowBtn";
import { MapPinIcon, MagnifyingGlassIcon } from "react-native-heroicons/solid";
import { routes } from "@/constants/routes";
import { useLocation } from "@/contexts/LocationContext";

interface LocationItem {
  id: string;
  name: string;
  address: string;
  type: "current_route" | "suggestion";
}

const LocationSelection = () => {
  const params = useLocalSearchParams();
  const { type } = params; // 'from' or 'to'
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const { setFromLocation, setToLocation } = useLocation();

  // Mock location data - expanded for better suggestions
  const [allLocations] = useState<LocationItem[]>([
    {
      id: "1",
      name: "Campus Mini Stadium",
      address: "102273 Lagos Island, Lagos",
      type: "current_route",
    },
    {
      id: "2",
      name: "Viva Cinema",
      address: "22 Simbiat Abiola Way, Lagos",
      type: "current_route",
    },
    {
      id: "3",
      name: "Campus backyard",
      address: "102273 Lagos Island, Lagos",
      type: "suggestion",
    },
    {
      id: "4",
      name: "Lagos Mall",
      address: "Victoria Island, Lagos",
      type: "suggestion",
    },
    {
      id: "5",
      name: "Airport Terminal",
      address: "Murtala Mohammed Airport, Lagos",
      type: "suggestion",
    },
    {
      id: "6",
      name: "University of Lagos",
      address: "Akoka, Lagos",
      type: "suggestion",
    },
    {
      id: "7",
      name: "Lekki Conservation Centre",
      address: "Lekki, Lagos",
      type: "suggestion",
    },
    {
      id: "8",
      name: "National Theatre",
      address: "Iganmu, Lagos",
      type: "suggestion",
    }
  ]);

  const currentRoute = useMemo(() => 
    allLocations.filter((loc) => loc.type === "current_route"), 
    [allLocations]
  );
  
  const suggestions = useMemo(() => 
    allLocations.filter((loc) => loc.type === "suggestion"), 
    [allLocations]
  );

  // Filter locations for dropdown based on search query
  const dropdownSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    return allLocations.filter((loc) => 
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8); // Limit to 8 suggestions
  }, [allLocations, searchQuery]);

  const handleCurrentLocation = useCallback(() => {
    // For now, we'll use a mock current location
    // In a real app, you would use geolocation API
    const currentLocation = {
      name: "Current Location",
      address: "Your current location"
    };
    
    if (type === 'from') {
      setFromLocation(currentLocation);
    } else if (type === 'to') {
      setToLocation(currentLocation);
    }
    
    router.back();
    console.log("Current location selected");
  }, [type, setFromLocation, setToLocation]);

  const handleLocationSelect = useCallback((location: LocationItem) => {
    // Update the location in the global context
    const locationData = {
      name: location.name,
      address: location.address
    };
    
    if (type === 'from') {
      setFromLocation(locationData);
    } else if (type === 'to') {
      setToLocation(locationData);
    }
    
    // Navigate back
    router.back();
    
    console.log("Selected location:", location);
  }, [type, setFromLocation, setToLocation]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
    setShowDropdown(text.length > 0);
  }, []);

  const handleSearchFocus = useCallback(() => {
    if (searchQuery.length > 0) {
      setShowDropdown(true);
    }
  }, [searchQuery]);

  const handleSearchBlur = useCallback(() => {
    // Delay hiding dropdown to allow for taps
    setTimeout(() => setShowDropdown(false), 200);
  }, []);

  const renderLocationItem = useCallback(({ item }: { item: LocationItem }) => (
    <TouchableOpacity
      onPress={() => handleLocationSelect(item)}
      className="flex-row items-center py-4 px-5 border-b border-gray-100"
      activeOpacity={0.7}
    >
      <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-4">
        <MapPinIcon size={16} color={"#D30309"} />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-NunitoBold text-gray-900">
          {item.name}
        </Text>
        <Text className="text-sm text-gray-500 font-NunitoMedium mt-1">
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  ), [handleLocationSelect]);

  const renderDropdownItem = useCallback(({ item }: { item: LocationItem }) => (
    <TouchableOpacity
      onPress={() => handleLocationSelect(item)}
      className="flex-row items-center py-3 px-4 border-b border-gray-100 bg-white"
      activeOpacity={0.7}
    >
      <View className="w-6 h-6 bg-gray-100 rounded-full items-center justify-center mr-3">
        <MapPinIcon size={14} color={"#D30309"} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-NunitoBold text-gray-900">
          {item.name}
        </Text>
        <Text className="text-sm text-gray-500 font-NunitoMedium">
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  ), [handleLocationSelect]);

  const keyExtractor = useCallback((item: LocationItem) => item.id, []);

  const ListHeaderComponent = useCallback(() => (
    <View className="px-5 py-2">
      <Text className="text-base font-NunitoBold text-gray-700">
        Recent Locations
      </Text>
    </View>
  ), []);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <BackArrowBtn />
        <Text className="text-xl font-NunitoBold text-gray-900">
          {type === 'from' ? 'Select Pickup' : 'Select Destination'}
        </Text>
        <View className="w-6" />
      </View>

      {/* Search Input */}
      <View className="mx-5 mt-4 mb-4 relative">
        <View className="flex-row items-center bg-gray-50 border border-primary-300 rounded-2xl px-4 py-4">
          <MagnifyingGlassIcon size={20} color="#9CA3AF" />
          <TextInput
            ref={searchInputRef}
            placeholder={`Search for ${type === 'from' ? 'pickup' : 'destination'} location`}
            value={searchQuery}
            onChangeText={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            className="flex-1 ml-3 text-base font-NunitoMedium text-gray-900"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            blurOnSubmit={false}
          />
        </View>

        {/* Dropdown Suggestions */}
        {showDropdown && (
          <View className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-50 mt-1 max-h-80">
            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Current Location Option */}
              <TouchableOpacity
                onPress={handleCurrentLocation}
                className="flex-row items-center py-3 px-4 border-b border-gray-100 bg-blue-50"
                activeOpacity={0.7}
              >
                <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center mr-3">
                  <MapPinIcon size={14} color={"white"} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-NunitoBold text-blue-700">
                    Use Current Location
                  </Text>
                  <Text className="text-sm text-blue-600 font-NunitoMedium">
                    Your current GPS location
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Search Results */}
              {dropdownSuggestions.map((item) => (
                <View key={item.id}>
                  {renderDropdownItem({ item })}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Main List - Only show when not searching */}
      {!showDropdown && (
        <FlatList
          data={suggestions}
          keyExtractor={keyExtractor}
          renderItem={renderLocationItem}
          ListHeaderComponent={ListHeaderComponent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          getItemLayout={(data, index) => ({
            length: 80,
            offset: 80 * index,
            index,
          })}
          contentContainerStyle={{
            paddingBottom: 20,
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default LocationSelection;

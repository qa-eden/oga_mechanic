"use client";

import { View, Text, FlatList, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import BackArrowBtn from "@/components/BackArrowBtn";
import { MapPinIcon, MagnifyingGlassIcon } from "react-native-heroicons/solid";
import { routes } from "@/constants/routes";
import { useLocation } from "@/contexts/LocationContext";
import { ENV_CONFIG } from "@/config/env";

interface LocationItem {
  id: string;
  name: string;
  address: string;
  type: "recent" | "suggestion";
  latitude?: number;
  longitude?: number;
  placeId?: string;
}

const LocationSelection = () => {
  const params = useLocalSearchParams();
  const { type } = params; // 'from' or 'to'
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const { setFromLocation, setToLocation } = useLocation();
  const [recentLocations, setRecentLocations] = useState<LocationItem[]>([
    {
      id: "recent-1",
      name: "Campus Mini Stadium",
      address: "102273 Lagos Island, Lagos",
      type: "recent",
      latitude: 6.4531,
      longitude: 3.3958,
    },
    {
      id: "recent-2",
      name: "Viva Cinema",
      address: "22 Simbiat Abiola Way, Lagos",
      type: "recent",
      latitude: 6.6018,
      longitude: 3.3515,
    },
  ]);
  const [apiSuggestions, setApiSuggestions] = useState<LocationItem[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setApiSuggestions([]);
      setFetchError(null);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      if (!ENV_CONFIG.MAPBOX_ACCESS_TOKEN) {
        setFetchError("Mapbox access token is missing. Please configure it in your environment.");
        setApiSuggestions([]);
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsLoadingSuggestions(true);
      setFetchError(null);

      try {
        const encodedQuery = encodeURIComponent(searchQuery.trim());
        const params = new URLSearchParams({
          access_token: ENV_CONFIG.MAPBOX_ACCESS_TOKEN,
          autocomplete: "true",
          country: "ng",
          language: "en",
          limit: "8",
          types: "address,place,poi",
        });

        const response = await fetch(
          `${ENV_CONFIG.MAPBOX_PLACES_ENDPOINT}/${encodedQuery}.json?${params.toString()}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Mapbox request failed with status ${response.status}`);
        }

        const data = await response.json();
        const mappedSuggestions: LocationItem[] =
          data?.features?.map((feature: any) => ({
            id: feature.id,
            name: feature.text || feature.place_name || searchQuery.trim(),
            address: feature.place_name || "",
            type: "suggestion" as const,
            latitude: feature.center?.[1],
            longitude: feature.center?.[0],
            placeId: feature.id,
          })) || [];

        setApiSuggestions(mappedSuggestions);
      } catch (error: any) {
        if (error.name === "AbortError") {
          return;
        }
        setFetchError(error.message || "Unable to fetch suggestions. Please try again.");
        setApiSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 350);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Filter locations for dropdown based on search query
  const dropdownSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return apiSuggestions;
  }, [apiSuggestions, searchQuery]);

  const fallbackMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return recentLocations
      .filter(
        (loc) =>
          loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loc.address.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5)
      .map((loc) => ({ ...loc, type: "suggestion" as const }));
  }, [recentLocations, searchQuery]);

  const displayedResults =
    dropdownSuggestions.length > 0 ? dropdownSuggestions : fallbackMatches;

  const handleCurrentLocation = useCallback(() => {
    // For now, we'll use a mock current location
    // In a real app, you would use geolocation API
    const currentLocation = {
      name: "Current Location",
      address: "Your current location",
      latitude: undefined,
      longitude: undefined,
      placeId: undefined,
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
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      placeId: location.placeId,
    };
    
    if (type === 'from') {
      setFromLocation(locationData);
    } else if (type === 'to') {
      setToLocation(locationData);
    }
    
    // Navigate back
    router.back();
    
    console.log("Selected location:", location);
    setRecentLocations((prev) => {
      const withoutSelected = prev.filter((loc) => loc.id !== location.id);
      return [
        {
          ...location,
          id: location.id.startsWith("recent-") ? location.id : `recent-${location.id}`,
          type: "recent" as const,
        },
        ...withoutSelected,
      ].slice(0, 6);
    });
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
    // Delay hiding dropdown to allow taps to register, but keep it snappy
    setTimeout(() => setShowDropdown(false), 250);
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
              keyboardShouldPersistTaps="always"
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

              {isLoadingSuggestions && (
                <View className="flex-row items-center gap-3 py-3 px-4 border-b border-gray-100">
                  <ActivityIndicator size="small" color="#2563EB" />
                  <Text className="text-sm text-gray-500 font-NunitoMedium">
                    Searching Mapbox...
                  </Text>
                </View>
              )}

              {fetchError && (
                <View className="py-3 px-4 border-b border-red-100 bg-red-50">
                  <Text className="text-sm text-red-600 font-NunitoMedium">
                    {fetchError}
                  </Text>
                </View>
              )}

              {/* Search Results */}
              {displayedResults.map((item) => (
                <View key={item.id}>
                  {renderDropdownItem({ item })}
                </View>
              ))}

              {!isLoadingSuggestions &&
                !fetchError &&
                displayedResults.length === 0 && (
                  <View className="py-3 px-4">
                    <Text className="text-sm text-gray-500 font-NunitoMedium">
                      No locations found. Try a different search term.
                    </Text>
                  </View>
                )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Main List - Only show when not searching */}
      {!showDropdown && (
        <FlatList
          data={recentLocations}
          keyExtractor={keyExtractor}
          renderItem={renderLocationItem}
          ListHeaderComponent={recentLocations.length > 0 ? ListHeaderComponent : null}
          ListEmptyComponent={
            <View className="px-5 py-6">
              <Text className="text-sm text-gray-500 font-NunitoMedium">
                Start typing to search for locations and build your recent list.
              </Text>
            </View>
          }
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

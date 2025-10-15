"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, TextInput, FlatList, RefreshControl, Animated } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { images } from "@/constants"
import { LAYOUT } from "@/constants/units"
import { routes } from "@/constants/routes"
import RentalCarCard from "@/components/cards/RentalCarCard";
import BackArrowBtn from "@/components/BackArrowBtn"
import { MagnifyingGlassIcon } from "react-native-heroicons/outline"
import { useQuery } from "@tanstack/react-query"
import { productsAPI } from "@/lib/api/products"
import { useVehicleMakes } from "@/hooks/useVehicleMakes"
import LoadingSpinner from "@/components/LoadingSpinner"

interface RentalCar {
  id: string
  name: string
  transmission: string
  pricePerDay: number
  image: any
  category: string
}

interface SectionData {
  type: 'search' | 'categories' | 'cars' | 'empty' | 'loading' | 'error';
  data?: any;
}

const RentACarScreen = () => {
  const { CONTAINER_PADDING } = LAYOUT

  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [selectedMake, setSelectedMake] = useState("All")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  // Animated progress bar
  const progressAnim = useRef(new Animated.Value(0)).current

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch vehicle makes from API
  const { data: vehicleMakes } = useVehicleMakes();

  // Fetch rental cars from API - use search if there's a query, otherwise get all
  const {
    data: rentalCarsResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['rental-cars', selectedMake, minPrice, maxPrice, debouncedSearchQuery],
    queryFn: async () => {
      // If there's a search query, use search endpoint
      if (debouncedSearchQuery.trim()) {
        const searchResults = await productsAPI.searchProducts(
          debouncedSearchQuery,
          undefined, // categoryId
          minPrice || undefined,
          maxPrice || undefined,
          selectedMake !== "All" ? selectedMake : undefined,
          true // isRental - always true
        );
        return { data: { results: searchResults } };
      } else {
        // Otherwise use regular products endpoint
        return await productsAPI.getProducts(
          undefined, // categoryId
          minPrice || undefined,
          maxPrice || undefined,
          undefined, // offset
          undefined, // limit
          undefined, // merchantId
          true, // isRental
          selectedMake !== "All" ? selectedMake : undefined // make
        );
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const rentalCarsData = rentalCarsResponse?.data?.results || [];
  console.log('🔍 Rental Cars Data:', rentalCarsData);
  console.log('🔍 Selected Make:', selectedMake);
  console.log('🔍 Vehicle Makes:', vehicleMakes);

  // Animate progress bar when loading
  useEffect(() => {
    if (isLoading) {
      // Start animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(progressAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      // Stop animation and reset
      progressAnim.stopAnimation();
      progressAnim.setValue(0);
    }
  }, [isLoading, progressAnim]);

  // Transform API data to match component interface
  const transformRentalCar = (car: any): RentalCar => ({
    id: car.id,
    name: car.name || 'Unknown Car',
    transmission: car.transmission || 'Automatic',
    pricePerDay: parseFloat(car.price || 0),
    image: car.images?.[0]?.image || images?.brabus, // Use first image or fallback
    category: car.make || 'Unknown', // Use make as category
  });

  // Transform API data
  const rentalCars: RentalCar[] = rentalCarsData.map(transformRentalCar);

  // Convert vehicle makes to make options (using the same format as uploadProducts)
  const makeOptions = vehicleMakes?.map(make => ({
    label: make.name,
    value: make.id.toString(),
    name: make.name
  })) || [];

  // Create makes array for filtering (using make names)
  const makes = ["All", ...makeOptions.map(option => option.name)];

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing rental cars:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const filteredCars = useMemo(() =>
    rentalCars.filter((car) => {
      const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesMake = selectedMake === "All" || car.category === selectedMake
      return matchesSearch && matchesMake
    }),
    [rentalCars, searchQuery, selectedMake]
  )

  const sections = useMemo(() => {
    const sectionsData: SectionData[] = [
      { type: 'search' },
      { type: 'categories', data: makes }
    ]

    if (isLoading) {
      sectionsData.push({ type: 'loading' })
    } else if (error) {
      sectionsData.push({ type: 'error' })
    } else if (filteredCars.length > 0) {
      sectionsData.push({ type: 'cars', data: filteredCars })
    } else {
      sectionsData.push({ type: 'empty' })
    }

    return sectionsData
  }, [makes, filteredCars, isLoading, error])

  const renderMakeTab = useCallback(({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => setSelectedMake(item)}
      className={`px-6 py-3 rounded-full mr-3 ${selectedMake === item ? "bg-primary-500" : "bg-gray-200"}`}
      activeOpacity={0.7}
    >
      <Text className={`font-NunitoBold text-base ${selectedMake === item ? "text-white" : "text-gray-600"}`}>
        {item}
      </Text>
    </TouchableOpacity>
  ), [selectedMake])

  const renderCarCard = useCallback(({ item }: { item: any }) => (
    <RentalCarCard item={item} onPress={(car) => {
      router.push({
        pathname: routes?.carRentalDetail,
        params: {
          carId: car.id,
          carName: car.name,
          pricePerDay: car.pricePerDay,
        },
      });
    }} />
  ), [])

  const renderSection = useCallback(({ item }: { item: SectionData }) => {
    switch (item.type) {
      case 'search':
        return (
          <View className={`${CONTAINER_PADDING} pt-6 mb-6`}>
            {/* Search Input */}
            <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 mb-4">
              <MagnifyingGlassIcon size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Search rental cars..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 ml-3 text-base font-NunitoMedium text-gray-900"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Price Filter Inputs */}
            <View className="space-y-3">
              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Text className="text-sm font-NunitoMedium text-gray-600 mb-2">Min Price (₦)</Text>
                  <TextInput
                    className="bg-gray-50 rounded-2xl px-4 py-4 text-base font-NunitoMedium text-gray-900"
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    value={minPrice}
                    onChangeText={setMinPrice}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-NunitoMedium text-gray-600 mb-2">Max Price (₦)</Text>
                  <TextInput
                    className="bg-gray-50 rounded-2xl px-4 py-4 text-base font-NunitoMedium text-gray-900"
                    placeholder="No limit"
                    placeholderTextColor="#9CA3AF"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    keyboardType="numeric"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Clear Filters Button */}
              {(minPrice || maxPrice) && (
                <TouchableOpacity
                  onPress={() => {
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  className="bg-gray-100 rounded-xl px-4 py-2 self-center"
                  activeOpacity={0.7}
                >
                  <Text className="text-sm font-NunitoMedium text-gray-600">Clear Price Filters</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Animated Progress Bar */}
            {isLoading && (
              <View className="mt-4">
                <View className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <Animated.View
                    className="bg-primary-500 h-full rounded-full"
                    style={{
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['20%', '90%'],
                      })
                    }}
                  />
                </View>
                <Text className="text-sm font-NunitoMedium text-gray-500 mt-2 text-center">
                  {debouncedSearchQuery.trim() ? 'Searching...' : 'Loading rental cars...'}
                </Text>
              </View>
            )}
          </View>
        )
      
      case 'categories':
        return (
          <View className="mb-6">
            <Text className={`text-xl font-NunitoExtraBold text-gray-900 mb-4 ${CONTAINER_PADDING}`}>Car Makes</Text>
            <FlatList
              data={item.data}
              renderItem={renderMakeTab}
              keyExtractor={(make) => make}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              scrollEnabled={true}
              nestedScrollEnabled={true}
              initialNumToRender={8}
              maxToRenderPerBatch={8}
              windowSize={7}
              removeClippedSubviews={true}
            />
          </View>
        )
      
      case 'cars':
        return (
          <View className={CONTAINER_PADDING}>
            <FlatList
              data={item.data}
              renderItem={renderCarCard}
              keyExtractor={(car) => car.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              initialNumToRender={8}
              maxToRenderPerBatch={8}
              windowSize={7}
              removeClippedSubviews={true}
            />
          </View>
        )
      
      case 'loading':
        return (
          <View className={`${CONTAINER_PADDING} py-12`}>
            <LoadingSpinner
              message="Loading rental cars..."
              subMessage="Please wait while we fetch available cars"
              size="medium"
              logoSize={32}
            />
          </View>
        )

      case 'error':
        return (
          <View className={`${CONTAINER_PADDING} items-center justify-center py-12`}>
            <Text className="text-lg font-NunitoBold text-red-500 mb-2">Error Loading Cars</Text>
            <Text className="text-base font-NunitoMedium text-gray-400 text-center mb-4">
              Failed to load rental cars. Please try again.
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="bg-primary-500 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-NunitoBold">Retry</Text>
            </TouchableOpacity>
          </View>
        )

      case 'empty':
        return (
          <View className={`${CONTAINER_PADDING} items-center justify-center py-12`}>
            <Text className="text-lg font-NunitoBold text-gray-500 mb-2">No Cars Found</Text>
            <Text className="text-base font-NunitoMedium text-gray-400 text-center">
              Try Adjusting your Search or Category Filter
            </Text>
          </View>
        )

      default:
        return null
    }
  }, [CONTAINER_PADDING, searchQuery, renderMakeTab, renderCarCard, minPrice, maxPrice, setMinPrice, setMaxPrice, isLoading, debouncedSearchQuery])

  const keyExtractor = useCallback((item: SectionData, index: number) => 
    `${item.type}-${index}`, 
    []
  )

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className={`flex-row items-center justify-between py-4 ${CONTAINER_PADDING} border-b border-gray-100`}>
        <BackArrowBtn />
        <Text className="text-xl font-NunitoExtraBold text-gray-900">Rent a Car</Text>
        <View className="w-10" />
      </View>

      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#D30309']}
            tintColor="#D30309"
          />
        }
      />
    </SafeAreaView>
  )
}

export default RentACarScreen
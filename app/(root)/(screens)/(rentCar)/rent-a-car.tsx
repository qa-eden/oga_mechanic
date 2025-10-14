"use client"

import { useState, useCallback, useMemo } from "react"
import { View, Text, TouchableOpacity, TextInput, FlatList, RefreshControl } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { images } from "@/constants"
import { LAYOUT } from "@/constants/units"
import { routes } from "@/constants/routes"
import RentalCarCard from "@/components/cards/RentalCarCard";
import BackArrowBtn from "@/components/BackArrowBtn"
import { MagnifyingGlassIcon } from "react-native-heroicons/outline"
import { useRentalCars } from "@/hooks/useMerchantProducts"
import { useCategories } from "@/hooks/useProducts"
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
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [refreshing, setRefreshing] = useState(false)

  // Fetch categories for filtering
  const { data: categoriesData } = useCategories();

  // Find car category ID (assuming there's a "Car" category)
  const carCategory = categoriesData?.find(cat =>
    cat.name.toLowerCase().includes('car') || cat.name.toLowerCase().includes('vehicle')
  );

  // Fetch rental cars from API
  const {
    data: rentalCarsData = [],
    isLoading,
    error,
    refetch
  } = useRentalCars(carCategory?.id);

  console.log('🔍 Rental Cars Data:', rentalCarsData);
  console.log('🔍 Car Category:', carCategory);

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

  // Extract unique categories from API data
  const apiCategories = Array.from(new Set(rentalCars.map(car => car.category).filter(Boolean)));
  const categories = ["All", ...apiCategories];

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
      const matchesCategory = selectedCategory === "All" || car.category === selectedCategory
      return matchesSearch && matchesCategory
    }),
    [rentalCars, searchQuery, selectedCategory]
  )

  const sections = useMemo(() => {
    const sectionsData: SectionData[] = [
      { type: 'search' },
      { type: 'categories', data: categories }
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
  }, [categories, filteredCars, isLoading, error])

  const renderCategoryTab = useCallback(({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => setSelectedCategory(item)}
      className={`px-6 py-3 rounded-full mr-3 ${selectedCategory === item ? "bg-primary-500" : "bg-gray-200"}`}
      activeOpacity={0.7}
    >
      <Text className={`font-NunitoBold text-base ${selectedCategory === item ? "text-white" : "text-gray-600"}`}>
        {item}
      </Text>
    </TouchableOpacity>
  ), [selectedCategory])

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
            <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4">
              <MagnifyingGlassIcon/>
              <TextInput
                placeholder="Search"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 ml-3 text-base font-NunitoMedium text-gray-900"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        )
      
      case 'categories':
        return (
          <View className="mb-6">
            <Text className={`text-xl font-NunitoExtraBold text-gray-900 mb-4 ${CONTAINER_PADDING}`}>Categories</Text>
            <FlatList
              data={item.data}
              renderItem={renderCategoryTab}
              keyExtractor={(category) => category}
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
            <Text className="text-lg font-NunitoBold text-gray-500 mb-2">No cars found</Text>
            <Text className="text-base font-NunitoMedium text-gray-400 text-center">
              Try adjusting your search or category filter
            </Text>
          </View>
        )

      default:
        return null
    }
  }, [CONTAINER_PADDING, searchQuery, renderCategoryTab, renderCarCard])

  const keyExtractor = useCallback((item: SectionData, index: number) => 
    `${item.type}-${index}`, 
    []
  )

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className={`flex-row items-center justify-between py-4 ${CONTAINER_PADDING} border-b border-gray-100`}>
        <BackArrowBtn />
        <Text className="text-xl font-NunitoExtraBold text-gray-900">Rent a car</Text>
        <View className="w-10" />
      </View>

      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
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
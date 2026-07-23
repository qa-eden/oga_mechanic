"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { View, Text, TouchableOpacity, TextInput, FlatList, RefreshControl, Modal } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { LAYOUT } from "@/constants/units"
import { routes } from "@/constants/routes"
import RentalCarCard from "@/components/cards/RentalCarCard";
import BackArrowBtn from "@/components/BackArrowBtn"
import InputField from "@/components/InputField"
import { AdjustmentsHorizontalIcon, MagnifyingGlassIcon, XMarkIcon } from "react-native-heroicons/outline"
import { useQuery } from "@tanstack/react-query"
import { productsAPI } from "@/lib/api/products"
import LoadingSpinner from "@/components/LoadingSpinner"
import AnimatedErrorCard from "@/components/AnimatedErrorCard"
import PriceRangeSlider from "@/components/PriceRangeSlider"

interface RentalCar {
  id: string
  name: string
  transmission: string
  pricePerDay: number
  image: string
  images: string[]
  category: string
  body_type: string
  make: string
}

interface SectionData {
  type: 'cars' | 'empty' | 'loading' | 'error';
  data?: any;
}

const RentACarScreen = () => {
  const { CONTAINER_PADDING } = LAYOUT

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("All") // "All", "car", "van"
  const [selectedMake, setSelectedMake] = useState("All") // Store make ID or "All"
  
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch rental cars from API (fetching all makes at once to allow dynamic client-side filtering and counts)
  const {
    data: rentalCarsResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['rental-cars', minPrice, maxPrice, searchQuery],
    queryFn: async () => {
      if (searchQuery.trim()) {
        const searchResults = await productsAPI.searchProducts(
          searchQuery,
          undefined,
          minPrice || undefined,
          maxPrice || undefined,
          undefined, // No make filter at API level
          true
        );
        return { data: { results: searchResults } };
      } else {
        const response = await productsAPI.getProducts(
          undefined,
          minPrice || undefined,
          maxPrice || undefined,
          undefined,
          undefined,
          undefined,
          true,
          undefined // No make filter at API level
        );
        return response;
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const rentalCarsData = (() => {
    const data = rentalCarsResponse?.data;
    if (!data) return [];
    return Array.isArray(data) ? data : (data?.results || []);
  })();

  const transformRentalCar = (car: any): RentalCar => {
    const images = car.images?.map((img: any) => img.image) || [];
    return {
      id: car.id,
      name: car.name || 'Unknown Car',
      transmission: car.transmission || 'Automatic',
      pricePerDay: parseFloat(car.price || 0),
      image: images[0] || 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=No+Image',
      images: images.length > 0 ? images : ['https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=No+Image'],
      category: car.body_type || 'car',
      body_type: car.body_type,
      make: car.make,
    };
  };

  const rentalCars: RentalCar[] = rentalCarsData.map(transformRentalCar);

  // Compute counts for categories (All, Cars, Towing Van, Truck)
  const categoryCounts = useMemo(() => {
    const counts = { All: 0, car: 0, van: 0, truck: 0 };
    rentalCars.forEach(car => {
      counts.All++;
      if (car.body_type === 'car') counts.car++;
      else if (car.body_type === 'van') counts.van++;
      else if (car.body_type === 'truck') counts.truck++;
    });
    return counts;
  }, [rentalCars]);

  // Dynamically extract unique makes with counts for the selected category
  const makeOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    rentalCars.forEach(car => {
      if (selectedType === 'All' || car.body_type === selectedType) {
        if (car.make) {
          counts[car.make] = (counts[car.make] || 0) + 1;
        }
      }
    });

    const options = Object.entries(counts).map(([name, count]) => ({
      label: `${name} (${count})`,
      value: name,
      name: name,
      count: count
    }));

    options.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    return options;
  }, [rentalCars, selectedType]);

  const totalCarsForSelectedType = useMemo(() => {
    return rentalCars.filter(car => selectedType === 'All' || car.body_type === selectedType).length;
  }, [rentalCars, selectedType]);

  // Automatically reset selectedMake if it is no longer available in makeOptions
  useEffect(() => {
    if (selectedMake !== "All") {
      const makeExists = makeOptions.some(option => option.value === selectedMake);
      if (!makeExists) {
        setSelectedMake("All");
      }
    }
  }, [selectedType, makeOptions, selectedMake]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const filteredCars = useMemo(() =>
    rentalCars.filter((car) => {
      const matchesType = selectedType === "All" || car.body_type === selectedType;
      const matchesMake = selectedMake === "All" || car.make === selectedMake;
      return matchesType && matchesMake;
    }),
    [rentalCars, selectedType, selectedMake]
  )

  const sections = useMemo(() => {
    const sectionsData: SectionData[] = []

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
  }, [filteredCars, isLoading, error])

  const renderCarCard = useCallback(({ item }: { item: any }) => (
    <RentalCarCard item={item} onPress={(car) => {
      router.push({
        pathname: routes?.carRentalDetail,
        params: { carId: car.id, carName: car.name, pricePerDay: car.pricePerDay },
      });
    }} />
  ), [])

  const renderSection = useCallback(({ item }: { item: SectionData }) => {
    switch (item.type) {
      case 'cars':
        return (
          <View className={CONTAINER_PADDING}>
            <FlatList
              data={item.data}
              renderItem={renderCarCard}
              keyExtractor={(car) => car.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )
      case 'loading':
        return (
          <View className={`${CONTAINER_PADDING} py-12`}>
            <LoadingSpinner message="Loading rental cars..." size="medium" />
          </View>
        )
      case 'error':
        return (
          <AnimatedErrorCard
            emoji="🚗" title="Error Loading Cars" message="Failed to load rental cars. Please try again."
            gradientColors={['#FEF2F2', '#FECACA', '#FCA5A5']}
            textColor="text-red-800"
            actionButton={{ text: "Retry", onPress: () => refetch(), backgroundColor: "#A80207" }}
            className={`${CONTAINER_PADDING}`}
          />
        )
      case 'empty':
        return (
          <AnimatedErrorCard
            emoji="🚗" title="No Cars Found" message="Try adjusting your search or category filter"
            gradientColors={['#F0F9FF', '#E0F2FE', '#BAE6FD']}
            textColor="text-blue-800"
            className={`${CONTAINER_PADDING}`}
          />
        )
      default:
        return null
    }
  }, [CONTAINER_PADDING, renderCarCard, refetch])

  const handleResetSearch = () => {
    setSearchQuery("");
    setSelectedType("All");
    setSelectedMake("All");
    setMinPrice("");
    setMaxPrice("");
    setShowFilters(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between py-4 px-5">
        <BackArrowBtn />
        <Text className="text-xl font-NunitoExtraBold text-gray-900">Vehicle Rental</Text>
        <View className="w-10" />
      </View>

      {/* Custom Search & Filter UI */}
      <View className="mb-2 z-10 bg-white">
        {/* Search Input Row */}
        <View className="px-5 mb-6">
          <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-1 border border-gray-100">
            <MagnifyingGlassIcon size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search cars, towing service..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-md font-NunitoMedium text-gray-900"
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity 
              onPress={() => setShowFilters(!showFilters)}
              className={`w-9 h-9 items-center justify-center rounded-xl ${showFilters || (minPrice || maxPrice) ? 'bg-primary-500' : 'bg-gray-100'}`}
            >
              <AdjustmentsHorizontalIcon size={18} color={(showFilters || minPrice || maxPrice) ? '#fff' : '#6B7280'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Row (Primary) */}
        <View className="mb-3">
          <FlatList
            data={[
              { label: isLoading ? "All" : `All (${categoryCounts.All})`, value: "All" },
              { label: isLoading ? "Cars" : `Cars (${categoryCounts.car})`, value: "car" },
              { label: isLoading ? "Towing Van" : `Towing Van (${categoryCounts.van})`, value: "van" },
              { label: isLoading ? "Truck" : `Truck (${categoryCounts.truck})`, value: "truck" }
            ]}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedType(item.value);
                  if (item.value === 'van' || item.value === 'truck') setSelectedMake("All");
                }}
                className={`px-6 py-2.5 rounded-full mr-2 ${selectedType === item.value ? "bg-primary-500" : "bg-gray-100"}`}
              >
                <Text className={`text-xs font-NunitoBold ${selectedType === item.value ? "text-white" : "text-gray-600"}`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item.value}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            keyboardShouldPersistTaps="handled"
          />
        </View>

        {/* Sub-category Row (Makes) */}
        {makeOptions.length > 0 && (
          <View className="bg-blue-50/30 border-y border-blue-100/50 py-2.5">
            <FlatList
              data={[{ label: `All Makes (${totalCarsForSelectedType})`, value: "All" }, ...makeOptions]}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedMake(item.value)}
                  className={`px-5 py-2 rounded-xl mr-2 ${selectedMake === item.value ? "bg-white border border-primary-500/30" : ""}`}
                >
                  <Text className={`text-[11px] font-NunitoBold ${selectedMake === item.value ? "text-primary-500" : "text-blue-500/70"}`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.value}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        )}

        {/* Price Filter Modal */}
        <Modal
          visible={showFilters}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFilters(false)}
        >
          <TouchableOpacity 
            className="flex-1 bg-black/30" 
            activeOpacity={1} 
            onPress={() => setShowFilters(false)} 
          />
          <View className="bg-white rounded-t-[40px] p-8 pb-12 absolute bottom-0 left-0 right-0 shadow-2xl">
            <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center mb-8" />
            
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-2xl font-NunitoExtraBold text-gray-900">Price Range</Text>
                <Text className="text-sm font-NunitoMedium text-gray-500">Set your daily rental budget</Text>
              </View>
              <TouchableOpacity 
                onPress={() => { setMinPrice(""); setMaxPrice(""); }}
                className="bg-gray-100 px-4 py-2 rounded-xl"
              >
                <Text className="text-xs font-NunitoBold text-gray-600">Reset All</Text>
              </TouchableOpacity>
            </View>

            {/* Visual Slider */}
            <View className="mb-6">
               <PriceRangeSlider 
                  min={0}
                  max={1000000}
                  initialMin={parseInt(minPrice) || 0}
                  initialMax={parseInt(maxPrice) || 1000000}
                  onValueChange={(low, high) => {
                    setMinPrice(low.toString());
                    setMaxPrice(high.toString());
                  }}
               />
            </View>
            
            <View className="flex-row gap-4 mb-10">
              <View className="flex-1">
                <Text className="text-[11px] font-NunitoBold text-gray-400 uppercase tracking-wider mb-2 ml-1">Minimum (₦)</Text>
                <View className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 flex-row items-center">
                  <Text className="text-gray-400 font-NunitoBold mr-2">₦</Text>
                  <TextInput
                    value={minPrice}
                    onChangeText={setMinPrice}
                    placeholder="0"
                    keyboardType="numeric"
                    className="flex-1 text-sm font-NunitoBold text-gray-900"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-NunitoBold text-gray-400 uppercase tracking-wider mb-2 ml-1">Maximum (₦)</Text>
                <View className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 flex-row items-center">
                  <Text className="text-gray-400 font-NunitoBold mr-2">₦</Text>
                  <TextInput
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    placeholder="Any"
                    keyboardType="numeric"
                    className="flex-1 text-sm font-NunitoBold text-gray-900"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => setShowFilters(false)}
              className="bg-primary-500 py-5 rounded-2xl items-center shadow-lg shadow-primary-200"
              activeOpacity={0.8}
            >
              <Text className="font-NunitoExtraBold text-white text-lg">Show Results</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Active Price Badge */}
        {(minPrice || maxPrice) && (
          <View className="px-5 mt-3">
            <TouchableOpacity 
              onPress={() => { setMinPrice(""); setMaxPrice(""); }}
              className="bg-red-50 border border-red-100 rounded-full px-4 py-1.5 self-start flex-row items-center gap-2"
            >
              <Text className="text-[11px] font-NunitoBold text-red-600">
                Price: ₦{minPrice || '0'} - ₦{maxPrice || 'Any'}
              </Text>
              <XMarkIcon size={12} color="#DC2626" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#D30309']} tintColor="#D30309" />
        }
      />
    </SafeAreaView>
  )
}

export default RentACarScreen
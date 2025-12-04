import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView, Modal, Pressable, FlatList, Dimensions, RefreshControl } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { PlusIcon } from 'react-native-heroicons/outline'
import { icons } from '@/constants'
import { router } from 'expo-router'
import { sellerRoutes } from '@/constants/routes'
import { NairaCurrency } from '@/utils/useCurrencyFormatter'
import { LAYOUT } from '@/constants/units'
import { productsAPI } from '@/lib/api/products'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useQuery } from '@tanstack/react-query'
import { useActiveRoleProfile } from '@/hooks/useUserProfile'
import { useCategories } from '@/hooks/useProducts'
import AndroidNavBarSpacer from '@/components/AndroidNavBarSpacer'

const { width: screenWidth } = Dimensions.get("window");

const Product = () => {
  const [showModal, setShowModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { SCROLL_PADDING_BOTTOM, CARD_GAP, CARD_PADDING, CONTAINER_PADDING } = LAYOUT;
  
  // Calculate card width to show 2 full cards + 1 partial card (20-30% visible)
  const CARD_WIDTH = Math.floor((screenWidth - 35 - 32) / 2.15);

  // Fetch user profile based on active role to get merchant ID
  const { data: profileData, activeRole } = useActiveRoleProfile();
  
  // Extract merchant ID safely from different profile structures
  const merchantId = activeRole === 'merchant' 
    ? (profileData?.data as any)?.user?.id || (profileData?.data as any)?.user_id
    : (profileData?.data as any)?.user_id;

  // Use specific category IDs as provided
  const SPARE_PARTS_CATEGORY_ID = 24;
  const CAR_CATEGORY_ID = 23;

  // Fetch categories for reference (optional)
  const { data: categories } = useCategories();

  // Query 1: Fetch ALL products (no category filter)
  const {
    data: allProducts = [],
    isLoading: loadingAll,
    error: errorAll,
    refetch: refetchAll,
  } = useQuery({
    queryKey: ['products', merchantId, 'all'],
    queryFn: async () => {
      const response = await productsAPI.getProducts(
        undefined, // categoryId - no filter
        undefined, // minPrice
        undefined, // maxPrice
        undefined, // offset
        undefined, // limit
        merchantId  // merchantId
      )
      return response.data.results || []
    },
    enabled: !!merchantId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  // Query 2: Fetch ONLY cars (filtered by car category)
  const {
    data: carProducts = [],
    isLoading: loadingCars,
    error: errorCars,
    refetch: refetchCars,
  } = useQuery({
    queryKey: ['products', merchantId, 'cars', CAR_CATEGORY_ID],
    queryFn: async () => {
      const response = await productsAPI.getProducts(
        CAR_CATEGORY_ID, // categoryId - filter by car category (23)
        undefined, // minPrice
        undefined, // maxPrice
        undefined, // offset
        undefined, // limit
        merchantId, // merchantId
        false // isRental - fetch non-rental cars only
      )
      return response.data.results || []
    },
    enabled: !!merchantId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  // Query 3: Fetch ONLY spare parts (filtered by spare parts category)
  const {
    data: sparePartsProducts = [],
    isLoading: loadingSpareParts,
    error: errorSpareParts,
    refetch: refetchSpareParts,
  } = useQuery({
    queryKey: ['products', merchantId, 'spareParts', SPARE_PARTS_CATEGORY_ID],
    queryFn: async () => {
      const response = await productsAPI.getProducts(
        SPARE_PARTS_CATEGORY_ID, // categoryId - filter by spare parts category (24)
        undefined, // minPrice
        undefined, // maxPrice
        undefined, // offset
        undefined, // limit
        merchantId  // merchantId
      )
      return response.data.results || []
    },
    enabled: !!merchantId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  // Query 4: Fetch ONLY rental cars (filtered by car category with is_rental=true)
  const {
    data: rentalCarProducts = [],
    isLoading: loadingRentalCars,
    error: errorRentalCars,
    refetch: refetchRentalCars,
  } = useQuery({
    queryKey: ['products', merchantId, 'rentalCars', CAR_CATEGORY_ID],
    queryFn: async () => {
      const response = await productsAPI.getProducts(
        CAR_CATEGORY_ID, // categoryId - filter by car category (23)
        undefined, // minPrice
        undefined, // maxPrice
        undefined, // offset
        undefined, // limit
        merchantId, // merchantId
        true // isRental - fetch rental cars only
      )
      return response.data.results || []
    },
    enabled: !!merchantId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  // Combine loading and error states
  const loading = loadingAll || loadingCars || loadingSpareParts || loadingRentalCars;
  const error = errorAll || errorCars || errorSpareParts || errorRentalCars;

  // Use specific query results instead of filtering from all products
  const products = allProducts; // Keep for backward compatibility

  // Use the specific query results for each category
  const spareParts = sparePartsProducts;
  const cars = carProducts;
  const rentedCars = rentalCarProducts;



  const options = [
    {
      id: 1,
      title: 'Upload Spare Parts',
      onPress: () => {
        setShowModal(false)
        router.push(sellerRoutes.uploadSpareParts)
      }
    },
    {
      id: 2,
      title: 'Upload Cars',
      onPress: () => {
        setShowModal(false)
        router.push(sellerRoutes.uploadProducts)
      }
    },
    {
      id: 3,
      title: 'Rent out Cars',
      onPress: () => {
        setShowModal(false)
        router.push(sellerRoutes.uploadCarToRent)
      }
    }
  ]

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Text key={i} className="text-yellow-400">★</Text>)
    }
    
    if (hasHalfStar) {
      stars.push(<Text key="half" className="text-yellow-400">★</Text>)
    }
    
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Text key={`empty-${i}`} className="text-gray-300">★</Text>)
    }
    return stars
  }

  // FlatList render functions
  const renderSparePartItem = useCallback(({ item }: { item: any }) => {
    const productImage = item.images && item.images.length > 0 ? item.images[0].image : null;
    
    return (
      <View style={{ width: CARD_WIDTH }}>
            <TouchableOpacity 
              className="bg-white rounded-2xl border border-gray-300 mt-4 overflow-hidden"
              onPress={() => {
                router.push({
                  pathname: sellerRoutes.productDetailsDetailed as any,
                  params: { 
                    productType: 'sparePart',
                    productId: item.id 
                  }
                });
              }}
            >
          <View className="w-full h-[140px] bg-gray-200">
            {productImage ? (
              <Image 
                source={{ uri: productImage }} 
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <icons.empty width={60} height={60} />
              </View>
            )}
          </View>
          <View className="p-3 space-y-2">
            <Text className="font-NunitoBold text-gray-900" numberOfLines={1}>
              {item.name}
            </Text>
            <View className="flex-row items-center">
              {renderStars(item.rating || 0)}
              <Text className="text-gray-500 text-xs ml-1">({item.reviews?.length || 0})</Text>
            </View>
            <NairaCurrency 
              value={parseFloat(item.price)} 
              className="font-NunitoBold text-gray-900"
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  }, [CARD_WIDTH]);

  const renderCarItem = useCallback(({ item }: { item: any }) => {
    const productImage = item.images && item.images.length > 0 ? item.images[0].image : null;
    
    return (
      <View style={{ width: CARD_WIDTH }}>
            <TouchableOpacity 
              className="bg-white rounded-2xl border border-gray-300 mt-4 overflow-hidden"
              onPress={() => {
                router.push({
                  pathname: sellerRoutes.productDetailsDetailed as any,
                  params: { 
                    productType: 'car',
                    productId: item.id 
                  }
                });
              }}
            >
          <View className="w-full h-[140px] bg-gray-200">
            {productImage ? (
              <Image 
                source={{ uri: productImage }} 
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <icons.empty width={60} height={60} />
              </View>
            )}
          </View>
          <View className="p-3 space-y-2">
            <Text className="font-NunitoBold text-gray-900" numberOfLines={1}>
              {item.name}
            </Text>
            <View className="flex-row items-center">
              {renderStars(item.rating || 0)}
              <Text className="text-gray-500 text-xs ml-1">({item.reviews?.length || 0})</Text>
            </View>
            <NairaCurrency 
              value={parseFloat(item.price)} 
              className="font-NunitoBold text-gray-900"
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  }, [CARD_WIDTH]);



  const renderRentedCarItem = useCallback(({ item }: { item: any }) => {
    const productImage = item.images && item.images.length > 0 ? item.images[0].image : null;
    
    return (
      <View style={{ width: CARD_WIDTH }}>
        <TouchableOpacity 
          className="bg-white rounded-2xl border border-gray-300 mt-4 overflow-hidden"
          onPress={() => {
            router.push({
              pathname: sellerRoutes.productDetails as any,
              params: { 
                productType: 'rentedCar',
                productId: item.id 
              }
            });
          }}
        >
          <View className="w-full h-[140px] bg-gray-200">
            {productImage ? (
              <Image 
                source={{ uri: productImage }} 
                className="w-full h-full"
                style={{ resizeMode: 'cover' }}
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <icons.empty width={60} height={60} />
              </View>
            )}
          </View>
          
          <View className="p-3 space-y-2">
            <Text className="font-NunitoBold text-gray-900" numberOfLines={1}>
              {item.name}
            </Text>
            <View className="flex-row items-center">
              {renderStars(item.rating || 0)}
              <Text className="text-gray-500 text-xs ml-1">({item.reviews?.length || 0})</Text>
            </View>
            <Text className="font-NunitoBold text-gray-900">
              NGN {parseFloat(item.price).toLocaleString()}/day
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }, [CARD_WIDTH]);

  const renderEmptyState = (message: string) => (
    <View className="items-center py-12">
      <View className="w-[100px] h-[100px] bg-gray-300 rounded-full items-center justify-center mb-4">
        <icons.empty className='w-full h-full' />
      </View>
      <Text className="text-gray-500 text-center">{message}</Text>
    </View>
  )

  // Pull-to-refresh functionality - refetch all four queries
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all([refetchAll(), refetchCars(), refetchSpareParts(), refetchRentalCars()])
    } catch (error) {
      console.error('❌ Error refreshing:', error);
    } finally {
      setRefreshing(false)
    }
  }, [refetchAll, refetchCars, refetchSpareParts, refetchRentalCars])

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100">
        <View className="w-8" />
        <Text className="text-xl font-NunitoBold text-gray-900">Uploaded Products</Text>
        <TouchableOpacity 
          onPress={() => setShowModal(true)}
          className="p-2 bg-primary-500 rounded-full items-center justify-center"
        >
          <PlusIcon size={25} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingSpinner 
          message="Loading Products"
          subMessage="Fetching your Uploaded Products..."
          size="medium"
          logoSize={32}
        />
      ) : error ? (
        <View className="flex-1 items-center justify-center py-20">
          <View className="items-center">
            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
              <Text className="text-red-500 text-2xl">⚠️</Text>
            </View>
            <Text className="text-lg font-NunitoSemiBold text-gray-900 mb-2">
              Error Loading Products
            </Text>
            <Text className="text-sm text-gray-500 text-center px-8">
              {error instanceof Error ? error.message : 'Failed to fetch products'}
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView 
          className="flex-1 px-4" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#D30309"
              colors={['#D30309']}
              title="Pull to refresh"
              titleColor="#6B7280"
            />
          }
          contentContainerStyle={{
            paddingBottom: 0,
          }}
        >
          {/* Spare Parts Section */}
          <View className="py-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-NunitoBold text-gray-900">All Uploaded Spare Parts</Text>
              <TouchableOpacity onPress={() => router.push(sellerRoutes.allSpareParts as any)}>
                <Text className="text-blue-500 font-NunitoMedium">See All</Text>
              </TouchableOpacity>
            </View>
            
            {spareParts.length > 0 ? (
              <FlatList
                data={spareParts}
                renderItem={renderSparePartItem}
                keyExtractor={(item) => String(item.id)}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                snapToAlignment="start"
                snapToInterval={CARD_WIDTH + CARD_GAP}
                decelerationRate="fast"
                contentContainerStyle={{
                  paddingHorizontal: CARD_PADDING,
                  gap: CARD_GAP,
                }}
                initialNumToRender={4}
                maxToRenderPerBatch={2}
                windowSize={3}
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={100}
              />
            ) : (
              renderEmptyState("You do not have any Uploaded Spare Parts.")
            )}
          </View>

          {/* Uploaded Cars Section */}
          <View className="py-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-NunitoBold text-gray-900">All Uploaded Cars</Text>
              <TouchableOpacity onPress={() => router.push(sellerRoutes.allCars as any)}>
                <Text className="text-blue-500 font-NunitoMedium">See All</Text>
              </TouchableOpacity>
            </View>
            
            {cars.length > 0 ? (
              <FlatList
                data={cars}
                renderItem={renderCarItem}
                keyExtractor={(item) => String(item.id)}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                snapToAlignment="start"
                snapToInterval={CARD_WIDTH + CARD_GAP}
                decelerationRate="fast"
                contentContainerStyle={{
                  paddingHorizontal: CARD_PADDING,
                  gap: CARD_GAP,
                }}
                initialNumToRender={4}
                maxToRenderPerBatch={2}
                windowSize={3}
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={100}
              />
            ) : (
              renderEmptyState("You do not have any Uploaded Cars.")
            )}
          </View>

          {/* Rented Cars Section */}
          <View className="py-6 pb-10">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-NunitoBold text-gray-900">All Rented Cars</Text>
              <TouchableOpacity onPress={() => router.push(sellerRoutes.allRentedCars as any)}>
                <Text className="text-blue-500 font-NunitoMedium">See All</Text>
              </TouchableOpacity>
            </View>
            
            {rentedCars.length > 0 ? (
              <FlatList
                data={rentedCars}
                renderItem={renderRentedCarItem}
                keyExtractor={(item) => String(item.id)}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                snapToAlignment="start"
                snapToInterval={CARD_WIDTH + CARD_GAP}
                decelerationRate="fast"
                contentContainerStyle={{
                  paddingHorizontal: CARD_PADDING,
                  gap: CARD_GAP,
                }}
                initialNumToRender={4}
                maxToRenderPerBatch={2}
                windowSize={3}
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={100}
              />
            ) : (
              renderEmptyState("You do not have any Cars Rented Out.")
            )}
          </View>
        </ScrollView>
      )}

      {/* Bottom Drawer Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setShowModal(false)}
        >
          <View 
            className="bg-white rounded-t-3xl"
            style={{ height: '90%' }}
          >
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mt-4 mb-6" />
            
            <View className="flex-1 justify-center px-8">
              <View className="bg-gray-200 rounded-3xl p-6">
                {/* Header Icon */}
                <View className="mb-4">
                  <View className="w-16 h-16 bg-[#FCF3F2] rounded-full items-center justify-center mb-2">
                    <icons.activeProductTab width={32} height={32} />
                  </View>
                </View>

                {/* Title and Description */}
                <View className="items-center mb-8">
                  <Text className="text-2xl font-NunitoBold text-gray-900 mb-2">
                    Choose your Preferred Option
                  </Text>
                  <Text className="text-gray-600 font-NunitoMedium text-center">
                    Select either of the Three to Perform an Action
                  </Text>
                </View>

                {/* Options */}
                <View className="space-y-4">
                  {options.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      onPress={option.onPress}
                      className="bg-white rounded-2xl p-5 mb-4 shadow-sm"
                    >
                      <Text className="text-lg font-NunitoMedium text-gray-900 text-center">
                        {option.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Android Navigation Bar Spacer */}
                <AndroidNavBarSpacer />
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

export default Product
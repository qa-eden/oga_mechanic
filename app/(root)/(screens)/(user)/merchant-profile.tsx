import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, ScrollView, FlatList, RefreshControl, Dimensions, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { ArrowLeftIcon, MapPinIcon, StarIcon } from 'react-native-heroicons/outline'
import { router, useLocalSearchParams } from 'expo-router'
import LoadingSpinner from '@/components/LoadingSpinner'
import { routes } from '@/constants/routes'
import { useQuery } from '@tanstack/react-query'
import { productsAPI } from '@/lib/api/products'
import { useMerchantProfileByUuid } from '@/hooks/useUserProfile'
import Card1 from '@/components/cards/Card1'
import BackArrowBtn from '@/components/BackArrowBtn'

const { width: screenWidth } = Dimensions.get("window");

const MerchantProfile = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products')

  const { merchantId } = useLocalSearchParams<{ merchantId?: string }>()

  // Fetch merchant profile data
  const {
    data: merchantProfileData,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useMerchantProfileByUuid(merchantId || '', !!merchantId)

  // Fetch merchant products
  const {
    data: productsData,
    isLoading: isProductsLoading,
    error: productsError,
    refetch: refetchProducts
  } = useQuery({
    queryKey: ['merchant-products', merchantId],
    queryFn: async () => {
      const response = await productsAPI.getProducts(
        undefined, // categoryId
        undefined, // minPrice
        undefined, // maxPrice
        undefined, // offset
        undefined, // limit
        merchantId  // merchantId
      )
      return response.data
    },
    enabled: !!merchantId,
  })

  // Extract merchant data from profile API
  const merchantData = merchantProfileData?.data // The merchant profile data
  const userData = merchantData?.user // User data is nested inside merchant data
  const merchantProducts = productsData?.results || []

  // Combined loading and error states
  const isLoading = isProfileLoading || isProductsLoading
  const error = profileError || productsError

  const onRefresh = useCallback(async () => {
    try {
      await Promise.all([refetchProfile(), refetchProducts()])
    } catch (error) {
    }
  }, [refetchProfile, refetchProducts])

  // Show loading state
  if (isLoading) {
    return (
      <LoadingSpinner
        message="Loading Merchant Profile..."
        subMessage="Please wait while we fetch the information"
        size="medium"
        logoSize={32}
      />
    )
  }

  // Show error state
  if (error || !merchantData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-xl font-NunitoBold text-gray-900 mb-2">Merchant Not Found</Text>
          <Text className="text-gray-500 text-center mb-6">
            Unable to load merchant profile. Please try again.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-NunitoBold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Text key={i} className={`${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>★</Text>
    ))
  }

  const renderProductCard = ({ item }: { item: any }) => (
    <View className="w-1/2 px-2 mb-4">
      <Card1
        Images={item.images?.[0]?.image || item.image}
        rating={item?.rating || 0}
        name={item?.name}
        price={item?.price || '0'}
        reviewCount={item?.reviewCount || 0}
        isFavorite={item?.is_in_favorite_list}
        productId={item?.id}
        showLove={true}
        onPress={() => {
          router.push({
            pathname: routes.ProductDetail,
            params: {
              productId: item.id,
              productName: item.name,
              productPrice: item.price,
            },
          });
        }}
      />
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="auto" />

      {/* Header */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between px-5 py-4">

          <BackArrowBtn />
          <Text className="text-xl font-NunitoBold text-gray-900">Seller Profile</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor="#D30309"
            colors={['#D30309']}
          />
        }
      >
        {/* Merchant Header Card */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-6 shadow-sm border border-gray-200">
          {/* Profile Section */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 rounded-full bg-primary-100 items-center justify-center mb-3">
              {(merchantData as any)?.profile_picture ? (
                <Image
                  source={{ uri: (merchantData as any).profile_picture }}
                  className="w-24 h-24 rounded-full"
                />
              ) : (
                <Text className="text-4xl font-NunitoBold text-primary-700">
                  {userData?.first_name?.charAt(0) || 'M'}{userData?.last_name?.charAt(0) || 'S'}
                </Text>
              )}
            </View>

            {/* Verified badge - show by default for now */}
            <View className="absolute top-16 right-32">
              <View className="w-8 h-8 bg-green-500 rounded-full items-center justify-center border-2 border-white">
                <Text className="text-white text-lg">✓</Text>
              </View>
            </View>

            <Text className="text-2xl font-NunitoBold text-gray-900 mb-1">
              {`${userData?.first_name || ''} ${userData?.last_name || ''}`.trim() || 'Merchant Store'}
            </Text>

            {/* Hide location for now - not available in API */}
            {/* <View className="flex-row items-center mb-3">
              <MapPinIcon size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1">Lagos, Nigeria</Text>
            </View> */}

            {/* Rating - Use merchant_rating from first product if available */}
            <View className="flex-row items-center mb-4">
              <View className="flex-row items-center mr-2">
                {renderStars(merchantProducts[0]?.merchant_rating || 0)}
              </View>
              <Text className="text-base font-NunitoBold text-gray-900">
                {merchantProducts[0]?.merchant_rating?.toFixed(1) || '0.0'}
              </Text>
              <Text className="text-sm text-gray-500 ml-1">(0 reviews)</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View className="flex-row justify-around py-4 border-t border-gray-200">
            <View className="items-center flex-1">
              <Text className="text-2xl font-NunitoBold text-gray-900">{merchantProducts.length}</Text>
              <Text className="text-xs text-gray-500 mt-1">Products</Text>
            </View>
            <View className="w-px h-12 bg-gray-200" />
            <View className="items-center flex-1">
              <Text className="text-2xl font-NunitoBold text-gray-900">
                {merchantProducts.reduce((sum, p) => sum + (p.purchased_count || 0), 0)}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">Total Sales</Text>
            </View>
            <View className="w-px h-12 bg-gray-200" />
            <View className="items-center flex-1">
              <Text className="text-2xl font-NunitoBold text-gray-900">
                {merchantProducts[0]?.merchant_rating?.toFixed(1) || '0.0'}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">Rating</Text>
            </View>
          </View>

        </View>

        {/* Business Info Card */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-5 shadow-sm border border-gray-200">
          <Text className="text-lg font-NunitoBold text-gray-900 mb-4">Business Information</Text>

          <View className="space-y-3">
            <View className="flex-row items-start">
              <View className="w-5 h-5 items-center justify-center">
                <Text className="text-gray-600">📅</Text>
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-sm text-gray-600 mb-1">Member Since</Text>
                <Text className="text-sm font-NunitoMedium text-gray-900">
                  {userData?.date_joined ? new Date(userData.date_joined).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  }) : 'N/A'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-start pt-3 border-t border-gray-100">
              <View className="w-5 h-5 items-center justify-center">
                <Text className="text-gray-600">📦</Text>
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-sm text-gray-600 mb-1">Total Products</Text>
                <Text className="text-sm font-NunitoMedium text-gray-900">{merchantProducts.length} items</Text>
              </View>
            </View>

            <View className="flex-row items-start pt-3 border-t border-gray-100">
              <View className="w-5 h-5 items-center justify-center">
                <Text className="text-gray-600">📊</Text>
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-sm text-gray-600 mb-1">Total Sales</Text>
                <Text className="text-sm font-NunitoMedium text-gray-900">
                  {merchantProducts.reduce((sum, p) => sum + (p.purchased_count || 0), 0)} units
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View className="mx-4 mt-6 mb-4">
          <View className="flex-row bg-gray-100 rounded-xl p-1">
            <TouchableOpacity
              onPress={() => setActiveTab('products')}
              className={`flex-1 py-3 rounded-lg ${activeTab === 'products' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`text-center font-NunitoBold ${activeTab === 'products' ? 'text-gray-900' : 'text-gray-500'}`}>
                Products ({merchantProducts.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('reviews')}
              className={`flex-1 py-3 rounded-lg ${activeTab === 'reviews' ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`text-center font-NunitoBold ${activeTab === 'reviews' ? 'text-gray-900' : 'text-gray-500'}`}>
                Reviews (0)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Content */}
        {activeTab === 'products' ? (
          <View className="px-4 pb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-NunitoBold text-gray-900">All Products</Text>
              <Text className="text-sm text-gray-500">{merchantProducts.length} items</Text>
            </View>

            {merchantProducts.length > 0 ? (
              <FlatList
                data={merchantProducts}
                renderItem={renderProductCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                scrollEnabled={false}
              />
            ) : (
              <View className="bg-gray-50 rounded-xl p-8 items-center">
                <Text className="text-gray-500 font-NunitoMedium text-center">
                  No products available yet
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View className="px-4 pb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-NunitoBold text-gray-900">Customer Reviews</Text>
              <View className="flex-row items-center">
                <StarIcon size={16} color="#FCD34D" fill="#FCD34D" />
                <Text className="text-sm font-NunitoBold text-gray-900 ml-1">
                  {merchantProducts[0]?.merchant_rating?.toFixed(1) || '0.0'}
                </Text>
              </View>
            </View>

            {/* No reviews available yet */}
            <View className="bg-gray-50 rounded-xl p-8 items-center">
              <Text className="text-gray-500 font-NunitoMedium text-center mb-2">
                No reviews yet
              </Text>
              <Text className="text-gray-400 text-sm text-center">
                Be the first to review this merchant
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default MerchantProfile
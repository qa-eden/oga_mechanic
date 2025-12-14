import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, ScrollView, FlatList, RefreshControl, Dimensions, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { StarIcon } from 'react-native-heroicons/outline'
import { router, useLocalSearchParams } from 'expo-router'
import LoadingSpinner from '@/components/LoadingSpinner'
import { routes } from '@/constants/routes'
import { useQuery } from '@tanstack/react-query'
import { productsAPI } from '@/lib/api/products'
import { useMerchantProfileByUuid } from '@/hooks/useUserProfile'
import Card1 from '@/components/cards/Card1'
import BackArrowBtn from '@/components/BackArrowBtn'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'

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
  const merchantData = merchantProfileData?.data 
  const userData = merchantData?.user 
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
      <StatusBar style="dark" />

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
        {/* Header Section */}
        <Animated.View 
          entering={FadeInDown.duration(600)}
          className="rounded-b-[2.5rem] overflow-hidden shadow-sm mb-6 bg-white"
        >
          <View className="px-5 pt-4 pb-8">
             {/* Top Bar */}
             <View className="flex-row items-center mb-6">
               <BackArrowBtn />
               <View className="ml-4">
                 <Text className="text-2xl font-NunitoExtraBold text-gray-900">
                   Seller Profile
                 </Text>
               </View>
             </View>

             {/* Merchant Card */}
             <View className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
               <View className="flex-row items-center">
                 {/* Avatar */}
                 <View className="relative mr-4">
                    <LinearGradient
                      colors={['#D30309', '#B91C1C']}
                      className="w-20 h-20 rounded-2xl items-center justify-center"
                    >
                      {(merchantData as any)?.profile_picture ? (
                        <Image
                          source={{ uri: (merchantData as any).profile_picture }}
                          className="w-[76px] h-[76px] rounded-xl bg-white"
                        />
                      ) : (
                        <Text className="text-2xl font-NunitoExtraBold text-white">
                          {userData?.first_name?.charAt(0) || 'M'}
                        </Text>
                      )}
                    </LinearGradient>
                    <View className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full items-center justify-center border-2 border-white">
                      <Text className="text-white text-[10px]">✓</Text>
                    </View>
                 </View>

                 {/* Info */}
                 <View className="flex-1">
                   <Text className="text-xl font-NunitoExtraBold text-gray-900 mb-1 leading-tight">
                     {`${userData?.first_name || ''} ${userData?.last_name || ''}`.trim() || 'Merchant Store'}
                   </Text>
                   <View className="flex-row items-center mb-2">
                     <StarIcon size={14} color="#FBBF24" fill="#FBBF24" />
                     <Text className="text-sm font-NunitoBold text-gray-900 ml-1">
                       {merchantProducts[0]?.merchant_rating?.toFixed(1) || '0.0'}
                     </Text>
                     <Text className="text-xs text-gray-500 ml-1">• 0 reviews</Text>
                   </View>
                   <Text className="text-gray-500 text-xs font-NunitoMedium">
                     Member since {userData?.date_joined ? new Date(userData.date_joined).getFullYear() : '2024'}
                   </Text>
                 </View>
               </View>

               {/* Quick Stats */}
               <View className="flex-row mt-5 pt-4 border-t border-gray-200/60">
                 <View className="flex-1 items-center">
                   <Text className="text-lg font-NunitoBold text-gray-900">{merchantProducts.length}</Text>
                   <Text className="text-xs text-gray-400 font-NunitoMedium">Products</Text>
                 </View>
                 <View className="w-px bg-gray-200" />
                 <View className="flex-1 items-center">
                   <Text className="text-lg font-NunitoBold text-gray-900">
                     {merchantProducts.reduce((sum, p) => sum + (p.purchased_count || 0), 0)}
                   </Text>
                   <Text className="text-xs text-gray-400 font-NunitoMedium">Sales</Text>
                 </View>
               </View>
             </View>
          </View>
        </Animated.View>

        <View className="px-5 space-y-6">
          {/* Tabs */}
          <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
            <View className="flex-row bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
              <TouchableOpacity
                onPress={() => setActiveTab('products')}
                className={`flex-1 py-3 rounded-xl ${activeTab === 'products' ? 'bg-gray-100' : 'bg-transparent'}`}
              >
                <Text className={`text-center font-NunitoBold ${activeTab === 'products' ? 'text-gray-900' : 'text-gray-400'}`}>
                  Products
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveTab('reviews')}
                className={`flex-1 py-3 rounded-xl ${activeTab === 'reviews' ? 'bg-gray-100' : 'bg-transparent'}`}
              >
                <Text className={`text-center font-NunitoBold ${activeTab === 'reviews' ? 'text-gray-900' : 'text-gray-400'}`}>
                  Reviews
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Tab Content */}
          <View className="pb-10">
            {activeTab === 'products' ? (
              <Animated.View entering={FadeInDown.delay(300).duration(600)}>
                <View className="flex-row items-center justify-between mb-4 mt-2">
                  <Text className="text-lg font-NunitoBold text-gray-900">Inventory</Text>
                  <Text className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-500 font-NunitoBold">
                    {merchantProducts.length} items
                  </Text>
                </View>

                {merchantProducts.length > 0 ? (
                  <FlatList
                    data={merchantProducts}
                    renderItem={renderProductCard}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    scrollEnabled={false}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                  />
                ) : (
                  <View className="bg-white rounded-2xl p-10 items-center border border-gray-100 border-dashed">
                    <Text className="text-gray-400 font-NunitoMedium text-center">
                      No products available yet
                    </Text>
                  </View>
                )}
              </Animated.View>
            ) : (
              <Animated.View entering={FadeInDown.delay(300).duration(600)}>
                {/* No reviews available yet */}
                <View className="bg-white rounded-2xl p-10 items-center shadow-sm border border-gray-100">
                  <StarIcon size={40} color="#E5E7EB" />
                  <Text className="text-gray-900 font-NunitoBold text-center mt-4 mb-1">
                    No reviews yet
                  </Text>
                  <Text className="text-gray-400 text-sm text-center">
                    This merchant hasn't received any reviews yet.
                  </Text>
                </View>
              </Animated.View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default MerchantProfile
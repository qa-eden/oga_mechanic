import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView, FlatList, RefreshControl } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeftIcon, PlusIcon } from 'react-native-heroicons/outline'
import { images, icons } from '@/constants'
import { router } from 'expo-router'
import { LAYOUT } from '@/constants/units'
import { sellerRoutes } from '@/constants/routes'
import Card1 from '@/components/cards/Card1'
import SearchBarWithCategories from '@/components/SearchBarWithCategories'
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal'
import { productsAPI } from '@/lib/api/products'
import LoadingSpinner from '@/components/LoadingSpinner'
import { useQuery } from '@tanstack/react-query'
import { useActiveRoleProfile } from '@/hooks/useUserProfile'

const { SCROLL_PADDING_BOTTOM, CARD_GAP, CARD_PADDING, CONTAINER_PADDING } = LAYOUT;

const AllCars = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [inputQuery, setInputQuery] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)
  
  const categoryOptions = [
    { name: "All", id: null },
    { name: "Mercedez", id: 1 },
    { name: "Porsche", id: 2 },
    { name: "Hyundai", id: 3 }
  ]

  // Fetch user profile based on active role to get merchant ID
  const { data: profileData, activeRole } = useActiveRoleProfile();
  
  // Extract merchant ID safely from different profile structures
  const merchantId = activeRole === 'merchant' 
    ? (profileData?.data as any)?.user?.id || (profileData?.data as any)?.user_id
    : (profileData?.data as any)?.user_id;
  
  console.log('🔍 Active Role:', activeRole, 'Merchant ID:', merchantId);

  // Fetch cars using TanStack Query with merchant_id filter
  const {
    data: cars = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products', merchantId, 'cars'], // Unique key for cars only
    queryFn: async () => {
      const response = await productsAPI.getProducts(
        undefined, // categoryId
        undefined, // minPrice
        undefined, // maxPrice
        undefined, // offset
        undefined, // limit
        merchantId  // merchantId
      )
      // Filter for cars only (non-rental)
      const carProducts = (response.data.results || []).filter((product: any) => 
        product.category?.name?.toLowerCase().includes('car') && 
        !product.is_rental
      )
      console.log('Fetched cars for merchant:', merchantId, carProducts)
      return carProducts
    },
    enabled: !!merchantId, // Only fetch when we have merchantId
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  // Pull-to-refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      console.log('🔄 Pull-to-refresh triggered - refetching cars...')
      await refetch()
      console.log('✅ Cars refreshed successfully')
    } catch (error) {
      console.error('❌ Error during refresh:', error)
    } finally {
      setRefreshing(false)
    }
  }, [refetch])

  const handleSearchChange = useCallback((text: string) => {
    setInputQuery(text);
  }, []);

  const handleCategoryChange = useCallback((categoryName: string, categoryId?: number | null) => {
    setSelectedCategory(categoryName);
  }, []);

  const handlePriceChange = useCallback((field: 'min' | 'max', value: string) => {
    if (field === 'min') {
      setMinPrice(value);
    } else {
      setMaxPrice(value);
    }
  }, []);

  const handleApplySearch = () => {
    console.log('Applying search:', { inputQuery, selectedCategory, minPrice, maxPrice });
  };

  const handleResetSearch = () => {
    setInputQuery("");
    setSelectedCategory("All");
    setMinPrice("");
    setMaxPrice("");
  };

  const handleFilterPress = () => {
    console.log("Filter pressed");
  };

  const handleDeleteItem = (item: any) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    // In real app, call delete API here
    console.log('Deleting car:', selectedItem?.id);
    
    // Navigate to success page
    setTimeout(() => {
      router.push({
        pathname: sellerRoutes.deleteSuccess as any,
        params: { itemType: 'car' }
      });
    }, 300);
  };

  const renderCarCard = ({ item, index }: { item: any; index: number }) => {
    // Get the first image or use placeholder
    const productImage = item.images && item.images.length > 0 ? item.images[0].image : null;
    
    // Custom image component that handles placeholders
    const ImageComponent = () => {
      if (productImage) {
        return <Image source={{ uri: productImage }} className="w-full h-full" resizeMode="cover" />;
      } else {
        return (
          <View className="w-full h-full bg-gray-200 items-center justify-center">
            <icons.empty width={60} height={60} />
            <Text className="text-gray-500 text-xs mt-2">No Image</Text>
          </View>
        );
      }
    };

    return (
      <View className="w-1/2 px-2 mb-4">
        <TouchableOpacity 
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
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
          <View className="w-full h-[160px]">
            <ImageComponent />
          </View>
          <View className="p-3">
            <Text className="font-NunitoBold text-gray-900 text-sm mb-1" numberOfLines={1}>
              {item.name}
            </Text>
            <View className="flex-row items-center mb-2">
              <Text className="text-yellow-400 text-sm">★</Text>
              <Text className="text-gray-500 text-xs ml-1">({item.reviews?.length || 0})</Text>
            </View>
            <Text className="font-NunitoBold text-gray-900">
              NGN {parseFloat(item.price).toLocaleString()}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="bg-white flex-1" edges={["top"]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className={`flex-row items-center justify-between ${CONTAINER_PADDING} py-4`}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeftIcon size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-NunitoBold text-gray-900">All Uploaded Cars</Text>
        <TouchableOpacity 
          onPress={() => router.push(sellerRoutes.uploadProducts)}
          className="p-2 bg-primary-500 rounded-full items-center justify-center"
        >
          <PlusIcon size={25} color="white" />
        </TouchableOpacity>
      </View>

      <SearchBarWithCategories
        searchQuery={inputQuery}
        setSearchQuery={handleSearchChange}
        selectedCategory={selectedCategory}
        setSelectedCategory={handleCategoryChange}
        categories={categoryOptions}
        onFilterPress={handleFilterPress}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onPriceChange={handlePriceChange}
        onApplySearch={handleApplySearch}
        onResetSearch={handleResetSearch}
        isSearching={false}
      />

      {/* Cars Grid */}
      {loading ? (
        <LoadingSpinner 
          message="Loading Cars"
          subMessage="Fetching your uploaded cars..."
          size="medium"
          logoSize={32}
        />
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-red-50 rounded-3xl p-8 items-center">
            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
              <Text className="text-red-500 text-2xl">⚠️</Text>
            </View>
            <Text className="text-red-700 font-NunitoBold text-lg mb-2">Error Loading Cars</Text>
            <Text className="text-red-600 text-center mb-4">
              {error instanceof Error ? error.message : 'Failed to fetch cars'}
            </Text>
            <TouchableOpacity 
              onPress={() => refetch()}
              className="bg-red-500 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-NunitoMedium">Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : cars.length > 0 ? (
        <FlatList
          data={cars}
          renderItem={renderCarCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0A6DEE"
              colors={['#0A6DEE']}
              title="Pull to refresh"
              titleColor="#6B7280"
            />
          }
          contentContainerStyle={{
            paddingHorizontal: CARD_PADDING,
            paddingBottom: SCROLL_PADDING_BOTTOM,
          }}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews={true}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-gray-50 rounded-3xl p-8 items-center">
            <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-6">
              <icons.empty width={40} height={40} />
            </View>
            <Text className="text-gray-700 font-NunitoBold text-lg mb-2">No Cars Uploaded</Text>
            <Text className="text-gray-500 text-center mb-6">
              You haven't uploaded any cars yet. Start by adding your first car listing.
            </Text>
            <TouchableOpacity 
              onPress={() => router.push(sellerRoutes.uploadProducts)}
              className="bg-primary-500 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-NunitoMedium">Upload Your First Car</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            visible={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleConfirmDelete}
            itemType="car"
            itemName={selectedItem?.name || ''}
          />
        </SafeAreaView>
      )
    }

    export default AllCars

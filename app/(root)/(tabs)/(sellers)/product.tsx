import React, { useState, useCallback, memo } from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView, Modal, Pressable, FlatList, Dimensions } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CubeIcon, TruckIcon, TruckIcon as CarIcon, PlusIcon } from 'react-native-heroicons/outline'
import { icons, images } from '@/constants'
import { router } from 'expo-router'
import { routes, sellerRoutes } from '@/constants/routes'
import { NairaCurrency } from '@/utils/useCurrencyFormatter'
import { LAYOUT } from '@/constants/units'
import RentedCarCard from '@/components/cards/RentedCarCard'

const { width: screenWidth } = Dimensions.get("window");

const Product = () => {
  const [showModal, setShowModal] = useState(false)
  const { SCROLL_PADDING_BOTTOM, CARD_GAP, CARD_PADDING, CONTAINER_PADDING } = LAYOUT;
  
  // Calculate card width to show 2 full cards + 1 partial card (20-30% visible)
  const CARD_WIDTH = Math.floor((screenWidth - 35 - 32) / 2.15);

  // Sample data - replace with actual data from API
  const spareParts = [
    {
      id: "1",
      name: "Fatai Sule",
      image: images.sparePart,
      rating: 4.5,
      reviewCount: 30,
    },
    {
      id: "2", 
      name: "Easther Emeka",
      image: images.carEngine,
      rating: 5.0,
      reviewCount: 30,
    },
    {
      id: "3",
      name: "Fatai Sule",
      image: images.sparePart,
      rating: 4.5,
      reviewCount: 30,
    },
    {
      id: "4", 
      name: "Easther Emeka",
      image: images.carEngine,
      rating: 5.0,
      reviewCount: 30,
    }
  ]

  const uploadedCars = [
    {
      id: "1",
      name: "Escalade (2024)",
      image: images.car1,
      rating: 4.5,
      reviewCount: 35,
      price: 105000000,
    },
    {
      id: "2",
      name: "Benz (2020)", 
      image: images.benz,
      rating: 3.5,
      reviewCount: 30,
      price: 80000000,
    }
  ]

  const rentedCars = [
    {
      id: "1",
      name: "Escalade (2024)",
      image: images.car1,
      rating: 4.5,
      reviewCount: 35,
      price: 105000000,
    },
    {
      id: "2",
      name: "Benz (2020)",
      image: images.benz,
      rating: 3.5,
      reviewCount: 30,
      price: 80000000,
    }
  ]

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
    const ImageComponent = item.image;
    
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
            {typeof ImageComponent === 'function' ? (
              <View className="w-full h-full items-center justify-center">
                <ImageComponent width={140} height={140} />
              </View>
            ) : (
              <Image 
                source={{ uri: item.image }} 
                className="w-full h-full"
                resizeMode="cover"
              />
            )}
          </View>
          <View className="p-3 space-y-2">
            <Text className="font-NunitoBold text-gray-900" numberOfLines={1}>
              {item.name}
            </Text>
            <View className="flex-row items-center">
              {renderStars(item.rating)}
              <Text className="text-gray-500 text-xs ml-1">({item.reviewCount})</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  }, [CARD_WIDTH]);

  const renderCarItem = useCallback(({ item }: { item: any }) => {
    const ImageComponent = item.image;
    
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
            {typeof ImageComponent === 'function' ? (
              <View className="w-full h-full items-center justify-center">
                <ImageComponent width={140} height={140} />
              </View>
            ) : (
              <Image 
                source={{ uri: item.image }} 
                className="w-full h-full"
                resizeMode="cover"
              />
            )}
          </View>
          <View className="p-3 space-y-2">
            <Text className="font-NunitoBold text-gray-900" numberOfLines={1}>
              {item.name}
            </Text>
            <View className="flex-row items-center">
              {renderStars(item.rating)}
              <Text className="text-gray-500 text-xs ml-1">({item.reviewCount})</Text>
            </View>
            <NairaCurrency 
              value={item.price} 
              className="font-NunitoBold text-gray-900"
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  }, [CARD_WIDTH]);

  const handleDeleteRentedCar = useCallback((car: any) => {
    console.log('Delete rented car:', car.id);
    // In real app, call delete API here
    // For now, just log the action
  }, []);

  const renderRentedCarItem = useCallback(({ item }: { item: any }) => {
    const ImageComponent = item.image;
    
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
            {typeof ImageComponent === 'function' ? (
              <View className="w-full h-full items-center justify-center">
                <ImageComponent width={140} height={140} />
              </View>
            ) : (
              <Image 
                source={{ uri: item.image }} 
                className="w-full h-full"
                style={{ resizeMode: 'cover' }}
              />
            )}
          </View>
          
          <View className="p-3 space-y-2">
            <Text className="font-NunitoBold text-gray-900" numberOfLines={1}>
              {item.name}
            </Text>
            <View className="flex-row items-center">
              {renderStars(item.rating)}
              <Text className="text-gray-500 text-xs ml-1">({item.reviewCount})</Text>
            </View>
            <Text className="font-NunitoBold text-gray-900">
              NGN {item.price.toLocaleString()}/day
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

      <ScrollView 
        className="flex-1 px-4" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 0,
        }}
      >
        {/* Spare Parts Section */}
        <View className="py-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-NunitoBold text-gray-900">All uploaded spare parts</Text>
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
            renderEmptyState("You do not have any uploaded spare parts.")
          )}
        </View>

        {/* Uploaded Cars Section */}
        <View className="py-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-NunitoBold text-gray-900">All uploaded cars</Text>
            <TouchableOpacity onPress={() => router.push(sellerRoutes.allCars as any)}>
              <Text className="text-blue-500 font-NunitoMedium">See All</Text>
            </TouchableOpacity>
          </View>
          
          {uploadedCars.length > 0 ? (
            <FlatList
              data={uploadedCars}
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
            renderEmptyState("You do not have any uploaded cars.")
          )}
        </View>

        {/* Rented Cars Section */}
        <View className="py-6 pb-10">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-NunitoBold text-gray-900">All rented cars</Text>
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
            renderEmptyState("You do not have any cars rented out.")
          )}
        </View>
      </ScrollView>

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
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

export default Product
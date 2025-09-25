import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView, FlatList } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeftIcon, PlusIcon } from 'react-native-heroicons/outline'
import { images } from '@/constants'
import { router } from 'expo-router'
import { LAYOUT } from '@/constants/units'
import { sellerRoutes } from '@/constants/routes'
import Card1 from '@/components/cards/Card1'
import SearchBarWithCategories from '@/components/SearchBarWithCategories'
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal'

const { SCROLL_PADDING_BOTTOM, CARD_GAP, CARD_PADDING, CONTAINER_PADDING } = LAYOUT;

const AllCars = () => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [inputQuery, setInputQuery] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  
  const categoryOptions = [
    { name: "All", id: null },
    { name: "Mercedez", id: 1 },
    { name: "Porsche", id: 2 },
    { name: "Hyundai", id: 3 }
  ]
  
  const cars = [
    { id: "1", name: "BMW 328", transmission: "Automatic", image: images.car1, price: 100000 },
    { id: "2", name: "Tesla Model S", transmission: "Automatic", image: images.benz, price: 210000 },
    { id: "3", name: "Toyota Yaris", transmission: "Manual", image: images.car1, price: 90000 },
    { id: "4", name: "Brabus G63", transmission: "Automatic", image: images.benz, price: 400000 },
  ]

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

  const renderCarCard = ({ item, index }: { item: any; index: number }) => (
    <View className="w-1/2 px-2 mb-4">
      <Card1
        Images={item.image}
        rating={item.rating || 4.5}
        name={item.name}
        reviewCount={item.reviewCount || 0}
        price={item.price}
        showLove={false}
            onPress={() => {
              router.push({
                pathname: sellerRoutes.productDetailsDetailed as any,
                params: { 
                  productType: 'car',
                  productId: item.id 
                }
              });
            }}
      />
    </View>
  )

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
          onPress={() => router.push('/uploadProducts' as any)}
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
      <FlatList
        data={cars}
        renderItem={renderCarCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: CARD_PADDING,
          paddingBottom: SCROLL_PADDING_BOTTOM,
        }}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={true}
          />

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

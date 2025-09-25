import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView, FlatList, Dimensions } from 'react-native'
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

const AllSpareParts = () => {
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
  
  const spareParts = [
    { id: "1", name: "Car Wheel", image: images.sparePart, rating: 5.0, reviewCount: 30, price: 150000 },
    { id: "2", name: "Engine Oil", image: images.carEngine, rating: 4.5, reviewCount: 30, price: 7000 },
    { id: "3", name: "Brake Pad", image: images.sparePart, rating: 4.8, reviewCount: 25, price: 25000 },
    { id: "4", name: "Air Filter", image: images.carEngine, rating: 4.2, reviewCount: 20, price: 12000 },
    { id: "5", name: "Spark Plug", image: images.sparePart, rating: 4.7, reviewCount: 35, price: 5000 },
    { id: "6", name: "Oil Filter", image: images.carEngine, rating: 4.6, reviewCount: 28, price: 8000 },
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
    console.log('Deleting spare part:', selectedItem?.id);
    
    // Navigate to success page
    setTimeout(() => {
      router.push({
        pathname: sellerRoutes.deleteSuccess as any,
        params: { itemType: 'sparePart' }
      });
    }, 300);
  };

  const renderSparePartCard = ({ item, index }: { item: any; index: number }) => (
    <View className="w-1/2 px-2 mb-4">
      <Card1
        Images={item.image}
        rating={item.rating}
        name={item.name}
        reviewCount={item.reviewCount}
        price={item.price}
        showLove={false}
            onPress={() => {
              router.push({
                pathname: sellerRoutes.productDetailsDetailed as any,
                params: { 
                  productType: 'sparePart',
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
        <Text className="text-lg font-NunitoBold text-gray-900">All Uploaded Spare Parts</Text>
        <TouchableOpacity 
          onPress={() => router.push('/upload-sparePart' as any)}
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

      {/* Products Grid */}
      <FlatList
        data={spareParts}
        renderItem={renderSparePartCard}
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
            itemType="sparePart"
            itemName={selectedItem?.name || ''}
          />
        </SafeAreaView>
      )
    }

    export default AllSpareParts

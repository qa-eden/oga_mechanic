import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeftIcon, PlusIcon } from 'react-native-heroicons/outline'
import { images } from '@/constants'
import { router } from 'expo-router'
import { LAYOUT } from '@/constants/units'
import { sellerRoutes } from '@/constants/routes'
import SearchBarWithCategories from '@/components/SearchBarWithCategories'
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal'
import RentedCarCard from '@/components/cards/RentedCarCard'

const { SCROLL_PADDING_BOTTOM, CARD_GAP, CARD_PADDING, CONTAINER_PADDING } = LAYOUT;

const AllRentedCars = () => {
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
  
  const rentedCars = [
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
    console.log('Deleting rented car:', selectedItem?.id);
    
    // Navigate to success page
    setTimeout(() => {
      router.push({
        pathname: sellerRoutes.deleteSuccess as any,
        params: { itemType: 'rentedCar' }
      });
    }, 300);
  };

  const renderCarCard = (car: any) => {
    return (
      <RentedCarCard
        key={car.id}
        car={car}
        onPress={() => {
          router.push({
            pathname: sellerRoutes.productDetails as any,
            params: { 
              productType: 'rentedCar',
              productId: car.id 
            }
          });
        }}
        onDelete={handleDeleteItem}
      />
    )
  }

  return (
    <SafeAreaView className="bg-white flex-1" edges={["top"]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className={`flex-row items-center justify-between ${CONTAINER_PADDING} py-4`}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeftIcon size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-NunitoBold text-gray-900">All Rented Cars</Text>
        <TouchableOpacity 
          onPress={() => router.push('/uploadCarToRent' as any)}
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

      {/* Cars List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className={`${CONTAINER_PADDING} py-4`}>
          {rentedCars.map(renderCarCard)}
        </View>
      </ScrollView>

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            visible={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleConfirmDelete}
            itemType="rentedCar"
            itemName={selectedItem?.name || ''}
          />
        </SafeAreaView>
      )
    }

    export default AllRentedCars

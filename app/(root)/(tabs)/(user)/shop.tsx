"use client"

import { View, FlatList } from "react-native"
import { useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { CarsList, SpareParts, icons } from "@/constants"
import Card1 from "@/components/cards/Card1"
import BackArrowBtn from "@/components/BackArrowBtn"
import { LAYOUT } from "@/constants/units"
import SearchBarWithCategories from "@/components/SearchBarWithCategories"
import ProfileHeader from "@/components/ProfileHeader"
import { useRouter } from "expo-router"
import { routes } from "@/constants/routes"
import CartIconBtn from "@/components/CartIconBtn"

const categories = ["All", "Mercedes", "Porsche", "Hyundai", "BMW", "Toyota"]

const Shop = () => {
  const { SCROLL_PADDING_BOTTOM, CARD_GAP, CARD_PADDING, CONTAINER_PADDING } = LAYOUT;
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  // Combine cars and spare parts for shop display
  const allProducts = [...CarsList, ...SpareParts]

  const handleFilterPress = () => {
    // Handle filter functionality
    console.log("Filter pressed")
  }

  const renderProductCard = ({ item, index }: { item: any; index: number }) => (
    <View className="w-1/2 px-2 mb-4">
      <Card1
        Images={item.image}
        rating={item.rating}
        name={item.name}
        reviewCount={item.reviewCount}
        price={item.price}
        showLove={true}
        love={item.love}
        onPress={() => {
          router.push({
            pathname: routes.ProductDetail,
            params: { id: item.id },
          });
        }}
        onLovePress={() => {
          // Handle love press
          console.log("Love pressed:", item.name)
        }}
      />
    </View>
  )

  return (
    <SafeAreaView className="bg-white flex-1" edges={["top"]}>
      {/* Header */}
      <View className={`flex-row items-center justify-between ${CONTAINER_PADDING} py-4`}>
        <BackArrowBtn />
        <ProfileHeader title="Shop" />
        <CartIconBtn />
      </View>

      <SearchBarWithCategories
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        onFilterPress={handleFilterPress}
      />

      {/* Products Grid */}
      <FlatList
        data={allProducts}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id.toString()}
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
    </SafeAreaView>
  )
}

export default Shop

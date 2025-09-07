"use client"

import { View, FlatList, Text, ActivityIndicator, RefreshControl, ScrollView } from "react-native"
import { useState, useEffect, useMemo, useCallback } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import Card1 from "@/components/cards/Card1"
import BackArrowBtn from "@/components/BackArrowBtn"
import { LAYOUT } from "@/constants/units"
import SearchBarWithCategories from "@/components/SearchBarWithCategories"
import ProfileHeader from "@/components/ProfileHeader"
import { useRouter } from "expo-router"
import { routes } from "@/constants/routes"
import CartIconBtn from "@/components/CartIconBtn"
import { useProducts, useCategories, useProductSearch } from "@/hooks/useProducts"
import { getErrorMessage, getLoadingMessage } from "@/utils/errorMessages"
import usePullToRefresh from "@/hooks/usePullToRefresh"

const Shop = () => {
  const { SCROLL_PADDING_BOTTOM, CARD_GAP, CARD_PADDING, CONTAINER_PADDING } = LAYOUT;
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products and categories from API
  const { data: products, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts();
  const { data: categories, isLoading: categoriesLoading, refetch: refetchCategories } = useCategories();
  
  // Search functionality - only search when debounced query has content
  const shouldSearch = debouncedSearchQuery.trim().length > 0;
  const { 
    data: searchResults, 
    isLoading: searchLoading, 
    error: searchError, 
    refetch: refetchSearch 
  } = useProductSearch(
    debouncedSearchQuery, 
    selectedCategoryId,
    shouldSearch,
    minPrice,
    maxPrice
  );

  // Pull to refresh functionality
  const { refreshControl } = usePullToRefresh({
    onRefresh: async () => {
      const promises = [refetchProducts(), refetchCategories()];
      if (shouldSearch) {
        promises.push(refetchSearch());
      }
      await Promise.all(promises);
    }
  });

  // Prepare categories for the search bar (add "All" at the beginning)
  const categoryOptions = useMemo(() => {
    if (!categories) return [{ name: "All", id: null }];
    const options = [
      { name: "All", id: null },
      ...categories.map(cat => ({ name: cat.name, id: cat.id }))
    ];
    console.log('🏷️ Available categories:', options);
    return options;
  }, [categories]);

  // Determine which products to display
  const displayProducts = useMemo(() => {
    // If searching, use search results
    if (shouldSearch) {
      console.log('🔍 Search state:', {
        searchQuery: debouncedSearchQuery,
        selectedCategory,
        searchResults: searchResults?.length || 0,
        searchLoading,
        searchError: !!searchError
      });
      return searchResults || [];
    }
    
    // If not searching but category is selected, filter products by category
    if (selectedCategoryId && products) {
      const filtered = products.filter(product => 
        product.category?.id === selectedCategoryId
      );
      console.log(`🔍 Filtered by category ID "${selectedCategoryId}":`, filtered.length, 'products');
      return filtered;
    }
    
    // Default: show all products
    console.log('🛍️ Showing all products:', products?.length || 0);
    return products || [];
  }, [shouldSearch, searchResults, selectedCategory, products, debouncedSearchQuery, searchLoading, searchError]);


  const handleFilterPress = () => {
    // Handle filter functionality
    console.log("Filter pressed")
  }

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleCategoryChange = useCallback((categoryName: string) => {
    setSelectedCategory(categoryName);
    if (categoryName === "All") {
      setSelectedCategoryId(null);
    } else {
      const category = categories?.find(cat => cat.name === categoryName);
      setSelectedCategoryId(category?.id || null);
    }
  }, [categories]);

  const handlePriceChange = useCallback((field: 'min' | 'max', value: string) => {
    if (field === 'min') {
      setMinPrice(value);
    } else {
      setMaxPrice(value);
    }
  }, []);

  const renderProductCard = ({ item, index }: { item: any; index: number }) => (
    <View className="w-1/2 px-2 mb-4">
      <Card1
        Images={item.images?.[0]?.image || "sparePart"}
        rating={item.rating || 0}
        name={item.name}
        reviewCount={0} // API doesn't provide review count yet
        price={parseFloat(item.price)}
        showLove={true}
        love={false} // Default to false, can be enhanced later
        onPress={() => {
          router.push({
            pathname: routes.ProductDetail,
            params: { productId: item.id },
          });
        }}
        onLovePress={() => {
          // Handle love press
          console.log("Love pressed:", item.name)
        }}
      />
    </View>
  )

  // Loading state
  if (productsLoading || categoriesLoading || (shouldSearch && searchLoading)) {
    return (
      <SafeAreaView className="bg-white flex-1" edges={["top"]}>
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl {...refreshControl} />}
        >
          <View className={`flex-row items-center justify-between ${CONTAINER_PADDING} py-4`}>
            <BackArrowBtn />
            <ProfileHeader title="Shop" />
            <CartIconBtn />
          </View>
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#D30309" />
            <Text className="text-gray-600 mt-4">{getLoadingMessage('products')}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Error state (only show if there's an actual error, not empty results)
  if (productsError || (shouldSearch && searchError)) {
    return (
      <SafeAreaView className="bg-white flex-1" edges={["top"]}>
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl {...refreshControl} />}
        >
          <View className={`flex-row items-center justify-between ${CONTAINER_PADDING} py-4`}>
            <BackArrowBtn />
            <ProfileHeader title="Shop" />
            <CartIconBtn />
          </View>
          <View className="flex-1 items-center justify-center px-4 py-20">
            <Text className="text-red-600 text-center text-lg font-medium">
              {getErrorMessage(shouldSearch ? searchError : productsError, 'products')}
            </Text>
            <Text className="text-gray-500 text-center mt-2 text-sm">
              Pull down to refresh or try again
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-white flex-1" edges={["top"]}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl {...refreshControl} />}
      >
        {/* Header */}
        <View className={`flex-row items-center justify-between ${CONTAINER_PADDING} py-4`}>
          <BackArrowBtn />
          <ProfileHeader title="Shop" />
          <CartIconBtn />
        </View>

        <SearchBarWithCategories
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          selectedCategory={selectedCategory}
          setSelectedCategory={handleCategoryChange}
          categories={categoryOptions}
          onFilterPress={handleFilterPress}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={handlePriceChange}
        />

        {/* Products Grid */}
        {displayProducts.length > 0 ? (
          <FlatList
            data={displayProducts}
            renderItem={renderProductCard}
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
            scrollEnabled={false} // Disable FlatList scroll since parent ScrollView handles it
          />
        ) : (
          <View className="flex-1 items-center justify-center px-4 py-20">
            <Text className="text-gray-600 text-center text-lg">
              {shouldSearch 
                ? "No products found for your search" 
                : selectedCategory !== "All" 
                  ? "No products found in this category" 
                  : "No products available"}
            </Text>
            {shouldSearch && (
              <Text className="text-gray-500 text-center mt-2">
                Try different keywords or check spelling
              </Text>
            )}
            {!shouldSearch && selectedCategory !== "All" && (
              <Text className="text-gray-500 text-center mt-2">
                Try selecting a different category
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default Shop

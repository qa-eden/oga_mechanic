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
import { useProducts, useProductsInfinite, useCategories, useProductSearch } from "@/hooks/useProducts"
import { ProductListResponse } from "@/lib/api/products"
import { getErrorMessage, getLoadingMessage } from "@/utils/errorMessages"
import usePullToRefresh from "@/hooks/usePullToRefresh"

const Shop = () => {
  const { SCROLL_PADDING_BOTTOM, CARD_GAP, CARD_PADDING, CONTAINER_PADDING } = LAYOUT;
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [inputQuery, setInputQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(inputQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [inputQuery]);

  // Auto-trigger search when user finishes typing
  useEffect(() => {
    if (debouncedSearchQuery.trim().length > 0) {
      console.log('🔍 Auto-triggering search for:', debouncedSearchQuery);
      setSearchTriggered(true);
      setSearchCategoryId(selectedCategoryId);
      setSearchMinPrice(minPrice);
      setSearchMaxPrice(maxPrice);
    } else {
      setSearchTriggered(false);
    }
  }, [debouncedSearchQuery, selectedCategoryId, minPrice, maxPrice]);

  // Debug: Monitor when main API parameters change
  useEffect(() => {
    console.log('🔄 Main API parameters changed:', {
      selectedCategoryId,
      minPrice,
      maxPrice,
      timestamp: new Date().toISOString()
    });
  }, [selectedCategoryId, minPrice, maxPrice]);

  // Manual filtering - only trigger when Apply button is clicked
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [appliedCategoryId, setAppliedCategoryId] = useState<number | null>(null);
  const [appliedMinPrice, setAppliedMinPrice] = useState("");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState("");

  // Fetch products and categories from API with pagination
  // Main products API only triggers when filters are applied
  const { 
    data: productsData, 
    isLoading: productsLoading, 
    error: productsError, 
    refetch: refetchProducts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useProductsInfinite(
    appliedCategoryId,
    appliedMinPrice,
    appliedMaxPrice,
    20, // limit per page - show 20 products initially
    true // Always load products initially
  );
  const { data: categories, isLoading: categoriesLoading, refetch: refetchCategories } = useCategories();
  
  // Search functionality - only search when manually triggered
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategoryId, setSearchCategoryId] = useState<number | null>(null);
  const [searchMinPrice, setSearchMinPrice] = useState("");
  const [searchMaxPrice, setSearchMaxPrice] = useState("");
  
  const { 
    data: searchResults, 
    isLoading: searchLoading, 
    error: searchError, 
    refetch: refetchSearch 
  } = useProductSearch(
    searchQuery, 
    searchCategoryId,
    searchTriggered, // Only search when manually triggered
    searchMinPrice,
    searchMaxPrice
  );

  // Pull to refresh functionality
  const { refreshControl } = usePullToRefresh({
    onRefresh: async () => {
      const promises = [refetchProducts(), refetchCategories()];
      if (searchTriggered) {
        promises.push(refetchSearch() as Promise<any>);
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

  // Flatten paginated products data
  const products = useMemo(() => {
    if (!productsData?.pages) return [];
    return productsData.pages.flatMap(page => page.data.results);
  }, [productsData]);

  // Determine which products to display
  const displayProducts = useMemo(() => {
    // If search was triggered, use search results
    if (searchTriggered) {
      console.log('🔍 Search state:', {
        searchQuery,
        searchCategoryId,
        searchMinPrice,
        searchMaxPrice,
        searchResults: (searchResults as ProductListResponse[])?.length || 0,
        searchLoading,
        searchError: !!searchError
      });
      return (searchResults as ProductListResponse[]) || [];
    }
    
    // If filters were applied, show products from main API
    if (filtersApplied) {
      console.log('🛍️ Showing products from main API with applied filters:', {
        categoryId: appliedCategoryId,
        minPrice: appliedMinPrice,
        maxPrice: appliedMaxPrice,
        productCount: products?.length || 0
      });
      return products || [];
    }
    
    // Default: show all products (no filters applied)
    console.log('🛍️ Showing all products (no filters applied)');
    return products || [];
  }, [searchTriggered, searchResults, products, searchQuery, searchCategoryId, searchMinPrice, searchMaxPrice, searchLoading, searchError, filtersApplied, appliedCategoryId, appliedMinPrice, appliedMaxPrice]);


  const handleFilterPress = () => {
    // Handle filter functionality
    console.log("Filter pressed")
  }

  const handleApplySearch = (categoryId?: number | null) => {
    // Use provided categoryId or current selectedCategoryId
    const targetCategoryId = categoryId !== undefined ? categoryId : selectedCategoryId;
    
    // Apply filters to main API
    setAppliedCategoryId(targetCategoryId);
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
    setFiltersApplied(true);
    
    // Also trigger search if there's a query
    if (debouncedSearchQuery.trim()) {
      setSearchQuery(debouncedSearchQuery);
      setSearchCategoryId(targetCategoryId);
      setSearchMinPrice(minPrice);
      setSearchMaxPrice(maxPrice);
      setSearchTriggered(true);
    } else {
      setSearchTriggered(false);
    }
    
    console.log('🔍 Applying filters and search:', {
      query: debouncedSearchQuery,
      categoryId: targetCategoryId,
      minPrice,
      maxPrice,
      filtersApplied: true,
      searchTriggered: debouncedSearchQuery.trim().length > 0
    });
  }

  const handleResetSearch = () => {
    // Reset everything and show all products
    setSearchTriggered(false);
    setFiltersApplied(false);
    setSearchQuery("");
    setSearchCategoryId(null);
    setSearchMinPrice("");
    setSearchMaxPrice("");
    setAppliedCategoryId(null);
    setAppliedMinPrice("");
    setAppliedMaxPrice("");
    setInputQuery("");
    setDebouncedSearchQuery("");
    setSelectedCategory("All");
    setSelectedCategoryId(null);
    setMinPrice("");
    setMaxPrice("");
    console.log('🔄 Everything reset - showing all products');
  }

  const handleSearchChange = useCallback((text: string) => {
    setInputQuery(text);
    setSearchQuery(text); // Update search query for search functionality
  }, []);

  const handleCategoryChange = useCallback((categoryName: string, categoryId?: number | null) => {
    setSelectedCategory(categoryName);
    if (categoryName === "All") {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(categoryId || null);
    }
  }, []);

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
  if (productsLoading || categoriesLoading) {
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
  if (productsError || (searchTriggered && searchError)) {
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
              {getErrorMessage(searchTriggered ? searchError : productsError, 'products')}
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
      <View className="flex-1">
      {/* Header */}
      <View className={`flex-row items-center justify-between ${CONTAINER_PADDING} py-4`}>
        <BackArrowBtn />
        <ProfileHeader title="Shop" />
        <CartIconBtn />
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
          isSearching={searchLoading}
      />

      {/* Products Grid */}
        {(displayProducts as ProductListResponse[]).length > 0 ? (
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
            refreshControl={<RefreshControl {...refreshControl} />}
            onEndReached={() => {
              // Only load more if not searching and there are more pages
              if (!searchTriggered && hasNextPage && !isFetchingNextPage) {
                console.log('📄 Loading next 20 products...');
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.1}
            ListFooterComponent={() => {
              if (isFetchingNextPage) {
                return (
                  <View className="py-4 items-center">
                    <Text className="text-gray-500">Loading 20 more products...</Text>
                  </View>
                );
              }
              
              // Show "Load more data" button when there are no more pages
              if (!searchTriggered && !hasNextPage && products.length > 0) {
                return (
                  <View className="py-4 items-center">
                    <Text className="text-gray-500 text-center">
                      No more products to load
                    </Text>
                    <Text className="text-gray-400 text-sm mt-1">
                      You've reached the end of the list
                    </Text>
                  </View>
                );
              }
              
              return null;
            }}
          />
        ) : (
          <View className="flex-1 items-center justify-center px-4 py-20">
            <Text className="text-gray-600 text-center text-lg">
              {searchTriggered 
                ? (searchQuery.trim() 
                    ? "No products found for your search" 
                    : "No products found with these filters")
                : filtersApplied
                  ? "No products found with applied filters"
                  : "No products available"}
            </Text>
            {searchTriggered && searchQuery.trim() && (
              <Text className="text-gray-500 text-center mt-2">
                Try different keywords or check spelling
              </Text>
            )}
            {searchTriggered && !searchQuery.trim() && (
              <Text className="text-gray-500 text-center mt-2">
                Try adjusting your price range or other filters
              </Text>
            )}
            {!searchTriggered && filtersApplied && (
              <Text className="text-gray-500 text-center mt-2">
                Try adjusting your category or price filters
              </Text>
            )}
            {!searchTriggered && !filtersApplied && (
              <Text className="text-gray-500 text-center mt-2">
                No products are currently available
              </Text>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

export default Shop

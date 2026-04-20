"use client"

import { View, FlatList, Text, RefreshControl, ScrollView, TouchableOpacity } from "react-native"
import { useState, useEffect, useMemo, useCallback } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import Card1 from "@/components/cards/Card1"
import { LAYOUT } from "@/constants/units"
import SearchBarWithCategories from "@/components/SearchBarWithCategories"
import { useRouter, useLocalSearchParams } from "expo-router"
import { routes } from "@/constants/routes"
import CartIconBtn from "@/components/CartIconBtn"
import SpecialistIconBtn from "@/components/SpecialistIconBtn"
import { useProductsInfinite, useCategories, useProductSearch } from "@/hooks/useProducts"
import { ProductListResponse, ProductListAPIResponse } from "@/lib/api/products"
import { getErrorMessage } from "@/utils/errorMessages"
import usePullToRefresh from "@/hooks/usePullToRefresh"
import { useCart } from "@/contexts/CartContext"
import LoadingSpinner from "@/components/LoadingSpinner"
import { ShoppingBagIcon, XMarkIcon } from "react-native-heroicons/outline"
import { StatusBar } from "expo-status-bar"
import Animated, { FadeInDown } from "react-native-reanimated"
import AnimatedPageContainer from "@/components/AnimatedPageContainer"
import { useUserOrders } from "@/hooks/useOrders"
import { ClipboardDocumentListIcon, ChevronRightIcon } from "react-native-heroicons/outline"

const Shop = () => {
  const { SCROLL_PADDING_BOTTOM } = LAYOUT;
  const router = useRouter();
  const { addToCart, removeFromCart } = useCart();
  const params = useLocalSearchParams<{ category?: string; categoryId?: string }>();

  const [selectedCategory, setSelectedCategory] = useState(params.category || "All")
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    params.categoryId ? parseInt(params.categoryId) : null
  )
  const [inputQuery, setInputQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  // Manual filtering - only trigger when Apply button is clicked
  // Initialize from params if they exist (for navigation from home page)
  const [filtersApplied, setFiltersApplied] = useState(!!(params.categoryId && params.category));
  const [appliedCategoryId, setAppliedCategoryId] = useState<number | null>(
    params.categoryId ? parseInt(params.categoryId) : null
  );
  const [appliedMinPrice, setAppliedMinPrice] = useState("");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState("");

  // Apply category filter from URL params on mount or when params change
  useEffect(() => {
    if (params.categoryId && params.category) {
      const categoryId = parseInt(params.categoryId);

      // Update both selected and applied states
      setSelectedCategory(params.category);
      setSelectedCategoryId(categoryId);
      setAppliedCategoryId(categoryId);
      setFiltersApplied(true);
    } else if (!params.categoryId && !params.category) {
      // If params are cleared, reset filters
      setFiltersApplied(false);
      setAppliedCategoryId(null);
    }
  }, [params.categoryId, params.category]);

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
      setSearchTriggered(true);
      setSearchCategoryId(selectedCategoryId);
      setSearchMinPrice(minPrice);
      setSearchMaxPrice(maxPrice);
    } else {
      setSearchTriggered(false);
    }
  }, [debouncedSearchQuery, selectedCategoryId, minPrice, maxPrice]);

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

  // Fetch all orders for the banner
  const { data: ordersData, refetch: refetchOrders } = useUserOrders();
  const activeOrdersCount = useMemo(() => {
    if (!Array.isArray(ordersData?.data)) return 0;
    // Count orders that are not 'delivered' or 'cancelled'
    return ordersData.data.filter(order => 
      !['delivered', 'cancelled', 'completed'].includes(order.status?.toLowerCase())
    ).length;
  }, [ordersData]);

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
      const promises = [refetchProducts(), refetchCategories(), refetchOrders()];
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
    return options;
  }, [categories]);

  // Sync category name from categories list when categories are loaded
  useEffect(() => {
    if (categories && params.categoryId && selectedCategoryId) {
      // Find the category in the categories list by ID
      const matchedCategory = categories.find(cat => cat.id === selectedCategoryId);
      if (matchedCategory && matchedCategory.name !== selectedCategory) {
        // Update the selected category name to match the one from the API
        setSelectedCategory(matchedCategory.name);
      }
    }
  }, [categories, params.categoryId, selectedCategoryId, selectedCategory]);

  // Flatten paginated products data
  const products = useMemo(() => {
    if (!productsData?.pages) return [];
    // Each page is a ProductListAPIResponse with structure: { data: { results: [...] } }
    return productsData.pages.flatMap((page: ProductListAPIResponse) => page.data.results);
  }, [productsData]);

  // Determine which products to display
  const displayProducts = useMemo(() => {
    // If search was triggered, use search results
    if (searchTriggered) {

      return (searchResults as ProductListResponse[]) || [];
    }

    // If filters were applied, show products from main API
    if (filtersApplied) {
      return products || [];
    }

    // Default: show all products (no filters applied)
    return products || [];
  }, [searchTriggered, searchResults, products, searchQuery, searchCategoryId, searchMinPrice, searchMaxPrice, searchLoading, searchError, filtersApplied, appliedCategoryId, appliedMinPrice, appliedMaxPrice]);


  const handleFilterPress = () => {
    // Handle filter functionality
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
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(400).springify()}
      style={{ width: (LAYOUT.SCREEN_WIDTH - 24 - 12) / 2 }}
    >
      <Card1
        Images={item.images?.[0]?.image}
        rating={item.rating || 0}
        name={item.name}
        reviewCount={0}
        price={parseFloat(item.price)}
        isFavorite={item.is_in_favorite_list}
        isInCart={item.is_in_cart}
        productId={item.id}
        showLove={true}
        love={false}
        onPress={() => {
          router.push({
            pathname: routes.ProductDetail,
            params: { productId: item.id },
          });
        }}
        onAddToCart={() => addToCart({
            id: item.id,
            name: item.name,
            price: parseFloat(item.price),
            stock: item.stock || 10,
            image: item.images?.[0]?.image,
        })}
        onRemoveFromCart={() => removeFromCart(item.id)}
      />
    </Animated.View>
  )

  // Check if this is the initial load (no cached data yet)
  const isInitialLoad = (productsLoading && !productsData) || (categoriesLoading && !categories);

  // Loading state - only show full screen loader on initial load (no cached data)
  if (isInitialLoad) {
    return (
      <LoadingSpinner
        message="Loading Products..."
        subMessage="Please wait while we fetch available products"
        size="medium"
      />
    );
  }

  // Error state (only show if there's an actual error, not empty results)
  if (productsError || (searchTriggered && searchError)) {
    return (
      <SafeAreaView className="bg-gray-50 flex-1" edges={["top"]}>
        <StatusBar style="dark" />
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl {...refreshControl} />}
        >
          {/* Header */}
          <View className="bg-white px-5 pt-4 pb-3 border-b border-gray-100">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <ShoppingBagIcon size={28} color="#D30309" />
                <Text className="text-2xl font-NunitoExtraBold text-gray-900">Shop</Text>
              </View>
              <View className="flex-row items-center gap-3">
                <SpecialistIconBtn />
                <CartIconBtn />
              </View>
            </View>
          </View>
          <View className="flex-1 items-center justify-center px-4 py-20">
            <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-4">
              <XMarkIcon size={32} color="#EF4444" />
            </View>
            <Text className="text-red-600 text-center text-lg font-NunitoBold">
              {getErrorMessage(searchTriggered ? searchError : productsError, 'products')}
            </Text>
            <Text className="text-gray-500 text-center mt-2 text-sm font-NunitoMedium">
              Pull down to refresh or try again
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-gray-50 flex-1" edges={["top"]}>
      <StatusBar style="dark" />
      <View className="flex-1">
        {/* Header */}
        <View className="px-3 pt-2 ">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <Text className="text-3xl font-NunitoExtraBold text-gray-900">Shop</Text>
            </View>
            <View className="flex-row items-center gap-3">
              {filtersApplied && (
                <TouchableOpacity
                  onPress={handleResetSearch}
                  className="bg-red-50 px-3 py-1.5 rounded-full flex-row items-center gap-1"
                >
                  <XMarkIcon size={14} color="#DC2626" />
                  <Text className="text-red-600 text-xs font-NunitoBold">Clear Filters</Text>
                </TouchableOpacity>
              )}
                <SpecialistIconBtn />
                <CartIconBtn />
            </View>
          </View>

          {/* Results Info */}
          <View className="flex-row items-center justify-between">
            {selectedCategory !== "All" && (
              <View className="bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                <Text className="text-primary-600 text-xs font-NunitoBold">{selectedCategory}</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Your Orders Card */}
        <Animated.View 
          entering={FadeInDown.delay(100).duration(500)}
          className="px-3 mb-4"
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push(routes.myOrders as any)}
            className="rounded-2xl flex-row items-center justify-between p-2 border border-gray-200"
          >
            <View className="flex-row items-center gap-2">
              <View className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-100">
                <ClipboardDocumentListIcon size={20} color="#111827" />
              </View>
              <Text className="text-md font-NunitoBold text-gray-900">Your orders</Text>
            </View>
            
            <View className="flex-row items-center gap-2">
              {activeOrdersCount > 0 && (
                <View className="bg-orange-500 px-2.5 py-1 rounded-full">
                   <Text className="text-white text-[10px] font-NunitoExtraBold uppercase mr-0.5 tracking-wider">
                    {activeOrdersCount}
                  </Text>
                </View>
              )}
              <ChevronRightIcon size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </Animated.View>

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
        <AnimatedPageContainer animationType="fadeInDown" duration={500} style={{ flex: 1 }}>
          {(displayProducts as ProductListResponse[]).length > 0 ? (
            <FlatList
              data={displayProducts}
              renderItem={renderProductCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 12, // Reduced padding (px-3)
                paddingTop: 8,
                paddingBottom: SCROLL_PADDING_BOTTOM,
                gap: 12, // Reduced vertical gap
              }}
              columnWrapperStyle={{
                gap: 12, // Consistent horizontal gap
              }}
              initialNumToRender={8}
              maxToRenderPerBatch={8}
              windowSize={7}
              removeClippedSubviews={true}
              refreshControl={<RefreshControl {...refreshControl} />}
              onEndReached={() => {
                // Only load more if not searching and there are more pages
                if (!searchTriggered && hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}
              onEndReachedThreshold={0.1}
              ListFooterComponent={() => {
                if (isFetchingNextPage) {
                  return (
                    <Animated.View entering={FadeInDown.duration(300)} className="py-6 items-center">
                      <View className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                        <Text className="text-gray-500 text-sm font-NunitoMedium">Loading more...</Text>
                      </View>
                    </Animated.View>
                  );
                }

                // Show end of list message
                if (!searchTriggered && !hasNextPage && products.length > 0) {
                  return (
                    <View className="py-8 items-center">
                      <View className="w-12 h-1 bg-gray-200 rounded-full mb-3" />
                      <Text className="text-gray-400 text-sm font-NunitoMedium">End of results</Text>
                    </View>
                  );
                }

                return null;
              }}
            />
          ) : (
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ flexGrow: 1 }}
              refreshControl={<RefreshControl {...refreshControl} />}
            >
              <View className="flex-1 items-center justify-center px-6 py-20 opacity-80">
                <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
                  <ShoppingBagIcon size={48} color="#9CA3AF" />
                </View>
                <Text className="text-gray-900 text-center text-xl font-NunitoBold mb-2">
                  {searchTriggered ? "No Results Found" : filtersApplied ? "No Matching Products" : "Store Empty"}
                </Text>
                <Text className="text-gray-500 text-center font-NunitoMedium mb-8 leading-6 max-w-[250px]">
                  {searchTriggered && searchQuery.trim()
                    ? `We couldn't find anything matching "${searchQuery}"`
                    : "We couldn't find any products matching your current filters."}
                </Text>
                {(searchTriggered || filtersApplied) && (
                  <TouchableOpacity
                    onPress={handleResetSearch}
                    className="bg-primary-500 px-8 py-3.5 rounded-2xl shadow-sm shadow-primary-200"
                  >
                    <Text className="text-white font-NunitoBold text-base">Clear Filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          )}
        </AnimatedPageContainer>
      </View>
    </SafeAreaView>
  )
}

export default Shop

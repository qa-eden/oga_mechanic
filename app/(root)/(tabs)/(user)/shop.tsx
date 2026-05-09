"use client"

import { View, FlatList, Text, RefreshControl, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { useState, useEffect, useMemo, useCallback } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import Card1 from "@/components/cards/Card1"
import { LAYOUT } from "@/constants/units"
import SearchBarWithCategories from "@/components/SearchBarWithCategories"
import { useRouter, useLocalSearchParams, useGlobalSearchParams } from "expo-router"
import { routes } from "@/constants/routes"
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
import { usePrimaryUserProfile, useUserCars } from "@/hooks/useUserProfile"

const Shop = () => {
  const { SCROLL_PADDING_BOTTOM } = LAYOUT;
  const router = useRouter();
  const params = useGlobalSearchParams<{ category?: string; categoryId?: string; q?: string }>();

  const [selectedCategory, setSelectedCategory] = useState(params.category || "All")
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    params.categoryId ? parseInt(params.categoryId) : null
  )
  const { data: profileResponse } = usePrimaryUserProfile();
  const { data: vehicles } = useUserCars();
  
  const userCarMakes = useMemo(() => {
    const makes = [];
    // From primary profile - normalized for PrimaryUserProfileResponse structure
    const user = (profileResponse as any)?.data || (profileResponse as any)?.user;
    const primaryMake = user?.car_make;
    if (primaryMake) makes.push(primaryMake.toLowerCase());
    
    // From vehicle list
    vehicles?.forEach(v => {
      if (v.make) makes.push(v.make.toLowerCase());
    });
    
    return [...new Set(makes)]; // Unique makes
  }, [profileResponse, vehicles]);

  const [inputQuery, setInputQuery] = useState(params.q || "")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  // User-driven overrides are stored in these states and take precedence after first interaction
  const [manualCategoryId, setManualCategoryId] = useState<number | null | undefined>(undefined);
  const [appliedMinPrice, setAppliedMinPrice] = useState("");
  const [appliedMaxPrice, setAppliedMaxPrice] = useState("");

  // appliedCategoryId: prefer user-driven selection (manualCategoryId), else fall back to URL params
  const appliedCategoryId = useMemo(() => {
    if (manualCategoryId !== undefined && manualCategoryId !== null) {
      return manualCategoryId;
    }
    
    // If manualCategoryId is null, it means user clicked "All" or "Clear"
    if (manualCategoryId === null) return null;

    // Fall back to params
    const cid = Array.isArray(params.categoryId) ? params.categoryId[0] : params.categoryId;
    if (cid) {
      const parsed = parseInt(cid, 10);
      return isNaN(parsed) ? null : parsed;
    }
    
    return null;
  }, [manualCategoryId, params.categoryId]);

  useEffect(() => {
    const cid = Array.isArray(params.categoryId) ? params.categoryId[0] : params.categoryId;
    const cat = Array.isArray(params.category) ? params.category[0] : params.category;
    
    console.log("Shop Params Changed:", { cid, cat });
    
    if (cid && cat) {
      setSelectedCategory(cat);
      setSelectedCategoryId(parseInt(cid, 10));
      // Reset manual override so params take effect on navigation
      setManualCategoryId(undefined);
    }
  }, [params.categoryId, params.category]);

  const filtersApplied = appliedCategoryId !== null || !!appliedMinPrice || !!appliedMaxPrice;

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
    isFetching: productsFetching,
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


  // Build hierarchical category options:
  // 1. Find all IDs that appear as sub-categories (to exclude them from top-level)
  // 2. Top-level = categories not in any parent's sub_categories list
  // 3. Each top-level entry carries its own sub_categories array
  const categoryOptions = useMemo(() => {
    if (!categories) return [{ name: "All", id: null as number | null, sub_categories: [] as Array<{ name: string; id: number }> }];

    // Collect all sub-category IDs
    const subCategoryIds = new Set<number>();
    categories.forEach(cat => {
      cat.sub_categories?.forEach(sub => subCategoryIds.add(sub.id));
    });

    // Top-level = not a sub-category of someone else
    const topLevel = categories.filter(cat => !subCategoryIds.has(cat.id));

    return [
      { name: "All", id: null as number | null, sub_categories: [] as Array<{ name: string; id: number }> },
      ...topLevel.map(cat => ({
        name: cat.name,
        id: cat.id as number | null,
        sub_categories: (cat.sub_categories ?? []).map(sub => ({ name: sub.name, id: sub.id })),
      })),
    ];
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
    return productsData.pages.flatMap((page: ProductListAPIResponse) => {
      const data = page.data;
      return Array.isArray(data) ? data : (data?.results || []);
    });
  }, [productsData]);

  // Determine which products to display
  const displayProducts = useMemo(() => {
    let baseList = [];
    // If search was triggered, use search results
    if (searchTriggered) {
      baseList = (searchResults as any[]) || [];
    } else {
      // If filters were applied or default: show products from main API
      baseList = products || [];
    }

    // Sort to bring "Verified Sellers" (rating > 4.5) to the top
    // This happens entirely on the client (phone) and is super fast for this list size
    return [...baseList].sort((a, b) => {
      const aRating = parseFloat(a.merchant_rating || a.rating || 0);
      const bRating = parseFloat(b.merchant_rating || b.rating || 0);
      
      const aIsVerified = aRating > 4.5;
      const bIsVerified = bRating > 4.5;

      if (aIsVerified && !bIsVerified) return -1; // a comes first
      if (!aIsVerified && bIsVerified) return 1;  // b comes first
      return 0; // maintain original order otherwise
    });
  }, [searchTriggered, searchResults, products, filtersApplied]);


  const handleApplySearch = (categoryId?: number | null) => {
    const targetCategoryId = categoryId !== undefined ? categoryId : selectedCategoryId;

    // Store as manual override so params don't overwrite it
    setManualCategoryId(targetCategoryId);
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);

    // Also trigger search if there's a text query
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
    setSearchTriggered(false);
    setSearchQuery("");
    setSearchCategoryId(null);
    setSearchMinPrice("");
    setSearchMaxPrice("");
    // Clear manual override — URL params will take over again (or null if none)
    setManualCategoryId(null);
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
        productId={item.id}
        showLove={true}
        love={false}
        userCarMakes={userCarMakes}
        onPress={() => {
          router.push({
            pathname: routes.ProductDetail,
            params: { productId: item.id },
          });
        }}
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
        <View className="px-3 pt-3 pb-1">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-3xl font-NunitoExtraBold text-gray-900">Shop</Text>
            <View className="flex-row items-center gap-2">
              {filtersApplied && (
                <TouchableOpacity
                  onPress={handleResetSearch}
                  className="bg-red-50 px-3 py-1.5 rounded-full flex-row items-center gap-1"
                >
                  <XMarkIcon size={13} color="#DC2626" />
                  <Text className="text-red-600 text-xs font-NunitoBold">Clear all</Text>
                </TouchableOpacity>
              )}
              <SpecialistIconBtn />
            </View>
          </View>
        </View>

        <SearchBarWithCategories
          searchQuery={inputQuery}
          setSearchQuery={handleSearchChange}
          selectedCategory={selectedCategory}
          setSelectedCategory={handleCategoryChange}
          categories={categoryOptions}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={handlePriceChange}
          onApplySearch={handleApplySearch}
          onResetSearch={handleResetSearch}
          isSearching={searchLoading}
        />

        {/* Background loading indicator */}
        {productsFetching && !isInitialLoad && (
          <View className="absolute top-36 right-5 z-10 bg-white/80 rounded-full p-2 shadow-sm border border-gray-100">
            <ActivityIndicator size="small" color="#D30309" />
          </View>
        )}

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
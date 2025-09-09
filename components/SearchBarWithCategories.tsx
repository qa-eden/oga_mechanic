"use client";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  Modal,
  Animated,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LAYOUT } from "@/constants/units";
import { useRef, useEffect, useState, useCallback } from "react";
import CategoryTab from "@/components/cards/CategoryTab";
import SearchSuggestion from "@/components/cards/SearchSuggestion";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";

interface SearchBarWithCategoriesProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: Array<{ name: string; id: number | null }>;
  onFilterPress?: () => void;
  minPrice?: string;
  maxPrice?: string;
  onPriceChange?: (field: 'min' | 'max', value: string) => void;
  onApplySearch?: (categoryId?: number | null) => void;
  onResetSearch?: () => void;
  isSearching?: boolean;
}

// No dummy data - use real search functionality

const SearchBarWithCategories = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  onFilterPress,
  minPrice = "",
  maxPrice = "",
  onPriceChange,
  onApplySearch,
  onResetSearch,
  isSearching = false,
}: SearchBarWithCategoriesProps) => {
  const flatListRef = useRef<FlatList>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentScrollX, setCurrentScrollX] = useState(0);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterButtonLayout, setFilterButtonLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isSelectingSuggestion, setIsSelectingSuggestion] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentAutoSuggestionIndex, setCurrentAutoSuggestionIndex] =
    useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Animation values for dropdown
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Animation values for search suggestions
  const searchSlideAnim = useRef(new Animated.Value(-200)).current;
  const searchFadeAnim = useRef(new Animated.Value(0)).current;

  // Animation values for auto-suggestions
  const placeholderFadeAnim = useRef(new Animated.Value(1)).current;
  const placeholderSlideAnim = useRef(new Animated.Value(0)).current;
  const [isAutoSuggestionReady, setIsAutoSuggestionReady] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    brand: "",
    condition: "",
  });
  
  // Enhanced search features
  const [popularSearches] = useState([
    "Engine Oil", "Brake Pads", "Air Filter", "Spark Plugs", "Battery",
    "Tires", "Headlights", "Windshield Wipers", "Oil Filter", "Transmission Fluid"
  ]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showPopularSearches, setShowPopularSearches] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  // Track if value was set by auto-suggestion
  const [isAutoSuggestionSelected, setIsAutoSuggestionSelected] = useState(false);

  // Debounce search query
  useEffect(() => {
    if (isSelectingSuggestion) {
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery, isSelectingSuggestion]);

  // Generate intelligent search suggestions
  useEffect(() => {
    if (debouncedSearchQuery.trim().length > 0 && !isAutoSuggestionSelected) {
      setShowSearchSuggestions(true);
      
      // Generate smart suggestions based on query
      const query = debouncedSearchQuery.toLowerCase();
      const suggestions = popularSearches
        .filter(item => item.toLowerCase().includes(query))
        .slice(0, 5);
      
      // Add recent searches that match
      const recentMatches = recentSearches
        .filter(item => item.toLowerCase().includes(query))
        .slice(0, 3);
      
      setSearchSuggestions([...recentMatches, ...suggestions]);
    } else {
      setShowSearchSuggestions(false);
      setSearchSuggestions([]);
    }
  }, [debouncedSearchQuery, isAutoSuggestionSelected, popularSearches, recentSearches]);

  // Animate search suggestions
  useEffect(() => {
    if (showSearchSuggestions) {
      Animated.parallel([
        Animated.timing(searchSlideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(searchFadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(searchSlideAnim, {
          toValue: -200,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(searchFadeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showSearchSuggestions]);

  // Debug: Monitor searchQuery changes
  useEffect(() => {
    console.log("SearchQuery changed to:", searchQuery);
  }, [searchQuery]);

  // No auto-rotating suggestions - use real search

  useEffect(() => {
    if (!isUserScrolling && containerWidth && selectedCategory) {
      const selectedIndex = categories.findIndex(cat => cat.name === selectedCategory);
      if (selectedIndex !== -1) {
        const itemWidth = 100;
        const gap = 0;
        const totalItemWidth = itemWidth + gap;
        const itemStartX = selectedIndex * totalItemWidth;

        // Calculate the target scroll position to center the item
        const targetScrollX = Math.max(
          0,
          itemStartX - (containerWidth - itemWidth) / 2
        );

        // Only scroll if the item is not properly centered and we're not currently scrolling
        const tolerance = 10; // 10px tolerance
        if (Math.abs(currentScrollX - targetScrollX) > tolerance) {
          // Add a small delay to prevent interference with manual scrolling
          setTimeout(() => {
            if (!isUserScrolling) {
              flatListRef.current?.scrollToOffset({
                offset: targetScrollX,
                animated: false,
              });
            }
          }, 100);
        }
      }
    }
  }, [selectedCategory, containerWidth, categories, isUserScrolling]);

  // Animate dropdown
  useEffect(() => {
    if (showFilterDropdown) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showFilterDropdown]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setCurrentScrollX(event.nativeEvent.contentOffset.x);
  };

  const handleScrollBeginDrag = () => setIsUserScrolling(true);
  const handleScrollEnd = () => {
    setTimeout(() => {
      setIsUserScrolling(false);
    }, 200); // Increased delay to prevent auto-scroll interference
  };

  const brandOptions = ["Toyota", "Honda", "BMW", "Mercedes", "Ford"];
  const conditionOptions = ["New", "Used", "Certified"];

  const handleFilterPress = () => {
    setShowFilterDropdown(true);
  };

  const applyAdvancedFilters = () => {
    console.log("Applying advanced filters:", advancedFilters);
    setShowFilterDropdown(false);
    // Call the main Apply function from parent
    onApplySearch?.();
  };

  const resetFilters = () => {
    setAdvancedFilters({
      brand: "",
      condition: "",
    });
    onPriceChange?.('min', '');
    onPriceChange?.('max', '');
    // Call the main Reset function from parent
    onResetSearch?.();
  };

  const handleSuggestionSelect = (suggestion: string) => {
    console.log("Selecting suggestion:", suggestion);

    // Set flag to prevent filtering interference
    setIsSelectingSuggestion(true);

    // Update search query with the selected suggestion
    setSearchQuery(suggestion);

    // Also update debounced query immediately
    setDebouncedSearchQuery(suggestion);

    // Add to recent searches
    addToRecentSearches(suggestion);

    // Hide suggestions immediately
    setShowSearchSuggestions(false);
    setShowSearchHistory(false);
    setShowPopularSearches(false);

    // Reset the flag after a short delay
    setTimeout(() => {
      setIsSelectingSuggestion(false);
    }, 200);
  };

  const addToSearchHistory = (query: string) => {
    if (query.trim().length > 0) {
      setSearchHistory((prev) => {
        const filtered = prev.filter((item) => item !== query);
        return [query, ...filtered].slice(0, 10); // Keep only last 10 searches
      });
    }
  };

  const addToRecentSearches = (query: string) => {
    if (query.trim().length > 0) {
      setRecentSearches((prev) => {
        const filtered = prev.filter((item) => item !== query);
        return [query, ...filtered].slice(0, 5); // Keep only last 5 recent searches
      });
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    setShowSearchHistory(false);
  };

  const handleHistorySelect = (historyItem: string) => {
    setSearchQuery(historyItem);
    setDebouncedSearchQuery(historyItem);
    addToSearchHistory(historyItem);
    setShowSearchHistory(false);
    // Prevent suggestions from showing after selecting history
    setShowSearchSuggestions(false);
  };

  const requestMicrophonePermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Microphone Permission",
            message:
              "This app needs access to your microphone for voice search.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles permissions differently
  };

  const handleSearchFocus = () => {
    setIsInputFocused(true);

    // If input is empty, show popular searches or search history
    if (searchQuery.trim().length === 0) {
      if (recentSearches.length > 0) {
        setShowSearchHistory(true);
      } else {
        setShowPopularSearches(true);
      }
    } else {
      // Show suggestions if user is typing
      if (searchQuery.trim().length > 0 && !isAutoSuggestionSelected) {
        setShowSearchSuggestions(true);
      }
    }
  };

  const handleSearchBlur = () => {
    setIsInputFocused(false);
    // Delay hiding to allow for suggestion selection
    setTimeout(() => {
      setShowSearchSuggestions(false);
      setShowSearchHistory(false);
      setShowPopularSearches(false);
    }, 200);
  };

  // When user types, reset auto-suggestion flag
  const handleInputChange = (text: string) => {
    setIsAutoSuggestionSelected(false);
    setSearchQuery(text);
  };

  const renderCategoryTab = useCallback(
    ({ item }: { item: { name: string; id: number | null } }) => (
      <CategoryTab 
        item={item} 
        selectedCategory={selectedCategory} 
        onSelect={(categoryName, categoryId) => {
          console.log('🏷️ Category clicked:', { categoryName, categoryId });
          setSelectedCategory(categoryName);
          // Call a special handler that applies the category filter immediately
          onApplySearch?.(categoryId);
        }} 
      />
    ),
    [selectedCategory, onApplySearch]
  );

  const renderSearchSuggestion = useCallback(
    ({ item }: { item: any }) => (
      <SearchSuggestion item={item} onSelect={handleSuggestionSelect} />
    ),
    [handleSuggestionSelect]
  );

  const renderSearchHistory = useCallback(() => (
    <View className="bg-white rounded-xl mt-2 shadow-2xl p-4">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="font-NunitoBold text-lg text-gray-900">
          Recent Searches
        </Text>
        <TouchableOpacity onPress={clearSearchHistory} className="p-2">
          <Text className="text-primary-500 font-NunitoMedium">Clear All</Text>
        </TouchableOpacity>
      </View>
      {searchHistory.length > 0 ? (
        searchHistory.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleHistorySelect(item)}
            className="flex-row items-center py-3 border-b border-gray-100"
            activeOpacity={0.7}
          >
            <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center mr-3">
              <Text className="text-gray-600">🕒</Text>
            </View>
            <Text className="font-NunitoMedium text-gray-900 flex-1">
              {item}
            </Text>
            <Text className="text-gray-400">→</Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text className="text-gray-500 text-center py-4">
          No recent searches
        </Text>
      )}
    </View>
  ), [searchHistory, clearSearchHistory, handleHistorySelect]);

  const { CONTAINER_PADDING } = LAYOUT;

  return (
    <View>
      <View className={`${CONTAINER_PADDING} mb-6`}>
        <View
          className="flex-row items-center bg-white rounded-2xl px-3 py-2 border border-primary-200"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View className="mr-4">
            {isSearching ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <MagnifyingGlassIcon/>
            )}
          </View>

          <View className="flex-1 relative">
            <TextInput
              placeholder={
                !isAutoSuggestionReady ? "Search cars, spare parts..." : ""
              }
              value={searchQuery}
              onChangeText={handleInputChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="text-base font-NunitoMedium text-gray-900"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Animated Auto-Suggestion Overlay */}
            {searchQuery.trim().length === 0 &&
              !isInputFocused &&
              isAutoSuggestionReady && (
                <Animated.View
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    justifyContent: "center", // This will center the text vertically
                    opacity: placeholderFadeAnim,
                    transform: [{ translateX: placeholderSlideAnim }],
                    pointerEvents: "none",
                  }}
                  className="bg-transparent"
                >
                  <Text
                    style={{
                      fontSize: 16,
                      lineHeight: 22,
                      color: "#9CA3AF",
                      paddingVertical: 0,
                      textAlignVertical: "center",
                    }}
                    className="font-NunitoMedium"
                  >
                    Search for products...
                  </Text>
                </Animated.View>
              )}
          </View>

          {/* Clear Button */}
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setDebouncedSearchQuery("");
                setShowSearchSuggestions(false);
                setFilteredSuggestions([]);
              }}
              className="mr-2 p-1"
              activeOpacity={0.7}
            >
              <View className="w-5 h-5 bg-gray-300 rounded-full items-center justify-center">
                <Text className="text-gray-600 text-xs font-NunitoBold">×</Text>
              </View>
            </TouchableOpacity>
          )}

          <View className="border-l border-primary-100 flex-row">
            <TouchableOpacity
              onPress={handleFilterPress}
              onLayout={(event) => {
                const { x, y, width, height } = event.nativeEvent.layout;
                setFilterButtonLayout({ x, y, width, height });
              }}
              className="ml-2 px-4 py-2 rounded-xl bg-red-50 flex-row items-center"
              activeOpacity={0.7}
            >
              <View className="w-4 h-4 mr-2">
                <View className="w-full h-0.5 bg-primary-500 mb-1" />
                <View className="w-3 h-0.5 bg-primary-500 mb-1" />
                <View className="w-full h-0.5 bg-primary-500" />
              </View>
              <Text className="text-primary-500 font-NunitoBold text-lg">
                Filter
              </Text>
            </TouchableOpacity>
            
          </View>
        </View>

        {/* Search History Dropdown */}
        {showSearchHistory && searchQuery.trim().length === 0 && (
          <Animated.View
            style={{
              transform: [{ translateY: searchSlideAnim }],
              opacity: searchFadeAnim,
            }}
            className="absolute top-full left-0 right-0 z-50"
          >
            {renderSearchHistory()}
          </Animated.View>
        )}

        {/* Popular Searches Dropdown */}
        {showPopularSearches && searchQuery.trim().length === 0 && (
          <Animated.View
            style={{
              transform: [{ translateY: searchSlideAnim }],
              opacity: searchFadeAnim,
            }}
            className="absolute top-full left-0 right-0 z-50"
          >
            <View className="bg-white rounded-xl mt-2 shadow-2xl p-4">
              <Text className="font-NunitoBold text-lg text-gray-900 mb-3">
                Popular Searches
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {popularSearches.slice(0, 8).map((search, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSuggestionSelect(search)}
                    className="px-3 py-2 bg-gray-100 rounded-full"
                    activeOpacity={0.7}
                  >
                    <Text className="text-gray-700 font-NunitoMedium text-sm">
                      {search}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Search Suggestions Dropdown */}
        {showSearchSuggestions && (
          <Animated.View
            style={{
              transform: [{ translateY: searchSlideAnim }],
              opacity: searchFadeAnim,
            }}
            className="absolute top-full left-0 right-0 bg-white rounded-xl mt-2 shadow-2xl z-50 max-h-80"
          >
            {isSearching ? (
              <View className="py-6 px-4 flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="text-gray-500 font-NunitoMedium ml-2">
                  Searching for "{searchQuery}"...
                </Text>
              </View>
            ) : searchSuggestions.length > 0 ? (
              <View className="py-2">
                <Text className="px-4 py-2 text-sm font-NunitoBold text-gray-600">
                  Suggestions
                </Text>
                {searchSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSuggestionSelect(suggestion)}
                    className="flex-row items-center px-4 py-3 border-b border-gray-100"
                    activeOpacity={0.7}
                  >
                    <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3">
                      <Text className="text-blue-600 text-xs">🔍</Text>
                    </View>
                    <Text className="font-NunitoMedium text-gray-900 flex-1">
                      {suggestion}
                    </Text>
                    <Text className="text-gray-400">→</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View className="py-6 px-4">
                <Text className="text-center text-gray-500 font-NunitoMedium">
                  No suggestions found for "{searchQuery}"
                </Text>
                <Text className="text-center text-gray-400 text-sm mt-1">
                  Try different keywords
                </Text>
              </View>
            )}
          </Animated.View>
        )}
      </View>

      <View className="mb-6">
        <Text
          className={`text-xl font-NunitoExtraBold text-gray-900 ${CONTAINER_PADDING} mb-2`}
        >
          Categories
        </Text>
        <View
          className="bg-[#F2F4F7] border border-gray-300 p-1 rounded-[.5rem] mx-3"
          onLayout={(event) =>
            setContainerWidth(event.nativeEvent.layout.width)
          }
        >
          <FlatList
            ref={flatListRef}
            data={categories}
            renderItem={renderCategoryTab}
            keyExtractor={(item) => item.id?.toString() || item.name}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            onScrollBeginDrag={handleScrollBeginDrag}
            onScrollEndDrag={handleScrollEnd}
            onMomentumScrollEnd={handleScrollEnd}
            scrollEventThrottle={16}
            decelerationRate="normal"
            contentContainerStyle={{ paddingHorizontal: 1, paddingVertical: 0 }}
            ItemSeparatorComponent={() => <View style={{ width: 0 }} />}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews={true}
          />
        </View>
      </View>

      {/* Enhanced Filter Dropdown Modal */}
      <Modal
        visible={showFilterDropdown}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowFilterDropdown(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)" }}
          activeOpacity={1}
          onPress={() => setShowFilterDropdown(false)}
        >
          <View className="flex-1 justify-start items-end pt-20 pr-5">
            <Animated.View
              style={{
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
                opacity: fadeAnim,
              }}
              className="bg-white rounded-2xl p-1 w-72 shadow-2xl"
            >
              {/* Advanced Filter Options */}
                <View className="py-2">
                  {/* Price Range */}
                  <View className="mb-4 px-4">
                    <Text className="font-NunitoBold text-gray-700 mb-2">
                      Price Range
                    </Text>
                    <View className="flex-col gap-2">
                      <Text className="text-gray-500">Min Price</Text>
                      <TextInput
                        value={minPrice}
                        onChangeText={(text) => onPriceChange?.('min', text)}
                        className="flex-1 w-full border border-gray-300 rounded-[.4rem] px-3 py-6"
                        placeholder="Min Price"
                        keyboardType="numeric"
                      />
                      <Text className="text-gray-500">Max Price</Text>
                      <TextInput
                        value={maxPrice}
                        onChangeText={(text) => onPriceChange?.('max', text)}
                        className="flex-1 w-full border border-gray-300 rounded-[.4rem] px-3 py-6 mb-[3rem]"
                        placeholder="Max Price"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  {/* Brand Filter */}
                  {/* <View className="mb-4 px-4">
                    <Text className="font-NunitoBold text-gray-700 mb-2">
                      Brand
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {brandOptions.map((brand) => (
                        <TouchableOpacity
                          key={brand}
                          onPress={() =>
                            setAdvancedFilters((prev) => ({
                              ...prev,
                              brand: prev.brand === brand ? "" : brand,
                            }))
                          }
                          className={`px-3 py-2 rounded-full border ${
                            advancedFilters.brand === brand
                              ? "bg-primary-500 border-primary-500"
                              : "bg-gray-100 border-gray-300"
                          }`}
                        >
                          <Text
                            className={`font-NunitoMedium ${
                              advancedFilters.brand === brand
                                ? "text-white"
                                : "text-gray-700"
                            }`}
                          >
                            {brand}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View> */}

                  {/* Condition Filter */}
                  {/* <View className="mb-4 px-4">
                    <Text className="font-NunitoBold text-gray-700 mb-2">
                      Condition
                    </Text>
                    <View className="flex-row gap-2">
                      {conditionOptions.map((condition) => (
                        <TouchableOpacity
                          key={condition}
                          onPress={() =>
                            setAdvancedFilters((prev) => ({
                              ...prev,
                              condition:
                                prev.condition === condition ? "" : condition,
                            }))
                          }
                          className={`px-3 py-2 rounded-full border ${
                            advancedFilters.condition === condition
                              ? "bg-primary-500 border-primary-500"
                              : "bg-gray-100 border-gray-300"
                          }`}
                        >
                          <Text
                            className={`font-NunitoMedium ${
                              advancedFilters.condition === condition
                                ? "text-white"
                                : "text-gray-700"
                            }`}
                          >
                            {condition}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View> */}

                  {/* Action Buttons */}
                  <View className="flex-row gap-3 px-4">
                    <TouchableOpacity
                      onPress={resetFilters}
                      className="flex-1 py-3 border border-gray-300 rounded-[.4rem] items-center"
                      activeOpacity={0.7}
                    >
                      <Text className="text-gray-700 font-NunitoBold">
                        Reset
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={applyAdvancedFilters}
                      className="flex-1 py-3 bg-primary-500 rounded-[.4rem] items-center"
                      activeOpacity={0.7}
                    >
                      <Text className="text-white font-NunitoBold">Apply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default SearchBarWithCategories;

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
  categories: string[];
  onFilterPress?: () => void;
}

// Mock search suggestions data
const mockSuggestions = [
  { id: "1", title: "Toyota Camry 2020", type: "Car", price: "₦25,000" },
  { id: "2", title: "Honda Civic 2019", type: "Car", price: "₦22,500" },
  { id: "3", title: "Engine Oil Filter", type: "Spare Part", price: "₦15" },
  { id: "4", title: "Brake Pads Set", type: "Spare Part", price: "₦45" },
  { id: "5", title: "Ford Focus 2021", type: "Car", price: "₦28,000" },
  { id: "6", title: "Air Filter", type: "Spare Part", price: "₦12" },
  { id: "7", title: "BMW X5 2018", type: "Car", price: "₦35,000" },
  { id: "8", title: "Spark Plugs", type: "Spare Part", price: "₦8" },
  { id: "9", title: "Mercedes C-Class 2022", type: "Car", price: "₦42,000" },
  { id: "10", title: "Battery", type: "Spare Part", price: "₦120" },
];

// Auto-suggestion placeholders that cycle through
const autoSuggestions = [
  "Search for Toyota Camry...",
  "Find brake pads...",
  "Looking for BMW X5?",
  "Search engine oil filters...",
  "Find Honda Civic parts...",
  "Search for Mercedes parts...",
  "Looking for spark plugs?",
  "Find car batteries...",
  "Search for Ford Focus...",
  "Looking for air filters?",
];

const SearchBarWithCategories = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  onFilterPress,
}: SearchBarWithCategoriesProps) => {
  const flatListRef = useRef<FlatList>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentScrollX, setCurrentScrollX] = useState(0);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [filterButtonLayout, setFilterButtonLayout] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] =
    useState(mockSuggestions);
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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    priceRange: [0, 100000],
    brand: "",
    condition: "",
    location: "",
    sortBy: "relevance",
  });

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

  // Filter suggestions based on debounced search query
  useEffect(() => {
    if (debouncedSearchQuery.trim().length > 0 && !isAutoSuggestionSelected) {
      const filtered = mockSuggestions.filter(
        (item) =>
          item.title
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          item.type.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSearchSuggestions(true);
    } else {
      setShowSearchSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [debouncedSearchQuery, isAutoSuggestionSelected]);

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

  // Auto-rotate suggestions when input is not focused and empty
  useEffect(() => {
    if (!isInputFocused && searchQuery.trim().length === 0) {
      // Set ready state after initial delay
      const readyTimer = setTimeout(() => {
        setIsAutoSuggestionReady(true);
      }, 500);

      const interval = setInterval(() => {
        // Animate out current suggestion (slide left and fade)
        Animated.parallel([
          Animated.timing(placeholderFadeAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(placeholderSlideAnim, {
            toValue: -50,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Change to next suggestion
          setCurrentAutoSuggestionIndex(
            (prev) => (prev + 1) % autoSuggestions.length
          );

          // Reset position for new suggestion (start from right)
          placeholderSlideAnim.setValue(50);

          // Animate in new suggestion (slide from right to center)
          Animated.parallel([
            Animated.timing(placeholderFadeAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(placeholderSlideAnim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]).start();
        });
      }, 5000); // Change every 5 seconds

      return () => {
        clearInterval(interval);
        clearTimeout(readyTimer);
      };
    } else {
      // Reset animations when input is focused or has content
      setIsAutoSuggestionReady(false);
      Animated.parallel([
        Animated.timing(placeholderFadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(placeholderSlideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isInputFocused, searchQuery]);

  useEffect(() => {
    if (!isUserScrolling && containerWidth && selectedCategory) {
      const selectedIndex = categories.indexOf(selectedCategory);
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

  const filterOptions = [
    { id: "all", label: "All", icon: "🏷️", description: "Show all items" },
    { id: "cars", label: "Cars", icon: "🚗", description: "Vehicles only" },
    {
      id: "spareParts",
      label: "Spare Parts",
      icon: "🔧",
      description: "Parts & accessories",
    },
  ];

  const brandOptions = ["Toyota", "Honda", "BMW", "Mercedes", "Ford"];
  const conditionOptions = ["New", "Used", "Certified"];

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setShowFilterDropdown(false);
    // You can add additional logic here to filter the data
    console.log("Filter selected:", filter);
  };

  const handleFilterPress = () => {
    setShowFilterDropdown(true);
  };

  const handleAdvancedFilterPress = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };

  const applyAdvancedFilters = () => {
    console.log("Applying advanced filters:", advancedFilters);
    setShowAdvancedFilters(false);
    // Here you would apply the filters to your search results
  };

  const resetFilters = () => {
    setAdvancedFilters({
      priceRange: [0, 100000],
      brand: "",
      condition: "",
      location: "",
      sortBy: "relevance",
    });
  };

  const handleSuggestionSelect = (suggestion: (typeof mockSuggestions)[0]) => {
    console.log("Before selection - searchQuery:", searchQuery);
    console.log("Selecting suggestion:", suggestion.title);

    // Set flag to prevent filtering interference
    setIsSelectingSuggestion(true);

    // Update search query with the selected suggestion
    setSearchQuery(suggestion.title);

    // Also update debounced query immediately
    setDebouncedSearchQuery(suggestion.title);

    // Add to search history
    addToSearchHistory(suggestion.title);

    // Hide suggestions immediately
    setShowSearchSuggestions(false);

    // Clear filtered suggestions to prevent interference
    setFilteredSuggestions([]);

    // Reset the flag after a short delay
    setTimeout(() => {
      setIsSelectingSuggestion(false);
      console.log("After delay - searchQuery should be:", suggestion.title);
    }, 200);

    // You can add navigation logic here
    console.log(
      "After selection - new searchQuery should be:",
      suggestion.title
    );
  };

  const addToSearchHistory = (query: string) => {
    if (query.trim().length > 0) {
      setSearchHistory((prev) => {
        const filtered = prev.filter((item) => item !== query);
        return [query, ...filtered].slice(0, 10); // Keep only last 10 searches
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

    // If input is empty, show search history or auto-suggestion
    if (searchQuery.trim().length === 0) {
      if (searchHistory.length > 0) {
        setShowSearchHistory(true);
      } else {
        const currentSuggestion = autoSuggestions[currentAutoSuggestionIndex];
        // Extract the search term from the suggestion (remove "Search for", "Find", "Looking for" etc.)
        const searchTerm = currentSuggestion
          .replace(/^(Search for|Find|Looking for)\s+/i, "")
          .replace(/\.\.\.$/, "")
          .replace(/\?$/, "");

        setSearchQuery(searchTerm);
        setDebouncedSearchQuery(searchTerm);
        setIsAutoSuggestionSelected(true);
      }
    } else {
      // Only show suggestions if user is typing (not just after history select or auto-suggestion)
      if (searchQuery.trim().length > 0 && !isAutoSuggestionSelected) {
        setShowSearchSuggestions(true);
        if (filteredSuggestions.length === 0) {
          setFilteredSuggestions(mockSuggestions);
        }
      }
    }
  };

  const handleSearchBlur = () => {
    setIsInputFocused(false);
    // Delay hiding to allow for suggestion selection
    setTimeout(() => {
      setShowSearchSuggestions(false);
    }, 200);
  };

  // When user types, reset auto-suggestion flag
  const handleInputChange = (text: string) => {
    setIsAutoSuggestionSelected(false);
    setSearchQuery(text);
  };

  const renderCategoryTab = useCallback(
    ({ item }: { item: string }) => (
      <CategoryTab item={item} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
    ),
    [selectedCategory, setSelectedCategory]
  );

  const renderSearchSuggestion = useCallback(
    ({ item }: { item: (typeof mockSuggestions)[0] }) => (
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
            <MagnifyingGlassIcon/>
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
                    {autoSuggestions[currentAutoSuggestionIndex]}
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

          <View className="border-l border-primary-100">
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

        {/* Search Suggestions Dropdown */}
        {showSearchSuggestions && (
          <Animated.View
            style={{
              transform: [{ translateY: searchSlideAnim }],
              opacity: searchFadeAnim,
            }}
            className="absolute top-full left-0 right-0 bg-white rounded-xl mt-2 shadow-2xl z-50 max-h-80"
          >
            {filteredSuggestions.length > 0 ? (
              <FlatList
                data={filteredSuggestions}
                renderItem={renderSearchSuggestion}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                contentContainerStyle={{ paddingVertical: 4 }}
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                windowSize={7}
                removeClippedSubviews={true}
              />
            ) : (
              <View className="py-6 px-4">
                <Text className="text-center text-gray-500 font-NunitoMedium">
                  No results found
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
            keyExtractor={(item) => item}
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
              {/* Header */}
              <View className="px-4 py-3 border-b border-gray-100">
                <Text className="text-lg font-NunitoExtraBold text-gray-900 text-center">
                  Filter Options
                </Text>
                <Text className="text-sm text-gray-500 text-center mt-1">
                  Choose your preferred filter
                </Text>
              </View>

              {/* Tab Navigation */}
              <View className="flex-row border-b border-gray-100 mb-4">
                <TouchableOpacity
                  onPress={() => setShowAdvancedFilters(false)}
                  className={`flex-1 py-3 px-4 border-b-2 ${
                    !showAdvancedFilters
                      ? "border-primary-500"
                      : "border-transparent"
                  }`}
                >
                  <Text
                    className={`text-center font-NunitoBold ${
                      !showAdvancedFilters
                        ? "text-primary-600"
                        : "text-gray-500"
                    }`}
                  >
                    Categories
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowAdvancedFilters(true)}
                  className={`flex-1 py-3 px-4 border-b-2 ${
                    showAdvancedFilters
                      ? "border-primary-500"
                      : "border-transparent"
                  }`}
                >
                  <Text
                    className={`text-center font-NunitoBold ${
                      showAdvancedFilters ? "text-primary-600" : "text-gray-500"
                    }`}
                  >
                    Advanced
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Content based on active tab */}
              {!showAdvancedFilters ? (
                /* Category Filter Options */
                <View className="py-2">
                  {filterOptions.map((option, index) => (
                    <TouchableOpacity
                      key={option.id}
                      onPress={() => handleFilterSelect(option.label)}
                      className={`flex-row items-center justify-between py-4 px-4 mx-2 rounded-xl mb-1 ${
                        selectedFilter === option.label
                          ? "bg-primary-50 border border-primary-200"
                          : "bg-transparent hover:bg-gray-50"
                      }`}
                      activeOpacity={0.7}
                      style={{
                        shadowColor:
                          selectedFilter === option.label
                            ? "#D30309"
                            : "transparent",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: selectedFilter === option.label ? 2 : 0,
                      }}
                    >
                      <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                          <Text className="text-lg">{option.icon}</Text>
                        </View>
                        <View className="flex-1">
                          <Text
                            className={`font-NunitoBold text-base ${
                              selectedFilter === option.label
                                ? "text-primary-600"
                                : "text-gray-800"
                            }`}
                          >
                            {option.label}
                          </Text>
                          <Text className="text-xs text-gray-500 mt-0.5">
                            {option.description}
                          </Text>
                        </View>
                      </View>

                      {selectedFilter === option.label && (
                        <View className="w-6 h-6 bg-primary-500 rounded-full items-center justify-center">
                          <Text className="text-white text-xs font-NunitoBold">
                            ✓
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                /* Advanced Filter Options */
                <View className="py-2">
                  {/* Price Range */}
                  <View className="mb-4 px-4">
                    <Text className="font-NunitoBold text-gray-700 mb-2">
                      Price Range
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-gray-500 mr-2">₦</Text>
                      <TextInput
                        value={advancedFilters.priceRange[0].toString()}
                        onChangeText={(text) =>
                          setAdvancedFilters((prev) => ({
                            ...prev,
                            priceRange: [
                              parseInt(text) || 0,
                              prev.priceRange[1],
                            ],
                          }))
                        }
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 mr-2"
                        placeholder="Min"
                        keyboardType="numeric"
                      />
                      <Text className="text-gray-500 mx-2">to</Text>
                      <TextInput
                        value={advancedFilters.priceRange[1].toString()}
                        onChangeText={(text) =>
                          setAdvancedFilters((prev) => ({
                            ...prev,
                            priceRange: [
                              prev.priceRange[0],
                              parseInt(text) || 100000,
                            ],
                          }))
                        }
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 ml-2"
                        placeholder="Max"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  {/* Brand Filter */}
                  <View className="mb-4 px-4">
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
                  </View>

                  {/* Condition Filter */}
                  <View className="mb-4 px-4">
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
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row gap-3 px-4">
                    <TouchableOpacity
                      onPress={resetFilters}
                      className="flex-1 py-3 border border-gray-300 rounded-lg items-center"
                      activeOpacity={0.7}
                    >
                      <Text className="text-gray-700 font-NunitoBold">
                        Reset
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={applyAdvancedFilters}
                      className="flex-1 py-3 bg-primary-500 rounded-lg items-center"
                      activeOpacity={0.7}
                    >
                      <Text className="text-white font-NunitoBold">Apply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default SearchBarWithCategories;

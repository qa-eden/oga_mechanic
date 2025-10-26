import {
  FlatList,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  RefreshControl,
} from "react-native";
import React, { useRef, useEffect, useState, useCallback, memo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Navbar from "@/components/Navbar";
import AdsComponents from "@/components/AdsComponents";
import { Ads } from "@/constants";
import Card1 from "@/components/cards/Card1";
import SectionHeader from "@/components/SectionHeader";
import { router } from "expo-router";
import { LAYOUT } from "@/constants/units";
import { routes } from "@/constants/routes";
import { CalendarIcon, MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { useHomeProducts } from "@/hooks/useProducts";
import { getErrorMessage, getLoadingMessage } from "@/utils/errorMessages";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import AnimatedErrorCard from "@/components/AnimatedErrorCard";

const { width: screenWidth } = Dimensions.get("window");

// Enhanced skeleton component with smooth animations
const CardSkeleton = memo(({ width }: { width: number }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, []);

  const shimmerStyle = {
    opacity: shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.7],
    }),
  };

  return (
    <View style={{ width }} className="bg-white rounded-2xl border border-gray-200 mt-4 overflow-hidden shadow-sm">
      {/* Image skeleton */}
      <Animated.View style={[shimmerStyle]} className="w-full h-[140px] bg-gray-200" />
      
      {/* Content skeleton */}
      <View className="p-3 space-y-2">
        {/* Title skeleton */}
        <Animated.View style={[shimmerStyle]} className="h-4 bg-gray-200 rounded" />
        
        {/* Rating skeleton */}
        <View className="flex-row items-center space-x-1">
          <Animated.View style={[shimmerStyle]} className="h-3 w-16 bg-gray-200 rounded" />
          <Animated.View style={[shimmerStyle]} className="h-3 w-12 bg-gray-200 rounded" />
        </View>
        
        {/* Price skeleton */}
        <Animated.View style={[shimmerStyle]} className="h-4 w-20 bg-gray-200 rounded" />
      </View>
    </View>
  );
});


const HomePage = memo(() => {
  const { SCROLL_PADDING_BOTTOM, CARD_GAP, CARD_PADDING, CONTAINER_PADDING } =
    LAYOUT;
  const flatListRef = useRef<FlatList>(null);
  const [activeAdIndex, setActiveAdIndex] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Fetch home products from API (includes mechanics, cars, and spare parts)
  const { data: homeProducts, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useHomeProducts();

  // Check if individual sections have data or failed
  const hasMechanics = (homeProducts?.data?.mechanics?.length ?? 0) > 0;
  const hasCars = (homeProducts?.data?.best_selling_cars?.length ?? 0) > 0;
  const hasSpareParts = (homeProducts?.data?.best_selling_spare_parts?.length ?? 0) > 0;

  // Extract category IDs from the actual products
  const carCategoryId = homeProducts?.data?.best_selling_cars?.[0]?.category?.id;
  const sparePartCategoryId = homeProducts?.data?.best_selling_spare_parts?.[0]?.category?.id;

  // Pull to refresh functionality
  const { refreshControl } = usePullToRefresh({
    onRefresh: async () => {
      await refetchProducts();
    }
  });

  // Calculate card width to show 2 full cards + 1 partial card (20-30% visible)
  const CARD_WIDTH = Math.floor((screenWidth - 35 - 32) / 2.15); // 40px padding, 32px gap, 2.3 cards visible

  // Create infinite loop data
  const infiniteAds = [...Ads, ...Ads, ...Ads];

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAdIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % Ads.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 8000); // 8 seconds per ad

    return () => clearInterval(interval);
  }, []);

  // Reset navigation loading state after a short delay
  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isNavigating]);

  const renderAdItem = useCallback(({ item, index }: { item: any; index: number }) => (
    <View style={{ width: screenWidth, paddingRight: 20 }}>
      <AdsComponents
        image={item.image}
        title={item.title}
        description={item.description}
        onPress={() => {}}
      />
    </View>
  ), [screenWidth]);

  const renderMechanicItem = useCallback(({ item }: { item: any }) => {
    // Extract name from user object or use fallback
    const getName = () => {
      if (item?.name) return item.name;
      if (item?.user) {
        if (typeof item.user === 'string') return item.user;
        if (typeof item.user === 'object' && item.user.first_name) {
          return `${item.user.first_name} ${item.user.last_name || ''}`.trim();
        }
      }
      return 'Mechanic';
    };

    return (
      <View style={{ width: CARD_WIDTH }}>
        <Card1
          Images={item.selfie || item.image || item.avatar} // Use selfie from API
          rating={item?.rating || 0} // Default rating if not provided
          name={getName()} // Use extracted name
          address={item?.location || 'Location not available'} // Add location as address
          reviewCount={item?.reviewCount || 0} // Default review count
          isFavorite={item?.is_in_favorite_list} // Default isFavorite if not provided
          onPress={() => {
            router.push({
              pathname: routes.mechanicProfile,
              params: {
                mechanicId: item.user.id,
                mechanicName: getName(),
                mechanicRating: item.rating || 0,
              },
            });
          }}
        />
      </View>
    );
  }, [CARD_WIDTH]);

  const renderCarItem = useCallback(({ item }: { item: any }) => (
    <View style={{ width: CARD_WIDTH }}>
      <Card1
        Images={item.images?.[0]?.image || item.image} // Use first image from API or fallback
        rating={item?.rating} // Default rating if not provided
        name={item?.name} // Use name from API
        price={item?.price || '0'} // Use price from API
        reviewCount={item?.reviewCount || 0} // Default review count
        isFavorite={item?.is_in_favorite_list} // Default isFavorite if not provided
        productId={item?.id} // Add productId for favorite functionality
        showLove={true}
        onPress={() => {
          router.push({
            pathname: routes.ProductDetail,
            params: {
              productId: item.id,
              productName: item.name,
              productPrice: item.price,
            },
          });
        }}
      />
    </View>
  ), [CARD_WIDTH]);

  const renderSparePartItem = useCallback(({ item }: { item: any }) => (
    <View style={{ width: CARD_WIDTH }}>
      <Card1
        Images={item.images?.[0]?.image || item.image} // Use first image from API or fallback
        rating={item?.rating} // Default rating if not provided
        name={item?.name} // Use name from API
        reviewCount={item?.reviewCount || 0} // Default review count
        price={item?.price || '0'} // Use price from API
        isFavorite={item?.is_in_favorite_list} // Default isFavorite if not provided
        productId={item?.id} // Add productId for favorite functionality
        showLove={true}
        onPress={() => {
          router.push({
            pathname: routes.ProductDetail,
            params: {
              productId: item.id,
              productName: item.name,
              productPrice: item.price,
            },
          });
        }}
      />
    </View>
  ), [CARD_WIDTH]);

  // Skeleton render functions
  const renderMechanicSkeleton = useCallback(() => (
    <CardSkeleton width={CARD_WIDTH} />
  ), [CARD_WIDTH]);

  const renderCarSkeleton = useCallback(() => (
    <CardSkeleton width={CARD_WIDTH} />
  ), [CARD_WIDTH]);

  const renderSparePartSkeleton = useCallback(() => (
    <CardSkeleton width={CARD_WIDTH} />
  ), [CARD_WIDTH]);

  const renderAdDotIndicator = () => (
    <View
      style={{
        position: "absolute",
        bottom: 8,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {Ads.map((_, i) => (
        <View
          key={i}
          style={{
            width: i === activeAdIndex ? 24 : 8,
            height: 8,
            borderRadius: 4,
            marginHorizontal: 4,
          }}
          className={i === activeAdIndex ? "bg-primary-500" : "bg-primary-200"}
        />
      ))}
    </View>
  );

  const handleAdMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    const actualIndex = index % Ads.length;
    setActiveAdIndex(actualIndex);
  };

  return (
    <SafeAreaView className="bg-gray-50 flex-1" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: SCROLL_PADDING_BOTTOM, // Increased padding for better spacing
        }}
        className={`${CONTAINER_PADDING}`}
        refreshControl={<RefreshControl {...refreshControl} />}
      >
        <Navbar />

        {/* Enhanced Ads Section */}
        <View className="h-64 pt-6 mb-4">
          <FlatList
            ref={flatListRef}
            data={infiniteAds}
            renderItem={renderAdItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleAdMomentumScrollEnd}
            snapToAlignment="start"
            snapToInterval={screenWidth}
            decelerationRate="fast"
            getItemLayout={(data, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            initialNumToRender={3}
            maxToRenderPerBatch={2}
            windowSize={3}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={100}
          />
          {renderAdDotIndicator()}
        </View>

        {/* Enhanced Search Section */}
        <View className="flex-row justify-between items-center mb-6 bg-white border border-gray-200 px-5 py-2 rounded-[1.2rem] shadow-sm">
          <TouchableOpacity
            onPress={() => router.push("/enterAddressForRide")}
            className="flex-row items-center gap-4 py-2 border-r pr-6 border-gray-200 flex-1"
          >
            <MagnifyingGlassIcon/>
            <Text className="text-gray-700 font-NunitoMedium">
              Where are you going today?
            </Text>
          </TouchableOpacity>
          <View className="flex-row items-center bg-primary-100 rounded-[1rem] p-3 ml-4">
            <CalendarIcon size={16} color={"#A80207"} />
            <Text className="text-primary-600 pl-1 font-NunitoBold">Later</Text>
          </View>
        </View>

        {/* Enhanced Mechanics Section */}
        <View className="mb-8">
          <SectionHeader
            name="Top Mechanics"
            onPress={() => {
              setIsNavigating(true);
              router?.push(routes?.AllMechanic);
            }}
            isLoading={isNavigating}
          />
          
          {/* Beautiful animated error message for mechanics */}
          {!productsLoading && !hasMechanics && (
            <AnimatedErrorCard
              emoji="🔧"
              title="Mechanics are taking a break"
              message="Our mechanics are currently unavailable. Check back later or browse our car collection!"
              gradientColors={['#EBF8FF', '#BEE3F8', '#90CDF4']}
              textColor="text-blue-800"
            />
          )}
          
          {productsLoading ? (
            <FlatList
              data={Array.from({ length: 4 }, (_, i) => ({ id: `skeleton-${i}` }))} // Generate 4 skeleton items
              renderItem={renderMechanicSkeleton}
              keyExtractor={(item) => String(item.id)}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              snapToAlignment="start"
              snapToInterval={CARD_WIDTH + CARD_GAP}
              decelerationRate="fast"
              contentContainerStyle={{
                paddingHorizontal: CARD_PADDING,
                gap: CARD_GAP,
              }}
            />
          ) : (
            <FlatList
              data={homeProducts?.data?.mechanics || []} // Use API data only, no fallback
              renderItem={renderMechanicItem}
              keyExtractor={(item) => String(item.id)}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              snapToAlignment="start"
              snapToInterval={CARD_WIDTH + CARD_GAP}
              decelerationRate="fast"
              contentContainerStyle={{
                paddingHorizontal: CARD_PADDING,
                gap: CARD_GAP,
              }}
              initialNumToRender={4}
              maxToRenderPerBatch={2}
              windowSize={3}
              removeClippedSubviews={true}
              updateCellsBatchingPeriod={100}
            />
          )}
        </View>

        {/* Enhanced Cars Section */}
        <View className="mb-8">
          <SectionHeader
            name="Best Selling Cars"
            onPress={() => {
              setIsNavigating(true);
              if (carCategoryId) {
                router?.push({
                  pathname: routes?.shop,
                  params: {
                    category: homeProducts?.data?.best_selling_cars?.[0]?.category?.name || 'Car',
                    categoryId: carCategoryId.toString(),
                  }
                });
              } else {
                router?.push(routes?.shop);
              }
            }}
            isLoading={isNavigating}
          />
          
          {/* Beautiful animated error message for cars */}
          {!productsLoading && !hasCars && (
            <AnimatedErrorCard
              emoji="🚗"
              title="Cars are out for a drive"
              message="Our car collection is temporarily unavailable. Try refreshing or check our spare parts!"
              gradientColors={['#FFF7ED', '#FED7AA', '#FDBA74']}
              textColor="text-orange-800"
            />
          )}
          
          {productsLoading ? (
            <FlatList
              data={Array.from({ length: 4 }, (_, i) => ({ id: `skeleton-car-${i}` }))} // Generate 4 skeleton items
              renderItem={renderCarSkeleton}
              keyExtractor={(item) => String(item.id)}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              snapToAlignment="start"
              snapToInterval={CARD_WIDTH + CARD_GAP}
              decelerationRate="fast"
              contentContainerStyle={{
                paddingHorizontal: CARD_PADDING,
                gap: CARD_GAP,
              }}
            />
          ) : (
            <FlatList
              data={homeProducts?.data?.best_selling_cars || []} // Use API data only, no fallback
              renderItem={renderCarItem}
              keyExtractor={(item) => String(item.id)}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              snapToAlignment="start"
              snapToInterval={CARD_WIDTH + CARD_GAP}
              decelerationRate="fast"
              contentContainerStyle={{
                paddingHorizontal: CARD_PADDING,
                gap: CARD_GAP,
              }}
              initialNumToRender={4}
              maxToRenderPerBatch={2}
              windowSize={3}
              removeClippedSubviews={true}
              updateCellsBatchingPeriod={100}
            />
          )}
        </View>

        {/* Enhanced Spare Parts Section */}
        <View className="mb-8">
          <SectionHeader
            name="Best Selling Spare Parts"
            onPress={() => {
              setIsNavigating(true);
              if (sparePartCategoryId) {
                router?.push({
                  pathname: routes?.shop,
                  params: {
                    category: homeProducts?.data?.best_selling_spare_parts?.[0]?.category?.name || 'Spare Part',
                    categoryId: sparePartCategoryId.toString(),
                  }
                });
              } else {
                router?.push(routes?.shop);
              }
            }}
            isLoading={isNavigating}
          />
          
          {/* Beautiful animated error message for spare parts */}
          {!productsLoading && !hasSpareParts && (
            <AnimatedErrorCard
              emoji="🔧"
              title="Parts are being restocked"
              message="Our spare parts inventory is being updated. Check back soon or browse our cars!"
              gradientColors={['#F0FDF4', '#BBF7D0', '#86EFAC']}
              textColor="text-green-800"
            />
          )}
          
          {productsLoading ? (
            <FlatList
              data={Array.from({ length: 4 }, (_, i) => ({ id: `skeleton-part-${i}` }))} // Generate 4 skeleton items
              renderItem={renderSparePartSkeleton}
              keyExtractor={(item) => String(item.id)}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              snapToAlignment="start"
              snapToInterval={CARD_WIDTH + CARD_GAP}
              decelerationRate="fast"
              contentContainerStyle={{
                paddingHorizontal: CARD_PADDING,
                gap: CARD_GAP,
              }}
            />
          ) : (
            <FlatList
              data={homeProducts?.data?.best_selling_spare_parts || []} // Use API data only, no fallback
              renderItem={renderSparePartItem}
              keyExtractor={(item) => String(item.id)}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              snapToAlignment="start"
              snapToInterval={CARD_WIDTH + CARD_GAP}
              decelerationRate="fast"
              contentContainerStyle={{
                paddingHorizontal: CARD_PADDING,
                gap: CARD_GAP,
              }}
              initialNumToRender={4}
              maxToRenderPerBatch={2}
              windowSize={3}
              removeClippedSubviews={true}
              updateCellsBatchingPeriod={100}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

export default HomePage;

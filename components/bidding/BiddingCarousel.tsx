import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, FlatList, Animated, Dimensions, Text, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import AdsComponents from "@/components/AdsComponents";
import { routes } from "@/constants/routes";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useActiveBiddingProducts } from "@/hooks/useProducts";

const { width: screenWidth } = Dimensions.get("window");

interface BiddingCarouselProps {
  containerPadding?: number;
  onFallbackChange?: (isFallbackShowing: boolean) => void;
}

const BiddingCarousel: React.FC<BiddingCarouselProps> = ({ containerPadding = 0, onFallbackChange }) => {
  const { data: activeBiddingRes, isLoading, error } = useActiveBiddingProducts();

  const [activeAdIndex, setActiveAdIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Prepare display ads - handle both paginated results and direct arrays in .data
  const biddingProducts = Array.isArray(activeBiddingRes?.data) 
    ? activeBiddingRes.data 
    : (activeBiddingRes?.results || (activeBiddingRes?.data as any)?.results || []);
  
  const displayAds = biddingProducts.map((p: any) => ({
    id: p.id,
    title: p.name,
    description: p.description?.slice(0, 60) + (p.description?.length > 60 ? '...' : ''),
    images: p.images?.map((img: any) => ({ uri: img.image })) || [],
    image: p.images?.[0]?.image ? { uri: p.images[0].image } : null,
    price: p.price,
    currency: p.currency,
    year: p.year,
    repairHistoryCount: p.repair_history?.length || 0,
    isBidding: true
  })).filter((ad: any) => ad.images.length > 0 || ad.image !== null);

  const isFallbackShowing = displayAds.length === 0 || isLoading || !!error;

  useEffect(() => {
    if (onFallbackChange) {
      onFallbackChange(isFallbackShowing);
    }
  }, [isFallbackShowing, onFallbackChange]);

  // Auto-scroll effect
  useEffect(() => {
    if (displayAds.length <= 1) return; // No need to scroll if only 1 item
    
    // We do not use infinite loop data here directly for simplicity, just index looping
    const interval = setInterval(() => {
      setActiveAdIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % displayAds.length;
        if (flatListRef.current) {
          try {
            flatListRef.current.scrollToIndex({
              index: nextIndex,
              animated: true,
            });
          } catch (e) {
            // Failsafe if list isn't measuring right yet
          }
        }
        return nextIndex;
      });
    }, 8000); 

    return () => clearInterval(interval);
  }, [displayAds.length]);

  const handleAdMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    const actualIndex = index % displayAds.length;
    setActiveAdIndex(actualIndex);
  };

  const renderAdItem = useCallback(({ item }: { item: any }) => (
    <View style={{ width: screenWidth, alignItems: 'center' }}>
      <View style={{ width: screenWidth - 18 }}>
          <AdsComponents
          images={item.images}
          image={item.image}
          title={item.title}
          description={item.description}
          price={item.price}
          currency={item.currency}
          year={item.year}
          repairHistoryCount={item.repairHistoryCount}
          isBidding={item.isBidding}
          onPress={() => {
            if (item.isBidding) {
              router.push({
                pathname: routes.biddingDetail as any,
                params: { productId: item.id }
              });
            }
          }}
        />
      </View>
    </View>
  ), []);

  // If there are absolutely no bids to show, render a persistent promotional banner instead of an empty state.
  // This ensures the layout stays stable and provides value to the user.
  if (isFallbackShowing) {
    return (
      <View style={{ width: screenWidth, alignItems: 'center', marginVertical: 4 }}>
        <TouchableOpacity 
          activeOpacity={0.9}
          style={{
            width: screenWidth - 18,
            height: 155, 
            backgroundColor: '#D30309', 
            borderRadius: 20,
            padding: 20,
            flexDirection: 'row',
            overflow: 'hidden',
          }}
        >
          {/* Left Side Content */}
          <View style={{ flex: 1, justifyContent: 'center', zIndex: 10 }}>
            <Text style={{ fontSize: 24, color: '#FFFFFF', marginBottom: 20, letterSpacing: -0.3 }} className="font-NunitoExtraBold">
              Find a mechanic
            </Text>
            
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 30,
              paddingVertical: 8,
              paddingHorizontal: 12,
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-start'
            }}>
              <Text style={{ color: '#D30309', fontSize: 13, marginRight: 8, marginLeft: 4 }} className="font-NunitoExtraBold">
                Book Service
              </Text>
              <View style={{
                backgroundColor: '#D30309',
                borderRadius: 14,
                width: 28,
                height: 28,
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MaterialCommunityIcons name="arrow-right" size={16} color="#FFFFFF" />
              </View>
            </View>
          </View>
          
          {/* Right Side Icon */}
          <View style={{ position: 'absolute', right: -15, bottom: -15, zIndex: 1 }}>
            <MaterialCommunityIcons name="car-wrench" size={140} color="rgba(255,255,255,0.15)" />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  const renderAdDotIndicator = () => {
    if (displayAds.length <= 1) return null;
    return (
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 6,
        }}
      >
        {displayAds.map((_: any, index: number) => {
          return (
            <Animated.View
              key={index.toString()}
              style={{
                width: activeAdIndex === index ? 16 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: activeAdIndex === index ? "#E11D48" : "#E2E8F0",
                marginHorizontal: 3,
              }}
            />
          );
        })}
      </View>
    );
  };

  return (
    <Animated.View 
      className="rounded-2xl mt-4" 
      style={{
        marginHorizontal: -containerPadding,
      }}
    >
      <View>
        <FlatList
          ref={flatListRef}
          data={displayAds}
          renderItem={renderAdItem}
          keyExtractor={(item, index) => item.id.toString() + index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={handleAdMomentumScrollEnd}
          decelerationRate="fast"
          snapToInterval={screenWidth}
          snapToAlignment="center"
        />
        {renderAdDotIndicator()}
      </View>
    </Animated.View>
  );
};

export default React.memo(BiddingCarousel);

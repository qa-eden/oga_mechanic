import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, FlatList, Animated, Dimensions } from "react-native";
import { router } from "expo-router";
import AdsComponents from "@/components/AdsComponents";
import { routes } from "@/constants/routes";
import { useActiveBiddingProducts } from "@/hooks/useProducts";

const { width: screenWidth } = Dimensions.get("window");

interface BiddingCarouselProps {
  containerPadding?: number;
}

const BiddingCarousel: React.FC<BiddingCarouselProps> = ({ containerPadding = 0 }) => {
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
    image: p.images?.[0]?.image ? { uri: p.images[0].image } : null,
    price: p.price,
    currency: p.currency,
    year: p.year,
    repairHistoryCount: p.repair_history?.length || 0,
    isBidding: true
  })).filter((ad: any) => ad.image !== null);

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

  // If there are absolutely no bids to show, render nothing at all so we don't clutter dashboards.
  if (displayAds.length === 0 || isLoading || error) {
    return null;
  }

  const renderAdDotIndicator = () => {
    if (displayAds.length <= 1) return null;
    return (
      <View
        style={{
          position: "absolute",
          bottom: 8,
          flexDirection: "row",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {displayAds.map((_: any, index: number) => {
          return (
            <Animated.View
              key={index.toString()}
              style={{
                width: activeAdIndex === index ? 15 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: activeAdIndex === index ? "#fff" : "rgba(255, 255, 255, 0.5)",
                marginHorizontal: 4,
              }}
            />
          );
        })}
      </View>
    );
  };

  return (
    <Animated.View 
      className="rounded-2xl mt-4 mb-4" 
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

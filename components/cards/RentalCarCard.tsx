import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import Animated, { useAnimatedStyle, withTiming, useSharedValue, runOnJS } from "react-native-reanimated";

interface RentalCarCardProps {
  item: any;
  onPress: (item: any) => void;
}

const RentalCarCard: React.FC<RentalCarCardProps> = React.memo(({ item, onPress }) => {
  if (!item) return null;

  const isVan = item.body_type === 'van' || item.category === 'van';
  const images = (item.images && item.images.length > 0) ? item.images : [item.image || 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=No+Image'];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const opacity = useSharedValue(1);

  const updateIndex = () => {
    if (!images || images.length === 0) return;
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    opacity.value = withTiming(1, { duration: 500 });
  };

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      // Smooth fade out
      opacity.value = withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(updateIndex)();
        }
      });
    }, 10000); // 10 seconds as requested

    return () => clearInterval(timer);
  }, [images]);

  const animatedImageStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      className="bg-white rounded-[24px] mb-5 overflow-hidden shadow-sm border border-gray-100"
      activeOpacity={0.9}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      <View className="flex-row p-4 items-center">
        {/* Car Image Container with Premium Background */}
        <View className="w-32 h-28 bg-gray-100 rounded-2xl overflow-hidden items-center justify-center">
          {/* Blurred Background Layer for "Fill" effect */}
          <Image
            source={{ uri: images[currentImageIndex] }}
            className="absolute w-full h-full opacity-20"
            blurRadius={10}
            resizeMode="cover"
          />
          
          <Animated.Image
            source={{ uri: images[currentImageIndex] }}
            style={[{ width: '100%', height: '100%' }, animatedImageStyle]}
            resizeMode="contain"
          />
          
          {/* Slideshow Progress Dots */}
          {images.length > 1 && (
            <View className="absolute bottom-1.5 flex-row gap-1 bg-black/5 px-2 py-0.5 rounded-full">
               {images.map((_: any, idx: number) => (
                  <View 
                    key={idx} 
                    className={`h-1 rounded-full ${idx === currentImageIndex ? 'w-3 bg-primary-500' : 'w-1 bg-gray-400'}`} 
                  />
               ))}
            </View>
          )}

          {/* Category Badge */}
          <View className="absolute top-2 left-2 shadow-sm">
            <View className={`px-2 py-0.5 rounded-lg ${isVan ? 'bg-blue-600' : 'bg-primary-600'}`}>
               <Text className="text-[8px] font-NunitoExtraBold text-white uppercase tracking-tighter">
                  {isVan ? 'Towing' : 'Premium'}
               </Text>
            </View>
          </View>
        </View>

        {/* Car Details */}
        <View className="flex-1 ml-4 py-1">
          <View className="flex-row justify-between items-start mb-1">
             <Text className="text-lg font-NunitoExtraBold text-gray-900 flex-1 mr-2" numberOfLines={1}>
                {item.name}
             </Text>
          </View>
          
          <Text className="text-[13px] font-NunitoSemiBold text-gray-400 mb-3 uppercase tracking-wide">
             {isVan ? 'Heavy Duty Service' : `${item.transmission} • ${item.make || 'Vehicle'}`}
          </Text>

          <View className="flex-row items-end justify-between">
            <View className="flex-row items-baseline">
              <NairaCurrency value={item.pricePerDay} className="text-xl font-NunitoExtraBold text-primary-500" />
              <Text className="text-xs font-NunitoBold text-gray-400 ml-1">/day</Text>
            </View>
            
            <View className="bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
               <Text className="text-[10px] font-NunitoBold text-gray-600">Details</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default RentalCarCard; 
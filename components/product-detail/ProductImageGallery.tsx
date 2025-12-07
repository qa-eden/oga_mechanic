import React, { useState, useRef, useEffect, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Animated,
} from "react-native";
import { PhotoIcon } from "react-native-heroicons/outline";
import { useImageValidator, getImageSource } from "@/hooks/useImageValidator";

const { width: screenWidth } = Dimensions.get("window");

interface ProductImage {
  id: number;
  image: string;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  onImagePress?: () => void;
}

// Image Skeleton with shimmer effect
const ImageSkeleton = memo(() => {
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
  }, [shimmerAnim]);

  return (
    <Animated.View
      style={{
        opacity: shimmerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.4, 0.8],
        }),
      }}
      className="absolute inset-0 bg-gray-200"
    />
  );
});

ImageSkeleton.displayName = "ImageSkeleton";

// Thumbnail component with image validator
const ThumbnailItem = memo(({ 
  item, 
  index, 
  isSelected, 
  onPress 
}: { 
  item: ProductImage; 
  index: number; 
  isSelected: boolean; 
  onPress: () => void;
}) => {
  const thumbnailSource = item?.image;
  const { validImage: thumbValidImage, isLoading: thumbLoading, isValid: thumbValid } = useImageValidator(
    thumbnailSource || null
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`w-16 h-16 rounded-xl overflow-hidden mr-2 ${
        isSelected
          ? "border-2 border-primary-500"
          : "border border-gray-200"
      }`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isSelected ? 0.2 : 0.1,
        shadowRadius: 2,
        elevation: isSelected ? 3 : 1,
      }}
    >
      {thumbLoading ? (
        <View className="w-full h-full bg-gray-200" />
      ) : thumbValid && thumbValidImage ? (
        <Image
          source={getImageSource(thumbValidImage)!}
          className="w-full h-full"
          style={{ resizeMode: "cover" }}
        />
      ) : (
        <View className="w-full h-full bg-gray-200 items-center justify-center">
          <PhotoIcon size={20} color="#9CA3AF" />
        </View>
      )}
    </TouchableOpacity>
  );
});

ThumbnailItem.displayName = "ThumbnailItem";

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  onImagePress,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Get image sources array
  const imageSources = images?.map((img) => img?.image).filter(Boolean) || [];
  
  // Ensure selectedIndex is within bounds
  const safeSelectedIndex = Math.min(selectedIndex, imageSources.length - 1);
  const currentImageSource = imageSources[safeSelectedIndex] || imageSources[0] || null;
  
  // Use image validator for the selected image
  const { validImage, isLoading: imageLoading, isValid } = useImageValidator(
    currentImageSource
  );

  const hasImages = images && images.length > 0;

  // Update selectedIndex if it's out of bounds
  useEffect(() => {
    if (selectedIndex >= imageSources.length && imageSources.length > 0) {
      setSelectedIndex(0);
    }
  }, [selectedIndex, imageSources.length]);

  return (
    <View className="relative bg-white">
      {/* Main Image */}
      <View
        className="w-full bg-gray-50"
        style={{ height: screenWidth * 0.95 }}
      >
        <TouchableOpacity
          onPress={onImagePress}
          className="w-full h-full rounded-2xl"
          activeOpacity={0.9}
          disabled={!hasImages}
        >
          {imageLoading ? (
            <View className="w-full h-full relative rounded-2xl">
              <ImageSkeleton />
              <View className="absolute inset-0 items-center justify-center">
                <View className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-lg">
                  <View className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
                </View>
              </View>
            </View>
          ) : isValid && validImage ? (
            <Image
              source={getImageSource(validImage)!}
              className="w-full h-full rounded-2xl"
              style={{ resizeMode: "contain" }}
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-gray-50 rounded-2xl">
              <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4 shadow-lg">
                <PhotoIcon size={48} color="#9CA3AF" />
              </View>
              <Text className="text-base font-NunitoBold text-gray-600">
                No image available
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Dots Navigation */}
      {images && images.length > 1 && (
        <View className="absolute bottom-4 left-0 right-0 flex-row justify-center space-x-2 z-10">
          {images.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedIndex(index)}
              className={`w-2.5 h-2.5 rounded-full ${
                index === safeSelectedIndex ? "bg-primary-500" : "bg-white/60"
              }`}
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 3,
              }}
            />
          ))}
        </View>
      )}

      {/* Thumbnail Strip */}
      {images && images.length > 1 && (
        <View className="py-3 px-4 bg-gray-50 border-t border-gray-100">
          <FlatList
            data={images}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => String(item.id || item.image)}
            contentContainerStyle={{ paddingHorizontal: 4 }}
            renderItem={({ item, index }) => (
              <ThumbnailItem
                item={item}
                index={index}
                isSelected={safeSelectedIndex === index}
                onPress={() => setSelectedIndex(index)}
              />
            )}
          />
        </View>
      )}
    </View>
  );
};

export default ProductImageGallery;


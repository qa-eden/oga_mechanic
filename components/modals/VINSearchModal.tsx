import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  TextInput,
  Image,
} from "react-native";
import { XMarkIcon } from "react-native-heroicons/outline";
import CustomButton from "../CustomButton";
import { router } from "expo-router";
import { routes } from "@/constants/routes";
import { productsAPI, ProductListResponse } from "@/lib/api/products";

const { height: screenHeight } = Dimensions.get("window");

interface VINSearchModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const VINSearchModal: React.FC<VINSearchModalProps> = ({
  isVisible,
  onClose,
}) => {
  // 1GNEK13ZX3R298984
  const [vin, setVin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<ProductListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Slide up from bottom
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
      ]).start();
    } else {
      // Slide down to bottom
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const handleSubmit = async () => {
    if (!vin.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const results = await productsAPI.searchByVin(vin.trim());
      if (results && results.length > 0) {
        setSearchResult(results[0]);
      } else {
        setError("No vehicle found matching this VIN.");
      }
    } catch (err) {
      setError("Error searching for VIN. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = () => {
    if (!searchResult) return;
    onClose();
    router.push({
      pathname: routes.ProductDetail as any,
      params: { id: searchResult.id }
    });
  };

  const handleReset = () => {
    setSearchResult(null);
    setVin("");
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none" // Custom animation
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end relative">
        {/* Animated Background Overlay */}
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="absolute inset-0 bg-black/50"
        >
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        {/* Animated Bottom Sheet */}
        <Animated.View
          style={{ transform: [{ translateY: slideAnim }] }}
          className="bg-white rounded-t-3xl overflow-hidden w-full"
        >
          {/* Header */}
          <View className="flex-row justify-between items-center px-6 py-5 border-b border-gray-100">
            <Text className="text-xl font-NunitoExtraBold text-gray-900">
              Search by VIN
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
            >
              <XMarkIcon size={20} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View className="px-6 py-6 pb-10">
            {searchResult ? (
              <View>
                <Text className="text-gray-900 font-NunitoExtraBold text-lg mb-4">Result Found</Text>
                
                <View className="bg-gray-50 rounded-2xl p-4 mb-6 flex-row items-center border border-gray-100">
                  <Image 
                    source={{ uri: searchResult.images?.[0]?.image || "https://via.placeholder.com/150" }} 
                    className="w-20 h-20 rounded-xl"
                    resizeMode="cover"
                  />
                  <View className="ml-4 flex-1">
                    <Text className="text-gray-900 font-NunitoBold text-base" numberOfLines={2}>
                      {searchResult.name}
                    </Text>
                    <Text className="text-gray-500 font-NunitoMedium text-sm mt-1">
                      {searchResult.category?.name}
                    </Text>
                    <Text className="text-[#189804] font-NunitoExtraBold text-lg mt-1">
                      ₦{parseFloat(searchResult.price).toLocaleString()}
                    </Text>
                  </View>
                </View>

                <CustomButton
                  title="View"
                  onPress={handleView}
                  className="mb-3"
                />
                <TouchableOpacity onPress={handleReset} className="items-center py-3">
                  <Text className="text-gray-500 font-NunitoBold">Search Another VIN</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text className="text-gray-500 font-NunitoMedium mb-6">
                  Enter the Vehicle Identification Number (VIN) to quickly search for car details and products.
                </Text>

                <View className="mb-2">
                  <Text className="text-sm font-medium text-gray-700 mb-2">Vehicle VIN</Text>
                  <TextInput
                    value={vin}
                    onChangeText={(t) => { setVin(t); setError(null); }}
                    placeholder="Enter VIN e.g 1GNEK13ZX3R298984"
                    className="border border-gray-400 rounded-xl px-4 py-4 text-base text-gray-900 bg-gray-50"
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>

                {error ? (
                  <Text className="text-red-500 text-sm mb-4 font-NunitoMedium">{error}</Text>
                ) : (
                  <View className="mb-4" />
                )}

                <CustomButton
                  title={isLoading ? "Searching..." : "Search VIN"}
                  onPress={handleSubmit}
                  disabled={vin.trim().length === 0 || isLoading}
                  className="mt-2"
                />
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default VINSearchModal;

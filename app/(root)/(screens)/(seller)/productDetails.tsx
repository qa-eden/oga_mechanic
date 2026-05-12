import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Animated, Linking, Platform } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { 
  ArrowLeftIcon, 
  TrashIcon, 
  PencilSquareIcon,
  IdentificationIcon,
  TagIcon,
  CalendarDaysIcon,
  CogIcon,
  BeakerIcon,
  UsersIcon,
  PaintBrushIcon,
  CheckBadgeIcon,
  BoltIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon
} from 'react-native-heroicons/outline'
import { SparklesIcon, StarIcon } from 'react-native-heroicons/solid'
import { icons } from '@/constants'
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { NairaCurrency } from '@/utils/useCurrencyFormatter'
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal'
import LoadingSpinner from '@/components/LoadingSpinner'
import { sellerRoutes } from '@/constants/routes'
import { productsAPI } from '@/lib/api/products'
import { useProductBids, useUpdateBid } from '@/hooks/useProducts'
import MerchantBidActionModal from '@/components/modals/MerchantBidActionModal'
import { formatDistanceToNow } from 'date-fns'
import CustomButton from '@/components/CustomButton'

const { width: screenWidth } = Dimensions.get("window");

const ProductDetails = () => {
  const { productType, productId } = useLocalSearchParams<{
    productType: 'sparePart' | 'car' | 'rentedCar';
    productId: string;
  }>();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const [selectedBid, setSelectedBid] = useState<any>(null);
  const [showBidActionModal, setShowBidActionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bids if auction is active
  const { data: bidsData } = useProductBids(productData?.bidding_window?.id || '');
  const bids = bidsData?.data || [];

  // Bid update mutation
  const updateBidMutation = useUpdateBid(productData?.bidding_window?.id || '');

  const handleBidClick = (bid: any) => {
    setSelectedBid(bid);
    setShowBidActionModal(true);
  };

  const handleBidStatusUpdate = async (status: 'accepted' | 'rejected') => {
    if (!selectedBid) return;
    
    return updateBidMutation.mutateAsync({
      bidId: selectedBid.id,
      payload: { status }
    });
  };

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;

  // Fetch product details from API
  const fetchProductDetails = async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getProductById(productId);
      setProductData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  // Refetch function to reload data after successful operations
  const refetchProductDetails = async () => {
    await fetchProductDetails();
  };

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  // Track if this is the initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Refetch data when screen comes into focus (e.g., returning from edit screens)
  useFocusEffect(
    React.useCallback(() => {
      // Only refetch if this is NOT the initial load
      if (!isInitialLoad) {
        refetchProductDetails();
      } else {
        setIsInitialLoad(false);
      }
    }, [isInitialLoad])
  );

  // Animation effects - only start when data is loaded
  useEffect(() => {
    if (productData && !loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [productData, loading]);

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  const handleEdit = () => {
    if (!productData) return;

    router.push({
      pathname: sellerRoutes?.editCarToRent,
      params: {
        editMode: 'true',
        isEditing: 'true',
        productId: productData.id,
        productData: JSON.stringify(productData)
      }
    });
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);

    if (!productData?.id) return;

    try {
      setLoading(true);
      await productsAPI.deleteProduct(productData.id);

      let itemType = 'sparePart';
      if (productData?.is_rental) {
        itemType = 'rentedCar';
      } else if (productData?.category?.name?.toLowerCase().includes('car')) {
        itemType = 'car';
      }

      setTimeout(() => {
        router.push({
          pathname: sellerRoutes.deleteSuccess as any,
          params: { itemType }
        });
      }, 300);

    } catch (error) {
      setError('Failed to delete product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Spec Item Component
  const SpecItem = ({ icon: Icon, label, value, colorClass }: { icon: any, label: string, value: string, colorClass: string }) => (
    <View className="bg-gray-50 rounded-2xl p-4 flex-1 min-w-[45%] border border-gray-100 flex-row items-center">
      <View className={`w-10 h-10 rounded-xl ${colorClass} items-center justify-center mr-3 shadow-sm`}>
        <Icon size={20} color="white" />
      </View>
      <View>
        <Text className="text-gray-400 text-[10px] font-NunitoBold uppercase tracking-wider mb-0.5">{label}</Text>
        <Text className="text-gray-900 font-NunitoExtraBold text-[13px] capitalize" numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );

  // Feature Item Component
  const FeatureItem = ({ label, isSafety = false }: { label: string, isSafety?: boolean }) => (
    <View className={`${isSafety ? 'bg-blue-50/50 border-blue-100' : 'bg-green-50/50 border-green-100'} border rounded-xl px-3 py-2 flex-row items-center mr-2 mb-2`}>
      {isSafety ? (
        <ShieldCheckIcon size={14} color="#3B82F6" />
      ) : (
        <CheckBadgeIcon size={14} color="#10B981" />
      )}
      <Text className={`ml-1.5 text-[12px] font-NunitoBold ${isSafety ? 'text-blue-700' : 'text-green-700'}`}>{label}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <LoadingSpinner message="Refining Details..." size="medium" />
      </SafeAreaView>
    );
  }

  if (error || !productData) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <View className="flex-1 items-center justify-center px-8">
          <View className="bg-gray-50 rounded-[32px] p-10 items-center border border-gray-100 shadow-sm">
            <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-6 shadow-md shadow-gray-200">
              <BoltIcon size={40} color="#6B7280" />
            </View>
            <Text className="text-gray-900 font-NunitoExtraBold text-xl mb-2">Something went wrong</Text>
            <Text className="text-gray-500 text-center mb-8 leading-5 font-NunitoMedium">
              {error || "We couldn't find the vehicle you're looking for. It might have been removed."}
            </Text>
            <TouchableOpacity onPress={() => router.back()} className="bg-primary-500 px-8 py-4 rounded-2xl shadow-lg shadow-primary-200">
              <Text className="text-white font-NunitoExtraBold">Back to Fleet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Modern Header */}
      <View className="flex-row items-center justify-between bg-white px-6 py-4 border-b border-gray-50">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center"
        >
          <ArrowLeftIcon size={20} color="#000" />
        </TouchableOpacity>
        <Text className="text-[17px] font-NunitoExtraBold text-gray-900">
          {productData.is_rental ? 'Rental Details' : 'Vehicle Details'}
        </Text>
        <TouchableOpacity 
          onPress={handleEdit}
          className="w-10 h-10 bg-primary-50 rounded-full items-center justify-center"
        >
          <PencilSquareIcon size={18} color="#D30309" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Premium Image Gallery */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }} className="relative bg-white pb-6 pt-2">
          <View className="mx-4 bg-white rounded-[32px] overflow-hidden shadow-2xl shadow-gray-400/30 border border-gray-50">
            <View className="w-full h-[280px] bg-gray-50">
              {productData.images && productData.images.length > 0 && !imageErrors.has(selectedImageIndex) ? (
                <Image
                  source={{ uri: productData.images[selectedImageIndex].image }}
                  className="w-full h-full"
                  resizeMode="cover"
                  onError={() => handleImageError(selectedImageIndex)}
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <PhotoIcon size={64} color="#E5E7EB" />
                  <Text className="text-gray-400 font-NunitoBold mt-2">No Visuals Available</Text>
                </View>
              )}
            </View>

            {/* Category Overlay */}
            <View className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50">
              <Text className="text-[10px] font-NunitoExtraBold text-gray-900 uppercase tracking-widest">
                {productData.body_type?.replace('_', ' ') || 'Vehicle'}
              </Text>
            </View>

            {/* Image Navigation */}
            {productData.images && productData.images.length > 1 && (
              <View className="absolute bottom-4 inset-x-0 flex-row justify-between px-4">
                <TouchableOpacity
                  onPress={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                  className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full items-center justify-center"
                  disabled={selectedImageIndex === 0}
                >
                  <ChevronLeftIcon size={20} color={selectedImageIndex === 0 ? "#D1D5DB" : "#000"} />
                </TouchableOpacity>
                <View className="flex-row items-center space-x-1.5 bg-black/20 backdrop-blur-md px-3 rounded-full">
                  {productData.images.map((_: any, index: number) => (
                    <View 
                      key={index} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${index === selectedImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} 
                    />
                  ))}
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedImageIndex(Math.min(productData.images.length - 1, selectedImageIndex + 1))}
                  className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full items-center justify-center"
                  disabled={selectedImageIndex === productData.images.length - 1}
                >
                  <ChevronRightIcon size={20} color={selectedImageIndex === productData.images.length - 1 ? "#D1D5DB" : "#000"} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Content Section */}
        <Animated.View 
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          className="px-5 pt-2 pb-10"
        >
          {/* Main Info Card */}
          <View className="bg-white rounded-[26px] p-4 shadow-xs border border-gray-200 mb-4">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-[22px] font-NunitoExtraBold text-gray-900 leading-tight mb-2">
                  {productData.name}
                </Text>
                <View className="flex-row items-center">
                  <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded-lg">
                    <StarIcon size={14} color="#F59E0B" />
                    <Text className="text-gray-900 font-NunitoExtraBold text-[12px] ml-1">{productData.rating || '5.0'}</Text>
                  </View>
                  <Text className="text-gray-400 text-[12px] font-NunitoBold ml-2">
                    {productData.reviews?.length || 0} Professional Reviews
                  </Text>
                </View>
              </View>
            </View>

            {/* Premium Pricing Block */}
            <View className="bg-primary-50 rounded-[24px] p-4 flex-row items-center justify-between border border-primary-100/50">
              <View>
                <Text className="text-primary-400 font-NunitoBold text-[10px] uppercase tracking-widest mb-1">
                  {productData.is_rental ? 'Rental Daily Rate' : 'Market Price'}
                </Text>
                <View className="flex-row items-baseline">
                  <Text className="text-primary-700 font-NunitoExtraBold text-[28px]">
                    ₦{parseFloat(productData.price).toLocaleString()}
                  </Text>
                  {productData.is_rental && (
                    <Text className="text-primary-400 font-NunitoBold text-[14px] ml-1">/day</Text>
                  )}
                </View>
              </View>
              {productData.stock > 0 && (
                <View className="bg-white/60 backdrop-blur-md px-3 py-2 rounded-2xl border border-white">
                  <Text className="text-primary-600 font-NunitoExtraBold text-[11px]">
                    {productData.stock} In Stock
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Specifications Grid */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4 px-1">
              <Text className="text-[17px] font-NunitoExtraBold text-gray-900">Specifications</Text>
              <CogIcon size={18} color="#9CA3AF" />
            </View>
            <View className="flex-row flex-wrap gap-3">
              {productData.transmission && (
                <SpecItem icon={BoltIcon} label="Gear" value={productData.transmission} colorClass="bg-orange-500" />
              )}
              {productData.fuel_type && (
                <SpecItem icon={BeakerIcon} label="Energy" value={productData.fuel_type} colorClass="bg-blue-500" />
              )}
              {productData.number_of_seats && (
                <SpecItem icon={UsersIcon} label="Capacity" value={`${productData.number_of_seats} Seats`} colorClass="bg-purple-500" />
              )}
              {productData.exterior_color && (
                <SpecItem icon={PaintBrushIcon} label="Exterior" value={productData.exterior_color} colorClass="bg-gray-700" />
              )}
              {productData.year && (
                <SpecItem icon={CalendarDaysIcon} label="Model Year" value={productData.year.toString()} colorClass="bg-green-500" />
              )}
              {productData.condition && (
                <SpecItem icon={CheckBadgeIcon} label="Condition" value={productData.condition} colorClass="bg-indigo-500" />
              )}
            </View>
          </View>

          {/* Features Section */}
          <View className="mb-8 bg-white rounded-[26px] p-4 shadow-xs border border-gray-200">
            <View className="flex-row items-center mb-5">
              <SparklesIcon size={20} color="#D30309" />
              <Text className="text-[17px] font-NunitoExtraBold text-gray-900 ml-2.5">Key Features</Text>
            </View>
            
            <View className="mb-4">
              <Text className="text-[11px] font-NunitoExtraBold text-gray-400 uppercase tracking-widest mb-3">Amenities</Text>
              <View className="flex-row flex-wrap">
                {productData.air_conditioning && <FeatureItem label="A/C System" />}
                {productData.leather_seats && <FeatureItem label="Leather Interior" />}
                {productData.navigation_system && <FeatureItem label="GPS Navigation" />}
                {productData.bluetooth && <FeatureItem label="Premium Audio" />}
                {productData.parking_sensors && <FeatureItem label="Proximity Sensors" />}
                {productData.sunroof && <FeatureItem label="Panoramic Roof" />}
              </View>
            </View>

            <View>
              <Text className="text-[11px] font-NunitoExtraBold text-gray-400 uppercase tracking-widest mb-3">Safety & Assistance</Text>
              <View className="flex-row flex-wrap">
                {productData.airbags && <FeatureItem label="Dual Airbags" isSafety />}
                {productData.abs && <FeatureItem label="ABS Braking" isSafety />}
                {productData.traction_control && <FeatureItem label="Traction Control" isSafety />}
                {productData.lane_assist && <FeatureItem label="Lane Departure" isSafety />}
                {productData.blind_spot_monitor && <FeatureItem label="Blind Spot Monitoring" isSafety />}
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View className="mb-4 px-1">
            <Text className="text-[17px] font-NunitoExtraBold text-gray-900 mb-3">Vehicle Narrative</Text>
            <View className="bg-white rounded-[24px] p-4 border border-gray-200 shadow-xs">
              <Text className="text-gray-500 font-NunitoMedium leading-6 text-[14px]">
                {productData.description || "No narrative provided for this vehicle. Contact merchant for detailed operational requirements and terms."}
              </Text>
            </View>
          </View>

          {/* Action Footer */}
          <View className="mt-4 space-y-3">
            <TouchableOpacity 
              onPress={handleEdit}
              className="bg-gray-900 rounded-[22px] py-4 items-center shadow-lg shadow-gray-300"
            >
              <View className="flex-row items-center">
                <PencilSquareIcon size={18} color="white" />
                <Text className="text-white font-NunitoExtraBold text-[16px] ml-2">Edit Vehicle Details</Text>
              </View>
            </TouchableOpacity>

            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity 
                onPress={() => {
                  router.push({
                    pathname: sellerRoutes.editImage as any,
                    params: { productId: productData.id, productData: JSON.stringify(productData) }
                  });
                }}
                className="flex-1 bg-white border border-gray-200 rounded-[22px] py-4 items-center"
              >
                <View className="flex-row items-center">
                  <PhotoIcon size={18} color="#4B5563" />
                  <Text className="text-gray-700 font-NunitoExtraBold text-[14px] ml-2">Images</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleDelete}
                className="flex-1 bg-red-50 border border-red-100 rounded-[22px] py-4 items-center"
              >
                <View className="flex-row items-center">
                  <TrashIcon size={18} color="#D30309" />
                  <Text className="text-red-600 font-NunitoExtraBold text-[14px] ml-2">Delete</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        itemType={productData?.is_rental ? 'rentedCar' : 'car'}
        itemName={productData?.name || ''}
      />
    </SafeAreaView>
  );
};

export default ProductDetails;

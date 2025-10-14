"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useState, useRef, useEffect, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { images } from "@/constants";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import {
  CheckIcon,
} from "react-native-heroicons/outline";
import { LinearGradient } from "expo-linear-gradient";
import { useState as useLocalState } from "react";
import CustomButton from "@/components/CustomButton";
import BackArrowBtn from "@/components/BackArrowBtn";
import PaymentMethodModal from "@/components/modals/PaymentMethodModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import { routes } from "@/constants/routes";
import CartItemCard from "@/components/cards/CartItemCard";
import { useCart, useUpdateCartItem, useRemoveFromCart, useUpdateCartItemQuantity } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useProducts";
import { getErrorMessage } from "@/utils/errorMessages";

const { width: screenWidth } = Dimensions.get("window");

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image: any; // <-- change from string to any
  originalPrice?: number;
  discount?: number;
}

const Cart = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loadingItems, setLoadingItems] = useState<Set<number>>(new Set());

  // Cart API hooks
  const { 
    data: cartData, 
    isLoading: cartLoading, 
    error: cartError, 
    refetch: refetchCart 
  } = useCart();
  
  const updateCartItemMutation = useUpdateCartItem();
  const removeFromCartMutation = useRemoveFromCart();
  const updateCartItemQuantityMutation = useUpdateCartItemQuantity();
  const checkoutMutation = useCheckout();

  // Transform API data to local format for compatibility
  const cartItems: CartItem[] = (() => {
    try {
      // Check if cart data exists and has items
      if (!cartData?.data) {
        console.log('🛒 No cart data available');
        return [];
      }
      
      if (!cartData.data.items || !Array.isArray(cartData.data.items)) {
        console.log('🛒 No items array in cart data:', cartData.data);
        return [];
      }
      
      return cartData.data.items
        .filter((item) => {
          // Filter out invalid items
          if (!item) {
            console.warn('⚠️ Cart item is null/undefined');
            return false;
          }
          
          return true;
        })
        .map((item) => ({
          id: parseInt(item.id || '0'),
          name: item.product?.name || `Product ${item.id}`, // Fallback to product ID
          price: parseFloat(item.product?.price || '0'),
          originalPrice: item.product?.original_price ? parseFloat(item.product.original_price) : undefined,
          discount: item.product?.discount || 0,
          quantity: item.quantity || 1,
          stock: item.product?.stock || 0,
          image: item.product?.images?.[0]?.image || images.cartImg,
        }));
    } catch (error) {
      console.error('❌ Error transforming cart items:', error);
      return [];
    }
  })();

  // Debug: Log cart data structure
  console.log('🛒 Cart API Response:', cartData);
  console.log('🛒 Cart Items:', cartItems);
  
  // Note: The cart API only returns item IDs and quantities, not full product details
  // For a complete cart experience, we would need to:
  // 1. Fetch product details for each cart item ID separately, or
  // 2. Modify the cart API to include product details in the response

  const deliveryFee = 2000;
  // const fadeAnim = useRef(new Animated.Value(1)).current;
  // const slideAnim = useRef(new Animated.Value(0)).current;
  // const scaleAnim = useRef(new Animated.Value(1)).current;
  // const bounceAnim = useRef(new Animated.Value(1)).current;

  const itemSlideAnim = useRef(new Animated.Value(50)).current;
  const itemFadeAnim = useRef(new Animated.Value(0)).current;

  const [selectedItems, setSelectedItems] = useLocalState<number[]>([]);
  const [selectAll, setSelectAll] = useLocalState(false);

  const bounceAnims = useRef<{ [id: number]: Animated.Value }>({}).current;
  cartItems.forEach((item) => {
    if (!bounceAnims[item.id]) bounceAnims[item.id] = new Animated.Value(1);
  });

  const slideAnims = useRef<{ [id: number]: Animated.Value }>({}).current;
  const fadeAnims = useRef<{ [id: number]: Animated.Value }>({}).current;
  cartItems.forEach((item) => {
    if (!slideAnims[item.id]) slideAnims[item.id] = new Animated.Value(0);
    if (!fadeAnims[item.id]) fadeAnims[item.id] = new Animated.Value(1);
  });

  // Staggered animation for cart items
  useEffect(() => {
    const animations = cartItems.map((_, index) =>
      Animated.timing(new Animated.Value(0), {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true,
      })
    );

    Animated.stagger(100, animations).start();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(itemSlideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(itemFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const updateQuantity = (id: number, change: number) => {
    // Find the cart item and determine action
    const cartItem = cartItems.find(item => item.id === id);
    if (cartItem) {
      // Check if we can increment/decrement based on stock
      const canIncrement = change > 0 && cartItem.quantity < cartItem.stock;
      const canDecrement = change < 0 && cartItem.quantity > 1;
      
      if ((change > 0 && canIncrement) || (change < 0 && canDecrement)) {
        // Add item to loading state
        setLoadingItems(prev => new Set(prev).add(id));
        
        // Find the original API item and get the product ID
        const apiItem = cartData?.data?.items?.find(item => parseInt(item.id) === id);
        if (apiItem && apiItem.product?.id) {
          // Use the product ID from the product object
          updateCartItemQuantityMutation.mutate({
            productId: apiItem.product.id, // Using actual product ID
            action: change > 0 ? "increment" : "decrement"
          }, {
            onSuccess: () => {
              // Remove from loading state on success
              setLoadingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
              });
              
              // Bounce animation for quantity change
              Animated.sequence([
                Animated.timing(bounceAnims[id], {
                  toValue: 1.2,
                  duration: 150,
                  useNativeDriver: true,
                }),
                Animated.timing(bounceAnims[id], {
                  toValue: 1,
                  duration: 150,
                  useNativeDriver: true,
                }),
              ]).start();
            },
            onError: () => {
              // Remove from loading state on error
              setLoadingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
              });
            }
          });
        }
      }
    }
  };

  const removeItem = (id: number) => {
    // Add item to loading state
    setLoadingItems(prev => new Set(prev).add(id));
    
    // Find the original API item and get the product ID
    const apiItem = cartData?.data?.items?.find(item => parseInt(item.id) === id);
    if (apiItem && apiItem.product?.id) {
      // Use the product ID from the product object
      removeFromCartMutation.mutate(apiItem.product.id, {
        onSuccess: () => {
          // Remove from loading state on success
          setLoadingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
          
          // Start delete animation after successful API call
          Animated.parallel([
            Animated.timing(slideAnims[id], {
              toValue: -screenWidth,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnims[id], {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Reset animations for future use
            slideAnims[id].setValue(0);
            fadeAnims[id].setValue(1);
          });
        },
        onError: () => {
          // Remove from loading state on error
          setLoadingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        }
      });
    }
  };

  // Only calculate for selected items
  const selectedCartItems = cartItems.filter((item) =>
    selectedItems.includes(item.id)
  );
  const calculateTotal = () => {
    return selectedCartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateSubTotal = () => {
    // Only add delivery fee if at least one item is selected
    return selectedCartItems.length > 0 ? calculateTotal() + deliveryFee : 0;
  };

  const calculateSavings = () => {
    return selectedCartItems.reduce((savings, item) => {
      if (item.originalPrice) {
        return savings + (item.originalPrice - item.price) * item.quantity;
      }
      return savings;
    }, 0);
  };

  const handleMakePayment = () => {
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
      setShowPaymentModal(true);
      // router.push("/(root)/(screens)/payment");
    }, 1500);
  };

  // Pull to refresh function
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchCart();
      console.log('Cart data refreshed');
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchCart]);

  // Handle select all functionality
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
      setSelectAll(true);
    }
  };

  const handlePaymentMethodSelect = (paymentMethod: string) => {
    setShowPaymentModal(false);

    if (paymentMethod === "online") {
      
      checkoutMutation.mutate(paymentMethod, {
        onSuccess: (response) => {
          setIsLoading(false);
          
          // Trigger cart refresh after successful checkout
          refetchCart();
          
          // Check if payment_url exists in response
          if (response?.data?.payment_url) {
            // Navigate to payment screen with WebView
            router.push({
              pathname: "/(root)/(screens)/(user)/payment",
              params: {
                paymentUrl: response.data.payment_url,
                orderId: response.data.id,
                totalAmount: response.data.total_amount,
                paymentReference: response.data.payment_reference
              }
            });
          } else {
            // Fallback if no payment URL
            alert("Payment initialized successfully!");
          }
        },
        onError: (error) => {
          console.error("❌ Online payment failed:", error);
          setIsLoading(false);
          // Show error message
          alert("Payment failed. Please try again.");
        }
      });
    } else if (paymentMethod === "cash_on_delivery") {
      // Handle cash on delivery with API call
      console.log("🔄 Processing cash on delivery...");
      
      checkoutMutation.mutate(paymentMethod, {
        onSuccess: (response) => {
          console.log("✅ Cash on delivery successful:", response);
          setIsLoading(false);
          
          // Trigger cart refresh after successful checkout
          refetchCart();
          
          // Show success message but don't navigate yet
          alert("Cash on delivery order created successfully!");
        },
        onError: (error) => {
          console.error("❌ Cash on delivery failed:", error);
          setIsLoading(false);
          // Show error message
          alert("Order creation failed. Please try again.");
        }
      });
    } else {
      // Handle legacy payment methods (if any)
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        if (paymentMethod === "transfer") {
          router.push(routes?.bankTransfer);
        } else {
          router.push(routes?.cardPayment);
        }
      }, 1500);
    }
  };

  const renderCartItem = ({ item, index }: { item: CartItem; index: number }) => (
    <CartItemCard
      item={item}
      index={index}
      isSelected={selectedItems.includes(item.id)}
      fadeAnim={fadeAnims[item.id]}
      slideAnim={slideAnims[item.id]}
      bounceAnim={bounceAnims[item.id]}
      isLoading={loadingItems.has(item.id)}
      onSelect={(id) => {
        setSelectedItems((prev) =>
          prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
      }}
      onRemove={removeItem}
      onUpdateQuantity={updateQuantity}
      onPress={() => {
        const apiItem = cartData?.data?.items?.find(i => parseInt(i.id) === item.id);
        if (apiItem?.product?.id) {
          router.push({
            pathname: routes.ProductDetail,
            params: {
              productId: apiItem.product.id.toString(),
            },
          });
        }
      }}
    />
  );

  // Loading state
  if (cartLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <LinearGradient
          colors={["#FFFFFF", "#F8FAFC"]}
          className="border-b border-gray-100"
        >
          <View className="flex-row items-center justify-between px-5 py-4">
            <BackArrowBtn />
            <View className="items-center">
              <Text className="text-xl font-NunitoExtraBold text-gray-900">
                My Cart
              </Text>
              <Text className="text-sm text-gray-500">Loading...</Text>
            </View>
            <View className="w-12" />
          </View>
        </LinearGradient>
        <LoadingSpinner 
          message="Loading your cart" 
          subMessage="Please wait while we fetch your items"
          size="medium"
        />
      </SafeAreaView>
    );
  }

  // Error state
  if (cartError) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <LinearGradient
          colors={["#FFFFFF", "#F8FAFC"]}
          className="border-b border-gray-100"
        >
          <View className="flex-row items-center justify-between px-5 py-4">
            <BackArrowBtn />
            <View className="items-center">
              <Text className="text-xl font-NunitoExtraBold text-gray-900">
                My Cart
              </Text>
              <Text className="text-sm text-gray-500">Error</Text>
            </View>
            <View className="w-12" />
          </View>
        </LinearGradient>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-red-500 text-center text-lg mb-4">
            {getErrorMessage(cartError)}
          </Text>
          <TouchableOpacity
            onPress={() => refetchCart()}
            className="bg-primary-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-NunitoBold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Empty cart state - check if cart exists but has no items
  if (!cartData?.data || cartItems.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <LinearGradient
          colors={["#FFFFFF", "#F8FAFC"]}
          className="border-b border-gray-100"
        >
          <View className="flex-row items-center justify-between px-5 py-4">
            <BackArrowBtn />
            <View className="items-center">
              <Text className="text-xl font-NunitoExtraBold text-gray-900">
                My Cart
              </Text>
              <Text className="text-sm text-gray-500">0 items</Text>
            </View>
            <View className="w-12" />
          </View>
        </LinearGradient>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-gray-600 text-center text-lg mb-4">
            Your cart is empty
          </Text>
          <Text className="text-gray-400 text-center mb-6">
            Add some products to get started
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-NunitoBold">Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={["#FFFFFF", "#F8FAFC"]}
        className="border-b border-gray-100"
      >
        <View className="flex-row items-center justify-between px-5 py-4">
          <BackArrowBtn />

          <View className="items-center">
            <Text className="text-xl font-NunitoExtraBold text-gray-900">
              My Cart
            </Text>
            <Text className="text-sm text-gray-500">
              {cartItems.length} items
            </Text>
          </View>

          <View className="w-12" />
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#D30309']} // Android
            tintColor="#D30309" // iOS
            title="Pull to refresh"
            titleColor="#666"
          />
        }
      >
        {/* Savings Banner */}
        {calculateSavings() > 0 && (
          <View className="mx-5 mt-4 mb-2">
            <LinearGradient
              colors={["#10B981", "#059669"]}
              style={{
                borderTopWidth: 1,
                borderTopColor: "#e5e7eb",
                padding: 8, // p-4 is 16px
                borderRadius: 12, // rounded-2xl is 16px
              }}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white font-NunitoBold text-base">
                    🎉 You're saving!
                  </Text>
                  <Text className="text-white/90 text-sm">
                    Total discount on this order
                  </Text>
                </View>
                <NairaCurrency
                  value={calculateSavings()}
                  className="text-white font-NunitoExtraBold text-lg"
                />
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Cart Items */}
        <View className="pt-4">
          {/* Select All Button */}
          <View className="mx-5 mb-2 flex-row items-center">
            <TouchableOpacity
              onPress={handleSelectAll}
              className="flex-row items-center"
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: selectAll ? "#111" : "#fff",
                borderWidth: 2,
                borderColor: "#111",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              {selectAll && <CheckIcon size={18} color="#fff" />}
            </TouchableOpacity>
            <Text className="text-base font-NunitoBold text-gray-900">
              Select All ({cartItems.length} items)
            </Text>
          </View>

          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews={true}
          />
        </View>

        {/* Empty space for better scrolling */}
        <View className="h-10" />
      </ScrollView>

      {/* Enhanced Bottom Summary */}
      <LinearGradient
        colors={["#FFFFFF", "#F8FAFC"]}
        style={{ borderTopWidth: 1, borderTopColor: "#e5e7eb" }} // #e5e7eb is Tailwind's gray-200
        className=""
      >
        <View className="px-3 pb-6">
          {/* Summary Details */}
          <View className="p-4">
            {/* Items Total */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-base font-NunitoMedium text-gray-600">
                Items (
                {selectedCartItems.reduce(
                  (sum, item) => sum + item.quantity,
                  0
                )}
                )
              </Text>
              <NairaCurrency
                value={calculateTotal()}
                className="text-base font-NunitoBold text-gray-900"
              />
            </View>

            {/* Savings */}
            {calculateSavings() > 0 && (
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-base font-NunitoMedium text-green-600">
                  Savings
                </Text>
                <Text className="text-base font-NunitoBold text-green-600">
                  -₦{calculateSavings().toLocaleString()}
                </Text>
              </View>
            )}

            {/* Delivery Fee */}
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base font-NunitoMedium text-gray-600">
                Delivery fee
              </Text>
              <NairaCurrency
                value={deliveryFee}
                className="text-base font-NunitoBold text-gray-900"
              />
            </View>

            {/* Divider */}
            <View className="h-px bg-gray-200 my-3" />

            {/* Sub Total */}
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-NunitoBold text-gray-900">
                Total
              </Text>
              <NairaCurrency
                value={calculateSubTotal()}
                className="text-xl font-NunitoExtraBold text-primary-500"
              />
            </View>
          </View>

          <CustomButton
            title={`Make Payment ₦${calculateSubTotal().toLocaleString()}`}
            onPress={handleMakePayment}
            className=""
            bgVariant="primary"
            loading={isLoading}
            loadingText="Processing"
            disabled={selectedCartItems.length === 0}
          />

          {/* Security Badge */}
          <View className="flex-row items-center justify-center mt-3">
            <View className="w-4 h-4 bg-green-500 rounded-full mr-2" />
            <Text className="text-sm text-gray-500">
              🔒 Secure payment guaranteed
            </Text>
          </View>
        </View>
      </LinearGradient>

      <PaymentMethodModal
        isVisible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSelectPayment={handlePaymentMethodSelect}
        totalAmount={calculateSubTotal()}
      />
    </SafeAreaView>
  );
};

export default Cart;

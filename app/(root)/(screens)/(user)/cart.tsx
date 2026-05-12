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
import { useState, useRef, useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import { LinearGradient } from "expo-linear-gradient";
import CustomButton from "@/components/CustomButton";
import BackArrowBtn from "@/components/BackArrowBtn";
import PaymentMethodModal from "@/components/modals/PaymentMethodModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import { routes } from "@/constants/routes";
import CartItemCard from "@/components/cards/CartItemCard";
import { useCart, useRemoveFromCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useProducts";
import { getApiErrorMessage } from "@/utils/errorMessages";
import AndroidNavBarSpacer from "@/components/AndroidNavBarSpacer";
import { useDebouncedQuantityUpdate } from "@/hooks/useDebouncedQuantityUpdate";

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
  const [removeLoadingItems, setRemoveLoadingItems] = useState<Set<number>>(new Set());

  // Cart API hooks
  const {
    data: cartData,
    isLoading: cartLoading,
    error: cartError,
    refetch: refetchCart
  } = useCart();

  const removeFromCartMutation = useRemoveFromCart();
  const checkoutMutation = useCheckout();

  // Debounced quantity update hook
  const {
    updateQuantity: debouncedUpdateQuantity,
    getDisplayQuantity,
    isItemLoading,
    cleanup: cleanupDebouncedUpdates,
  } = useDebouncedQuantityUpdate({
    debounceMs: 800,
    onSuccess: () => {
      refetchCart();
    },
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupDebouncedUpdates();
    };
  }, [cleanupDebouncedUpdates]);

  // Transform API data to local format for compatibility
  const cartItems: CartItem[] = (() => {
    try {
      if (!cartData?.data?.items || !Array.isArray(cartData.data.items)) {
        return [];
      }

      return cartData.data.items
        .filter((item) => !!item)
        .map((item) => ({
          id: parseInt(item.id || '0'),
          name: item.product?.name || `Product ${item.id}`,
          price: parseFloat(item.product?.price || '0'),
          originalPrice: item.product?.original_price ? parseFloat(item.product.original_price) : undefined,
          discount: item.product?.discount || 0,
          quantity: item.quantity || 1,
          stock: item.product?.stock || 0,
          image: item.product?.images?.[0]?.image,
        }));
    } catch (error) {
      return [];
    }
  })();

  const deliveryFee = 0; // Free delivery

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



  const updateQuantity = (id: number, change: number) => {
    // Find the cart item and determine action
    const cartItem = cartItems.find(item => item.id === id);
    if (!cartItem) return;

    // Find the original API item and get the product ID
    const apiItem = cartData?.data?.items?.find(item => parseInt(item.id) === id);
    if (!apiItem?.product?.id) return;

    // Use the debounced update - it handles stock limits internally
    debouncedUpdateQuantity(
      id,
      apiItem.product.id,
      cartItem.quantity,
      change,
      cartItem.stock
    );

    // Bounce animation for immediate feedback
    Animated.sequence([
      Animated.timing(bounceAnims[id], {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnims[id], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const removeItem = (id: number) => {
    // Add item to loading state
    setRemoveLoadingItems(prev => new Set(prev).add(id));

    // Find the original API item and get the product ID
    const apiItem = cartData?.data?.items?.find(item => parseInt(item.id) === id);
    if (apiItem && apiItem.product?.id) {
      // Use the product ID from the product object
      removeFromCartMutation.mutate(apiItem.product.id, {
        onSuccess: () => {
          // Remove from loading state on success
          setRemoveLoadingItems(prev => {
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
          setRemoveLoadingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        }
      });
    }
  };

  // Calculate totals for all cart items (no selection needed)
  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateSubTotal = () => {
    return cartItems.length > 0 ? calculateTotal() + deliveryFee : 0;
  };

  const calculateSavings = () => {
    return cartItems.reduce((savings, item) => {
      if (item.originalPrice) {
        return savings + (item.originalPrice - item.price) * item.quantity;
      }
      return savings;
    }, 0);
  };

  const getTotalQuantity = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleMakePayment = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowPaymentModal(true);
    }, 500);
  };

  // Pull to refresh function
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetchCart();
    } catch (error) {
      // Handle silently
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchCart]);

  const handlePaymentMethodSelect = (paymentMethod: string) => {
    setShowPaymentModal(false);

    if (paymentMethod === "online") {

      checkoutMutation.mutate({
        paymentMethod,
        mobileCallbackUrl: "ogamechanic://payment-callback"
      }, {
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
        onError: () => {
          setIsLoading(false);
          alert("Payment failed. Please try again.");
        }
      });
    } else if (paymentMethod === "cash_on_delivery") {
      checkoutMutation.mutate({
        paymentMethod
      }, {
        onSuccess: () => {
          setIsLoading(false);
          refetchCart();
          alert("Cash on delivery order created successfully!");
        },
        onError: () => {
          setIsLoading(false);
          alert("Order creation failed. Please try again.");
        }
      });
    } else {
      // Unsupported payment method - show error
      setIsLoading(false);
      alert("This payment method is not currently supported. Please select 'Online Payment' or 'Cash on Delivery'.");
    }
  };

  const renderCartItem = ({ item, index }: { item: CartItem; index: number }) => {
    // Get optimistic quantity for display (updates immediately on tap)
    const displayQuantity = getDisplayQuantity(item.id, item.quantity);
    // Combine loading states from both debounced updates and remove operations
    const isItemCurrentlyLoading = isItemLoading(item.id) || removeLoadingItems.has(item.id);

    return (
      <CartItemCard
        item={{ ...item, quantity: displayQuantity }}
        index={index}
        fadeAnim={fadeAnims[item.id]}
        slideAnim={slideAnims[item.id]}
        bounceAnim={bounceAnims[item.id]}
        isLoading={isItemCurrentlyLoading}
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
  };

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
            {getApiErrorMessage(cartError)}
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
        <View className="pt-2">
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

      {/* Order Summary */}
      <View className="bg-white border-t border-gray-200 px-5 pt-4 pb-2">
        {/* Summary Row */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm font-NunitoMedium text-gray-500">
            Subtotal ({getTotalQuantity()} items)
          </Text>
          <NairaCurrency
            value={calculateTotal()}
            className="text-sm font-NunitoBold text-gray-900"
          />
        </View>

        {/* Savings */}
        {calculateSavings() > 0 && (
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-sm font-NunitoMedium text-green-600">
              You save
            </Text>
            <Text className="text-sm font-NunitoBold text-green-600">
              -₦{calculateSavings().toLocaleString()}
            </Text>
          </View>
        )}

        {/* Delivery Fee */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm font-NunitoMedium text-gray-500">
            Delivery
          </Text>
          <Text className="text-sm font-NunitoBold text-green-600">
            Free
          </Text>
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-100 mb-3" />

        {/* Total */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-NunitoBold text-gray-900">Total</Text>
          <NairaCurrency
            value={calculateSubTotal()}
            className="text-xl font-NunitoExtraBold text-gray-900"
          />
        </View>

        {/* Checkout Button */}
        <CustomButton
          title="Proceed to Checkout"
          onPress={handleMakePayment}
          bgVariant="primary"
          loading={isLoading}
          loadingText="Processing"
          disabled={cartItems.length === 0}
        />

        {/* Security Note */}
        <Text className="text-xs text-gray-400 text-center mt-3 mb-2">
          🔒 Secure checkout
        </Text>

        {/* Android Navigation Bar Spacer */}
        <AndroidNavBarSpacer backgroundColor="transparent" extraHeight={4} />
      </View>

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

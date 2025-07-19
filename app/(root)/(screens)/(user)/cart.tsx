"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
  Dimensions,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { icons, images } from "@/constants";
import { NairaCurrency } from "@/utils/useCurrencyFormatter";
import {
  TrashIcon,
  CheckIcon,
  PlusIcon,
  MinusIcon,
} from "react-native-heroicons/outline";
import { LinearGradient } from "expo-linear-gradient";
import { useState as useLocalState } from "react";
import CustomButton from "@/components/CustomButton";
import BackArrowBtn from "@/components/BackArrowBtn";
import PaymentMethodModal from "@/components/modals/PaymentMethodModal";
import { routes } from "@/constants/routes";
import CartItemCard from "@/components/cards/CartItemCard";

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
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Toyota Corolla Brake Pads",
      price: 7000,
      originalPrice: 8500,
      discount: 18,
      quantity: 1,
      stock: 12,
      image: images.cartImg,
    },
    {
      id: 2,
      name: "Honda Civic Oil Filter",
      price: 3500,
      originalPrice: 4000,
      discount: 12,
      quantity: 2,
      stock: 8,
      image: images.cartImg,
    },
    {
      id: 3,
      name: "BMW X5 Air Filter",
      price: 12000,
      quantity: 1,
      stock: 5,
      image: images.cartImg,
    },
    // {
    //   id: 4,
    //   name: "Mercedes Spark Plugs",
    //   price: 15000,
    //   originalPrice: 18000,
    //   discount: 17,
    //   quantity: 1,
    //   stock: 15,
    //   image: "/placeholder.svg?height=80&width=80",
    // },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const deliveryFee = 2000;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

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

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(
            1,
            Math.min(item.stock, item.quantity + change)
          );
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeItem = (id: number) => {
    // Slide out animation
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
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
      // Reset animations for future use
      slideAnims[id].setValue(0);
      fadeAnims[id].setValue(1);
    });
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

    setIsLoading(true);

    // Simulate payment processing

    setTimeout(() => {
      setIsLoading(false);

      if (paymentMethod === "transfer") {
        // Handle cash payment

        console.log("Processing cash payment...");

        router.push(routes?.bankTransfer);
      } else {
        // Handle card payment

        console.log("Processing card payment...");

        router.push(routes?.cardPayment);
      }
    }, 1500);
  };

  const renderCartItem = ({ item, index }: { item: CartItem; index: number }) => (
    <CartItemCard
      item={item}
      index={index}
      isSelected={selectedItems.includes(item.id)}
      fadeAnim={fadeAnims[item.id]}
      slideAnim={slideAnims[item.id]}
      bounceAnim={bounceAnims[item.id]}
      onSelect={(id) => {
        setSelectedItems((prev) =>
          prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
      }}
      onRemove={removeItem}
      onUpdateQuantity={updateQuantity}
    />
  );

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
        contentContainerStyle={{ paddingBottom: 120 }}
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

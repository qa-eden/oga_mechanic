import React from "react";
import { TouchableOpacity, Text, Animated } from "react-native";
import { ShoppingCartIcon } from "react-native-heroicons/outline";
import { router } from "expo-router";
import { routes } from "@/constants/routes";
import { useCart } from "@/hooks/useCart";

interface CartIconBtnProps {
  count?: number;
  showAnimation?: boolean;
}

const CartIconBtn = ({ count, showAnimation = true }: CartIconBtnProps) => {
  const { data: cartData } = useCart();
  
  // Calculate total items from API data
  const itemCount = count ?? (() => {
    if (!cartData?.data?.items) return 0;
    return cartData.data.items.reduce((total, item) => total + (item.quantity || 0), 0);
  })();

  return (
    <Animated.View
      style={{
        transform: [{ scale: 1 }], // Removed cartAnimation since it's not available from API hook
      }}
    >
      <TouchableOpacity 
        onPress={() => router.push(routes?.cart)} 
        className="w-[45px] h-[45px] bg-primary-100 flex justify-center items-center rounded-full relative"
      >
        <ShoppingCartIcon className="text-primary-500" color={"#D30309"} />
        {itemCount > 0 && (
          <Animated.View
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              minWidth: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: "#D30309",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              paddingHorizontal: 4,
            }}
          >
            <Text style={{ 
              color: "#fff", 
              fontSize: 11, 
              fontWeight: "bold",
              fontFamily: "Nunito-Bold"
            }}>
              {itemCount > 99 ? "99+" : itemCount}
            </Text>
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default CartIconBtn;

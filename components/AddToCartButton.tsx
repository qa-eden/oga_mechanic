import React from "react";
import { TouchableOpacity, Text, Animated, View } from "react-native";
import { useCart } from "@/contexts/CartContext";
import { useCartAnimation } from "@/hooks/useCartAnimation";
import { CartItem } from "@/contexts/CartContext";
import { PlusIcon, MinusIcon, TrashIcon } from "react-native-heroicons/outline";

interface AddToCartButtonProps {
  item: Omit<CartItem, "quantity">;
  className?: string;
  size?: "small" | "medium" | "large";
  variant?: "primary" | "secondary" | "outline";
  showQuantity?: boolean;
  disabled?: boolean;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  item,
  className = "",
  size = "medium",
  variant = "primary",
  showQuantity = true,
  disabled = false,
}) => {
  const {
    addToCart,
    removeFromCart,
    updateQuantity,
    isInCart,
    getItemQuantity,
  } = useCart();
  const { scaleAnim, triggerAddToCartAnimation } = useCartAnimation();

  const isItemInCart = isInCart(item.id);
  const itemQuantity = getItemQuantity(item.id);

  const handleAddToCart = () => {
    if (disabled) return;

    addToCart(item);
    triggerAddToCartAnimation();
  };

  const handleRemoveFromCart = () => {
    removeFromCart(item.id);
  };

  const handleIncrement = () => {
    if (itemQuantity < item.stock) {
      updateQuantity(item.id, itemQuantity + 1);
    }
  };

  const handleDecrement = () => {
    if (itemQuantity > 1) {
      updateQuantity(item.id, itemQuantity - 1);
    } else {
      removeFromCart(item.id);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "px-3 py-2";
      case "large":
        return "px-6 py-4";
      default:
        return "px-4 py-3";
    }
  };

  const getVariantClasses = () => {
    if (isItemInCart) {
      return "bg-green-100 border-green-300";
    }

    switch (variant) {
      case "secondary":
        return "bg-gray-100 border-gray-300";
      case "outline":
        return "bg-transparent border-primary-500";
      default:
        return "bg-primary-500 border-primary-500";
    }
  };

  const getTextClasses = () => {
    if (isItemInCart) {
      return "text-green-700";
    }

    switch (variant) {
      case "secondary":
        return "text-gray-700";
      case "outline":
        return "text-primary-500";
      default:
        return "text-white";
    }
  };

  const getButtonText = () => {
    if (isItemInCart && showQuantity) {
      return `In Cart (${itemQuantity})`;
    }
    if (isItemInCart) {
      return "In Cart";
    }
    return "Add to Cart";
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      {isItemInCart ? (
        // Cart controls when item is in cart - 50/50 split
        <View className={`flex-row items-center ${className}`}>
          {/* Remove button - 50% width */}
          <TouchableOpacity
            onPress={handleRemoveFromCart}
            disabled={disabled}
            className={`
              flex-1 mr-2
              bg-red-500 border-red-500
              border rounded-lg flex-row items-center justify-center py-3
              ${disabled ? "opacity-50" : ""}
            `}
          >
            <Text className="font-NunitoBold text-md text-white ml-1">
              Remove from cart
            </Text>
          </TouchableOpacity>

          {/* Quantity controls - 50% width */}
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg border border-gray-200">
            <TouchableOpacity
              onPress={handleDecrement}
              disabled={disabled || itemQuantity <= 1}
              className={`
                flex-1 h-10 rounded-l-lg items-center justify-center
                ${itemQuantity <= 1 ? "bg-gray-300" : "bg-red-500"}
                ${disabled ? "opacity-50" : ""}
              `}
            >
              <MinusIcon size={16} color="white" />
            </TouchableOpacity>

            <View className="flex-1 py-2 bg-white items-center justify-center">
              <Text className="font-NunitoBold text-sm text-gray-900">
                {itemQuantity}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleIncrement}
              disabled={disabled || itemQuantity >= item.stock}
              className={`
                flex-1 h-10 rounded-r-lg items-center justify-center
                ${itemQuantity >= item.stock ? "bg-gray-300" : "bg-green-500"}
                ${disabled ? "opacity-50" : ""}
              `}
            >
              <PlusIcon size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Add to cart button when item is not in cart
        <TouchableOpacity
          onPress={handleAddToCart}
          disabled={disabled}
          className={`
            ${getSizeClasses()}
            ${getVariantClasses()}
            border rounded-lg items-center justify-center
            ${disabled ? "opacity-50" : ""}
            ${className}
          `}
        >
          <Text
            className={`
              font-NunitoBold text-sm
              ${getTextClasses()}
            `}
          >
            Add to Cart
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default AddToCartButton;

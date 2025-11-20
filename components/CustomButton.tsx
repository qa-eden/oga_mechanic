"use client";

import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  Animated,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import type { ButtonProps } from "@/types/type";

const getBgVariantStyle = (variant: ButtonProps["bgVariant"]) => {
  switch (variant) {
    case "primary":
      return "bg-[#D30309]";
    case "secondary":
      return "bg-[#DDDDDD]";
    case "danger":
      return "bg-red-600";
    case "dangerborder":
      return "border-red-500 border bg-white";
    case "success":
      return "bg-green-500";
    case "outline":
      return "bg-transparent border-2 border-gray-300";
    default:
      return "border border-2 border-white";
  }
};

const getTextVariantStyle = (variant: ButtonProps["textVariant"]) => {
  switch (variant) {
    case "primary":
      return "text-black";
    case "secondary":
      return "text-[#000]";
    case "danger":
      return "text-red-100";
    case "dangerborder":
      return "text-red-500";
    case "success":
      return "text-green-100";
    case "outline":
      return "text-gray-500";
    default:
      return "text-white";
  }
};

const getLoadingColor = (
  variant: ButtonProps["bgVariant"],
  textVariant: ButtonProps["textVariant"]
) => {
  // For other variants, use the text color
  switch (textVariant) {
    case "primary":
      return "#000000"; // black
    case "secondary":
      return "#cccccc";
    case "danger":
      return "#FEE2E2"; // red-100
    case "dangerborder":
      return "#FEE2E2"; // red-100
    case "success":
      return "#DCFCE7"; // green-100
    case "outline":
      return "#6B7280"; // gray-500
    default:
      return "#FFFFFF"; // white
  }
};

// Animated Dots Component
const AnimatedDots = ({ textColor }: { textColor: string }) => {
  const [dots, setDots] = useState(".");
  const fadeAnim1 = useRef(new Animated.Value(0.3)).current;
  const fadeAnim2 = useRef(new Animated.Value(0.3)).current;
  const fadeAnim3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : "."));
    }, 400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animateDots = () => {
      // Reset all dots to low opacity
      Animated.parallel([
        Animated.timing(fadeAnim1, {
          toValue: 0.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim2, {
          toValue: 0.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim3, {
          toValue: 0.3,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Animate dots sequentially
        const sequence = Animated.sequence([
          Animated.timing(fadeAnim1, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim2, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim3, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]);

        Animated.loop(sequence).start();
      });
    };

    animateDots();
  }, [fadeAnim1, fadeAnim2, fadeAnim3]);

  return (
    <View className="flex-row items-center ml-1">
      <Animated.Text
        style={{
          opacity: fadeAnim1,
          color: textColor,
          fontSize: 16,
          fontWeight: "bold",
        }}
      >
        .
      </Animated.Text>
      <Animated.Text
        style={{
          opacity: fadeAnim2,
          color: textColor,
          fontSize: 16,
          fontWeight: "bold",
        }}
      >
        .
      </Animated.Text>
      <Animated.Text
        style={{
          opacity: fadeAnim3,
          color: textColor,
          fontSize: 16,
          fontWeight: "bold",
        }}
      >
        .
      </Animated.Text>
    </View>
  );
};

const CustomButton = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft,
  IconRight,
  className,
  loading = false,
  disabled = false,
  loadingText = "Loading",
  ...props
}: ButtonProps & {
  loading?: boolean;
  loadingText?: string;
}) => {
  const isDisabled = disabled || loading;

  // Get text color for dots animation
  const textColorClass = getTextVariantStyle(textVariant);
  const textColor = textColorClass.includes("text-white")
    ? "#FFFFFF"
    : textColorClass.includes("text-black")
      ? "#000000"
      : textColorClass.includes("text-[#141414]")
        ? "#141414"
        : textColorClass.includes("text-red-100")
          ? "#FEE2E2"
          : textColorClass.includes("text-green-100")
            ? "#DCFCE7"
            : "#FFFFFF";

  return (
    <TouchableOpacity
      onPress={isDisabled ? undefined : onPress}
      className={`w-full rounded-full py-5 px-2 flex flex-row justify-center items-center ${getBgVariantStyle(
        bgVariant
      )} ${isDisabled ? "opacity-70" : ""} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <View className="flex-row items-center">
          {/* Loading Spinner */}
          <ActivityIndicator
            size="small"
            color={getLoadingColor(bgVariant, textVariant)}
          />

          {/* Loading Text with Animated Dots */}
          <View className="flex-row items-center ml-2">
            <Text
              className={`text-lg font-bold ${getTextVariantStyle(
                textVariant
              )}`}
            >
              {loadingText}
            </Text>
            <AnimatedDots textColor={textColor} />
          </View>
        </View>
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {/* Left Icon */}
          {IconLeft && <IconLeft size={20} color={getLoadingColor(bgVariant, textVariant)} />}

          {/* Button Text */}
          <Text
            className={`text-[1.1rem] font-bold ${getTextVariantStyle(
              textVariant
            )}`}
          >
            {title}
          </Text>

          {/* Right Icon */}
          {IconRight && <IconRight size={20} color={getLoadingColor(bgVariant, textVariant)} />}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;

"use client";

import { useState, useRef, useCallback } from "react";
import {
  TextInput,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  TouchableOpacity,
  Animated,
} from "react-native";

import type { InputFieldProps } from "@/types/type";
import { icons } from "@/constants";

const InputFieldPassword = ({
  label,
  icon,
  secureTextEntry = false,
  labelStyle,
  containerStyle,
  inputStyle,
  iconStyle,
  placeholder,
  isPasswordVisible,
  setIsPasswordVisible,
  error,
  touched,
  required,
  helperText,
  onBlur,
  onFocus,
  ...props
}: InputFieldProps & {
  error?: string;
  touched?: boolean;
  required?: boolean;
  helperText?: string;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Determine if there's an error to show
  const hasError = touched && error;

  // Memoized border colors to prevent recalculation
  const borderColors = useRef({
    default: hasError ? "#EF4444" : "#D1D5DB",
    focused: hasError ? "#EF4444" : "#F59E42",
  });

  // Update border colors only when error state changes
  if (borderColors.current.default !== (hasError ? "#EF4444" : "#D1D5DB")) {
    borderColors.current = {
      default: hasError ? "#EF4444" : "#D1D5DB",
      focused: hasError ? "#EF4444" : "#F59E42",
    };
  }

  const handleFocus = useCallback(
    (e: any) => {
      if (!isFocused) {
        setIsFocused(true);

        // Cancel any existing animation
        if (animationRef.current) {
          animationRef.current.stop();
        }

        animationRef.current = Animated.timing(animatedValue, {
          toValue: 1,
          duration: 150, // Reduced duration for smoother feel
          useNativeDriver: false,
        });

        animationRef.current.start();
      }

      // Call the original onFocus if provided
      if (onFocus) {
        onFocus(e);
      }
    },
    [isFocused, animatedValue, onFocus]
  );

  const handleBlur = useCallback(
    (e: any) => {
      if (isFocused) {
        setIsFocused(false);

        // Cancel any existing animation
        if (animationRef.current) {
          animationRef.current.stop();
        }

        animationRef.current = Animated.timing(animatedValue, {
          toValue: 0,
          duration: 150, // Reduced duration for smoother feel
          useNativeDriver: false,
        });

        animationRef.current.start();
      }

      // Call the original onBlur if provided
      if (onBlur) {
        onBlur(e);
      }
    },
    [isFocused, animatedValue, onBlur]
  );

  // Stable border color interpolation
  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [borderColors.current.default, borderColors.current.focused],
    extrapolate: "clamp", // Prevent values outside the range
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="mb-4 w-full">
          {/* Label */}
          <Text
            className={`text-[1.1rem] font-JakartaSemiBold text-text-400 mb-2 ${labelStyle}`}
          >
            {label}
            {required && <Text className="text-red-500 ml-1">*</Text>}
          </Text>

          {/* Input Container */}
          <Animated.View
            className={`flex bg-white flex-row justify-start items-center relative bg-input-background rounded-[.8rem] ${containerStyle}`}
            style={{
              borderWidth: 1.5,
              borderColor: borderColor,
              ...Platform.select({
                ios: {
                  shadowColor: hasError
                    ? "#EF4444"
                    : isFocused
                    ? "#F59E42"
                    : "transparent",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                },
                android: {
                  elevation: isFocused ? 2 : 0,
                },
              }),
            }}
          >
            <TextInput
              className={`rounded-[.8rem] p-4 font-JakartaSemiBold text-[15px] flex-1 ${inputStyle} text-left`}
              secureTextEntry={secureTextEntry}
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={{ color: '#000' }}
              {...props}
            />

            <TouchableOpacity
              onPress={() =>
                setIsPasswordVisible && setIsPasswordVisible(!isPasswordVisible)
              }
              className="mr-4"
            >
              <Image
                source={isPasswordVisible ? icons?.eyeOpen : icons?.eyeClosed}
                className={`w-6 h-6 ml-4 ${iconStyle}`}
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Error Message */}
          {hasError && (
            <View className="flex-row items-center">
              <View className="w-1 h-1 bg-red-500 rounded-full mr-2" />
              <Text className="text-md font-NunitoMedium text-red-500 flex-1">
                {error}
              </Text>
            </View>
          )}

          {/* Helper Text */}
          {!hasError && helperText && (
            <Text className="text-md font-NunitoRegular text-gray-500 mt-2 ml-1">
              {helperText}
            </Text>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default InputFieldPassword;

"use client";

import { useState, useRef, useCallback, useMemo } from "react";
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
import clsx from "clsx";

const InputField = ({
  label,
  leftIcon,
  icon,
  secureTextEntry = false,
  labelStyle,
  containerStyle,
  containerStyle1,
  inputStyle,
  iconStyle,
  placeholder,
  keyboardType = "default",
  error,
  touched,
  isPasswordVisible,
  setIsPasswordVisible,
  required,
  helperText,
  onBlur,
  onFocus,
  autoCapitalize = "sentences",
  autoCorrect = true,
  noMargin = false,
  ...props
}: InputFieldProps & {
  error?: string;
  touched?: boolean;
  isPasswordVisible?: boolean;
  setIsPasswordVisible?: (value: boolean) => void;
  leftIcon?: any;
  required?: boolean;
  helperText?: string;
  containerStyle1?: string;
  noMargin?: boolean;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Determine if there's an error to show
  const hasError = touched && error;

  // Memoized border colors to prevent recalculation
  const borderColors = useMemo(
    () => ({
      default: hasError ? "#EF4444" : "#D1D5DB",
      focused: hasError ? "#EF4444" : "#F59E42",
    }),
    [hasError]
  );

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
          duration: 150,
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
          duration: 150,
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
    outputRange: [borderColors.default, borderColors.focused],
    extrapolate: "clamp",
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      enabled={!props.multiline} // Disable for multiline to prevent conflicts
    >
      <TouchableWithoutFeedback onPress={props.multiline ? undefined : Keyboard.dismiss}>
        <View className={clsx("mb-4 w-full", containerStyle1, !noMargin && "mb-4")}>
          {/* Label */}
          {label && (
            <Text
              className={`text-base font-NunitoSemiBold text-gray-700 mb-2 ${labelStyle}`}
            >
              {label}
              {required && <Text className="text-red-500 ml-1">*</Text>}
            </Text>
          )}

          {/* Input Container */}
          <Animated.View
            className={`flex ${props.multiline ? 'flex-col' : 'flex-row items-center'} bg-gray-50 rounded-xl px-4 py-1 ${containerStyle}`}
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
            {/* Left Icon */}
            {leftIcon && !secureTextEntry && !props.multiline && (
              <View className="mr-3">
                <Image
                  source={leftIcon}
                  className={`w-5 h-5 ${iconStyle}`}
                  resizeMode="contain"
                />
              </View>
            )}

            {/* Text Input */}
            <TextInput
              className={`flex-1 ${props.multiline ? 'py-3 min-h-[100px]' : 'py-3'} text-[1.2rem] font-NunitoMedium text-gray-900 ${inputStyle}`}
              secureTextEntry={secureTextEntry && isPasswordVisible}
              keyboardType={keyboardType}
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              onFocus={handleFocus}
              onBlur={handleBlur}
              autoCapitalize={autoCapitalize}
              autoCorrect={autoCorrect}
              textContentType={
                keyboardType === "email-address" ? "emailAddress" : undefined
              }
              textAlignVertical={props.multiline ? "top" : "center"}
              {...props}
            />

            {/* Right Icon (Password Toggle) */}
            {secureTextEntry &&
              typeof isPasswordVisible === "boolean" &&
              typeof setIsPasswordVisible === "function" &&
              !props.multiline && (
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  className="ml-3 p-1"
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Image
                    source={isPasswordVisible ? icons.eyeOpen : icons.eyeClosed}
                    className={`w-5 h-5 ${iconStyle}`}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}

            {/* Custom Right Icon */}
            {icon && !secureTextEntry && !props.multiline && (
              <View className="ml-3">
                <Image
                  source={icon}
                  className={`w-5 h-5 ${iconStyle}`}
                  resizeMode="contain"
                />
              </View>
            )}
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

export default InputField;

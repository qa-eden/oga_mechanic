import React, { useState, useRef, useCallback, useMemo } from 'react'
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Animated
} from 'react-native'
import { MapPinIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline'
import clsx from 'clsx'

interface AddressInputProps {
  label?: string
  placeholder?: string
  value?: string
  onChangeText?: (text: string) => void
  onLocationSelect?: (location: any) => void
  error?: string
  touched?: boolean
  multiline?: boolean
  numberOfLines?: number
  required?: boolean
  disabled?: boolean
  containerClassName?: string
  inputClassName?: string
  labelClassName?: string
  containerStyle?: string
  containerStyle1?: string
  noMargin?: boolean
}

const AddressInput: React.FC<AddressInputProps> = ({
  label = "Address",
  placeholder = "Enter your address",
  value = "",
  onChangeText,
  onLocationSelect,
  error,
  touched,
  multiline = true,
  numberOfLines = 3,
  required = false,
  disabled = false,
  containerClassName = "",
  inputClassName = "",
  labelClassName = "",
  containerStyle = "",
  containerStyle1 = "",
  noMargin = false
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<TextInput>(null)
  const animatedValue = useRef(new Animated.Value(0)).current
  const animationRef = useRef<Animated.CompositeAnimation | null>(null)

  const hasError = touched && error

  // Memoized border colors to prevent recalculation
  const borderColors = useMemo(
    () => ({
      default: hasError ? "#EF4444" : "#D1D5DB",
      focused: hasError ? "#EF4444" : "#F59E42",
    }),
    [hasError]
  )

  const handleLocationPress = () => {
    // TODO: Implement Google Maps location picker
    Alert.alert(
      'Location Picker',
      'Google Maps location picker will be implemented here',
      [
        {
          text: 'Use Current Location',
          onPress: () => {
            // TODO: Get current location and set address
            // For now, just show a placeholder
            onChangeText?.('Current location will be set here')
          }
        },
        {
          text: 'Search Location',
          onPress: () => {
            // TODO: Open location search
            // For now, just focus the input
            inputRef.current?.focus()
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    )
  }

  const handleInputFocus = useCallback(
    (e: any) => {
      if (!isFocused) {
        setIsFocused(true)

        // Cancel any existing animation
        if (animationRef.current) {
          animationRef.current.stop()
        }

        animationRef.current = Animated.timing(animatedValue, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        })

        animationRef.current.start()
      }
    },
    [isFocused, animatedValue]
  )

  const handleInputBlur = useCallback(
    (e: any) => {
      if (isFocused) {
        setIsFocused(false)

        // Cancel any existing animation
        if (animationRef.current) {
          animationRef.current.stop()
        }

        animationRef.current = Animated.timing(animatedValue, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        })

        animationRef.current.start()
      }
    },
    [isFocused, animatedValue]
  )

  // Stable border color interpolation
  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [borderColors.default, borderColors.focused],
    extrapolate: "clamp",
  })

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className={clsx("w-full", containerStyle1, !noMargin && "mb-4")}>
          {/* Label */}
          {label && (
            <Text className={`text-base font-NunitoSemiBold text-gray-700 mb-2 ${labelClassName}`}>
              {label}
              {required && <Text className="text-red-500 ml-1">*</Text>}
            </Text>
          )}

          {/* Input Container */}
          <Animated.View
            className={`flex flex-row items-center bg-gray-50 rounded-xl px-4 py-1 ${containerStyle}`}
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
            {/* Text Input */}
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              multiline={multiline}
              numberOfLines={numberOfLines}
              editable={!disabled}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              className={`flex-1 py-3 text-[1.2rem] font-NunitoMedium text-gray-900 ${inputClassName}`}
              style={{
                textAlignVertical: multiline ? 'top' : 'center',
                // minHeight: multiline ? 80 : 50,
                // maxHeight: multiline ? 120 : 50
              }}
            />

            {/* Location Button */}
            <TouchableOpacity
              onPress={handleLocationPress}
              disabled={disabled}
              className="ml-3 p-1"
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MapPinIcon size={20} color={disabled ? "#9CA3AF" : "#6B7280"} />
            </TouchableOpacity>
          </Animated.View>

          {/* Error Message */}
          {hasError && (
            <View className="flex-row items-center">
              <View className="w-1 h-1 bg-red-500 rounded-full mr-2" />
              <Text className="text-md font-NunitoMedium text-red-500 flex-1">
                {String(error)}
              </Text>
            </View>
          )}

          {/* Helper Text */}
          {/* {!hasError && (
            <Text className="text-md font-NunitoRegular text-gray-500 mt-2 ml-1">
              Tap the location icon to use current location or search for an address
            </Text>
          )} */}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

export default AddressInput

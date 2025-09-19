import React, { useState, useRef, useCallback, useMemo } from 'react'
import { View, Text, TouchableOpacity, Modal, Pressable, Animated, Platform } from 'react-native'
import { ChevronDownIcon, CheckIcon } from 'react-native-heroicons/outline'

interface SelectOption {
  label: string
  value: string
}

interface SelectFieldProps {
  name: string
  label: string
  placeholder: string
  options: SelectOption[]
  value: string
  onValueChange: (value: string) => void
  error?: string
  touched?: boolean
  required?: boolean
}

const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  placeholder,
  options,
  value,
  onValueChange,
  error,
  touched,
  required = false
}) => {
  const [showDrawer, setShowDrawer] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const animatedValue = useRef(new Animated.Value(0)).current
  const animationRef = useRef<Animated.CompositeAnimation | null>(null)

  const selectedOption = options.find(option => option.value === value)
  const hasError = touched && error

  // Memoized border colors to prevent recalculation
  const borderColors = useMemo(
    () => ({
      default: hasError ? "#EF4444" : "#D1D5DB",
      focused: hasError ? "#EF4444" : "#F59E42",
    }),
    [hasError]
  )

  const handleFocus = useCallback(() => {
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
  }, [isFocused, animatedValue])

  const handleBlur = useCallback(() => {
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
  }, [isFocused, animatedValue])

  // Stable border color interpolation
  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [borderColors.default, borderColors.focused],
    extrapolate: "clamp",
  })

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue)
    setShowDrawer(false)
    handleBlur()
  }

  const openDrawer = () => {
    handleFocus()
    setShowDrawer(true)
  }

  return (
    <View className="mb-4 w-full">
      {/* Label */}
      {label && (
        <Text className="text-base font-NunitoSemiBold text-gray-700 mb-2">
          {label}
          {required && <Text className="text-red-500 ml-1">*</Text>}
        </Text>
      )}

      {/* Select Container */}
      <Animated.View
        className="flex flex-row items-center bg-gray-50 rounded-xl px-4 py-1"
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
        <TouchableOpacity 
          onPress={openDrawer}
          className="flex-1 flex-row items-center justify-between py-3"
        >
          <Text className={`text-[1.2rem] font-NunitoMedium ${selectedOption ? "text-gray-900" : "text-gray-400"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          <ChevronDownIcon size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Error Message */}
      {hasError && (
        <View className="flex-row items-center mt-2">
          <View className="w-1 h-1 bg-red-500 rounded-full mr-2" />
          <Text className="text-md font-NunitoMedium text-red-500 flex-1">
            {error}
          </Text>
        </View>
      )}

      {/* Bottom Drawer Modal */}
      <Modal
        visible={showDrawer}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDrawer(false)}
      >
        <Pressable 
          className="flex-1 justify-end bg-black/50"
          onPress={() => setShowDrawer(false)}
        >
          <Pressable className="bg-white rounded-t-3xl p-6 max-h-96">
            <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
            
            <Text className="text-lg font-NunitoBold text-gray-900 mb-4 text-center">
              Select {label}
            </Text>
            
            <View className="space-y-2">
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl"
                >
                  <Text className="text-base font-NunitoMedium text-gray-900">
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <CheckIcon size={20} color="#0A6DEE" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

export default SelectField
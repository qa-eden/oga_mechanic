import React, { useState, useRef, useCallback, useMemo } from 'react'
import { View, Text, TouchableOpacity, Modal, Pressable, Animated, Platform, ScrollView, TextInput } from 'react-native'
import { ChevronDownIcon, CheckIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline'
import AndroidNavBarSpacer from '../AndroidNavBarSpacer'

interface SelectOption {
  label: string
  value: string
}

interface SelectFieldProps {
  name: string
  label: string
  placeholder?: string
  options: SelectOption[]
  value: string
  onValueChange?: (value: string) => void
  error?: any
  touched?: any
  required?: boolean
}

const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  placeholder = "Select option",
  options,
  value,
  onValueChange,
  error,
  touched,
  required = false
}) => {
  const [showDrawer, setShowDrawer] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const animatedValue = useRef(new Animated.Value(0)).current
  const animationRef = useRef<Animated.CompositeAnimation | null>(null)

  const selectedOption = options.find(option => option.value === value)
  const hasError = touched && error

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options
    
    return options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [options, searchQuery])

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
    if (onValueChange && typeof onValueChange === 'function') {
      onValueChange(optionValue)
    }
    setShowDrawer(false)
    setSearchQuery('') // Clear search when selecting
    handleBlur()
  }

  const openDrawer = () => {
    handleFocus()
    setSearchQuery('') // Clear search when opening
    setShowDrawer(true)
  }

  const closeDrawer = () => {
    setShowDrawer(false)
    setSearchQuery('') // Clear search when closing
    handleBlur()
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
        onRequestClose={closeDrawer}
      >
        <Pressable 
          className="flex-1 justify-end bg-black/50"
          onPress={closeDrawer}
        >
          <Pressable className="bg-white rounded-t-3xl h-[70vh] max-h-[80vh]">
            <View className="p-6 pb-0">
              <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
              
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-NunitoBold text-gray-900">
                  Select {label}
                </Text>
                {searchQuery.trim() && (
                  <Text className="text-sm font-NunitoMedium text-gray-500">
                    {filteredOptions.length} result{filteredOptions.length !== 1 ? 's' : ''}
                  </Text>
                )}
              </View>
              
              {/* Search Input */}
              <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2 mb-4">
                <MagnifyingGlassIcon size={20} color="#9CA3AF" />
                <TextInput
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="flex-1 ml-2 text-base font-NunitoMedium text-gray-900"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
            
            <ScrollView 
              className="flex-1 px-6"
              showsVerticalScrollIndicator={true}
              bounces={false}
            >
              <View className="space-y-2 pb-6">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
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
                  ))
                ) : (
                  <View className="p-8 items-center">
                    <Text className="text-gray-500 text-center font-NunitoMedium">
                      No {label.toLowerCase()} found matching "{searchQuery}"
                    </Text>
                  </View>
                )}

                {/* Android Navigation Bar Spacer */}
                <AndroidNavBarSpacer />
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

export default SelectField
import React, { useState, useRef } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { MapPinIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline'

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
  labelClassName = ""
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<TextInput>(null)

  const hasError = error && touched

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
            console.log('Getting current location...')
            // For now, just show a placeholder
            onChangeText?.('Current location will be set here')
          }
        },
        {
          text: 'Search Location',
          onPress: () => {
            // TODO: Open location search
            console.log('Opening location search...')
            // For now, just focus the input
            inputRef.current?.focus()
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    )
  }

  const handleInputFocus = () => {
    setIsFocused(true)
  }

  const handleInputBlur = () => {
    setIsFocused(false)
  }

  return (
    <View className={`space-y-2 my-2 ${containerClassName}`}>
      {/* Label */}
      {label && (
        <Text className={`text-sm font-NunitoMedium text-gray-700 ${labelClassName}`}>
          {label}
          {required && <Text className="text-red-500 ml-1">*</Text>}
        </Text>
      )}

      {/* Input Container */}
      <View className="relative">
        {/* Address Input */}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className={`w-full px-4 py-4 bg-gray-100 rounded-xl border text-base font-NunitoMedium ${
            hasError 
              ? "border-red-500 bg-red-50" 
              : isFocused 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-200"
          } ${disabled ? "opacity-50 bg-gray-50" : ""} ${inputClassName}`}
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
          className={`absolute right-3 top-3 w-8 h-8 items-center justify-center rounded-lg ${
            disabled ? "" : ""
          }`}
          activeOpacity={0.7}
        >
          <MapPinIcon size={16} color={"#aaa"} />
        </TouchableOpacity>

        {/* Search Button (for future Google Maps integration) */}
        {/* <TouchableOpacity
          onPress={() => {
            // TODO: Open Google Maps search
            console.log('Opening Google Maps search...')
            inputRef.current?.focus()
          }}
          disabled={disabled}
          className={`absolute right-12 top-3 w-8 h-8 items-center justify-center rounded-lg ${
            disabled ? "bg-gray-200" : "bg-green-500"
          }`}
          activeOpacity={0.7}
        >
          <MagnifyingGlassIcon size={16} color={disabled ? "#9CA3AF" : "white"} />
        </TouchableOpacity> */}
      </View>

      {/* Error Message */}
      {hasError && (
        <Text className="text-red-500 text-sm font-NunitoMedium">
          {String(error)}
        </Text>
      )}

      {/* Helper Text */}
      <Text className="text-xs text-gray-500 font-NunitoMedium">
        Tap the location icon to use current location or search for an address
      </Text>
    </View>
  )
}

export default AddressInput

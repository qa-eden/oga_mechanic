import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'
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
  Animated,
  ScrollView,
  ActivityIndicator
} from 'react-native'
import { MapPinIcon } from 'react-native-heroicons/outline'
import clsx from 'clsx'
import * as Location from 'expo-location'
import { ENV_CONFIG } from '@/config/env'

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
  const [inputValue, setInputValue] = useState(value ?? '')
  const [searchQuery, setSearchQuery] = useState(value ?? '')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [isFetchingCurrentLocation, setIsFetchingCurrentLocation] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasError = touched && error

  // Memoized border colors to prevent recalculation
  const borderColors = useMemo(
    () => ({
      default: hasError ? "#EF4444" : "#D1D5DB",
      focused: hasError ? "#EF4444" : "#F59E42",
    }),
    [hasError]
  )

  useEffect(() => {
    setInputValue(value ?? '')
    setSearchQuery(value ?? '')
  }, [value])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      setFetchError(null)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      return
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      if (!ENV_CONFIG.MAPBOX_ACCESS_TOKEN) {
        setFetchError('Mapbox access token missing. Set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment.')
        setSuggestions([])
        return
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const controller = new AbortController()
      abortControllerRef.current = controller

      setIsLoadingSuggestions(true)
      setFetchError(null)

      try {
        const encodedQuery = encodeURIComponent(searchQuery.trim())
        const params = new URLSearchParams({
          access_token: ENV_CONFIG.MAPBOX_ACCESS_TOKEN,
          autocomplete: 'true',
          country: 'ng',
          limit: '6',
          language: 'en',
          types: 'address,place,poi'
        })

        const response = await fetch(
          `${ENV_CONFIG.MAPBOX_PLACES_ENDPOINT}/${encodedQuery}.json?${params.toString()}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error(`Mapbox request failed with status ${response.status}`)
        }

        const data = await response.json()
        const mappedSuggestions =
          data?.features?.map((feature: any) => ({
            id: feature.id,
            name: feature.text || feature.place_name || searchQuery.trim(),
            address: feature.place_name || '',
            latitude: feature.center?.[1],
            longitude: feature.center?.[0],
            placeId: feature.id
          })) ?? []

        setSuggestions(mappedSuggestions)
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return
        }
        setFetchError(err.message || 'Unable to fetch location suggestions.')
        setSuggestions([])
      } finally {
        setIsLoadingSuggestions(false)
      }
    }, 350)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const handleLocationPress = useCallback(async () => {
    if (isFetchingCurrentLocation) return

    try {
      setIsFetchingCurrentLocation(true)
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to use your current location.'
        )
        return
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      })

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      })

      const addressRecord = reverseGeocode[0]
      const formattedAddress = addressRecord
        ? [
            addressRecord.name || addressRecord.street,
            addressRecord.city,
            addressRecord.region,
            addressRecord.country
          ]
            .filter(Boolean)
            .join(', ')
        : `Lat: ${currentLocation.coords.latitude.toFixed(4)}, Lng: ${currentLocation.coords.longitude.toFixed(4)}`

      setInputValue(formattedAddress)
      setSearchQuery(formattedAddress)
      setShowSuggestions(false)
      onChangeText?.(formattedAddress)
      onLocationSelect?.({
        name: addressRecord?.name || 'Current Location',
        address: formattedAddress,
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        placeId: addressRecord?.postalCode || undefined
      })
    } catch (err) {
      console.error('Error fetching current location:', err)
      Alert.alert(
        'Location Error',
        'Unable to fetch your current location. Please try again.'
      )
    } finally {
      setIsFetchingCurrentLocation(false)
    }
  }, [isFetchingCurrentLocation, onChangeText, onLocationSelect])

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
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
      setShowSuggestions(searchQuery.trim().length > 0)
    },
    [isFocused, animatedValue, searchQuery]
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
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
      // Only hide suggestions if there are no suggestions or if the input is empty
      // This prevents hiding when keyboard dismisses but user might still want to see suggestions
      blurTimeoutRef.current = setTimeout(() => {
        if (!searchQuery.trim() || suggestions.length === 0) {
          setShowSuggestions(false)
        }
      }, 250)
    },
    [isFocused, animatedValue, searchQuery, suggestions.length]
  )

  // Stable border color interpolation
  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [borderColors.default, borderColors.focused],
    extrapolate: "clamp",
  })

  const handleTextChange = useCallback(
    (text: string) => {
      setInputValue(text)
      setSearchQuery(text)
      setShowSuggestions(text.trim().length > 0)
      onChangeText?.(text)
    },
    [onChangeText]
  )

  const handleSuggestionSelect = useCallback(
    (suggestion: any) => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
      setInputValue(suggestion.address || suggestion.name)
      setSearchQuery(suggestion.address || suggestion.name)
      setShowSuggestions(false)
      onChangeText?.(suggestion.address || suggestion.name)
      onLocationSelect?.(suggestion)
      // Dismiss keyboard after selection
      Keyboard.dismiss()
    },
    [onChangeText, onLocationSelect]
  )

  const handleWrapperPress = useCallback(() => {
    if (!showSuggestions) {
      Keyboard.dismiss()
    } else {
      // If suggestions are showing, hide them when tapping outside
      setShowSuggestions(false)
      Keyboard.dismiss()
    }
  }, [showSuggestions])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={handleWrapperPress} accessible={false}>
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
              value={inputValue}
              onChangeText={handleTextChange}
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
              disabled={disabled || isFetchingCurrentLocation}
              className="ml-3 p-1"
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isFetchingCurrentLocation ? (
                <ActivityIndicator size="small" color="#6B7280" />
              ) : (
              <MapPinIcon size={20} color={disabled ? "#9CA3AF" : "#6B7280"} />
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Suggestions */}
          {showSuggestions && (
            <View className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64">
              <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              >
                {isLoadingSuggestions && (
                  <View className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-100">
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text className="text-sm font-NunitoMedium text-gray-500">
                      Searching Mapbox...
                    </Text>
                  </View>
                )}

                {fetchError && (
                  <View className="px-4 py-3 border-b border-red-100 bg-red-50">
                    <Text className="text-sm font-NunitoMedium text-red-600">
                      {fetchError}
                    </Text>
                  </View>
                )}

                {!isLoadingSuggestions && !fetchError && suggestions.length === 0 && (
                  <View className="px-4 py-3">
                    <Text className="text-sm font-NunitoMedium text-gray-500">
                      No suggestions yet. Keep typing to search Mapbox.
                    </Text>
                  </View>
                )}

                {suggestions.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion.id}
                    onPress={() => handleSuggestionSelect(suggestion)}
                    activeOpacity={0.7}
                    className="px-4 py-3 border-b border-gray-100 flex-row items-center"
                  >
                    <MapPinIcon size={18} color="#D30309" />
                    <View className="ml-3 flex-1">
                      <Text className="text-base font-NunitoBold text-gray-900">
                        {suggestion.name}
                      </Text>
                      <Text className="text-sm font-NunitoMedium text-gray-500">
                        {suggestion.address}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

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
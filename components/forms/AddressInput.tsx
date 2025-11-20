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
  ActivityIndicator,
  Dimensions
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
  scrollViewRef?: React.RefObject<ScrollView>
  showCurrentLocationButton?: boolean
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
  noMargin = false,
  scrollViewRef,
  showCurrentLocationButton = false
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<TextInput>(null)
  const containerRef = useRef<View>(null)
  const animatedValue = useRef(new Animated.Value(0)).current
  const animationRef = useRef<Animated.CompositeAnimation | null>(null)
  const [inputValue, setInputValue] = useState(value ?? '')
  const [searchQuery, setSearchQuery] = useState(value ?? '')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [isFetchingCurrentLocation, setIsFetchingCurrentLocation] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const geocodeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // Function to scroll input into view
  const scrollInputIntoView = useCallback(() => {
    if (!containerRef.current || !inputRef.current) return

    // Wait a bit for keyboard to fully show and layout to settle
    setTimeout(() => {
      containerRef.current?.measureInWindow((x, y, width, height) => {
        const screenHeight = Dimensions.get('window').height
        // Account for suggestions dropdown height if showing
        const suggestionsHeight = showSuggestions ? 256 : 0
        const totalHeight = height + suggestionsHeight
        const inputBottom = y + totalHeight
        const visibleAreaBottom = screenHeight - keyboardHeight
        const padding = 20 // Padding above keyboard

        // If input would be hidden by keyboard, scroll it into view
        if (inputBottom > visibleAreaBottom - padding && keyboardHeight > 0) {
          const scrollNeeded = inputBottom - (visibleAreaBottom - padding)

          // Try to scroll parent ScrollView if ref is provided
          if (scrollViewRef?.current) {
            // For ScrollView, we need to scroll by the amount needed
            // We'll use a relative scroll by measuring current position
            scrollViewRef.current.scrollTo({
              y: scrollNeeded,
              animated: true,
            })
          } else {
            // Without parent ScrollView ref, KeyboardAvoidingView should handle it
            // But we can try to ensure the input stays focused
            // This is a fallback - ideally parent should pass scrollViewRef
            if (Platform.OS === 'android') {
              // On Android, try to use a workaround
              inputRef.current?.focus()
            }
          }
        }
      })
    }, Platform.OS === 'ios' ? 250 : 350)
  }, [keyboardHeight, scrollViewRef, showSuggestions])

  // Keyboard listeners to track keyboard height and scroll into view
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height)
        // If input is focused when keyboard shows, scroll it into view
        if (isFocused) {
          setTimeout(() => {
            scrollInputIntoView()
          }, Platform.OS === 'ios' ? 50 : 100)
        }
      }
    )

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0)
      }
    )

    return () => {
      keyboardWillShow.remove()
      keyboardWillHide.remove()
    }
  }, [isFocused, scrollInputIntoView])

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
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current)
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

  // Geocode address to get coordinates
  const geocodeAddress = useCallback(async (address: string) => {
    if (!address.trim() || !ENV_CONFIG.MAPBOX_ACCESS_TOKEN) {
      return null
    }

    try {
      setIsGeocoding(true)
      const encodedQuery = encodeURIComponent(address.trim())
      const params = new URLSearchParams({
        access_token: ENV_CONFIG.MAPBOX_ACCESS_TOKEN,
        country: 'ng',
        limit: '1',
        types: 'address,place,poi'
      })

      const response = await fetch(
        `${ENV_CONFIG.MAPBOX_PLACES_ENDPOINT}/${encodedQuery}.json?${params.toString()}`
      )

      if (!response.ok) {
        throw new Error(`Geocoding failed with status ${response.status}`)
      }

      const data = await response.json()
      const feature = data?.features?.[0]

      if (feature && feature.center) {
        return {
          name: feature.text || address.trim(),
          address: feature.place_name || address.trim(),
          latitude: feature.center[1],
          longitude: feature.center[0],
          placeId: feature.id
        }
      }

      return null
    } catch (err) {
      console.error('Error geocoding address:', err)
      return null
    } finally {
      setIsGeocoding(false)
    }
  }, [])

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
      
      // Scroll input into view when focused
      scrollInputIntoView()
    },
    [isFocused, animatedValue, searchQuery, scrollInputIntoView]
  )

  const handleInputBlur = useCallback(
    async (e: any) => {
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
      blurTimeoutRef.current = setTimeout(async () => {
        if (!searchQuery.trim() || suggestions.length === 0) {
          setShowSuggestions(false)
        }

        // Geocode the address when user finishes typing (on blur)
        // This ensures we get coordinates even if user typed manually without selecting a suggestion
        if (inputValue.trim() && onLocationSelect) {
          const geocodedLocation = await geocodeAddress(inputValue)
          if (geocodedLocation) {
            onLocationSelect(geocodedLocation)
          }
        }
      }, 250)
    },
    [isFocused, animatedValue, searchQuery, suggestions.length, inputValue, geocodeAddress, onLocationSelect]
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

      // Clear any pending geocode
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current)
      }

      // Geocode the address after user stops typing (2 seconds delay)
      if (text.trim().length > 0) {
        geocodeTimeoutRef.current = setTimeout(async () => {
          // Only geocode if no suggestion was selected (user typed manually)
          if (!showSuggestions || suggestions.length === 0) {
            const geocodedLocation = await geocodeAddress(text)
            if (geocodedLocation && onLocationSelect) {
              onLocationSelect(geocodedLocation)
            }
          }
        }, 2000)
      }
    },
    [onChangeText, geocodeAddress, onLocationSelect, showSuggestions, suggestions.length]
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
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={handleWrapperPress} accessible={false}>
        <View 
          ref={containerRef}
          className={clsx("w-full", containerStyle1, !noMargin && "mb-4")}
        >
          {/* Label */}
          {label && (
            <View className="mb-2 flex-row items-center justify-between">
              <Text className={`text-base font-NunitoSemiBold text-gray-700 ${labelClassName}`}>
                {label}
                {required && <Text className="text-red-500 ml-1">*</Text>}
              </Text>
              {showCurrentLocationButton && (
                <TouchableOpacity
                  onPress={handleLocationPress}
                  disabled={disabled || isFetchingCurrentLocation}
                  className={`flex-row items-center px-3 py-1 rounded-full ${
                    isFetchingCurrentLocation ? 'bg-gray-100' : 'bg-blue-50'
                  }`}
                  activeOpacity={0.7}
                >
                  <MapPinIcon size={14} color={isFetchingCurrentLocation ? "#9CA3AF" : "#3B82F6"} />
                  <Text className={`text-sm font-NunitoMedium ml-1 ${
                    isFetchingCurrentLocation ? 'text-gray-400' : 'text-blue-600'
                  }`}>
                    {isFetchingCurrentLocation ? 'Getting Current Location...' : 'Pick Current Location'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Input Container */}
          <Animated.View
            className={`flex flex-row ${multiline ? 'items-start' : 'items-center'} bg-gray-50 rounded-xl px-4 py-1 ${containerStyle}`}
            style={{
              borderWidth: 1.5,
              borderColor: borderColor,
              minHeight: multiline ? 80 : undefined,
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
                maxWidth: '100%',
              }}
              textBreakStrategy="simple"
            />

            {/* Location Button */}
            <TouchableOpacity
              onPress={handleLocationPress}
              disabled={disabled || isFetchingCurrentLocation}
              className={`ml-3 p-1 ${multiline ? 'pt-3' : ''}`}
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
            <View 
              className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg"
              style={{ maxHeight: 256 }}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                nestedScrollEnabled={true}
                style={{ maxHeight: 256 }}
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
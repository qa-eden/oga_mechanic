import React, { useState, useMemo } from 'react'
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native'
import { ChevronDownIcon, XMarkIcon, CheckCircleIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline'
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal'
import { IState } from 'countries-states-cities'

interface CountryStatePickerProps {
  selectedCountry: Country | null
  selectedState: string
  onCountryChange: (country: Country) => void
  onStateChange: (state: string) => void
  showCountryPicker?: boolean
  showStatePicker?: boolean
  onCountryPickerToggle?: (show: boolean) => void
  onStatePickerToggle?: (show: boolean) => void
}

const CountryStatePicker: React.FC<CountryStatePickerProps> = ({
  selectedCountry,
  selectedState,
  onCountryChange,
  onStateChange,
  showCountryPicker = false,
  showStatePicker = false,
  onCountryPickerToggle,
  onStatePickerToggle
}) => {
  const [localShowCountryPicker, setLocalShowCountryPicker] = useState(false)
  const [localShowStatePicker, setLocalShowStatePicker] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const isControlled = onCountryPickerToggle !== undefined && onStatePickerToggle !== undefined

  const showCountry = isControlled ? showCountryPicker : localShowCountryPicker
  const showState = isControlled ? showStatePicker : localShowStatePicker

  const setShowCountry = (show: boolean) => {
    if (isControlled) {
      onCountryPickerToggle?.(show)
    } else {
      setLocalShowCountryPicker(show)
    }
  }

  const setShowState = (show: boolean) => {
    if (isControlled) {
      onStatePickerToggle?.(show)
    } else {
      setLocalShowStatePicker(show)
    }
  }

  // Get states dynamically from the package
  const states = useMemo(() => {
    console.log('🔍 States calculation triggered for country:', selectedCountry?.cca2)
    
    if (!selectedCountry) {
      console.log('❌ No country selected')
      return []
    }
    
    try {
      // Import the functions dynamically to avoid issues
      const { Country: CountryData, State } = require('countries-states-cities')
      console.log('📦 Package imported successfully')
      
      const countryData = CountryData.getCountryByCode(selectedCountry.cca2)
      console.log('🌍 Country data found:', countryData?.name || 'Not found')
      
      if (countryData) {
        const countryStates = State.getStatesOfCountry(countryData.id)
        console.log('🏛️ States from package:', countryStates?.length || 0)
        if (countryStates && countryStates.length > 0) {
          return countryStates.map((state: IState) => state.name)
        }
      }
    } catch (error) {
      console.log('❌ Error fetching states from package:', error)
    }
    
    // Fallback for Nigeria if package fails
    if (selectedCountry.cca2 === 'NG') {
      console.log('🇳🇬 Using fallback states for Nigeria')
      return [
        'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River',
        'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano',
        'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
        'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
      ]
    }
    
    console.log('⚠️ No states found, returning empty array')
    return []
  }, [selectedCountry])

  const filteredStates = states.filter((state: string) => 
    state.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCountrySelect = (country: Country) => {
    onCountryChange(country)
    onStateChange('') // Reset state when country changes
    setShowCountry(false)
    setSearchQuery('')
  }

  const handleStateSelect = (state: string) => {
    onStateChange(state)
    setShowState(false)
    setSearchQuery('')
  }

  return (
    <>
      {/* Country Picker Modal */}
      {showCountry && (
        <CountryPicker
          countryCode={selectedCountry?.cca2 as CountryCode || 'NG'}
          visible={true}
          onSelect={handleCountrySelect}
          onClose={() => setShowCountry(false)}
          withFilter
          withFlag
          withCallingCode
          withEmoji
          // withCurrency
          withModal
          modalProps={{
            animationType: 'slide',
            transparent: true,
          }}
          theme={{
            flagSize: 25,
            fontSize: 16,
            primaryColor: '#EF4444',
            primaryColorVariant: '#FEE2E2',
            backgroundColor: '#FFFFFF',
            onBackgroundTextColor: '#1F2937',
            filterPlaceholderTextColor: '#6B7280',
          }}
          filterProps={{
            placeholder: "Search countries...",
            autoFocus: false,
          }}
        />
      )}

      {/* State Picker Modal */}
      <Modal
        visible={showState}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowState(false)}
      >
        <View className="flex-1 bg-black/20 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[70%]">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                Select State/Province
              </Text>
              <TouchableOpacity onPress={() => setShowState(false)}>
                <XMarkIcon size={24} color="gray" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="p-4 border-b border-gray-100">
              <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
                <MagnifyingGlassIcon size={20} color="gray" />
                <TextInput
                  placeholder="Search states..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="flex-1 ml-2 text-base"
                />
              </View>
            </View>

            {/* State List */}
            <FlatList
              data={filteredStates}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleStateSelect(item)}
                  className={`p-4 border-b border-gray-100 ${
                    selectedState === item ? 'bg-red-50' : ''
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-medium text-gray-900">{item}</Text>
                    {selectedState === item && (
                      <CheckCircleIcon size={24} color="#EF4444" />
                    )}
                  </View>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View className="p-8 items-center">
                  <Text className="text-gray-500 text-center">
                    {selectedCountry ? `No states found for ${selectedCountry.name} (${states.length} total)` : 'Please select a country first'}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-2">
                    Debug: States array length: {states.length}
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  )
}

export default CountryStatePicker

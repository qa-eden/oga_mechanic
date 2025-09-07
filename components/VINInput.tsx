import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useFormikContext } from 'formik'
import CustomAlert from './CustomAlert'
import { useCustomAlert } from '@/hooks/useCustomAlert'

interface VINInputProps {
  name: string
  label?: string
  placeholder?: string
  required?: boolean
  onChangeText?: (text: string) => void
  onVINLookup?: (vin: string, setFieldValue: (field: string, value: any) => void) => void
  showLookupButton?: boolean // New prop to control button visibility
}

const VINInput: React.FC<VINInputProps> = ({
  name,
  label = "VIN-Vehicle Identification Number",
  placeholder = "Enter your VIN (17 characters)",
  required = false,
  onChangeText,
  onVINLookup,
  showLookupButton = false // Default to false to avoid conflicts
}) => {
  const { values, setFieldValue, errors, touched, setFieldTouched } = useFormikContext<Record<string, any>>()
  const [localValue, setLocalValue] = useState((values as Record<string, any>)[name] || '')
  const [isLoading, setIsLoading] = useState(false)
  const [hasLookedUp, setHasLookedUp] = useState(false)
  const { visible, alertConfig, hideAlert, showSuccess, showError } = useCustomAlert()

  // Update local value when Formik value changes
  useEffect(() => {
    setLocalValue((values as Record<string, any>)[name] || '')
  }, [(values as Record<string, any>)[name]])

  const handleChange = (text: string) => {
    setLocalValue(text)
    setFieldValue(name, text)
    
    // Reset lookup flag if VIN is cleared or changed
    if (text.length < 17) {
      setHasLookedUp(false)
    }
    
    // Show warning for invalid VIN format
    if (text.length === 17 && !isValidVIN(text)) {
      showError('Invalid VIN Format', 'This VIN format appears to be invalid. Please check and try again.')
    }
    
    // Auto-trigger VIN lookup when it reaches 17 characters (only if no manual button and not already looked up)
    if (!showLookupButton && text.length === 17 && onVINLookup && !hasLookedUp && isValidVIN(text)) {
      setTimeout(() => {
        handleManualVINLookup()
      }, 1500)
    }
    
    // Call the parent onChangeText if provided
    if (onChangeText) {
      onChangeText(text)
    }
  }

  // Basic VIN validation
  const isValidVIN = (vin: string): boolean => {
    if (vin.length !== 17) return false
    
    // Check for invalid characters (I, O, Q are not allowed in VINs)
    const invalidChars = /[IOQ]/i
    if (invalidChars.test(vin)) return false
    
    // Check for all same characters (likely invalid)
    if (/^(.)\1{16}$/.test(vin)) return false
    
    return true
  }

  // 1GNEK13ZX3R298984 or 4Y1SL65848Z411439 or 1GNEK13ZX3R298984


  const handleBlur = () => {
    setFieldTouched(name, true)
  }

  const handleManualVINLookup = async () => {
    if (!localValue || localValue.length !== 17) {
      showError('Invalid VIN', 'Please enter a complete 17-character VIN number.')
      return
    }

    if (!onVINLookup) {
      showError('Lookup Unavailable', 'VIN lookup service is not available.')
      return
    }

    if (isLoading || hasLookedUp) {
      return // Prevent multiple calls
    }

    setIsLoading(true)
    setHasLookedUp(true)
    try {
      await onVINLookup(localValue, setFieldValue)
      showSuccess('Vehicle Found!', 'Vehicle details have been automatically populated.')
    } catch (error) {
      console.error('VIN lookup error:', error)
      setHasLookedUp(false) // Reset flag on error so user can retry
      showError('Lookup Failed', 'Unable to find vehicle details. Please check your VIN and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View>
      <Text className="text-sm font-medium text-gray-700 mb-2">
        {label} {required && <Text className="text-red-500 text-lg">*</Text>}
      </Text>
      
      <TextInput
        value={localValue}
        onChangeText={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="border border-gray-400 rounded-xl px-4 py-4 text-base text-gray-900 bg-gray-50"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={17}
      />

      {/* Lookup Button - Shows when user starts typing and showLookupButton is true */}
      {showLookupButton && localValue.length > 0 && (
        <View className="mt-3">
          <TouchableOpacity
            onPress={handleManualVINLookup}
            disabled={isLoading || localValue.length !== 17}
            className={`py-4 px-6 rounded-xl border-2 shadow-sm ${
              isLoading || localValue.length !== 17
                ? 'bg-gray-100 border-gray-200'
                : 'bg-blue-500 border-blue-600 active:bg-blue-600'
            }`}
            style={{
              shadowColor: isLoading || localValue.length !== 17 ? '#000' : '#3B82F6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            {isLoading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="text-blue-600 font-semibold ml-3 text-base">
                  Looking up vehicle details...
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center justify-center">
                <Text className={`text-center font-semibold text-base ${
                  isLoading || localValue.length !== 17
                    ? 'text-gray-400'
                    : 'text-white'
                }`}>
                  {localValue.length === 17 ? (
                    <>
                      🔍 Lookup Vehicle Details
                    </>
                  ) : (
                    <>
                      ⏳ Complete VIN to lookup ({localValue.length}/17)
                    </>
                  )}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          
          {/* Progress indicator for VIN length */}
          {localValue.length > 0 && localValue.length < 17 && (
            <View className="mt-2">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-xs text-gray-500">VIN Progress</Text>
                <Text className="text-xs text-gray-500">{localValue.length}/17</Text>
              </View>
              <View className="w-full bg-gray-200 rounded-full h-2">
                <View 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(localValue.length / 17) * 100}%` }}
                />
              </View>
            </View>
          )}
        </View>
      )}

      {(errors as Record<string, any>)[name] && (touched as Record<string, any>)[name] && (
        <Text className="text-red-500 text-sm mt-1">{(errors as Record<string, any>)[name]}</Text>
      )}

      {/* Quick Tip */}
      <View className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
        <Text className="text-xs text-blue-800 font-medium mb-1">
          💡 <Text className="font-bold">Quick Tip:</Text> {showLookupButton 
            ? 'Start typing your VIN and a lookup button will appear below!'
            : 'Enter your 17-character VIN to automatically populate vehicle details!'
          }
        </Text>
        <Text className="text-xs text-blue-600 mb-2">
          The VIN can be found on your vehicle registration, insurance card, or on the driver's side dashboard.
        </Text>
        <Text className="text-xs text-gray-500 mb-1 hidden">
          Sample VINs for testing: 1GNEK13ZX3R298984, 4Y1SL65848Z411439
        </Text>
        <Text className="text-xs text-gray-500">
          Note: VIN lookup provides make, model, year, and body style. Color, transmission, and engine details may need manual entry.
        </Text>
      </View>

      {/* Custom Alert */}
      {alertConfig && (
        <CustomAlert
          visible={visible}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={hideAlert}
          type={alertConfig.type}
          autoDismiss={alertConfig.autoDismiss}
          autoDismissDelay={alertConfig.autoDismissDelay}
        />
      )}
    </View>
  )
}

export default VINInput
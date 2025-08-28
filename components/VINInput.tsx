import React, { useState, useEffect } from 'react'
import { View, Text, TextInput } from 'react-native'
import { useFormikContext } from 'formik'

interface VINInputProps {
  name: string
  label?: string
  placeholder?: string
  required?: boolean
  onChangeText?: (text: string) => void
}

const VINInput: React.FC<VINInputProps> = ({
  name,
  label = "VIN-Vehicle Identification Number",
  placeholder = "Enter your VIN (17 characters)",
  required = false,
  onChangeText
}) => {
  const { values, setFieldValue, errors, touched, setFieldTouched } = useFormikContext<Record<string, any>>()
  const [localValue, setLocalValue] = useState((values as Record<string, any>)[name] || '')

  // Update local value when Formik value changes
  useEffect(() => {
    setLocalValue((values as Record<string, any>)[name] || '')
  }, [(values as Record<string, any>)[name]])

  const handleChange = (text: string) => {
    setLocalValue(text)
    setFieldValue(name, text)
    
    // Call the parent onChangeText if provided
    if (onChangeText) {
      onChangeText(text)
    }
  }

  // 1GNEK13ZX3R298984 or 4Y1SL65848Z411439 or 1GNEK13ZX3R298984

  const handleBlur = () => {
    setFieldTouched(name, true)
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

      {(errors as Record<string, any>)[name] && (touched as Record<string, any>)[name] && (
        <Text className="text-red-500 text-sm mt-1">{(errors as Record<string, any>)[name]}</Text>
      )}

      {/* Quick Tip */}
      <View className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
        <Text className="text-xs text-blue-800 font-medium mb-1">
          💡 <Text className="font-bold">Quick Tip:</Text> Enter your 17-character VIN to automatically populate vehicle details!
        </Text>
        <Text className="text-xs text-blue-600 mb-2">
          The VIN can be found on your vehicle registration, insurance card, or on the driver's side dashboard.
        </Text>
        <Text className="text-xs text-gray-500 mb-1">
          Sample VINs for testing: 1GNEK13ZX3R298984, 4Y1SL65848Z411439
        </Text>
        <Text className="text-xs text-gray-500">
          Note: VIN lookup provides make, model, year, and body style. Color, transmission, and engine details may need manual entry.
        </Text>
      </View>
    </View>
  )
}

export default VINInput

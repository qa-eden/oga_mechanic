import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useFormikContext } from 'formik'
import CustomAlert from './CustomAlert'
import { useCustomAlert } from '@/hooks/useCustomAlert'
import { IdentificationIcon, CheckCircleIcon, InformationCircleIcon } from 'react-native-heroicons/outline'

interface VINInputProps {
  name?: string
  label?: string
  placeholder?: string
  required?: boolean
  value?: string
  onValueChange?: (value: string) => void
  onChangeText?: (text: string) => void
  onVINLookup?: (vin: string, setFieldValue: (field: string, value: any) => void) => void
  showLookupButton?: boolean
}

interface VINInputBaseProps extends VINInputProps {
  formikContext?: any
}

const VINInputBase: React.FC<VINInputBaseProps> = ({
  name,
  label = "VIN-Vehicle Identification Number",
  placeholder = "Enter your VIN (17 characters)",
  required = false,
  value: controlledValue,
  onValueChange,
  onChangeText,
  onVINLookup,
  showLookupButton = false,
  formikContext
}) => {
  const values = formikContext?.values || {};
  const setFieldValue = formikContext?.setFieldValue;
  const errors = formikContext?.errors || {};
  const touched = formikContext?.touched || {};
  const setFieldTouched = formikContext?.setFieldTouched;

  const [localValue, setLocalValue] = useState(
    controlledValue !== undefined 
      ? controlledValue 
      : (name ? (values as Record<string, any>)[name] : '') || ''
  );
  const [isLoading, setIsLoading] = useState(false)
  const [hasLookedUp, setHasLookedUp] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showQuickTip, setShowQuickTip] = useState(false)
  const { visible, alertConfig, hideAlert, showSuccess, showError } = useCustomAlert()

  // Sync with controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setLocalValue(controlledValue);
    }
  }, [controlledValue]);

  // Sync with Formik value if name is provided
  useEffect(() => {
    if (name && values && (values as Record<string, any>)[name] !== undefined) {
      setLocalValue((values as Record<string, any>)[name] || '');
    }
  }, [name, values]);

  const handleChange = (text: string) => {
    setLocalValue(text)
    
    if (name && setFieldValue) {
      setFieldValue(name, text)
    }

    if (onValueChange) {
      onValueChange(text)
    }
    
    // Reset lookup flags if VIN is modified
    setHasLookedUp(false)
    setIsSuccess(false)
    
    // Show warning for invalid VIN format
    if (text.length === 17 && !isValidVIN(text)) {
      showError('Invalid VIN Format', 'This VIN format appears to be invalid. Please check and try again.')
    }
    
    // Call the parent onChangeText if provided
    if (onChangeText) {
      onChangeText(text)
    }
  }

  // Auto-trigger VIN lookup when it reaches 17 characters
  useEffect(() => {
    if (localValue.length === 17 && onVINLookup && !hasLookedUp && isValidVIN(localValue)) {
      const timeoutId = setTimeout(() => {
        handleAutoVINLookup()
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [localValue, hasLookedUp, onVINLookup])

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

  const handleBlur = () => {
    if (name && setFieldTouched) {
      setFieldTouched(name, true)
    }
  }

  // 1GNEK13ZX3R298984 or 4Y1SL65848Z411439 or 1GNEK13ZX3R298984

  const handleAutoVINLookup = async () => {
    if (!localValue || localValue.length !== 17) return
    if (!onVINLookup) return
    if (isLoading || hasLookedUp) return

    setIsLoading(true)
    setHasLookedUp(true)
    setIsSuccess(false)
    try {
      await onVINLookup(localValue, setFieldValue || ((field: string, val: any) => {
        if (name && field === name && onValueChange) {
          onValueChange(val);
        }
      }))
      setIsSuccess(true)
    } catch (error) {
      console.error('VIN lookup error:', error)
      setIsSuccess(false)
      showError('Lookup Failed', 'Unable to find vehicle details. Please check your VIN and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-medium text-gray-700">
          {label} {required && <Text className="text-red-500 text-lg">*</Text>}
        </Text>

        <TouchableOpacity onPress={() => setShowQuickTip(!showQuickTip)}>
          <InformationCircleIcon size={25} color="#3B82F6" />
        </TouchableOpacity>
      </View>
      
      <View className="relative justify-center">
        <TextInput
          value={localValue}
          onChangeText={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="border border-gray-400 rounded-xl px-4 py-4 text-base text-gray-900 bg-gray-50 pr-12"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={17}
        />
        <View className="absolute right-4">
          {isLoading && <ActivityIndicator size="small" color="#3B82F6" />}
          {isSuccess && !isLoading && <CheckCircleIcon size={24} color="#10B981" />}
        </View>
      </View>

      {name && (errors as Record<string, any>)[name] && (touched as Record<string, any>)[name] && (
        <Text className="text-red-500 text-sm mt-1">{(errors as Record<string, any>)[name]}</Text>
      )}

      {showQuickTip && (
        <View className="mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
          <Text className="text-xs text-blue-800 font-medium mb-1">
            💡 <Text className="font-bold">Quick Tip:</Text> Enter your 17-character VIN to automatically populate vehicle details!
          </Text>
          <Text className="text-xs text-blue-600 mb-2">
            The VIN can be found on your vehicle registration, insurance card, or on the driver's side dashboard.
          </Text>
          <Text className="text-xs text-gray-500">
            Note: VIN lookup provides make, model, year, and body style. Color, transmission, and engine details may need manual entry.
          </Text>
        </View>
      )}

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

const FormikVINInput: React.FC<VINInputProps> = (props) => {
  const formikContext = useFormikContext<Record<string, any>>()
  return <VINInputBase {...props} formikContext={formikContext} />
}

const VINInput: React.FC<VINInputProps> = (props) => {
  // If name is provided and we are not explicitly in controlled mode, use Formik
  if (props.name && props.value === undefined) {
    return <FormikVINInput {...props} />
  }
  return <VINInputBase {...props} />
}

export default VINInput
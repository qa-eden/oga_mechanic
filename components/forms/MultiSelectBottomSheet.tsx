import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native'
import { ChevronDownIcon, CheckIcon, XMarkIcon } from 'react-native-heroicons/outline'
import CustomButton from '../CustomButton'

interface Option {
  label: string
  value: string | number
}

interface MultiSelectBottomSheetProps {
  label: string
  placeholder: string
  options: Option[]
  selectedValues?: (string | number)[]
  onValuesChange: (values: (string | number)[]) => void
  error?: any
  touched?: any
}

const { height: screenHeight } = Dimensions.get('window')

const MultiSelectBottomSheet: React.FC<MultiSelectBottomSheetProps> = ({
  label,
  placeholder,
  options,
  selectedValues = [],
  onValuesChange,
  error,
  touched
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleValue = (value: string | number) => {
    const currentValues = selectedValues || [];
    if (currentValues.includes(value)) {
      onValuesChange(currentValues.filter(v => v !== value))
    } else {
      onValuesChange([...currentValues, value])
    }
  }

  const getSelectedLabels = () => {
    if (!selectedValues || !Array.isArray(selectedValues)) return [];
    return options
      .filter(opt => selectedValues.includes(opt.value))
      .map(opt => opt.label)
  }

  const selectedLabels = getSelectedLabels()

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-NunitoMedium text-gray-700 mb-2">
          {label}
        </Text>
      )}

      {/* Trigger Button - Same design as SelectField */}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className={`bg-white border rounded-[.4rem] px-3 py-4 flex-row items-center justify-between ${
          touched && error ? 'border-red-500' : 'border-gray-300'
        }`}
        activeOpacity={0.7}
      >
        <View className="flex-1 mr-2">
          {selectedValues.length === 0 ? (
            <Text className="text-gray-400 text-sm font-NunitoMedium">
              {placeholder}
            </Text>
          ) : (
            <View className="flex-row flex-wrap gap-1">
              {selectedLabels.slice(0, 2).map((label, idx) => (
                <View key={idx} className="bg-primary-100 px-2 py-0.5 rounded">
                  <Text className="text-primary-700 text-xs font-NunitoMedium">
                    {label}
                  </Text>
                </View>
              ))}
              {selectedLabels.length > 2 && (
                <View className="bg-gray-200 px-2 py-0.5 rounded">
                  <Text className="text-gray-700 text-xs font-NunitoMedium">
                    +{selectedLabels.length - 2}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
        <ChevronDownIcon size={20} color="#6B7280" />
      </TouchableOpacity>

      {touched && error && (
        <Text className="text-red-500 text-xs mt-1 font-NunitoMedium">
          {error}
        </Text>
      )}

      {/* Bottom Sheet Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          className="flex-1 justify-end bg-black/50"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View 
              className="bg-white rounded-t-3xl flex"
              style={{ height: screenHeight * 0.7 }}
            >
              {/* Header - Fixed */}
              <View className="flex-row items-center justify-between p-5 border-b border-gray-200">
                <View className="flex-1">
                  <Text className="text-lg font-NunitoBold text-gray-900">
                    {label}
                  </Text>
                  <Text className="text-xs text-gray-500 font-NunitoMedium">
                    {selectedValues.length} selected
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsOpen(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                >
                  <XMarkIcon size={18} color="#374151" />
                </TouchableOpacity>
              </View>

              {/* Options List - Scrollable - Takes remaining space */}
              <ScrollView 
                className="flex-1"
                showsVerticalScrollIndicator={true}
              >
                {!options || options.length === 0 ? (
                  <View className="py-12 items-center">
                    <Text className="text-gray-500 text-base font-NunitoMedium">
                      No options available
                    </Text>
                  </View>
                ) : (
                  options.map((option) => {
                    const isSelected = selectedValues.includes(option.value)
                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => toggleValue(option.value)}
                        className={`flex-row items-center px-5 py-4 border-b border-gray-100 ${
                          isSelected ? 'bg-primary-50' : 'bg-white'
                        }`}
                        activeOpacity={0.7}
                      >
                        {/* Checkbox */}
                        <View 
                          className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center ${
                            isSelected 
                              ? 'bg-primary-500 border-primary-500' 
                              : 'bg-white border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <CheckIcon size={16} color="#FFF" strokeWidth={3} />
                          )}
                        </View>
                        
                        {/* Option Label */}
                        <Text className={`text-base flex-1 ${
                          isSelected 
                            ? 'text-primary-700 font-NunitoBold' 
                            : 'text-gray-700 font-NunitoMedium'
                        }`}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    )
                  })
                )}
              </ScrollView>

              {/* Footer Button - Fixed at Bottom */}
              <View className="p-5 pb-16 border-t border-gray-200 bg-white">

                <CustomButton
                  title={`Done (${selectedValues.length} selected)`}
                  onPress={() => setIsOpen(false)}
                />
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

export default MultiSelectBottomSheet
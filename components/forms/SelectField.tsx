"use client";

import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TouchableWithoutFeedback } from "react-native";
import { ChevronDownIcon } from "react-native-heroicons/outline";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onSelect?: (value: string) => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  labelStyle?: string;
  required?: boolean;
}

const SelectField = ({
  label,
  placeholder,
  options,
  value,
  onSelect,
  error,
  touched,
  disabled = false,
  labelStyle = "mb-3",
  required = false,
}: SelectFieldProps) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedOption = options.find((option) => option.value === value);
  const hasError = error && touched;

  const handleSelect = (option: SelectOption) => {
    onSelect?.(option.value);
    setShowDropdown(false);
  };

  const handlePress = () => {
    if (!disabled) {
      setShowDropdown(!showDropdown);
    }
  };

  return (
    <View className="relative">
      {label && (
        <Text
          className={`text-base font-NunitoBold text-gray-900 mb-3 ${labelStyle}`}
        >
          {label}
          {required && <Text className="text-red-500 ml-1">*</Text>}
        </Text>
      )}

      <TouchableOpacity
        onPress={handlePress}
        className={`border-2 rounded-xl px-4 py-4 flex-row items-center justify-between bg-white transition-all duration-200 ${
          hasError 
            ? "border-red-500 bg-red-50" 
            : showDropdown 
            ? "border-blue-500 bg-blue-50" 
            : "border-gray-200 hover:border-gray-300"
        } ${disabled ? "opacity-50 bg-gray-50" : ""}`}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          className={`font-NunitoMedium text-base ${
            value ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <View className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}>
          <ChevronDownIcon 
            size={20} 
            color={hasError ? "#EF4444" : showDropdown ? "#3B82F6" : "#6B7280"} 
          />
        </View>
      </TouchableOpacity>

      {hasError && (
        <Text className="text-red-500 text-sm font-NunitoMedium mt-2 ml-1">
          {error}
        </Text>
      )}

      {showDropdown && !disabled && (
        <>
          {/* Backdrop overlay */}
          <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
            <View className="absolute inset-0 -z-10" />
          </TouchableWithoutFeedback>
          
          {/* Dropdown */}
          <View className="absolute top-full left-0 right-0 bg-white border-2 border-gray-200 rounded-xl mt-2 z-50 shadow-xl shadow-gray-300 max-h-48">
            <ScrollView 
              showsVerticalScrollIndicator={false}
              className="max-h-48"
            >
              {options.map((option, index) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleSelect(option)}
                  className={`px-4 py-3.5 border-b border-gray-100 last:border-b-0 transition-colors duration-150 ${
                    option.value === value 
                      ? "bg-blue-50 border-blue-200" 
                      : "hover:bg-gray-50"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text className={`font-NunitoMedium text-base ${
                    option.value === value ? "text-blue-700" : "text-gray-700"
                  }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );
};

export default SelectField;

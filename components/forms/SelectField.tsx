"use client";

import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
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
  labelStyle = "mt-2",
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
    <View className={labelStyle}>
      {label && (
            <Text
              className={`text-base font-NunitoSemiBold text-gray-700 mb-2 ${labelStyle}`}
            >
              {label}
              {required && <Text className="text-red-500 ml-1">*</Text>}
            </Text>
          )}

      <TouchableOpacity
        onPress={handlePress}
        className={`border-2 rounded-[.6rem] px-4 py-4 flex-row items-center justify-between bg-white ${
          hasError ? "border-red-500" : "border-[#D1D5DB]"
        } ${disabled ? "opacity-50" : ""}`}
        disabled={disabled}
      >
        <Text
          className={`font-NunitoMedium text-lg ${
            value ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <ChevronDownIcon size={20} color={disabled ? "#9CA3AF" : "#6B7280"} />
      </TouchableOpacity>

      {hasError && (
        <Text className="text-red-500 text-xs font-NunitoMedium mt-1">
          {error}
        </Text>
      )}

      {showDropdown && !disabled && (
        <View className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 z-10 max-h-40">
          <ScrollView>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleSelect(option)}
                className="px-4 py-3 border-b border-gray-100"
              >
                <Text className="text-gray-900 font-NunitoMedium">
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default SelectField;

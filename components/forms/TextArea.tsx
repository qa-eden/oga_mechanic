import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";

interface TextAreaProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  touched?: boolean;
  labelStyle?: string;
  required?: boolean;
  rows?: number;
}

const TextArea = ({
  label,
  placeholder,
  error,
  touched,
  labelStyle = "mb-3",
  required = false,
  rows = 4,
  ...props
}: TextAreaProps) => {
  const hasError = error && touched;
  const minHeight = rows * 20; // Approximate height per row

  return (
    <View className="mb-6">
      {label && (
        <Text
          className={`text-base font-NunitoBold text-gray-900 ${labelStyle}`}
        >
          {label}
          {required && <Text className="text-red-500 ml-1">*</Text>}
        </Text>
      )}

      <TextInput
        multiline
        numberOfLines={rows}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        className={`border-2 rounded-xl px-4 py-4 bg-white font-NunitoMedium text-base text-gray-900 ${
          hasError 
            ? "border-red-500 bg-red-50" 
            : "border-gray-200 focus:border-blue-500"
        }`}
        style={{
          minHeight: minHeight,
          textAlignVertical: 'top',
        }}
        {...props}
      />

      {hasError && (
        <Text className="text-red-500 text-sm font-NunitoMedium mt-2 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
};

export default TextArea;

import React, { useState } from "react";
import {
  TextInput,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  TouchableOpacity,
} from "react-native";

import { InputFieldProps } from "@/types/type";
import { icons } from "@/constants";

const InputFieldPassword = ({
  label,
  icon,
  secureTextEntry = false,
  labelStyle,
  containerStyle,
  inputStyle,
  iconStyle,
  placeholder,
  isPasswordVisible,
  setIsPasswordVisible,
  ...props
}: InputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="my-2 w-full">
          <Text
            className={`text-[1.1rem] font-JakartaSemiBold text-text-400 mb-2 ${labelStyle}`}
          >
            {label}
          </Text>
          <View
            className={`flex flex-row justify-start items-center relative bg-input-background rounded-[.8rem] border ${
              isFocused ? "border-primary-500" : "border-input-border"
            } ${containerStyle}`}
          >
            <TextInput
              className={`rounded-[.8rem] p-4 font-JakartaSemiBold text-[15px] flex-1 ${inputStyle} text-left`}
              secureTextEntry={secureTextEntry}
              placeholder={placeholder}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              
              {...props}
            />

            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              className="mr-4"
            >
              <Image
                source={isPasswordVisible ? icons?.eyeOpen : icons?.eyeClosed}
                className={`w-6 h-6 ml-4 ${iconStyle}`}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default InputFieldPassword;

import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import HeaderAndDescTextCenter from "@/components/HeaderAndDescTextCenter";
import InputField from "@/components/InputField";
import InputFieldPassword from "@/components/InputFieldPassword";
import Checkbox from "@/components/Checkbox";
import AuthNavigateLink from "@/components/AuthNavigateLink";

const SignIn = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(true);
  return (
    <View>
      <View className="pt-[3rem]">
        <HeaderAndDescTextCenter header="Sign in" text1="Hi, Welcome back." />
      </View>

      <View className="px-5">
        <InputField
          label="Email address"
          placeholder="johndoe@gmail.com"
          containerStyle="mb-[1rem]"
          keyboardType="email-address"
        />

        <InputFieldPassword
          label="Password"
          placeholder="*********"
          containerStyle="mb-[1rem]"
          isPasswordVisible={isPasswordVisible}
          setIsPasswordVisible={setIsPasswordVisible}
          secureTextEntry={isPasswordVisible}
        />

        <View className="flex flex-row justify-between items-center">
          <View className="flex flex-row items-center">
            <Checkbox />
            <Text className="text-text-100">Remember me</Text>
          </View>

          <TouchableOpacity
            onPress={() => router.replace("/(auth)/(login)/forgetPassword")}
          >
            <Text className="font-NunitoSemiBold text-primary-500 text-[1rem]">
              Forgot Password ?
            </Text>
          </TouchableOpacity>
        </View>

        <CustomButton
          title="Sign In"
          onPress={() => router.replace("/(auth)/(login)/forgetPassword")}
          className="mb-4 mt-[2.5rem]"
        />

        <AuthNavigateLink
          onPress={() => router?.replace("/(auth)/(register)/sign_up")}
          text="Didn’t have an account?"
          textLink="Sign Up"
          containerClassName="mt-[1rem]"
        />
      </View>
    </View>
  );
};

export default SignIn;

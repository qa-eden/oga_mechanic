import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import HeaderAndDescTextCenter from "@/components/HeaderAndDescTextCenter";
import InputField from "@/components/InputField";
import AuthNavigateLink from "@/components/AuthNavigateLink";
import { SafeAreaView } from "react-native-safe-area-context";

const forgetPassword = () => {
  const router = useRouter();

  const handleProceed = () => {
    router.push("/(auth)/(login)/enterCode");
  };
  return (
    <SafeAreaView>
      <View className="pt-[3rem]">
        <HeaderAndDescTextCenter
          header="Forgot Password?"
          text1="Please enter your email, an OTP will be sent"
        />
      </View>

      <View className="px-5 pt-[1rem]">
        <InputField
          label="Email address"
          placeholder="johndoe@gmail.com"
          containerStyle=""
          keyboardType="email-address"
        />

        <CustomButton
          title="Proceed"
          onPress={() => handleProceed()}
          className="mb-4 mt-[1.5rem]"
        />

        <AuthNavigateLink
          onPress={() => router?.replace("/(auth)/(login)/sign_in")}
          text="Didn't have an account?"
          textLink="Sign In"
          containerClassName="mt-[1rem]"
        />
      </View>
    </SafeAreaView>
  );
};

export default forgetPassword;

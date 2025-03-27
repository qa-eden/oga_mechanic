import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Toast } from "toastify-react-native";
import { icons } from "@/constants";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import HeaderAndDescTextCenter from "@/components/HeaderAndDescTextCenter";

const AccountCreatedSucessful = () => {
  const handleSign = () => {
    Toast.error("hello");
  };
  return (
    <View className="bg-white flex-1 flex flex-col justify-between items-center py-10">
      <View></View>

      <View className="flex items-center justify-center px-5">
        <icons.splash width={200} height={100} />
        <Image source={icons.success} className="w-[70px] h-[70px] my-[2rem]" />

        <HeaderAndDescTextCenter
          header="Account created successfully"
          text1="Your account have been created successfully and you can now proceed sign in to your dashboard to see your details"
          containerStyle="px-0"
          headerStyle="font-NunitoExtraBold text-[24px]"
          textStyle="text-[16px]"
        />
      </View>

      <View className="w-full px-5 pb-10 ">
        <CustomButton
          title="Sign In"
          className="py-4"
          onPress={() => router?.replace("/(auth)/(login)/sign_in")}
        />
      </View>
    </View>
  );
};

export default AccountCreatedSucessful;

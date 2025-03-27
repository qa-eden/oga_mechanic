import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import UserAuthHeader from "@/components/UserAuthHeader";
import { StatusBar } from "expo-status-bar";
import ProgressBar from "@/components/ProgressBar";
import HeaderAndDescTextCenter from "@/components/HeaderAndDescTextCenter";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import AuthNavigateLink from "@/components/AuthNavigateLink";

const Step1 = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="px-5 flex-1">
          <StatusBar style="dark" />
          <UserAuthHeader />

          {/* ScrollView inside KeyboardAvoidingView to fix scrolling issues */}
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
          >
            <View className="py-4">
              <ProgressBar step={1} totalSteps={3} />
            </View>

            <View>
              <HeaderAndDescTextCenter
                header="Personal details"
                text1="Kindly input your personal details to continue"
                containerStyle="px-0"
              />
            </View>

            <View>
              <InputField
                label="First Name"
                placeholder="Enter your first name"
                onChangeText={(value) => setForm({ ...form, firstName: value })}
                labelStyle="mt-2"
              />
              <InputField
                label="Last Name"
                placeholder="Enter your last name"
                onChangeText={(value) => setForm({ ...form, lastName: value })}
                labelStyle="mt-2"
              />
              <InputField
                label="Email address"
                placeholder="Enter your email address"
                onChangeText={(value) => setForm({ ...form, email: value })}
                keyboardType="email-address"
                labelStyle="mt-2"
              />
              <InputField
                label="Phone number"
                placeholder="Enter your phone number"
                onChangeText={(value) => setForm({ ...form, phone: value })}
                keyboardType="phone-pad"
                labelStyle="mt-2"
              />

              {/* Use router.push instead of router.replace */}
              <CustomButton
                title="Proceed"
                className="py-4 mb-2 mt-4"
                onPress={() => router.push("/(auth)/(register)/user/step2")}
              />

              <AuthNavigateLink
                onPress={() => router.push("/(auth)/(login)/sign_in")}
                text="Already have an account?"
                textLink="Sign In"
                containerClassName="mt-[1rem]"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Step1;

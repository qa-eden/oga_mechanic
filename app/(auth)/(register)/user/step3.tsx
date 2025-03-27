import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import UserAuthHeader from "@/components/UserAuthHeader";
import { StatusBar } from "expo-status-bar";
import ProgressBar from "@/components/ProgressBar";
import HeaderAndDescTextCenter from "@/components/HeaderAndDescTextCenter";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import AuthNavigateLink from "@/components/AuthNavigateLink";
import InputFieldPassword from "@/components/InputFieldPassword";

const Step3 = () => {
  const [isPasswordVisible1, setIsPasswordVisible1] = useState(true);
  const [isPasswordVisible2, setIsPasswordVisible2] = useState(true);
  const router = useRouter();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
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
              <ProgressBar step={3} totalSteps={3} />
            </View>

            <View>
              <HeaderAndDescTextCenter
                header="Password"
                text1="Kindly set up your password "
                containerStyle="px-0"
              />
            </View>

            <View>
              <InputFieldPassword
                label="Password"
                placeholder="*********"
                containerStyle="mb-[1rem]"
                isPasswordVisible={isPasswordVisible1}
                setIsPasswordVisible={setIsPasswordVisible1}
                secureTextEntry={isPasswordVisible1}
                onChangeText={(value) =>
                  setFormData({ ...formData, password: value })
                }
              />

              <InputFieldPassword
                label="Confirm password"
                placeholder="*********"
                containerStyle="mb-[1rem]"
                isPasswordVisible={isPasswordVisible2}
                setIsPasswordVisible={setIsPasswordVisible2}
                secureTextEntry={isPasswordVisible2}
                onChangeText={(value) =>
                  setFormData({ ...formData, confirmPassword: value })
                }
              />

              <CustomButton
                title="Create account"
                className="py-4 mb-2 mt-4"
                onPress={() => router.push("/(auth)/accountCreatedSucessful")}
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

export default Step3;

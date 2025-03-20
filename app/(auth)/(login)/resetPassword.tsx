import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import HeaderAndDescTextCenter from "@/components/HeaderAndDescTextCenter";
import AuthNavigateLink from "@/components/AuthNavigateLink";
import { SafeAreaView } from "react-native-safe-area-context";
import InputFieldPassword from "@/components/InputFieldPassword";
import { Toast } from "toastify-react-native";

const ResetPassword = () => {
  const [isPasswordVisible1, setIsPasswordVisible1] = useState(true);
  const [isPasswordVisible2, setIsPasswordVisible2] = useState(true);
  const router = useRouter();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleProceed = () => {
    console.log(formData);

    if (formData.password !== formData?.confirmPassword) {
      Toast?.error("Password does not match");
    } else {
      router.push("/(auth)/resetPasswordSucessful");
    }
  };

  return (
    <SafeAreaView>
      <View className="pt-[3rem]">
        <HeaderAndDescTextCenter
          header="Reset Password"
          text1="Please create a new password"
        />
      </View>

      <View className="px-5 pt-[1rem]">
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
          title="Reset password"
          onPress={() => handleProceed()}
          className="mb-4 mt-[1.5rem]"
        />

        <AuthNavigateLink
          onPress={() => router?.replace("/(auth)/(login)/sign_in")}
          text="Didn’t Forget Password?"
          textLink="Sign In"
          containerClassName="mt-[1rem]"
        />
      </View>
    </SafeAreaView>
  );
};

export default ResetPassword;

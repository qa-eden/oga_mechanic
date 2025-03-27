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
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import AuthNavigateLink from "@/components/AuthNavigateLink";

const Step2 = () => {
  const [form, setForm] = useState({
    vin: "",
    model: "",
    modelYear: "",
    verhicleType: "",
    engineType: "",
    transmission: "",
    bodyStyle: "",
  });
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="px-5 flex-1">
        <StatusBar style="dark" />
        <UserAuthHeader />

        {/* ScrollView inside KeyboardAvoidingView to fix scrolling issues */}
        {/* <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        > */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View className="py-4">
              <ProgressBar step={2} totalSteps={3} />
            </View>

            <View>
              <HeaderAndDescTextCenter
                header="Add your car details"
                text1="Kindly input your car details to continue"
                containerStyle="px-0"
              />
            </View>

            <View>
              <InputField
                label="VIN-Vehicle Identification Number"
                placeholder="Enter your VIN"
                onChangeText={(value) => setForm({ ...form, vin: value })}
                labelStyle="mt-2"
              />
              <InputField
                label="Make & Model"
                placeholder="Enter your make & model"
                onChangeText={(value) => setForm({ ...form, model: value })}
                labelStyle="mt-2"
              />
              <InputField
                label="Model Year"
                placeholder="Enter your model year"
                onChangeText={(value) => setForm({ ...form, modelYear: value })}
                labelStyle="mt-2"
              />
              <InputField
                label="Vehicle Type"
                placeholder="Enter your vehicle type"
                onChangeText={(value) =>
                  setForm({ ...form, verhicleType: value })
                }
                labelStyle="mt-2"
              />
              <InputField
                label="Engine Type"
                placeholder="Enter your engine type"
                onChangeText={(value) =>
                  setForm({ ...form, engineType: value })
                }
                labelStyle="mt-2"
              />
              <InputField
                label="Transmission"
                placeholder="Enter your transmission"
                onChangeText={(value) =>
                  setForm({ ...form, transmission: value })
                }
                labelStyle="mt-2"
              />
              <InputField
                label="Body Style"
                placeholder="Enter your body style"
                onChangeText={(value) => setForm({ ...form, bodyStyle: value })}
                labelStyle="mt-2"
              />

              <CustomButton
                title="Proceed"
                className="py-4 mb-2 mt-4"
                onPress={() => router.push("/(auth)/(register)/user/step3")}
              />
              <CustomButton
                bgVariant="secondary"
                textVariant="secondary"
                title="Skip for now"
                className="py-4 mb-2 mt-4"
                onPress={() => router.push("/(auth)/(register)/user/step3")}
              />

              <AuthNavigateLink
                onPress={() => router.push("/(auth)/(login)/sign_in")}
                text="Already have an account?"
                textLink="Sign In"
                containerClassName="mt-[1rem]"
              />
            </View>
          </KeyboardAvoidingView>
        {/* </ScrollView> */}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default Step2;

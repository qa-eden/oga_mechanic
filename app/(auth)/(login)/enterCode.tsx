import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import HeaderAndDescTextCenter from "@/components/HeaderAndDescTextCenter";
import { icons } from "@/constants";
import { maskEmail } from "@/utils/emailUtils";
import OTPInput from "@/components/OTPInput";
import { useRouter } from "expo-router";

const EnterCode = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60); // Initial countdown value

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer); // Cleanup on unmount
    }
  }, [countdown]);

  const handleOtpComplete = (otp: string | number) => {
    setLoading(true); // Start loader
    // console.log("Entered OTP:", String(otp));

    setTimeout(() => {
      router.push("/(auth)/(login)/resetPassword");
      setLoading(false); // Stop loader after navigation
    }, 1500); // Simulating API call delay
  };

  const handleResendCode = () => {
    setCountdown(60);
  };

  return (
    <ScrollView>
      <View className="pt-[1.5rem]">
        <HeaderAndDescTextCenter
          header="Enter Code"
          text1="A six-digit OTP code has been sent to your email"
        />

        <View className="px-5 pt-6">
          <icons.tick1 />

          <Text className="font-NunitoSemiBold text-[16px] pt-5 pb-2">
            Enter the 6-digit code we texted to your linked email{" "}
            {maskEmail("emmzzyvibes@gmail.com")}
          </Text>
          <Text className="text-text-100 text-[14px]">
            This helps keep your account safe by verifying it's you
          </Text>

          <OTPInput
            numberOfDigits={6}
            onComplete={handleOtpComplete}
            countdown={countdown}
          />

          {loading ? (
            <ActivityIndicator size="large" color="#D30309" className="pt-4" />
          ) : (
            <>
              <Text className="pt-2 pb-4">Didn't receive OTP?</Text>
              {countdown > 0 ? (
                <TouchableOpacity>
                  <Text className="text-primary-500 font-NunitoSemiBold">
                    {`Resend Code (${countdown}s)`}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleResendCode}>
                  <Text className="text-primary-500 font-NunitoSemiBold">
                    {"Resend Code"}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default EnterCode;

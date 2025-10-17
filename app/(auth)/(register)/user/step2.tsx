import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { icons } from "@/constants";
import { maskEmail } from "@/utils/emailUtils";
import OTPInput from "@/components/OTPInput";
import { useRouter } from "expo-router";
import { routes } from "@/constants/routes";
import ProgressBar from "@/components/ProgressBar";
import UserAuthHeader from "@/components/UserAuthHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRegistrationStore } from "@/stores/registrationStore";
import { useRegisterStep3, useResendOTP } from "@/hooks/useRegistration";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";
import { StatusBar } from "expo-status-bar";

const Step2 = () => {
  const router = useRouter();
  const { getStepByStepData } = useRegistrationStore();
  const registerStep3Mutation = useRegisterStep3();
  const resendOTPMutation = useResendOTP();
  const { visible, alertConfig, hideAlert, showError, showSuccess } = useCustomAlert();
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
    // Get email from registration data
    const stepByStepData = getStepByStepData();
    const email = stepByStepData.email || '';

    // Use TanStack Query mutation for step 3
    registerStep3Mutation.mutate({
      email: email,
      verification_code: otp.toString()
    }, {
      onSuccess: () => {
        // Navigate to next step
    router.push(routes?.userStep3);
      },
      onError: (error: any) => {
        
        // Extract error message from API response
        let errorMessage = 'OTP verification failed. Please try again.';
        
        if (error?.response?.data?.errors) {
          const errors = error.response.data.errors;
          if (errors.verification_code && errors.verification_code.length > 0) {
            errorMessage = errors.verification_code[0];
          } else if (errors.message) {
            errorMessage = errors.message;
          }
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        // Show custom error alert
        showError('OTP Verification Error', errorMessage);
        
        // Don't navigate on error - let user try again
      }
    });
  };

  const handleResendCode = () => {
    resendOTPMutation.mutate(undefined, {
      onSuccess: () => {
        setCountdown(60);
        showSuccess('OTP Sent', 'A new verification code has been sent to your email.');
      },
      onError: (error: any) => {
        
        // Extract error message from API response
        let errorMessage = 'Failed to resend OTP. Please try again.';
        
        if (error?.response?.data?.errors) {
          const errors = error.response.data.errors;
          if (errors.email && errors.email.length > 0) {
            errorMessage = errors.email[0];
          } else if (errors.message) {
            errorMessage = errors.message;
          }
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        showError('Resend Failed', errorMessage);
      }
    });
  };

  return (
    <SafeAreaView>
      <StatusBar style="auto" />
      <View className="">
        <View className=" w-full px-4">
          <UserAuthHeader />

          <View className="pt-6 pb-2">
            <ProgressBar step={2} totalSteps={4} />
          </View>

        </View>

        <View className="px-5 pt-6">
          <icons.tick1 />

          <Text className="font-NunitoSemiBold text-[19px] pt-5 pb-2">
            Enter the 6-digit code we texted to your linked email{" "}
            {maskEmail(getStepByStepData().email || "user@example.com")}
          </Text>
          <Text className="text-text-100 text-[16px]">
            This helps keep your account safe by verifying it's you
          </Text>

          <OTPInput
            numberOfDigits={6}
            onComplete={handleOtpComplete}
            countdown={countdown}
          />

          {registerStep3Mutation.isPending ? (
            <ActivityIndicator size="large" color="#D30309" className="pt-4" />
          ) : (
            <>
              <Text className="pt-2 pb-4 text-[15px]">Didn't receive OTP?</Text>
              {countdown > 0 ? (
                <TouchableOpacity>
                  <Text className="text-primary-500 text-[16px] font-NunitoSemiBold">
                    {`Resend Code (${countdown}s)`}
                        </Text>
                </TouchableOpacity>
                            ) : (
                <TouchableOpacity 
                  onPress={handleResendCode}
                  disabled={resendOTPMutation.isPending}
                >
                  <Text className={`text-[16px] font-NunitoSemiBold ${
                    resendOTPMutation.isPending ? 'text-gray-400' : 'text-primary-500'
                  }`}>
                    {resendOTPMutation.isPending ? "Sending..." : "Resend Code"}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
      
      {/* Custom Alert */}
      {alertConfig && (
        <CustomAlert
          visible={visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={hideAlert}
        />
      )}
    </SafeAreaView>
  );
};

export default Step2;
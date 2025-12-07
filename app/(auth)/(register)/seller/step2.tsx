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
  import { useRouter, useLocalSearchParams } from "expo-router";
  import { sellerRoutes } from "@/constants/routes";
  import ProgressBar from "@/components/ProgressBar";
  import UserAuthHeader from "@/components/UserAuthHeader";
  import { SafeAreaView } from "react-native-safe-area-context";
  import { useSellerRegisterStep3 } from "@/hooks/useSellerRegistration";
  import CustomAlert from "@/components/CustomAlert";
import { StatusBar } from "expo-status-bar";
  
  const Step2 = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [countdown, setCountdown] = useState(60); // Initial countdown value
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
      title: '',
      message: '',
      type: 'error' as 'success' | 'error' | 'warning' | 'info'
    });
    
    // Get email from previous step
    const email = params.email as string || '';
    
    // Use the seller step 3 registration hook (OTP verification)
    const sellerRegistrationMutation = useSellerRegisterStep3();
  
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
      
      sellerRegistrationMutation.mutate({
        email: email,
        verification_code: otp.toString()
      }, {
        onSuccess: (response) => {
          // Navigate to next step
          router.push(sellerRoutes?.step3);
        },
        onError: (error: any) => {
          
          // Extract error message from API response
          let errorMessage = 'OTP verification failed. Please try again.';
          
          if (error?.response?.data?.errors) {
            const errors = error.response.data.errors;
            if (errors.verification_code && errors.verification_code.length > 0) {
              errorMessage = errors.verification_code[0];
            } else if (errors.email && errors.email.length > 0) {
              errorMessage = errors.email[0];
            } else if (errors.message) {
              errorMessage = errors.message;
            }
          } else if (error?.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          // Show error alert
          setAlertConfig({
            title: 'OTP Verification Error',
            message: errorMessage,
            type: 'error'
          });
          setShowAlert(true);
          
          // Auto-hide error after 3 seconds
          setTimeout(() => {
            setShowAlert(false);
          }, 3000);
        }
      });
    };
  
    const handleResendCode = () => {
      setCountdown(60);
    };
  
    return (
      <SafeAreaView>
        <StatusBar style="auto" />
        <View className="">
          <View className=" w-full px-4">
            <UserAuthHeader />
  
            <View className="pt-6 pb-2">
              <ProgressBar step={2} totalSteps={5} />
            </View>
  
          </View>
  
          <View className="px-5 pt-6">
            <icons.tick1 />
  
            <Text className="font-NunitoSemiBold text-[19px] pt-5 pb-2">
              Enter the 6-digit code we texted to your linked email{" "}
              {maskEmail(email)}
            </Text>
            <Text className="text-text-100 text-[16px]">
              This helps keep your account safe by verifying it's you
            </Text>
  
            <OTPInput
              numberOfDigits={6}
              onComplete={handleOtpComplete}
              countdown={countdown}
            />
  
            {sellerRegistrationMutation.isPending ? (
              <ActivityIndicator size="large" color="#D30309" className="pt-4" />
            ) : (
              <>
                <Text className="pt-2 pb-4 text-[15px]">Didn't receive OTP?</Text>
                {countdown > 0 ? (
                  <TouchableOpacity disabled={true}>
                    <Text className="text-gray-400 text-[16px] font-NunitoSemiBold">
                      {`Resend Code (${countdown}s)`}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={handleResendCode}>
                    <Text className="text-primary-500 text-[16px] font-NunitoSemiBold">
                      {"Resend Code"}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
        
        {/* Error Alert Modal */}
        <CustomAlert
          visible={showAlert}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setShowAlert(false)}
        />
      </SafeAreaView>
    );
  };
  
  export default Step2;
  
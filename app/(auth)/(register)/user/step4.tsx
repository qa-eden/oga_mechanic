"use client";

import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import UserAuthHeader from "@/components/UserAuthHeader";
import { StatusBar } from "expo-status-bar";
import ProgressBar from "@/components/ProgressBar";
import HeaderAndDescTextCenter from "@/components/HeaderAndDescTextCenter";
import FormikInput from "@/components/forms/FormikInput";
import FormikButton from "@/components/forms/FormikButton";
import { useRouter } from "expo-router";
import AuthNavigateLink from "@/components/AuthNavigateLink";
import { resetPasswordSchema } from "@/utils/validationSchemas";
import { routes } from "@/constants/routes";
import { useRegistrationStore } from "@/stores/registrationStore";
import { useRegisterStep4 } from "@/hooks/useRegistration";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";
import AsyncStorage from '@react-native-async-storage/async-storage';

const Step4 = () => {
  const router = useRouter();
  const { clearStepByStepData, setStepByStepData } = useRegistrationStore();
  const registerStep4Mutation = useRegisterStep4();
  const { visible, alertConfig, hideAlert, showError, showSuccess } = useCustomAlert();

  const handleStepSubmit = async (values: any, { setSubmitting }: any) => {
    
    // Use TanStack Query mutation for step 4
    registerStep4Mutation.mutate({
      password: values.password,
      password_confirm: values.confirmPassword
    }, {
      onSuccess: async (response) => {
        setSubmitting(false);
        
        try {
          // Handle registration response structure (data is nested)
          const responseData = response.data || response;
          
          // Store user data to AsyncStorage
          const userData = {
            access_token: responseData.access,
            refresh_token: responseData.refresh,
            user_id: responseData.user_id,
            email: responseData.email,
            role: responseData.role,
            message: response.message,
            referenceId: response.referenceId
          };
          
          // Store tokens and user data
          await AsyncStorage.setItem('auth_token', responseData.access);
          await AsyncStorage.setItem('refresh_token', responseData.refresh);
          await AsyncStorage.setItem('user_data', JSON.stringify(userData));
          await AsyncStorage.setItem('is_logged_in', 'true');
          
          // Call /users/roles/ endpoint after successful registration
          try {
            console.log('🔄 Fetching user roles after registration...');
            const { userAPI } = await import('@/lib/api/user');
            const rolesResponse = await userAPI.getUserRoles();
            console.log('✅ User roles fetched after registration:', rolesResponse);
            
            // Store roles data in local storage
            await AsyncStorage.setItem('user_roles_data', JSON.stringify(rolesResponse));
            console.log('✅ User roles data stored in AsyncStorage after registration');
          } catch (rolesError) {
            console.error('❌ Failed to fetch roles after registration:', rolesError);
            // Continue with registration even if roles fetch fails
          }
          
          // Show success message
          showSuccess(
            'Account Created!', 
            'Your account has been created successfully. You are now logged in.'
          );
          
          // Clear step-by-step data and navigate to role-specific home after a short delay
          setTimeout(() => {
            clearStepByStepData();
            
            // Navigate based on user role
            const role = responseData.role || 'primary_user';
            let targetRoute: string = routes?.userHome;
            
            switch (role) {
              case 'primary_user':
                targetRoute = routes?.userHome;
                break;
              case 'driver':
                targetRoute = routes?.driverHome;
                break;
              case 'mechanic':
                targetRoute = routes?.mechanicHome;
                break;
              case 'rider':
                targetRoute = routes?.riderHome;
                break;
              default:
                targetRoute = routes?.userHome;
            }
            
            router.replace(targetRoute as any);
          }, 2000);
          
        } catch (storageError) {
          clearStepByStepData();
          router.replace(routes?.userHome);
        }
      },
      onError: (error: any) => {
        setSubmitting(false);
        
        // Extract error message from API response
        let errorMessage = 'Password setup failed. Please try again.';
        
        if (error?.response?.data?.errors) {
          const errors = error.response.data.errors;
          if (errors.password && errors.password.length > 0) {
            errorMessage = errors.password[0];
          } else if (errors.message) {
            errorMessage = errors.message;
          }
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        // Show custom error alert
        showError('Password Setup Error', errorMessage);
        
        // Don't navigate on error - let user fix the issue
      }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingBottom: 200,
            }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            bounces={true}
            automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          >
            <View className="px-5">
              <UserAuthHeader />

              <View className="py-4">
                <ProgressBar step={4} totalSteps={4} />
              </View>

              <HeaderAndDescTextCenter
                header="Password"
                text1="Kindly set up your password"
                containerStyle="px-0 py-2"
              />

              <Formik
                initialValues={{
                  password: "",
                  confirmPassword: "",
                }}
                validationSchema={resetPasswordSchema}
                onSubmit={handleStepSubmit}
              >
                {() => (
                  <View>
                    <FormikInput
                      name="password"
                      label="Password"
                      placeholder="*********"
                      type="password"
                      labelStyle="mt-2"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />

                    <FormikInput
                      name="confirmPassword"
                      label="Confirm password"
                      placeholder="*********"
                      type="password"
                      labelStyle="mt-2"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />

                    {/* Spacing before buttons */}
                    <View style={{ height: 40 }} />

                    <FormikButton
                      title="Create account"
                      className="py-4 mb-2"
                      loading={registerStep4Mutation.isPending}
                    />

                    <AuthNavigateLink
                      onPress={() => router.push(routes.signIn)}
                      text="Already have an account?"
                      textLink="Sign In"
                      containerClassName="mt-4"
                    />

                    {/* Extra bottom spacing */}
                    <View style={{ height: 100 }} />
                  </View>
                )}
              </Formik>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      
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

export default Step4;

import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal } from "react-native";
import { Formik } from "formik";
import { router } from "expo-router";
import HeaderAndDescTextCenter from "@/components/HeaderAndDescTextCenter";
import AuthNavigateLink from "@/components/AuthNavigateLink";
import { loginSchema } from "@/utils/validationSchemas";
import { driverRoutes, mechanicRoutes, routes } from "@/constants/routes";
import FormikInput from "@/components/forms/FormikInput";
import FormikButton from "@/components/forms/FormikButton";
import FormikCheckbox from "@/components/forms/FormikCheckbox";
import { useUserStore } from "@/stores/userStore";
import { LoginCredentials } from "@/lib/api/user";
import { Toast } from "toastify-react-native";
import { ChevronDownIcon } from "react-native-heroicons/outline";
import CountryStatePicker from "@/components/CountryStatePicker";
import { Country } from 'react-native-country-picker-modal';
import AsyncStorage from "@react-native-async-storage/async-storage";

const SignIn = () => {
  const { login, loading, error, clearError } = useUserStore();
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('email');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>({
    cca2: 'NG',
    callingCode: ['234'],
    name: 'Nigeria',
    region: 'Africa',
    subregion: 'Western Africa',
    currency: ['NGN'],
    flag: '🇳🇬'
  });
  const [selectedState, setSelectedState] = useState<string>('');

  const getCountryFlag = (cca2: string) => {
    const countryCode = cca2?.toUpperCase();
    const flagOffset = 127397;
    return String.fromCodePoint(...countryCode.split('').map(char => char.charCodeAt(0) + flagOffset));
  };

  const getPhoneExample = (country: any) => {
    if (!country?.callingCode) return 'Enter phone number';
    const examples: { [key: string]: string } = {
      '234': '906 935 0833',
      '1': '555 123 4567',
      '44': '7700 900000',
      '33': '6 12 34 56 78',
      '49': '151 12345678',
      '81': '90 1234 5678',
      '86': '138 0013 8000',
      '91': '98765 43210'
    };
    const callingCode = Array.isArray(country.callingCode) ? country.callingCode[0] : country.callingCode;
    return examples[callingCode] || 'Enter phone number';
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  const handleSignIn = async (values: LoginCredentials, { setSubmitting, setFieldError }: any) => {
    console.log("Sign in values:", values);
    
    try {
      // Check for saved role in local storage
      const savedRole = await AsyncStorage.getItem('selectedRole');
      console.log('🔍 Raw saved role from storage:', savedRole);
      
      if (savedRole) {
        const role = JSON.parse(savedRole);
        
        // Determine the appropriate dashboard based on role
        if (role.id === 1 || role.id === 2) { // Primary user (1) or Seller (2) -> User dashboard
          console.log('🚀 Redirecting user to user dashboard');
          router.push(routes?.home as any);
        } else if (role.id === 3) {
          router.push(mechanicRoutes?.home as any);
        } else if (role.id === 4) {
          router.push(driverRoutes?.home as any);
        } else {
          // Fallback to default home route
          console.log('🚀 No specific role, using default route');
          router.push(routes?.home as any);
        }
      } else {
        // No saved role, use default route
        console.log('🚀 No saved role found, using default route');
        router.push(routes?.home as any);
      }
      
      // Clear the saved role after successful login
      await AsyncStorage.removeItem('selectedRole');
      console.log('🧹 Cleared saved role from storage');
      
    } catch (error) {
      console.error('❌ Error during sign in:', error);
      // Fallback to default home route
      router.push(routes?.home as any);
    }

    // // Additional client-side validation (optional)
    // if (!values.email || !values.email.includes("@")) {
    //   setFieldError("email", "Please enter a valid email address");
    //   setSubmitting(false);
    //   return;
    // }

    // if (!values.password || values.password.length < 6) {
    //   setFieldError("password", "Password must be at least 6 characters");
    //   setSubmitting(false);
    //   return;
    // }

    // // Clear any previous errors
    // clearError();

    // // Call login API
    // const success = await login(values);
    
    // if (success) {
    //   Toast.success("Login successful! Welcome back!");
    //   // Navigate based on user role
    //   setTimeout(() => {
    //     router.push(routes?.home);
    //   }, 1000);
    // } else {
    //   // Error toast will be shown by the store
    //   Toast.error("Login failed. Please check your credentials.");
    // }
    
    setSubmitting(false);
  };

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="pt-[2rem]">
        <HeaderAndDescTextCenter header="Sign in" text1="Hi, Welcome back." />
      </View>

      {/* Segmented Control */}
      <View className="px-5 mb-6">
        <View className="flex-row bg-gray-100 border border-gray-300 rounded-xl">
          <TouchableOpacity
            onPress={() => setLoginMethod('email')}
            className={`flex-1 py-3 px-4 rounded-xl ${loginMethod === 'email'
                ? 'bg-primary-500'
                : 'bg-transparent'
              }`}
          >
            <Text className={`text-center font-semibold ${loginMethod === 'email'
                ? 'text-white'
                : 'text-gray-500'
              }`}>
              Email address
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setLoginMethod('phone')}
            className={`flex-1 py-3 px-4 rounded-xl ${loginMethod === 'phone'
                ? 'bg-primary-500'
                : 'bg-transparent'
              }`}
          >
            <Text className={`text-center font-semibold ${loginMethod === 'phone'
                ? 'text-white'
                : 'text-gray-500'
              }`}>
              Phone number
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Formik
        initialValues={{
          email: "",
          password: "",
          rememberMe: false,
        }}
        validationSchema={loginSchema}
        onSubmit={handleSignIn}
      >
        <View className="px-5">
          {/* Phone Number Input */}
          {loginMethod === 'phone' && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Phone number
              </Text>
              <View className="flex-row items-center border border-gray-400 rounded-xl bg-gray-50">
                <TouchableOpacity
                  onPress={() => setShowCountryPicker(true)}
                  className="px-2 h-full rounded-l-xl border border-gray-200 flex-row items-center"
                >
                  <Text className="text-2xl mr-2">{getCountryFlag(selectedCountry?.cca2)}</Text>
                  <Text className="text-gray-900 font-medium mr-2">+{Array.isArray(selectedCountry?.callingCode) ? selectedCountry?.callingCode[0] : selectedCountry?.callingCode || '234'}</Text>
                  <ChevronDownIcon size={16} color="gray" />
                </TouchableOpacity>
                <View className="flex-1 m-0 p-0">
                  <TextInput
                    className="flex-1 py-4 px-4 text-base text-gray-900 bg-transparent"
                    placeholder={getPhoneExample(selectedCountry)}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>
              </View>
              
              {/* Country Picker Modal */}
              <CountryStatePicker
                selectedCountry={selectedCountry}
                selectedState={selectedState}
                onCountryChange={setSelectedCountry}
                onStateChange={setSelectedState}
                showCountryPicker={showCountryPicker}
                showStatePicker={showStatePicker}
                onCountryPickerToggle={setShowCountryPicker}
                onStatePickerToggle={setShowStatePicker}
              />
            </View>
          )}

          {/* Email Input */}
          {loginMethod === 'email' && (
            <FormikInput
              name="email"
              label="Email address"
              placeholder="johndoe@gmail.com"
              containerStyle=""
              type="email"
              required={true}
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}

          {/* Password Input */}
          <FormikInput
            name="password"
            label="Password"
            placeholder="Enter your password"
            type="password"
            containerStyle=""
            required={true}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View className="flex flex-row justify-between items-center mb-6">
            {/* Left side - Checkbox with constrained width */}
            <View className="flex-1 mr-4">
              <FormikCheckbox
                name="rememberMe"
                label="Remember me"
                labelStyle=""
                containerStyle="flex-shrink"
              />
            </View>

            {/* Right side - Forgot Password */}
            <View className="flex-shrink-0">
              <TouchableOpacity
                onPress={() => router.push(routes?.forgotPassword)}
              >
                <Text className="font-NunitoSemiBold text-primary-500 text-[1.2rem]">
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <FormikButton 
            title={loading ? "Signing In..." : "Sign In"} 
            className="mb-6" 
            loading={loading}
            disabled={loading}
          />

          <AuthNavigateLink
            onPress={() => router?.push(routes?.signUp)}
            text="Didn't have an account?"
            textLink="Sign Up"
            containerClassName="mb-4"
          />
        </View>
      </Formik>

      {/* Country Picker Modal */}
      <CountryStatePicker
        selectedCountry={selectedCountry}
        selectedState={selectedState}
        onCountryChange={setSelectedCountry}
        onStateChange={setSelectedState}
        showCountryPicker={showCountryPicker}
        showStatePicker={showStatePicker}
        onCountryPickerToggle={setShowCountryPicker}
        onStatePickerToggle={setShowStatePicker}
      />
    </ScrollView>
  );
};

export default SignIn;
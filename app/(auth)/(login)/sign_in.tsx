import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import KeyboardAwareScrollView from "@/components/KeyboardAwareScrollView";
import { Formik } from "formik";
import { router, useLocalSearchParams } from "expo-router";
import HeaderAndDescTextCenter from "@/components/HeaderAndDescTextCenter";
import AuthNavigateLink from "@/components/AuthNavigateLink";
import { loginSchema } from "@/utils/validationSchemas";
import { riderRoutes, routes, sellerRoutes } from "@/constants/routes";
import FormikInput from "@/components/forms/FormikInput";
import FormikButton from "@/components/forms/FormikButton";
import FormikCheckbox from "@/components/forms/FormikCheckbox";
import { LoginCredentials } from "@/lib/api/user";
import { useLogin } from "@/hooks/useLogin";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";
import { ChevronDownIcon } from "react-native-heroicons/outline";
import CountryStatePicker from "@/components/CountryStatePicker";
import { Country } from 'react-native-country-picker-modal';
import { useRoles } from "@/hooks/useRoles";

const SignIn = () => {
  const loginMutation = useLogin();
  const { visible, alertConfig, hideAlert, showError, showSuccess } = useCustomAlert();

  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('email');
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

  const {
    refetch: refetchRoles
  } = useRoles();

  // Get user type from route params (set during registration)
  const params = useLocalSearchParams();
  const userType = params.userType as string;

  // Memoize expensive calculations
  const getCountryFlag = useMemo(() => (cca2: string) => {
    const countryCode = cca2?.toUpperCase();
    const flagOffset = 127397;
    return String.fromCodePoint(...countryCode.split('').map(char => char.charCodeAt(0) + flagOffset));
  }, []);

  const getPhoneExample = useMemo(() => (country: any) => {
    if (!country?.callingCode) return 'Enter phone number';
    const examples: { [key: string]: string } = {
      '234': '0906 935 0833',
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
  }, []);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  const handleSignIn = async (values: any, { setSubmitting, setFieldError }: any) => {
    // router.replace(sellerRoutes?.home);

    try {
      // Prepare login credentials based on login method
      const credentials: LoginCredentials = {
        password: values.password,
      };

      if (loginMethod === 'email') {
        credentials.email = values.email;
      } else {
        // For phone login, combine country code with phone number
        const countryCode = Array.isArray(selectedCountry?.callingCode)
          ? selectedCountry?.callingCode[0]
          : selectedCountry?.callingCode || '234';
        // credentials.phone_number = `+${countryCode}${values.phone_number}`;
        credentials.phone_number = `${values.phone_number}`;
      }

      // Call login mutation
      loginMutation.mutate(credentials, {
        onSuccess: (response) => {
          showSuccess('Login Successful!', 'Welcome back!');
          setSubmitting(false);

          // Immediate navigation - no delay
          router.replace(routes?.userHome);
          // router.replace(sellerRoutes?.home as any);
        },
        onError: (error: any) => {

          // Extract error message
          let errorMessage = 'Login failed. Please check your credentials.';

          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            if (errors.email) {
              errorMessage = errors.email[0];
            } else if (errors.password) {
              errorMessage = errors.password[0];
            } else if (errors.phone_number) {
              errorMessage = errors.phone_number[0];
            }
          }

          showError('Login Failed', errorMessage);
          setSubmitting(false);
        }
      });

    } catch (error) {
      showError('Login Failed', 'An unexpected error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAwareScrollView>
      <View className="pt-[2rem]">
        <HeaderAndDescTextCenter
          header={userType ? `Sign in as ${userType.charAt(0).toUpperCase() + userType.slice(1)}` : "Sign in"}
          text1={userType ? `Hi, Welcome back ${userType}.` : "Hi, Welcome back."}
        />
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
          phone_number: "",
          password: "",
          rememberMe: false,
          loginMethod: loginMethod,
        }}
        validationSchema={loginSchema}
        onSubmit={handleSignIn}
        enableReinitialize={true}
        context={{ loginMethod }}
      >
        {({ values, setFieldValue, errors, touched }) => (
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
                    value={values.phone_number}
                    onChangeText={(text) => setFieldValue('phone_number', text)}
                  />
                </View>
                {errors.phone_number && touched.phone_number && (
                  <Text className="text-red-500 text-sm mt-1 px-2">
                    {errors.phone_number}
                  </Text>
                )}
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
            title={loginMutation.isPending ? "Signing In..." : "Sign In"}
            className="mb-6"
            loading={loginMutation.isPending}
            disabled={loginMutation.isPending}
          />

          <AuthNavigateLink
            onPress={() => router?.push(routes?.register)}
            text="Didn't have an account?"
            textLink="Sign Up"
            containerClassName="mb-4"
          />
        </View>
        )}
      </Formik>

      {/* Country Picker Modal - Only render when needed */}
      {showCountryPicker && (
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
      )}


      {/* Custom Alert */}
      {alertConfig && (
        <CustomAlert
          visible={visible}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={hideAlert}
          type={alertConfig.type}
        />
      )}
    </KeyboardAwareScrollView>
  );
};

export default SignIn;
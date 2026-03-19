import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ChevronLeftIcon } from "react-native-heroicons/solid";
import { 
  CameraIcon, 
  UserIcon, 
  EnvelopeIcon,
  TruckIcon, 
  CreditCardIcon,
  ChevronRightIcon,
} from "react-native-heroicons/outline";
import { useRiderProfile, useBanks, useVerifyBank, userProfileKeys } from "@/hooks/useUserProfile";
import { userAPI } from "@/lib/api/user";
import { showToast } from "@/utils/toastUtils";
import { useQueryClient } from "@tanstack/react-query";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import FormikInput from "@/components/forms/FormikInput";
import AddressInput from "@/components/forms/AddressInput";
import SelectField from "@/components/forms/SelectField";
import DateInput from "@/components/forms/DateInput";
import RadioGroup from "@/components/forms/RadioGroup";
import InputField from "@/components/InputField";
import { LinearGradient } from "expo-linear-gradient";
import { getStatesByCountry, getCitiesByState } from "@/constants/locationData";
import ProgressBar from "@/components/ProgressBar";

const step1Schema = Yup.object().shape({
  full_name: Yup.string().required("Full name is required"),
  phone_number: Yup.string().required("Phone number is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  gender: Yup.string().required("Gender is required"),
  date_of_birth: Yup.string().required("Date of birth is required"),
});

const step2Schema = Yup.object().shape({
  state: Yup.string().required("State is required"),
  location: Yup.string().required("Location is required"),
  city: Yup.string().required("City is required"),
});

const step3Schema = Yup.object().shape({
  ride_type: Yup.string().required("Ride Type is required"),
  license_plate: Yup.string().required("License Plate is required"),
});

const step4Schema = Yup.object().shape({
  bank_name: Yup.string().required("Required"),
  account_number: Yup.string().required("Required"),
});

const getValidationSchema = (step: number) => {
  switch (step) {
    case 1: return step1Schema;
    case 2: return step2Schema;
    case 3: return step3Schema;
    case 4: return step4Schema;
    default: return step1Schema;
  }
};

const EditRiderProfile = () => {
  const queryClient = useQueryClient();
  const formikRef = useRef<FormikProps<any>>(null);
  const { data: profileData, isLoading: isLoadingProfile } = useRiderProfile();
  const { data: banksData } = useBanks();
  const { mutate: verifyBank, isPending: isVerifyingBank } = useVerifyBank();
  
  const riderProfile = profileData?.data?.rider_profile;
  const userObj = riderProfile?.user;

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [initialValues, setInitialValues] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    gender: "",
    date_of_birth: "",
    state: "",
    location: "",
    city: "",
    ride_type: "",
    license_plate: "",
    bank_name: "",
    account_number: "",
    profile_picture: "",
  });

  const [accountName, setAccountName] = useState<string>("");

  useEffect(() => {
    if (riderProfile) {
      const initialLocation = riderProfile.location || "";
      let initialState = riderProfile.state || "";
      let initialCity = riderProfile.city || "";

      if (initialLocation && (!initialState || !initialCity)) {
        const states = getStatesByCountry('NG');
        const matchedState = states.find(s => initialLocation.toLowerCase().includes(s.name.toLowerCase()));
        if (matchedState) {
          if (!initialState) initialState = matchedState.name;
          const cities = getCitiesByState('NG', matchedState.name);
          const matchedCity = cities.find(c => initialLocation.toLowerCase().includes(c.toLowerCase()));
          if (matchedCity && !initialCity) initialCity = matchedCity;
        }
      }

      setInitialValues({
        full_name: riderProfile.full_name || (userObj?.first_name && userObj?.last_name ? `${userObj.first_name} ${userObj.last_name}`.trim() : ""),
        email: userObj?.email || "",
        phone_number: riderProfile.phone_number || userObj?.phone_number || "",
        gender: riderProfile.gender || "",
        date_of_birth: riderProfile.date_of_birth || "",
        state: initialState,
        location: initialLocation,
        city: initialCity,
        ride_type: riderProfile.ride_type || "",
        license_plate: riderProfile.license_plate || "",
        bank_name: riderProfile.bank_name || "",
        account_number: riderProfile.account_number || "",
        profile_picture: riderProfile.selfie || userObj?.profile_image || userObj?.image || "",
      });
    }
  }, [riderProfile, userObj]);

  const handleNextStep = async (validateForm: any, setTouched: any) => {
    const errors = await validateForm();
    if (Object.keys(errors).length > 0) {
      setTouched(errors);
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSave = async (values: any, { setSubmitting }: any) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('requestType', 'inbound');
      
      formData.append('full_name', values.full_name);
      formData.append('email', values.email);
      formData.append('phone_number', values.phone_number);
      formData.append('gender', values.gender);
      formData.append('date_of_birth', values.date_of_birth);
      formData.append('state', values.state);
      formData.append('location', values.location);
      formData.append('city', values.city);
      formData.append('ride_type', values.ride_type);
      formData.append('license_plate', values.license_plate);
      formData.append('bank_name', values.bank_name);
      formData.append('account_number', values.account_number);

      if (values.profile_picture && (values.profile_picture.startsWith('data:') || values.profile_picture.startsWith('file:'))) {
        formData.append('selfie', {
            uri: values.profile_picture,
            name: `profile_${Date.now()}.jpg`,
            type: 'image/jpeg'
        } as any);
      }

      await userAPI.submitRiderKYC(formData);
      queryClient.invalidateQueries({ queryKey: userProfileKeys.all });
      showToast.success("Profile updated successfully");
      router.back();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update profile";
      showToast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImagePick = async (field: string, setFieldValue: any) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showToast.error("Permission required!");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });
      if (!result.canceled && result.assets[0].base64) {
        setFieldValue(field, `data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      showToast.error("Failed to pick image");
    }
  };

  const SectionHeader = ({ icon: Icon, title, color = "#D30309", bgColor = "bg-primary-50" }: any) => (
    <View className="flex-row items-center mb-6">
      <View className={`w-10 h-10 ${bgColor} rounded-xl items-center justify-center mr-3`}>
        <Icon size={20} color={color} />
      </View>
      <Text className="text-lg font-NunitoBold text-gray-900">{title}</Text>
    </View>
  );

  const handleBankAccountLookup = (accountNumber: string, bankName: string, setFieldError: any, setFieldTouched: any) => {
    if (accountNumber.length === 10 && bankName) {
      setFieldError("account_number", undefined);
      const bank = (banksData as any)?.data?.find((b: any) => b.name === bankName);
      if (bank) {
        verifyBank({
          requestType: "inbound",
          data: {
            account_number: accountNumber,
            bank_code: bank.code
          }
        }, {
          onSuccess: (res: any) => {
            if (res.status && res.data?.account_name) {
              setAccountName(res.data.account_name);
              setFieldError("account_number", undefined);
            } else {
              setAccountName("");
              setFieldError("account_number", res.message || "Could not verify account");
              setFieldTouched("account_number", true);
            }
          },
          onError: (err: any) => {
            setAccountName("");
            setFieldError("account_number", err.response?.data?.message || "Account verification service is temporarily unavailable.");
            setFieldTouched("account_number", true);
          }
        });
      }
    } else {
      setAccountName("");
      setFieldError("account_number", undefined);
    }
  };

  if (isLoadingProfile) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#D30309" />
      </View>
    );
  }

  // Define userProfileKeys inside component to avoid import issues or define properly above
  // Define userProfileKeys inside component to avoid import issues or define properly above

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-5 py-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity
          onPress={() => currentStep === 1 ? router.back() : handlePrevStep()}
          className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3"
        >
          <ChevronLeftIcon size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-NunitoBold text-gray-900">Edit Profile</Text>
      </View>

      {/* Progress Bar */}
      <View className="py-4 border-b border-gray-100 bg-white">
        <ProgressBar step={currentStep} totalSteps={totalSteps} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <Formik 
            innerRef={formikRef}
            initialValues={initialValues} 
            validationSchema={getValidationSchema(currentStep)} 
            enableReinitialize 
            onSubmit={handleSave}
        >
          {({ handleSubmit, setFieldValue, values, errors, touched, isSubmitting, handleChange, handleBlur, setFieldError, setFieldTouched, validateForm, setTouched }) => (
            <View className="px-5 pt-6">

              {/* STEP 1: PERSONAL INFORMATION */}
              {currentStep === 1 && (
                <View>
                  <SectionHeader icon={UserIcon} title="Personal Information" />
                  
                  <View className="items-center mb-8">
                    <TouchableOpacity onPress={() => handleImagePick("profile_picture", setFieldValue)} className="relative">
                      <View className="w-28 h-28 rounded-2xl items-center justify-center border-4 border-white shadow-lg mb-3 overflow-hidden">
                        {values.profile_picture ? (
                          <Image source={{ uri: values.profile_picture }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                          <LinearGradient colors={["#D30309", "#B91C1C"]} className="w-full h-full items-center justify-center">
                            <Text className="text-4xl font-NunitoExtraBold text-white">
                              {values.full_name ? values.full_name.charAt(0).toUpperCase() : "R"}
                            </Text>
                          </LinearGradient>
                        )}
                      </View>
                      <View className="absolute bottom-3 right-0 bg-primary-500 w-9 h-9 rounded-full items-center justify-center border-3 border-white shadow-md">
                        <CameraIcon size={18} color="white" />
                      </View>
                    </TouchableOpacity>
                    <Text className="text-gray-500 font-NunitoMedium text-sm">Tap to change profile photo</Text>
                  </View>

                  <FormikInput name="full_name" placeholder="John Doe" label="Full Name" required />
                  <FormikInput name="email" placeholder="example@gmail.com" label="Email Address" editable={false} required />
                  <FormikInput name="phone_number" placeholder="080 0000 0000" label="Phone Number" keyboardType="phone-pad" required />
                  
                  <DateInput
                    label="Date of Birth"
                    placeholder="Select date"
                    value={values.date_of_birth ? new Date(values.date_of_birth) : null}
                    onDateChange={(date: Date) => setFieldValue("date_of_birth", date.toISOString().split('T')[0])}
                    error={errors.date_of_birth as string}
                    touched={touched.date_of_birth as boolean}
                    maximumDate={new Date()}
                    required
                  />

                  <RadioGroup
                    label="Gender"
                    options={[
                      { label: "Male", value: "male" },
                      { label: "Female", value: "female" }
                    ]}
                    value={values.gender}
                    onValueChange={(val: string) => setFieldValue("gender", val)}
                    error={errors.gender as string}
                    touched={touched.gender as boolean}
                    required
                  />
                </View>
              )}

              {/* STEP 2: ADDRESS DETAILS */}
              {currentStep === 2 && (
                <View>
                  <SectionHeader icon={EnvelopeIcon} title="Address Details" color="#3B82F6" bgColor="bg-blue-50" />
                  
                  <AddressInput
                    label="Home Address"
                    value={values.location}
                    onChangeText={(text: string) => {
                      setFieldValue("location", text);
                      if (text.length > 3) {
                        const states = getStatesByCountry('NG');
                        const matchedState = states.find(s => text.toLowerCase().includes(s.name.toLowerCase()));
                        if (matchedState && !values.state) {
                          setFieldValue("state", matchedState.name);
                          const cities = getCitiesByState('NG', matchedState.name);
                          const matchedCity = cities.find(c => text.toLowerCase().includes(c.toLowerCase()));
                          if (matchedCity && !values.city) {
                            setFieldValue("city", matchedCity);
                          }
                        }
                      }
                    }}
                    onLocationSelect={(loc: any) => {
                        setFieldValue("location", loc.address || loc.name);
                    }}
                    placeholder="Enter your address"
                    error={errors.location as string}
                    touched={touched.location as boolean}
                    required
                  />
                  
                  <SelectField
                    label="State"
                    name="state"
                    placeholder="Select State"
                    options={getStatesByCountry('NG').map(s => ({ label: s.name, value: s.name }))}
                    value={values.state}
                    onValueChange={(val: string) => setFieldValue("state", val)}
                    error={errors.state as string}
                    touched={touched.state as boolean}
                    required
                  />

                  <SelectField
                    label="City"
                    name="city"
                    placeholder="Select City"
                    options={getCitiesByState('NG', values.state).map(c => ({ label: c, value: c }))}
                    value={values.city}
                    onValueChange={(val: string) => setFieldValue("city", val)}
                    error={errors.city as string}
                    touched={touched.city as boolean}
                    required
                  />
                </View>
              )}

              {/* STEP 3: RIDE INFORMATION */}
              {currentStep === 3 && (
                <View>
                  <SectionHeader icon={TruckIcon} title="Ride Information" color="#10B981" bgColor="bg-green-50" />
                  
                  <SelectField
                    label="Ride Type"
                    name="ride_type"
                    placeholder="Select ride type"
                    options={[
                      { label: "Motorcycle / Bike", value: "motorcycle" },
                      { label: "Bicycle", value: "bicycle" }
                    ]}
                    value={values.ride_type}
                    onValueChange={(val: string) => setFieldValue("ride_type", val)}
                    required
                    error={errors.ride_type as string}
                    touched={touched.ride_type as boolean}
                  />

                  <InputField
                    label="License Plate"
                    placeholder="ABC 123 XY"
                    value={values.license_plate}
                    onChangeText={handleChange("license_plate")}
                    onBlur={handleBlur("license_plate")}
                    error={errors.license_plate}
                    touched={touched.license_plate}
                    required
                  />
                </View>
              )}

              {/* STEP 4: BANKING INFORMATION */}
              {currentStep === 4 && (
                <View>
                  <SectionHeader icon={CreditCardIcon} title="Banking Information" color="#F59E0B" bgColor="bg-amber-50" />
                  
                  <SelectField
                    label="Bank Name"
                    name="bank_name"
                    placeholder="Select bank"
                    options={(banksData as any)?.data?.map((b: any) => ({ label: b.name, value: b.name })) || []}
                    value={values.bank_name}
                    onValueChange={(val: string) => {
                      setFieldValue("bank_name", val);
                      if (values.account_number) handleBankAccountLookup(values.account_number, val, setFieldError, setFieldTouched);
                    }}
                    required
                  />

                  <View>
                    <InputField
                      label="Account Number"
                      placeholder="0000000000"
                      keyboardType="numeric"
                      value={values.account_number}
                      onChangeText={(val: string) => {
                        setFieldValue("account_number", val);
                        if (val.length === 10 && values.bank_name) handleBankAccountLookup(val, values.bank_name, setFieldError, setFieldTouched);
                        else if (val.length !== 10) {
                          setAccountName("");
                          setFieldError("account_number", undefined);
                        }
                      }}
                      onBlur={handleBlur("account_number")}
                      error={errors.account_number}
                      touched={touched.account_number}
                      required
                    />
                    {isVerifyingBank && <ActivityIndicator size="small" color="#D30309" className="absolute right-3 top-12" />}
                    {accountName ? (
                      <View className="bg-green-50 p-3 rounded-lg mt-1 border border-green-100">
                        <Text className="text-green-700 text-sm font-NunitoBold">{accountName}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              )}

              {/* Navigation Buttons */}
              <View className="flex-row gap-4 mt-10">
                {currentStep > 1 && (
                  <TouchableOpacity
                    onPress={handlePrevStep}
                    className="flex-1 py-4 bg-gray-100 rounded-2xl items-center justify-center"
                  >
                    <Text className="text-gray-900 font-NunitoBold text-base">Back</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  onPress={() => currentStep === totalSteps ? handleSubmit() : handleNextStep(validateForm, setTouched)}
                  disabled={isSubmitting}
                  className={`${currentStep === 1 ? 'w-full' : 'flex-1'} py-4 bg-primary-500 rounded-2xl items-center shadow-md shadow-primary-200`}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white font-NunitoBold text-base">
                      {currentStep === totalSteps ? "Save Changes" : "Next Step"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

            </View>
          )}
        </Formik>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditRiderProfile;
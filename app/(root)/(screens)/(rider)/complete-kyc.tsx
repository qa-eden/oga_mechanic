import React, { useState, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ChevronLeftIcon } from "react-native-heroicons/solid";
import { UserIcon, TruckIcon, IdentificationIcon, CameraIcon, ChevronDownIcon } from "react-native-heroicons/outline";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";

import InputField from "@/components/InputField";
import FormikInput from "@/components/forms/FormikInput";
import SelectField from "@/components/forms/SelectField";
import AddressInput from "@/components/forms/AddressInput";
import ImageUpload from "@/components/ImageUpload";
import SelfieUpload from "@/components/SelfieUpload";
import SuccessModal from "@/components/modals/SuccessModal";
import ErrorModal from "@/components/modals/ErrorModal";
import CountryStatePicker from "@/components/CountryStatePicker";
import DateInput from "@/components/forms/DateInput";
import RadioGroup from "@/components/forms/RadioGroup";
import { Country } from "react-native-country-picker-modal";
import { getStatesByCountry, getCitiesByState } from "@/constants/locationData";
import { userAPI } from "@/lib/api/user";
import { useProfileStore } from "@/hooks/useProfileStore";
import { useRiderProfile } from "@/hooks/useUserProfile";
import ProgressBar from "@/components/ProgressBar";
import LivenessCamera from "@/components/LivenessCamera";

// Type definitions for the multi-step form state
export interface FormValues {
  // Step 1: Personal
  full_name: string;
  email: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  state: string;
  location: string;
  city: string;
  latitude?: number;
  longitude?: number;

  // Step 2: Ride Details
  ride_type: string;
  license_plate: string;

  // Step 3: Identity & Docs
  government_id: string; // Document type (e.g. "nin", "passport")
  id_number: string;
}

// Global Validation Schemas per Step
const step1Schema = Yup.object().shape({
  full_name: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone_number: Yup.string().required("Phone number is required"),
  gender: Yup.string().required("Gender is required"),
  date_of_birth: Yup.date()
    .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)), "You must be at least 18 years old")
    .required("Date of birth is required"),
  state: Yup.string().required("State is required"),
  location: Yup.string().required("Location is required"),
  city: Yup.string().required("City is required"),
  latitude: Yup.number().required("Please select your address from the dropdown to verify your location"),
  longitude: Yup.number().required("Please select your address from the dropdown to verify your location"),
});

const step2Schema = Yup.object().shape({
  ride_type: Yup.string().required("Required"),
  license_plate: Yup.string().when("ride_type", {
    is: (val: string) => val !== "bicycle",
    then: (schema) => schema.required("Required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const step3Schema = Yup.object().shape({
  government_id: Yup.string().required("Required"),
  id_number: Yup.string().required("Required"),
});

const getValidationSchema = (step: number) => {
  switch (step) {
    case 1: return step1Schema;
    case 2: return step2Schema;
    case 3: return step3Schema;
    default: return step1Schema;
  }
};

const RiderKYC = () => {
  const formikRef = useRef<FormikProps<FormValues>>(null);
  const scrollRef = useRef<any>(null);
  const { data: profileData, isLoading: profileLoading } = useRiderProfile();

  const riderProfile = profileData?.data?.rider_profile;
  const userObj = riderProfile?.user;
  console.log("RIDER PROFILE DATA:", JSON.stringify(profileData, null, 2));

  const initialFullName = riderProfile?.full_name || (userObj?.first_name && userObj?.last_name ? `${userObj.first_name} ${userObj.last_name}`.trim() : "");
  const initialPhone = riderProfile?.phone_number || userObj?.phone_number || "";
  const initialEmail = userObj?.email || "";

  const [currentStep, setCurrentStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const totalSteps = 3;
  const [isAddressFocused, setIsAddressFocused] = useState(false);

  const eighteenYearsAgo = React.useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d;
  }, []);

  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Helper to safely parse date strings to Date objects (local time)
  const parseDate = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null;
    // Handle YYYY-MM-DD format explicitly to avoid UTC shift issues
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const initialValues = React.useMemo(() => ({
    full_name: initialFullName,
    email: initialEmail,
    phone_number: initialPhone,
    gender: riderProfile?.gender || "",
    date_of_birth: riderProfile?.date_of_birth || "",
    state: riderProfile?.state || "",
    location: riderProfile?.location || "",
    city: riderProfile?.city || "",
    latitude: riderProfile?.latitude || undefined,
    longitude: riderProfile?.longitude || undefined,
    ride_type: riderProfile?.ride_type || "",
    license_plate: riderProfile?.license_plate || "",
    government_id: riderProfile?.government_id || "",
    id_number: riderProfile?.id_number || ""
  }), [riderProfile, initialFullName, initialEmail, initialPhone]);

  // Prefill document and photo states from profile
  React.useEffect(() => {
    if (riderProfile) {
      if (riderProfile.government_id_front && !govtIdFront) setGovtIdFront({ uri: riderProfile.government_id_front });
      if (riderProfile.government_id_back && !govtIdBack) setGovtIdBack({ uri: riderProfile.government_id_back });
      if (riderProfile.selfie && !selfie) setSelfie({ uri: riderProfile.selfie });
      if (riderProfile.ride_photo_front && !rideFront) setRideFront({ uri: riderProfile.ride_photo_front });
      if (riderProfile.ride_photo_back && !rideBack) setRideBack({ uri: riderProfile.ride_photo_back });
    }
  }, [riderProfile]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToPosition(0, 0, true);
    }
  }, [currentStep]);

  const handleNextStep = async (validateForm: any, setTouched: any, values: FormValues) => {
    const errors = await validateForm();
    if (Object.keys(errors).length > 0) {
      // Mark all fields in current step as touched to show errors
      const touchedFields = Object.keys(errors).reduce((acc: any, key) => {
        acc[key] = true;
        return acc;
      }, {});
      setTouched(touchedFields);
      setErrorMessage("Please fill all required text fields in this step.");
      setShowErrorModal(true);
      return;
    }

    // Step-specific document validation
    if (currentStep === 1) {
      if (!selfie) {
        setErrorMessage("Please complete the liveness check (selfie) before proceeding.");
        setShowErrorModal(true);
        return;
      }
    } else if (currentStep === 3) {
      if (!govtIdFront) {
        setErrorMessage("Please upload the front of your Government ID.");
        setShowErrorModal(true);
        return;
      }
      if (values.government_id !== 'passport' && !govtIdBack) {
        setErrorMessage("Please upload the back of your Government ID.");
        setShowErrorModal(true);
        return;
      }
      if (!rideFront) {
        setErrorMessage("Please upload the front photo of your ride.");
        setShowErrorModal(true);
        return;
      }
      if (!rideBack) {
        setErrorMessage("Please upload the back photo of your ride.");
        setShowErrorModal(true);
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const finalSubmit = async (values: FormValues) => {
    // Final Validations for Photos on Submit
    if (!rideFront || !rideBack) {
      setErrorMessage("Please upload all required ride photos (Front, Back).");
      setShowErrorModal(true);
      return;
    }
    if (!selfie) {
      setErrorMessage("Please capture your selfie to complete verification.");
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      // Helper function to handle image upload if it's a local URI
      const getFileObject = (image: any) => {
        if (!image || !image.uri) return null;
        // If it's already a URL, we don't need to wrap it as a file object
        if (image.uri.startsWith('http')) return image.uri;
        
        return {
          uri: image.uri,
          name: image.name || `file_${Date.now()}.jpg`,
          type: image.type || 'image/jpeg'
        } as any;
      };

      const formData = new FormData();
      formData.append('requestType', 'inbound');

      // Step 1: Personal
      formData.append('full_name', values.full_name);
      formData.append('email', values.email);
      formData.append('phone_number', values.phone_number);
      formData.append('gender', values.gender);
      formData.append('date_of_birth', values.date_of_birth);
      formData.append('state', values.state);
      formData.append('location', values.location);
      formData.append('city', values.city);
      formData.append('latitude', values.latitude !== undefined && values.latitude !== null ? values.latitude.toString() : "");
      formData.append('longitude', values.longitude !== undefined && values.longitude !== null ? values.longitude.toString() : "");

      // Step 2: Ride Details
      formData.append('ride_type', values.ride_type);
      if (values.ride_type !== 'bicycle') {
        formData.append('license_plate', values.license_plate);
      } else {
        formData.append('license_plate', "");
      }

      // Step 3: Identity & Docs
      formData.append('government_id', values.government_id);
      formData.append('id_number', values.id_number);

      // Append Files (now as file objects or existing URLs)
      if (govtIdFront) {
        const file = getFileObject(govtIdFront);
        if (file) formData.append('government_id_front', file);
      }

      if (govtIdBack) {
        const file = getFileObject(govtIdBack);
        if (file) formData.append('government_id_back', file);
      } else if (values.government_id === 'passport' && govtIdFront) {
        // If passport, use front image for back payload
        const file = getFileObject(govtIdFront);
        if (file) formData.append('government_id_back', file);
      }

      if (rideFront) {
        const file = getFileObject(rideFront);
        if (file) formData.append('ride_photo_front', file);
      }

      if (rideBack) {
        const file = getFileObject(rideBack);
        if (file) formData.append('ride_photo_back', file);
      }

      if (selfie) {
        const file = getFileObject(selfie);
        if (file) formData.append('selfie', file);
      }

      await userAPI.submitRiderKYC(formData);

      useProfileStore.getState().setIsProfileComplete(true);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Rider KYC Submission Error:', error);
      const errMsg = error?.response?.data?.message ||
        error?.response?.data?.detail ||
        error?.message ||
        "There was an error submitting your verification. Please try again.";

      setErrorMessage(errMsg);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <View className="flex-row items-center space-x-2 mb-4">
      <View className="bg-primary-50 p-2 rounded-lg">
        <Icon size={20} color="#D30309" strokeWidth={2} />
      </View>
      <Text className="text-lg font-NunitoBold text-gray-900">{title}</Text>
    </View>
  );

  // Document states
  const [govtIdFront, setGovtIdFront] = useState<any>(null);
  const [govtIdBack, setGovtIdBack] = useState<any>(null);
  const [rideFront, setRideFront] = useState<any>(null);
  const [rideBack, setRideBack] = useState<any>(null);
  const [selfie, setSelfie] = useState<any>(null);
  const [showLivenessCamera, setShowLivenessCamera] = useState(false);

  // Country, State and Date Pickers UI State
  const [selectedCountry, setSelectedCountry] = useState<Country | null>({
    cca2: 'NG',
    name: 'Nigeria',
    callingCode: ['234'],
    flag: '🇳🇬',
    currency: ['NGN'],
    region: 'Africa',
    subregion: 'Western Africa',
    latlng: [10, 8],
    borders: ['BEN', 'CMR', 'TCD', 'NER'],
    area: 923768,
    population: 206139589,
    timezones: ['UTC+01:00'],
    continents: ['Africa'],
    flags: { png: 'https://flagcdn.com/w320/ng.png', svg: 'https://flagcdn.com/ng.svg' },
    startOfWeek: 'monday',
    capitalInfo: { latlng: [9.08, 7.53] }
  } as Country);
  const [selectedState, setSelectedState] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);

  // Convert country code to flag emoji
  const getCountryFlag = (countryCode: string | undefined) => {
    if (!countryCode) return '🇳🇬';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const getPhoneExample = (country: Country | null) => {
    if (!country) return '9069350833';
    const phoneExamples: { [key: string]: string } = {
      'NG': '9069350833', 'US': '5551234567', 'GB': '7911123456',
      'CA': '4161234567', 'IN': '9876543210', 'GH': '244123456',
      'KE': '712123456', 'ZA': '821234567', 'AU': '412345678',
      'DE': '15123456789', 'FR': '612345678',
    };
    return phoneExamples[country.cca2] || 'Enter phone number';
  };

  const pickDocument = async (type: string) => {
    if (type === "selfie") {
      setShowLivenessCamera(true);
      return;
    }

    try {
      const ExpoImagePicker = require("expo-image-picker");
      let result;

      const { status } = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;

      result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const file = {
          uri: result.assets[0].uri,
          name: `${type}_${Date.now()}.jpg`,
          type: "image/jpeg",
          size: result.assets[0].fileSize || 0,
        };
        if (type === "govt_id_front") setGovtIdFront(file);
        if (type === "govt_id_back") setGovtIdBack(file);
        if (type === "ride_front") setRideFront(file);
        if (type === "ride_back") setRideBack(file);
        if (type === "selfie") setSelfie(file);
      }
    } catch (e) {
      console.log(e);
    }
  };

  if (profileLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#D30309" />
      </SafeAreaView>
    );
  }

  if (showLivenessCamera) {
    return (
      <LivenessCamera
        onCapture={(uri) => {
          setSelfie({
            uri,
            name: `selfie_${Date.now()}.jpg`,
            type: "image/jpeg",
          });
          setShowLivenessCamera(false);
        }}
        onCancel={() => setShowLivenessCamera(false)}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-6 py-4 bg-white flex-row items-center space-x-4 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => currentStep === 1 ? router.back() : handlePrevStep()}
          className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center -ml-2"
        >
          <ChevronLeftIcon size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-NunitoBold ml-2 text-gray-900">Rider Verification</Text>
      </View>

      {/* Stepper Progress */}
      <View className="px-4 py-4 bg-white border-b border-gray-100">
        <ProgressBar step={currentStep} totalSteps={totalSteps} />
      </View>

      <KeyboardAwareScrollView
        ref={scrollRef}
        enableAutomaticScroll={true}
        extraScrollHeight={isAddressFocused ? 200 : 120}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableResetScrollToCoords={false}
      >
        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          validationSchema={getValidationSchema(currentStep)}
          onSubmit={finalSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue, validateForm, setTouched, setFieldError, setFieldTouched }) => {
            // Dynamic options calculation
            const stateOptions = getStatesByCountry('NG').map(s => ({
              label: s.name,
              value: s.name
            }));

            // Inject auto-filled state if missing
            if (values.state && !stateOptions.find(o => o.value === values.state)) {
              stateOptions.push({ label: values.state, value: values.state });
            }

            const cityOptions = getCitiesByState('NG', values.state).map(c => ({
              label: c,
              value: c
            }));

            // Inject auto-filled city if missing
            if (values.city && !cityOptions.find(o => o.value === values.city)) {
              cityOptions.push({ label: values.city, value: values.city });
            }

            return (
              <View className="p-4">

                {/* STEP 1: PERSONAL DETAILS */}
                {currentStep === 1 && (
                  <View className="space-y-4 pb-10">
                    <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
                      <SectionHeader icon={UserIcon} title="Personal Detail" />

                      <View className="space-y-4">
                        <View className="">
                          <Text className="text-base font-NunitoSemiBold text-gray-700 mb-2">Liveness Check (Selfie) <Text className="text-red-500">*</Text></Text>
                          <SelfieUpload
                            onPress={() => pickDocument("selfie")}
                            imageUri={selfie?.uri}
                          />
                        </View>

                        {!initialFullName && (
                          <FormikInput
                            name="full_name"
                            placeholder="e.g. John Doe"
                            label="Full Name"
                            required
                          />
                        )}

                        {!initialEmail && (
                          <FormikInput
                            name="email"
                            placeholder="e.g. johndoe@gmail.com"
                            label="Email Address"
                            required
                            keyboardType="email-address"
                            autoCapitalize="none"
                          />
                        )}

                        {!initialPhone && (
                          <View>
                            <Text className="text-md font-medium text-gray-700 mb-2">Phone number <Text className="text-red-500 text-lg">*</Text></Text>
                            <View className="flex-row items-center border border-gray-400 rounded-xl bg-gray-50 mb-4 ">
                              <TouchableOpacity
                                onPress={() => setShowCountryPicker(true)}
                                className="px-2 h-full rounded-l-xl border border-gray-200 flex-row items-center"
                              >
                                <Text className="text-2xl mr-2">{getCountryFlag(selectedCountry?.cca2)}</Text>
                                <Text className="text-gray-900 font-medium mr-2">+{selectedCountry?.callingCode || '234'}</Text>
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
                                  onBlur={() => setFieldTouched('phone_number', true)}
                                />
                              </View>
                            </View>
                          </View>
                        )}
                        {/* Date of Birth Field */}
                        <View>
                          <DateInput
                            label="Date of Birth"
                            placeholder="Select birth date"
                            value={values.date_of_birth ? new Date(values.date_of_birth) : null}
                            onDateChange={(date: Date) => setFieldValue("date_of_birth", date.toISOString().split('T')[0])}
                            error={errors.date_of_birth as string}
                            touched={touched.date_of_birth as boolean}
                            required
                            maximumDate={eighteenYearsAgo} // Must be at least 18 years old
                          />
                        </View>

                        {/* Gender Selection */}
                        <View className="">
                          <RadioGroup
                            label="Select Gender"
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
                      </View>
                    </View>

                    <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100" style={{ zIndex: 100 }}>
                      <SectionHeader icon={TruckIcon} title="Address Details" />
                      <View className="space-y-4" style={{ zIndex: 100 }}>
                        <View style={{ zIndex: 110, elevation: 110 }}>
                          <AddressInput
                            label="Address Location"
                            placeholder="Search for your address..."
                            value={values.location}
                            onChangeText={handleChange("location")}
                            onLocationSelect={(loc: any) => {
                              setFieldValue("location", loc.address || loc.name);
                              if (loc.latitude && loc.longitude) {
                                setFieldValue("latitude", loc.latitude);
                                setFieldValue("longitude", loc.longitude);
                              }

                              // Mapbox feature context parsing
                              if (loc.context && Array.isArray(loc.context)) {
                                const region = loc.context.find((c: any) => c.id.startsWith('region'));
                                const place = loc.context.find((c: any) => c.id.startsWith('place'));

                                if (region) setFieldValue("state", region.text);
                                if (place) setFieldValue("city", place.text);
                              } else if (loc.address) {
                                // Fallback: Try to parse from address string "City, State, Country"
                                const parts = loc.address.split(',').map((p: string) => p.trim());
                                if (parts.length >= 3) {
                                  // Assuming format like "Street, City, State, Country"
                                  setFieldValue("city", parts[parts.length - 3]);
                                  setFieldValue("state", parts[parts.length - 2]);
                                }
                              }
                            }}
                            error={errors.location || errors.latitude || errors.longitude}
                            touched={touched.location || touched.latitude || touched.longitude}
                            required
                            multiline={false}
                            numberOfLines={1}
                            showCurrentLocationButton={true}
                            onFocus={() => setIsAddressFocused(true)}
                            onBlur={() => setIsAddressFocused(false)}
                          />
                        </View>


                        <SelectField
                          label="State"
                          name="state"
                          placeholder="Select State"
                          options={stateOptions}
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
                          options={cityOptions}
                          value={values.city}
                          onValueChange={(val: string) => setFieldValue("city", val)}
                          error={errors.city as string}
                          touched={touched.city as boolean}
                          required
                        />

                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleNextStep(validateForm, setTouched, values)}
                      className="py-4 bg-gray-900 rounded-xl items-center shadow-md mt-4"
                    >
                      <Text className="text-white font-NunitoBold text-lg">Continue to Ride Info</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* STEP 2: RIDE INFO */}
                {currentStep === 2 && (
                  <View className="space-y-4 pb-10">
                    <View className="bg-white p-4 mb-4 rounded-2xl shadow-sm border border-gray-100">
                      <SectionHeader icon={TruckIcon} title="Ride Details" />

                      <View className="space-y-4 mt-4">
                        <SelectField
                          label="Ride Type"
                          name="ride_type"
                          placeholder="Select Ride Type"
                          options={[
                            { label: "Motorcycle / Bike", value: "motorcycle" },
                            { label: "Bicycle", value: "bicycle" },
                          ]}
                          value={values.ride_type}
                          onValueChange={(val: string) => setFieldValue("ride_type", val)}
                          error={errors.ride_type as string}
                          touched={touched.ride_type as boolean}
                          required
                        />

                        {values.ride_type !== 'bicycle' && (
                          <>
                            <FormikInput
                              name="license_plate"
                              label="License Plate"
                              placeholder="e.g. ABC 123 XY"
                              required
                            />
                          </>
                        )}
                      </View>
                    </View>

                    <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mt-4">
                      <SectionHeader icon={IdentificationIcon} title="Ride Photos" />
                      <View className="space-y-4">
                        <ImageUpload
                          label="Front View"
                          isUploaded={!!rideFront}
                          imageUri={rideFront?.uri}
                          onPress={() => pickDocument("ride_front")}
                          required
                        />
                        <View className="py-4">
                          <ImageUpload
                            label="Back View"
                            isUploaded={!!rideBack}
                            imageUri={rideBack?.uri}
                            onPress={() => pickDocument("ride_back")}
                            required
                          />
                        </View>
                      </View>
                    </View>

                    <View className="flex-row gap-4 mt-4">
                      <TouchableOpacity
                        onPress={handlePrevStep}
                        className="flex-1 py-4 bg-gray-100 border border-gray-300 rounded-xl items-center shadow-sm"
                      >
                        <Text className="text-gray-700 font-NunitoBold text-lg">Back</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleNextStep(validateForm, setTouched, values)}
                        className="flex-[2] py-4 bg-gray-900 rounded-xl items-center shadow-md"
                      >
                        <Text className="text-white font-NunitoBold text-lg">Continue to Identity</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* STEP 3: IDENTITY & DOCS */}
                {currentStep === 3 && (
                  <View className="space-y-4 pb-10">
                    <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                      <SectionHeader icon={IdentificationIcon} title="Identity & Documents" />

                      <View className="space-y-4">
                        <SelectField
                          label="Government ID Type"
                          name="government_id"
                          placeholder="Select ID Type"
                          options={[
                            { label: "National ID (NIN)", value: "nin" },
                            { label: "International Passport", value: "passport" },
                            { label: "Permanent Voter's Card (PVC)", value: "pvc" },
                            { label: "Driver's License", value: "driver_license" },
                            { label: "Bank Verification Number (BVN)", value: "bvn" },
                            { label: "Residence Permit", value: "residence_permit" }
                          ]}
                          value={values.government_id}
                          onValueChange={(val: string) => setFieldValue("government_id", val)}
                          error={errors.government_id}
                          touched={touched.government_id}
                          required
                        />

                        <ImageUpload
                          label={`${values.government_id ? values.government_id.toUpperCase() : 'Government ID'} (Front)`}
                          isUploaded={!!govtIdFront}
                          imageUri={govtIdFront?.uri}
                          onPress={() => pickDocument("govt_id_front")}
                          required
                        />

                        {values.government_id !== 'passport' && (
                          <View className="mt-4">
                            <ImageUpload
                              label={`${values.government_id ? values.government_id.toUpperCase() : 'Government ID'} (Back)`}
                              isUploaded={!!govtIdBack}
                              imageUri={govtIdBack?.uri}
                              onPress={() => pickDocument("govt_id_back")}
                              required
                            />
                          </View>
                        )}

                        <FormikInput
                          name="id_number"
                          label="ID Number"
                          placeholder="Enter ID number"
                          required
                        />
                      </View>
                    </View>

                    <View className="flex-row gap-4 mt-4">
                      <TouchableOpacity
                        onPress={handlePrevStep}
                        className="flex-1 py-4 bg-gray-100 border border-gray-300 rounded-xl items-center shadow-sm"
                      >
                        <Text className="text-gray-700 font-NunitoBold text-lg">Back</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleSubmit()}
                        className="flex-[2] py-4 bg-gray-900 rounded-xl items-center shadow-md"
                      >
                        <Text className="text-white font-NunitoBold text-lg">Complete Verification</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                </View>
              );
            }}
          </Formik>
        </KeyboardAwareScrollView>

      {/* Success Modal */}
      <SuccessModal
        isVisible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.back();
        }}
        title="Verification Submitted!"
        message="Your rider verification has been submitted successfully. You will be notified once it's approved."
      />

      {/* Error Modal */}
      <ErrorModal
        isVisible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
      />
    </SafeAreaView>
  );
};

export default RiderKYC;

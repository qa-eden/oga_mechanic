import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { driverRoutes } from "@/constants/routes";
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
import { productsAPI } from "@/lib/api/products";
import VINInput from "@/components/VINInput";
import { decodeVINWithImage } from "@/utils/vinDecoder";
import { useProfileStore } from "@/hooks/useProfileStore";
import { useDriverProfile } from "@/hooks/useUserProfile";
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

  // Step 2: Vehicle
  vehicle_name: string;
  vehicle_type: string;
  vehicle_model: string;
  vehicle_color: string;
  plate_number: string;
  vehicle_registration_number: string;
  vin: string;

  // Step 3: Identity & Docs
  government_id: string; // Document type (e.g. "nin", "passport")
  driver_license_type: string; // E.g. "Class B"
  license_number: string;
  license_issue_date: string;
  license_expiry_date: string;
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
  vehicle_name: Yup.string().required("Required"),
  vehicle_type: Yup.string().required("Required"),
  vehicle_model: Yup.string().required("Required"),
  vehicle_color: Yup.string().required("Required"),
  plate_number: Yup.string().required("Required"),
  vehicle_registration_number: Yup.string().required("Required"),
  vin: Yup.string().required("Required"),
});

const step3Schema = Yup.object().shape({
  government_id: Yup.string().required("Required"),
  driver_license_type: Yup.string().required("Required"),
  license_number: Yup.string().required("Required"),
  license_issue_date: Yup.date()
    .max(new Date(), "Issue date cannot be in the future")
    .required("Required"),
  license_expiry_date: Yup.date()
    .required("Required")
    .test("is-expired", "License has expired. Please ensure this is correct.", (value) => {
      if (!value) return true;
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      // Allow expired licenses but show warning
      return true;
    })
    .test("is-after-issue", "Expiry date must be after issue date", function (value) {
      const { license_issue_date } = this.parent;
      if (!value || !license_issue_date) return true;
      return new Date(value) >= new Date(license_issue_date);
    }),
});

const getValidationSchema = (step: number) => {
  switch (step) {
    case 1: return step1Schema;
    case 2: return step2Schema;
    case 3: return step3Schema;
    default: return step1Schema;
  }
};

const DriverKYC = () => {
  const formikRef = useRef<FormikProps<FormValues>>(null);
  const scrollRef = useRef<any>(null);
  const { data: profileData, isLoading: profileLoading } = useDriverProfile();

  const driverProfile = profileData?.data?.driver_profile;
  const userObj = driverProfile?.user;
  console.log("PROFILE DATA:", JSON.stringify(profileData, null, 2));
  console.log("INITIALS:", { initialFullName: driverProfile?.full_name || (userObj?.first_name && userObj?.last_name ? `${userObj.first_name} ${userObj.last_name}`.trim() : ""), initialPhone: driverProfile?.phone_number || userObj?.phone_number || "", initialEmail: userObj?.email || "" });

  const initialFullName = driverProfile?.full_name || (userObj?.first_name && userObj?.last_name ? `${userObj.first_name} ${userObj.last_name}`.trim() : "");
  const initialPhone = driverProfile?.phone_number || userObj?.phone_number || "";
  const initialEmail = userObj?.email || "";

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
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
  const [errorMessage, setErrorMessage] = useState("");

  const [vehicleMakes, setVehicleMakes] = useState<{ label: string; value: string }[]>([]);
  const [vehicleModels, setVehicleModels] = useState<{ label: string; value: string }[]>([]);
  const [allMakesData, setAllMakesData] = useState<{ name: string; models: { name: string }[] }[]>([]);
  const getSanitizedVehicleType = (type: string | undefined) => {
    if (!type) return "";
    const t = type.toLowerCase();
    if (t === "suv" || t === "sedan") return "car";
    return t;
  };

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
    gender: driverProfile?.gender || "",
    date_of_birth: driverProfile?.date_of_birth || "",
    state: driverProfile?.state || "",
    location: driverProfile?.location || "",
    city: driverProfile?.city || "",
    latitude: driverProfile?.latitude || undefined,
    longitude: driverProfile?.longitude || undefined,
    vehicle_name: driverProfile?.vehicle_name || "",
    vehicle_type: getSanitizedVehicleType(driverProfile?.vehicle_type),
    vehicle_model: driverProfile?.vehicle_model || "",
    vehicle_color: driverProfile?.vehicle_color || "",
    plate_number: driverProfile?.plate_number || "",
    vehicle_registration_number: driverProfile?.vehicle_registration_number || "",
    vin: driverProfile?.vin || "",
    government_id: driverProfile?.government_id || "",
    driver_license_type: driverProfile?.driver_license || "",
    license_number: driverProfile?.license_number || "",
    license_issue_date: driverProfile?.license_issue_date || "",
    license_expiry_date: driverProfile?.license_expiry_date || ""
  }), [driverProfile, initialFullName, initialEmail, initialPhone]);

  // Prefill document and photo states from profile
  React.useEffect(() => {
    if (driverProfile) {
      if (driverProfile.government_id_front && !govtIdFront) setGovtIdFront({ uri: driverProfile.government_id_front });
      if (driverProfile.government_id_back && !govtIdBack) setGovtIdBack({ uri: driverProfile.government_id_back });
      
      if (driverProfile.license_front_image && !licenseFront) {
        setLicenseFront({ uri: driverProfile.license_front_image });
      } else if (driverProfile.driver_license && !licenseFront) {
        setLicenseFront({ uri: driverProfile.driver_license });
      }
      
      if (driverProfile.license_back_image && !licenseBack) setLicenseBack({ uri: driverProfile.license_back_image });
      if (driverProfile.insurance_document && !insuranceDoc) setInsuranceDoc({ uri: driverProfile.insurance_document });
      
      if (driverProfile.vehicle_photo_front && !vehicleFront) setVehicleFront({ uri: driverProfile.vehicle_photo_front });
      if (driverProfile.vehicle_photo_back && !vehicleBack) setVehicleBack({ uri: driverProfile.vehicle_photo_back });
      if (driverProfile.vehicle_photo_right && !vehicleRight) setVehicleRight({ uri: driverProfile.vehicle_photo_right });
      if (driverProfile.vehicle_photo_left && !vehicleLeft) setVehicleLeft({ uri: driverProfile.vehicle_photo_left });
      
      if (driverProfile.selfie && !selfie) setSelfie({ uri: driverProfile.selfie });
    }
  }, [driverProfile]);

  React.useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        const makes = await productsAPI.getVehicleMakes();
        setAllMakesData(makes);
        const makeOptions = makes.map(make => ({ label: make.name, value: make.name }));
        setVehicleMakes(makeOptions);
      } catch (error) {
        console.error("Failed to fetch vehicle makes:", error);
      }
    };
    fetchVehicleData();
  }, []);

  // Initialize vehicle models for prefilled data
  React.useEffect(() => {
    if (allMakesData.length > 0 && driverProfile?.vehicle_name && vehicleModels.length === 0) {
      const makeObj = allMakesData.find((m: { name: string; models: { name: string }[] }) => m.name.toLowerCase() === driverProfile.vehicle_name?.toLowerCase());
      if (makeObj && makeObj.models) {
        const modelOptions = makeObj.models.map((model: { name: string }) => ({
          label: model.name,
          value: model.name
        }));
        setVehicleModels(modelOptions);
      }
    }
  }, [allMakesData, driverProfile?.vehicle_name]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToPosition(0, 0, true);
    }
  }, [currentStep]);


  const handleMakeChange = (selectedMake: string, setFieldValue: any) => {
    setFieldValue("vehicle_name", selectedMake);
    setFieldValue("vehicle_model", ""); // reset model

    const makeObj = allMakesData.find((m: { name: string; models: { name: string }[] }) => m.name === selectedMake);
    if (makeObj && makeObj.models) {
      const modelOptions = makeObj.models.map((model: { name: string }) => ({
        label: model.name, value: model.name
      }));
      setVehicleModels(modelOptions);
    } else {
      setVehicleModels([]);
    }
  };

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


  // Document states
  const [govtIdFront, setGovtIdFront] = useState<any>(null);
  const [govtIdBack, setGovtIdBack] = useState<any>(null);
  const [licenseFront, setLicenseFront] = useState<any>(null);
  const [licenseBack, setLicenseBack] = useState<any>(null);
  const [insuranceDoc, setInsuranceDoc] = useState<any>(null);

  // Vehicle Photo States
  const [vehicleFront, setVehicleFront] = useState<any>(null);
  const [vehicleBack, setVehicleBack] = useState<any>(null);
  const [vehicleRight, setVehicleRight] = useState<any>(null);
  const [vehicleLeft, setVehicleLeft] = useState<any>(null);

  // Selfie State
  const [selfie, setSelfie] = useState<any>(null);
  const [showLivenessCamera, setShowLivenessCamera] = useState(false);

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
        if (type === "license_front") setLicenseFront(file);
        if (type === "license_back") setLicenseBack(file);
        if (type === "insurance") setInsuranceDoc(file);
        if (type === "vehicle_front") setVehicleFront(file);
        if (type === "vehicle_back") setVehicleBack(file);
        if (type === "vehicle_right") setVehicleRight(file);
        if (type === "vehicle_left") setVehicleLeft(file);
        if (type === "selfie") setSelfie(file);
      }
    } catch (e) {
      console.log(e);
    }
  };

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
      if (!licenseFront) {
        setErrorMessage("Please upload the front of your Driver's License.");
        setShowErrorModal(true);
        return;
      }
      if (!licenseBack) {
        setErrorMessage("Please upload the back of your Driver's License.");
        setShowErrorModal(true);
        return;
      }
      if (!insuranceDoc) {
        setErrorMessage("Please upload your Comprehensive Insurance Document.");
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
    if (!vehicleFront || !vehicleBack || !vehicleRight || !vehicleLeft) {
      setErrorMessage("Please upload all 4 required vehicle photos (Front, Back, Right, Left).");
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

      // Step 2: Vehicle
      formData.append('vehicle_name', values.vehicle_name);
      formData.append('vehicle_type', values.vehicle_type);
      formData.append('vehicle_model', values.vehicle_model);
      formData.append('vehicle_color', values.vehicle_color);
      formData.append('plate_number', values.plate_number);
      formData.append('vehicle_registration_number', values.vehicle_registration_number);
      formData.append('vin', values.vin);

      // Step 3: Identity & Docs
      formData.append('government_id', values.government_id);
      formData.append('driver_license_type', values.driver_license_type);
      formData.append('license_number', values.license_number);
      formData.append('license_issue_date', values.license_issue_date);
      formData.append('license_expiry_date', values.license_expiry_date);

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

      if (licenseFront) {
        const file = getFileObject(licenseFront);
        if (file) {
          formData.append('driver_license', file);
          formData.append('license_front_image', file);
        }
      }

      if (licenseBack) {
        const file = getFileObject(licenseBack);
        if (file) formData.append('license_back_image', file);
      }

      if (insuranceDoc) {
        const file = getFileObject(insuranceDoc);
        if (file) formData.append('insurance_document', file);
      }

      if (vehicleFront) {
        const file = getFileObject(vehicleFront);
        if (file) formData.append('vehicle_photo_front', file);
      }

      if (vehicleBack) {
        const file = getFileObject(vehicleBack);
        if (file) formData.append('vehicle_photo_back', file);
      }

      if (vehicleRight) {
        const file = getFileObject(vehicleRight);
        if (file) formData.append('vehicle_photo_right', file);
      }

      if (vehicleLeft) {
        const file = getFileObject(vehicleLeft);
        if (file) formData.append('vehicle_photo_left', file);
      }

      if (selfie) {
        const file = getFileObject(selfie);
        if (file) formData.append('selfie', file);
      }

      await userAPI.submitDriverKYC(formData);

      useProfileStore.getState().setIsProfileComplete(true);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Driver KYC Submission Error:', error);
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
        <Text className="text-xl font-NunitoBold ml-2 text-gray-900">Driver Verification</Text>
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
                      <Text className="text-white font-NunitoBold text-lg">Continue to Vehicle Info</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* STEP 2: VEHICLE INFO */}
                {currentStep === 2 && (
                  <View className="space-y-4 pb-10">
                    <View className="bg-white p-4 mb-4 rounded-2xl shadow-sm border border-gray-100">
                      <SectionHeader icon={TruckIcon} title="Vehicle Details" />

                      <VINInput
                        name="vin"
                        label="Vehicle Identification Number (VIN)"
                        placeholder="17-character VIN"
                        required
                        showLookupButton={true}
                        onVINLookup={async (vin, setFieldValue) => {
                          const result = await decodeVINWithImage(vin);
                          if (result) {
                            if (result.make) {
                              // Find exact match case-insensitively from available makes
                              const makeMatch = allMakesData.find((m: { name: string; models: { name: string }[] }) => m.name.toLowerCase() === result.make.toLowerCase());
                              const finalMake = makeMatch ? makeMatch.name : result.make;

                              // Use handleMakeChange to populate the models list
                              handleMakeChange(finalMake, setFieldValue);

                              if (result.model) {
                                // Wait a tick for vehicleModels to populate via handleMakeChange, then set model case-insensitively
                                setTimeout(() => {
                                  // Re-find the models for the matched make directly from allMakesData since state might not be updated synchronously
                                  let matchedModel = result.model;
                                  if (makeMatch && makeMatch.models) {
                                    // vinDecoder sometimes returns "make model" (e.g., "Toyota Camry"). We just need "Camry".
                                    // The vpic results sometimes contain make in model string, let's clean it up if so:
                                    const cleanedResultModel = result.model.toLowerCase().replace(result.make.toLowerCase(), '').trim();

                                    const modelMatch = makeMatch.models.find((m: any) =>
                                      m.name.toLowerCase() === cleanedResultModel || m.name.toLowerCase() === result.model.toLowerCase()
                                    );
                                    if (modelMatch) {
                                      matchedModel = modelMatch.name;
                                    }
                                  }

                                  // Formally inject the model option so SelectField can display it if it wasn't statically loaded
                                  setVehicleModels(prev => {
                                    if (!prev.find(p => p.value === matchedModel)) {
                                      return [...prev, { label: matchedModel, value: matchedModel }];
                                    }
                                    return prev;
                                  });

                                  setFieldValue("vehicle_model", matchedModel);
                                }, 100);
                              }
                            }

                            // Map vehicle_type properly if needed.
                            if (result.vehicleType || result.bodyStyle) {
                              const typeStr = `${result.vehicleType || ''} ${result.bodyStyle || ''}`.toLowerCase();
                              let mappedType = "";
                              if (typeStr.includes("suv") || typeStr.includes("sport utility") || typeStr.includes("sedan") || typeStr.includes("passenger") || typeStr.includes("saloon") || typeStr.includes("car")) mappedType = "car";
                              else if (typeStr.includes("motorcycle") || typeStr.includes("bike")) mappedType = "motorcycle";
                              else if (typeStr.includes("van") || typeStr.includes("minivan")) mappedType = "van";
                              else if (typeStr.includes("truck") || typeStr.includes("pickup") || typeStr.includes("cab")) mappedType = "truck";
                              else if (typeStr.includes("bicycle")) mappedType = "bicycle";
                              else mappedType = "other";

                              if (mappedType) {
                                setFieldValue("vehicle_type", mappedType);
                              }
                            }

                            if (result.color || result.exteriorColor) {
                              setFieldValue("vehicle_color", result.color || result.exteriorColor);
                            }
                          }
                        }}
                      />

                      <View className="space-y-4 mt-4">
                        <SelectField
                          label="Vehicle Name (Make)"
                          name="vehicle_name"
                          placeholder="Select Make"
                          options={vehicleMakes}
                          value={values.vehicle_name}
                          onValueChange={(val: string) => handleMakeChange(val, setFieldValue)}
                          error={errors.vehicle_name as string}
                          touched={touched.vehicle_name as boolean}
                          required
                        />

                        <View className="flex-1">
                          <SelectField
                            label="Vehicle Model"
                            name="vehicle_model"
                            placeholder="Select Model"
                            options={vehicleModels}
                            value={values.vehicle_model}
                            onValueChange={(val: string) => setFieldValue("vehicle_model", val)}
                            error={errors.vehicle_model as string}
                            touched={touched.vehicle_model as boolean}
                            required
                          />
                        </View>


                        <SelectField
                          label="Vehicle Type"
                          name="vehicle_type"
                          placeholder="Select Vehicle Type"
                          options={[
                            { label: "Car", value: "car" },
                            { label: "Motorcycle", value: "motorcycle" },
                            { label: "Van", value: "van" },
                            { label: "Truck", value: "truck" },
                            { label: "Bicycle", value: "bicycle" },
                            { label: "Other", value: "other" }
                          ]}
                          value={values.vehicle_type}
                          onValueChange={(val: string) => setFieldValue("vehicle_type", val)}
                          error={errors.vehicle_type}
                          touched={touched.vehicle_type}
                          required
                        />

                        <View className="flex-1">
                          <InputField
                            label="Vehicle Color"
                            placeholder="e.g. Silver"
                            value={values.vehicle_color}
                            onChangeText={handleChange("vehicle_color")}
                            onBlur={handleBlur("vehicle_color")}
                            error={errors.vehicle_color}
                            touched={touched.vehicle_color}
                            required
                          />
                        </View>
                      </View>
                    </View>

                    <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                      <SectionHeader icon={IdentificationIcon} title="Registration Info" />

                      <View className="space-y-4">
                        <InputField
                          label="Plate Number"
                          placeholder="e.g. ABC 123 XY"
                          value={values.plate_number}
                          onChangeText={handleChange("plate_number")}
                          onBlur={handleBlur("plate_number")}
                          error={errors.plate_number}
                          touched={touched.plate_number}
                          required
                        />

                        <InputField
                          label="Vehicle Registration Number"
                          placeholder="Registration Number"
                          value={values.vehicle_registration_number}
                          onChangeText={handleChange("vehicle_registration_number")}
                          onBlur={handleBlur("vehicle_registration_number")}
                          error={errors.vehicle_registration_number}
                          touched={touched.vehicle_registration_number}
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
                        onPress={() => handleNextStep(validateForm, setTouched, values)}
                        className="flex-[2] py-4 bg-gray-900 rounded-xl items-center shadow-md"
                      >
                        <Text className="text-white font-NunitoBold text-lg">Continue to Documents</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* STEP 3: IDENTITY & DOCS */}
                {currentStep === 3 && (
                  <View className="space-y-4 pb-10">
                    <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                      <SectionHeader icon={IdentificationIcon} title="Identity & License" />

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

                        <View className="h-[1px] bg-gray-100 my-4" />

                        <InputField
                          label="Driver's License Number"
                          placeholder="License Number"
                          value={values.license_number}
                          onChangeText={handleChange("license_number")}
                          onBlur={handleBlur("license_number")}
                          error={errors.license_number}
                          touched={touched.license_number}
                          required
                        />

                        <SelectField
                          label="Driver's License Type"
                          name="driver_license_type"
                          placeholder="Select License Type"
                          options={[
                            { label: "Class A", value: "Class A" },
                            { label: "Class B", value: "Class B" },
                            { label: "Class C", value: "Class C" },
                            { label: "Class D", value: "Class D" },
                            { label: "Class E", value: "Class E" },
                            { label: "Class F", value: "Class F" },
                            { label: "Class G", value: "Class G" },
                            { label: "Class H", value: "Class H" },
                            { label: "Class J", value: "Class J" }
                          ]}
                          value={values.driver_license_type}
                          onValueChange={(val: string) => setFieldValue("driver_license_type", val)}
                          error={errors.driver_license_type}
                          touched={touched.driver_license_type}
                          required
                        />

                        <View className="flex-col gap-2 w-full">
                          <View className="flex-1">
                            <DateInput
                              label="Issue Date"
                              placeholder="YYYY-MM-DD"
                              value={values.license_issue_date ? new Date(values.license_issue_date) : null}
                              onDateChange={(date: Date) => {
                                const issueDateStr = date.toISOString().split('T')[0];
                                setFieldValue("license_issue_date", issueDateStr);
                                
                                // Auto-reset expiry if it becomes invalid (before issue date)
                                if (values.license_expiry_date) {
                                  const expiryDate = parseDate(values.license_expiry_date);
                                  if (expiryDate && expiryDate < date) {
                                    setFieldValue("license_expiry_date", "");
                                  }
                                }
                              }}
                              error={errors.license_issue_date as string}
                              touched={touched.license_issue_date as boolean}
                              required
                              maximumDate={new Date()}
                            />
                          </View>
                          <View className="flex-1">
                            <DateInput
                              label="Expiry Date"
                              placeholder="YYYY-MM-DD"
                              value={values.license_expiry_date ? new Date(values.license_expiry_date) : null}
                              onDateChange={(date: Date) => setFieldValue("license_expiry_date", date.toISOString().split('T')[0])}
                              minimumDate={parseDate(values.license_issue_date) || undefined}
                              error={errors.license_expiry_date as string}
                              touched={touched.license_expiry_date as boolean}
                              required
                            />
                            {/* {values.license_expiry_date && parseDate(values.license_expiry_date) && parseDate(values.license_expiry_date)! < new Date() && (
                              <Text className="text-orange-500 text-sm mt-1">
                                ⚠️ License has expired
                              </Text>
                            )} */}
                          </View>
                        </View>

                        <ImageUpload
                          label="Driver's License (Front)"
                          isUploaded={!!licenseFront}
                          imageUri={licenseFront?.uri}
                          onPress={() => pickDocument("license_front")}
                          required
                        />

                        <View className="flex-col gap-2 w-full mt-4">
                          <ImageUpload
                            label="Driver's License (Back)"
                            isUploaded={!!licenseBack}
                            imageUri={licenseBack?.uri}
                            onPress={() => pickDocument("license_back")}
                            required
                          />
                        </View>
                      </View>
                    </View>

                    <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mt-4">
                      <SectionHeader icon={TruckIcon} title="Insurance Document" />

                      <View className="space-y-4">
                        <ImageUpload
                          label="Comprehensive Insurance Document"
                          isUploaded={!!insuranceDoc}
                          imageUri={insuranceDoc?.uri}
                          onPress={() => pickDocument("insurance")}
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
                        onPress={() => handleNextStep(validateForm, setTouched, values)}
                        className="flex-[2] py-4 bg-gray-900 rounded-xl items-center shadow-md"
                      >
                        <Text className="text-white font-NunitoBold text-lg">Continue to Photos</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* STEP 4: VEHICLE PHOTOS */}
                {currentStep === 4 && (
                  <View className="space-y-4 pb-10">
                    <View className="bg-white p-5 rounded-2xl shadow-sm mb-4 border border-gray-100">
                      <SectionHeader icon={CameraIcon} title="Vehicle Photos" />
                      <View className="space-y-4">
                        <ImageUpload
                          label="Front View"
                          isUploaded={!!vehicleFront}
                          imageUri={vehicleFront?.uri}
                          onPress={() => pickDocument("vehicle_front")}
                          required
                        />
                        <View className="py-4">
                          <ImageUpload
                            label="Back View"
                            isUploaded={!!vehicleBack}
                            imageUri={vehicleBack?.uri}
                            onPress={() => pickDocument("vehicle_back")}
                            required
                          />
                        </View>
                        <View className="py-4">
                          <ImageUpload
                            label="Right View"
                            isUploaded={!!vehicleRight}
                            imageUri={vehicleRight?.uri}
                            onPress={() => pickDocument("vehicle_right")}
                            required
                          />
                        </View>
                        <View className="py-4">
                          <ImageUpload
                            label="Left View"
                            isUploaded={!!vehicleLeft}
                            imageUri={vehicleLeft?.uri}
                            onPress={() => pickDocument("vehicle_left")}
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
                        onPress={() => handleSubmit()}
                        className={`flex-[2] py-4 rounded-xl items-center shadow-md ${isSubmitting ? 'bg-primary-300' : 'bg-primary-500'}`}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Text className="text-white font-NunitoBold text-lg">Submit Verification</Text>
                        )}
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
        title="KYC Submitted!"
        message="Your profile verification is under review. You will be notified once approved."
        onClose={() => {
          setShowSuccessModal(false);
          router.replace(driverRoutes.home as any);
        }}
        buttonText="Go to Dashboard"
      />

      {/* Error Modal */}
      <ErrorModal
        isVisible={showErrorModal}
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
        title="Verification Failed"
        buttonText="Try Again"
      />

      {/* Country and State Picker */}
      <CountryStatePicker
        selectedCountry={selectedCountry}
        selectedState={selectedState}
        onCountryChange={setSelectedCountry}
        onStateChange={(state) => {
          setSelectedState(state);
          // formikRef.current?.setFieldValue('city', state); // Removed legacy sync
        }}
        showCountryPicker={showCountryPicker}
        showStatePicker={showStatePicker}
        onCountryPickerToggle={setShowCountryPicker}
        onStatePickerToggle={setShowStatePicker}
      />
    </SafeAreaView>
  );
};

export default DriverKYC;
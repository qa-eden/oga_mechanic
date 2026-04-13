import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
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
  IdentificationIcon, 
  CreditCardIcon,
  ChevronDownIcon
} from "react-native-heroicons/outline";
import { useDriverProfile, useBanks, useVerifyBank, userProfileKeys } from "@/hooks/useUserProfile";
import { userAPI } from "@/lib/api/user";
import { productsAPI } from "@/lib/api/products";
import { showToast } from "@/utils/toastUtils";
import { useQueryClient } from "@tanstack/react-query";
import { Formik, FormikProps } from "formik";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import FormikInput from "@/components/forms/FormikInput";
import FormikButton from "@/components/forms/FormikButton";
import AddressInput from "@/components/forms/AddressInput";
import SelectField from "@/components/forms/SelectField";
import DateInput from "@/components/forms/DateInput";
import RadioGroup from "@/components/forms/RadioGroup";
import InputField from "@/components/InputField";
import VINInput from "@/components/VINInput";
import { LinearGradient } from "expo-linear-gradient";
import { getStatesByCountry, getCitiesByState } from "@/constants/locationData";
import { decodeVINWithImage } from "@/utils/vinDecoder";
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
  vehicle_name: Yup.string().required("Required"),
  vehicle_type: Yup.string().required("Required"),
  vehicle_model: Yup.string().required("Required"),
  vehicle_color: Yup.string().required("Required"),
  plate_number: Yup.string().required("Required"),
  vehicle_registration_number: Yup.string().required("Required"),
  vin: Yup.string().required("Required"),
});

const step4Schema = Yup.object().shape({
  bank_name: Yup.string().required("Required"),
  account_number: Yup.string().required("Required"),
});

const step5Schema = Yup.object().shape({
  license_number: Yup.string().required("Required"),
  license_issue_date: Yup.string().required("Required"),
  license_expiry_date: Yup.string().required("Required"),
});

const getValidationSchema = (step: number) => {
  switch (step) {
    case 1: return step1Schema;
    case 2: return step2Schema;
    case 3: return step3Schema;
    case 4: return step4Schema;
    case 5: return step5Schema;
    default: return step1Schema;
  }
};

const EditDriverProfile = () => {
  const queryClient = useQueryClient();
  const formikRef = useRef<FormikProps<any>>(null);
  const { data: profileData, isLoading: isLoadingProfile } = useDriverProfile();
  const { data: banksData } = useBanks();
  const { mutate: verifyBank, isPending: isVerifyingBank } = useVerifyBank();
  
  const driverProfile = profileData?.data?.driver_profile;
  const userObj = driverProfile?.user;

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [initialValues, setInitialValues] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    gender: "",
    date_of_birth: "",
    state: "",
    location: "",
    city: "",
    vehicle_name: "",
    vehicle_type: "",
    vehicle_model: "",
    vehicle_color: "",
    plate_number: "",
    vehicle_registration_number: "",
    vin: "",
    bank_name: "",
    account_number: "",
    profile_picture: "",
    license_number: "",
    license_issue_date: "",
    license_expiry_date: "",
    license_front_image: "",
    license_back_image: "",
    government_id_front: "",
    government_id_back: "",
    vehicle_photo_front: "",
    vehicle_photo_back: "",
    vehicle_photo_right: "",
    vehicle_photo_left: "",
    insurance_document: "",
  });

  const [vehicleMakes, setVehicleMakes] = useState<{ label: string; value: string }[]>([]);
  const [vehicleModels, setVehicleModels] = useState<{ label: string; value: string }[]>([]);
  const [allMakesData, setAllMakesData] = useState<any[]>([]);
  const [accountName, setAccountName] = useState<string>("");
  const [isAddressFocused, setIsAddressFocused] = useState(false);

  useEffect(() => {
    if (driverProfile) {
      const initialLocation = driverProfile.location || "";
      let initialState = driverProfile.state || "";
      let initialCity = driverProfile.city || "";

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
        full_name: driverProfile.full_name || (userObj?.first_name && userObj?.last_name ? `${userObj.first_name} ${userObj.last_name}`.trim() : ""),
        email: userObj?.email || "",
        phone_number: driverProfile.phone_number || userObj?.phone_number || "",
        gender: driverProfile.gender || "",
        date_of_birth: driverProfile.date_of_birth || "",
        state: initialState,
        location: initialLocation,
        city: initialCity,
        vehicle_name: driverProfile.vehicle_name || "",
        vehicle_type: driverProfile.vehicle_type || "",
        vehicle_model: driverProfile.vehicle_model || "",
        vehicle_color: driverProfile.vehicle_color || "",
        plate_number: driverProfile.plate_number || "",
        vehicle_registration_number: driverProfile.vehicle_registration_number || "",
        vin: driverProfile.vin || "",
        bank_name: driverProfile.bank_name || "",
        account_number: driverProfile.account_number || "",
        profile_picture: driverProfile?.selfie || userObj?.profile_image || userObj?.image || "",
        license_number: driverProfile.license_number || "",
        license_issue_date: driverProfile.license_issue_date || "",
        license_expiry_date: driverProfile.license_expiry_date || "",
        license_front_image: driverProfile.license_front_image || "",
        license_back_image: driverProfile.license_back_image || "",
        government_id_front: driverProfile.government_id_front || "",
        government_id_back: driverProfile.government_id_back || "",
        vehicle_photo_front: driverProfile.vehicle_photo_front || "",
        vehicle_photo_back: driverProfile.vehicle_photo_back || "",
        vehicle_photo_right: driverProfile.vehicle_photo_right || "",
        vehicle_photo_left: driverProfile.vehicle_photo_left || "",
        insurance_document: driverProfile.insurance_document || "",
      });
    }
  }, [driverProfile, userObj]);

  useEffect(() => {
    const fetchMakes = async () => {
      try {
        const makes = await productsAPI.getVehicleMakes();
        setAllMakesData(makes);
        setVehicleMakes(makes.map((m: any) => ({ label: m.name, value: m.name })));
        
        if (driverProfile?.vehicle_name) {
          const makeObj = makes.find((m: any) => m.name === driverProfile.vehicle_name);
          if (makeObj?.models) {
            setVehicleModels(makeObj.models.map((mod: any) => ({ label: mod.name, value: mod.name })));
          }
        }
      } catch (error) {
        console.error("Failed to fetch makes:", error);
      }
    };
    fetchMakes();
  }, [driverProfile?.vehicle_name]);

  const handleMakeChange = (selectedMake: string, sF: any) => {
    sF("vehicle_name", selectedMake);
    sF("vehicle_model", "");
    const makeObj = allMakesData.find(m => m.name === selectedMake);
    if (makeObj?.models) {
      setVehicleModels(makeObj.models.map((m: any) => ({ label: m.name, value: m.name })));
    } else {
      setVehicleModels([]);
    }
  };

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

      // Helper function to handle image upload if it's a local URI or base64
      const getFileObject = (imageUri: string, fieldName: string) => {
        if (!imageUri) return undefined;
        // If it's already a URL, return it
        if (imageUri.startsWith('http')) return imageUri;
        
        return {
          uri: imageUri,
          name: `${fieldName}_${Date.now()}.jpg`,
          type: 'image/jpeg'
        } as any;
      };

      const documentFields = [
        { field: 'profile_picture', name: 'selfie' },
        { field: 'license_front_image', name: 'license_front_image' },
        { field: 'license_back_image', name: 'license_back_image' },
        { field: 'government_id_front', name: 'government_id_front' },
        { field: 'government_id_back', name: 'government_id_back' },
        { field: 'vehicle_photo_front', name: 'vehicle_photo_front' },
        { field: 'vehicle_photo_back', name: 'vehicle_photo_back' },
        { field: 'vehicle_photo_right', name: 'vehicle_photo_right' },
        { field: 'vehicle_photo_left', name: 'vehicle_photo_left' },
        { field: 'insurance_document', name: 'insurance_document' }
      ];

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

      formData.append('vehicle_name', values.vehicle_name);
      formData.append('vehicle_type', values.vehicle_type);
      formData.append('vehicle_model', values.vehicle_model);
      formData.append('vehicle_color', values.vehicle_color);
      formData.append('plate_number', values.plate_number);
      formData.append('vehicle_registration_number', values.vehicle_registration_number);
      formData.append('vin', values.vin);

      formData.append('bank_name', values.bank_name);
      formData.append('account_number', values.account_number);

      // Append Files (now as file objects or existing URLs)
      documentFields.forEach(({ field, name }) => {
        const file = getFileObject(values[field], name);
        if (file) {
          formData.append(name, file);
        }
      });

      // Add license info
      formData.append('license_number', values.license_number);
      formData.append('license_issue_date', values.license_issue_date);
      formData.append('license_expiry_date', values.license_expiry_date);


      await userAPI.submitDriverKYC(formData);
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
        aspect: field === "profile_picture" ? [1, 1] : [4, 3],
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

  const DocumentPicker = ({ label, field, value, setFieldValue }: any) => (
    <View className="mb-4">
      <Text className="text-gray-700 font-NunitoSemiBold mb-2">{label}</Text>
      <TouchableOpacity 
        onPress={() => handleImagePick(field, setFieldValue)}
        className="w-full h-40 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 items-center justify-center overflow-hidden"
      >
        {value ? (
          <Image source={{ uri: value }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="items-center">
            <CameraIcon size={32} color="#9CA3AF" />
            <Text className="text-gray-400 font-NunitoMedium mt-2">Tap to upload</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

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
          scrollEventThrottle={16}
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
                  
                  {/* Avatar Section */}
                  <View className="items-center mb-8">
                    <TouchableOpacity onPress={() => handleImagePick("profile_picture", setFieldValue)} className="relative">
                      <View className="w-28 h-28 rounded-2xl items-center justify-center border-4 border-white shadow-lg mb-3 overflow-hidden">
                        {values.profile_picture ? (
                          <Image source={{ uri: values.profile_picture }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                          <LinearGradient colors={["#D30309", "#B91C1C"]} className="w-full h-full items-center justify-center">
                            <Text className="text-4xl font-NunitoExtraBold text-white">
                              {values.full_name ? values.full_name.charAt(0).toUpperCase() : "D"}
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
                  
                  <View className="flex-row gap-4">
                    <View className="flex-1">
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
                    </View>
                 
                  </View>

                     <View className="flex-1">
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
                      // Soft auto-fill search
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
                        if (loc.context && Array.isArray(loc.context)) {
                            const region = loc.context.find((c: any) => c.id.startsWith('region'));
                            const place = loc.context.find((c: any) => c.id.startsWith('place'));
                            if (region) setFieldValue("state", region.text);
                            if (place) setFieldValue("city", place.text);
                        }
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

              {/* STEP 3: VEHICLE INFORMATION */}
              {currentStep === 3 && (
                <View>
                  <SectionHeader icon={TruckIcon} title="Vehicle Information" color="#10B981" bgColor="bg-green-50" />
                  
                  <VINInput
                    name="vin"
                    label="VIN"
                    placeholder="17-character VIN"
                    showLookupButton={true}
                    required
                    onVINLookup={async (vin, sF) => {
                      const result = await decodeVINWithImage(vin);
                      if (result) {
                        if (result.make) handleMakeChange(result.make, sF);
                        if (result.model) setTimeout(() => sF("vehicle_model", result.model), 100);
                        if (result.color) sF("vehicle_color", result.color);
                      }
                    }}
                  />
                  
                  <View className="mt-4">
                    <SelectField
                      label="Make"
                      name="vehicle_name"
                      placeholder="Select vehicle make"
                      options={vehicleMakes}
                      value={values.vehicle_name}
                      onValueChange={(val: string) => handleMakeChange(val, setFieldValue)}
                      required
                    />

                    <SelectField
                      label="Model"
                      name="vehicle_model"
                      placeholder="Select vehicle model"
                      options={vehicleModels}
                      value={values.vehicle_model}
                      onValueChange={(val: string) => setFieldValue("vehicle_model", val)}
                      required
                    />

                    <SelectField
                      label="Type"
                      name="vehicle_type"
                      placeholder="Select vehicle type"
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
                      required
                    />

                    <InputField
                      label="Color"
                      placeholder="Silver"
                      value={values.vehicle_color}
                      onChangeText={handleChange("vehicle_color")}
                      onBlur={handleBlur("vehicle_color")}
                      error={errors.vehicle_color}
                      touched={touched.vehicle_color}
                      required
                    />

                    <InputField
                      label="Plate Number"
                      placeholder="ABC 123 XY"
                      value={values.plate_number}
                      onChangeText={handleChange("plate_number")}
                      onBlur={handleBlur("plate_number")}
                      error={errors.plate_number}
                      touched={touched.plate_number}
                      required
                    />

                    <InputField
                      label="Registration Number"
                      placeholder="Reg No"
                      value={values.vehicle_registration_number}
                      onChangeText={handleChange("vehicle_registration_number")}
                      onBlur={handleBlur("vehicle_registration_number")}
                      error={errors.vehicle_registration_number}
                      touched={touched.vehicle_registration_number}
                      required
                    />
                    
                    <View className="mt-6">
                      <Text className="text-base font-NunitoBold text-gray-900 mb-4">Vehicle Photos</Text>
                      <View className="flex-row flex-wrap justify-between">
                        <View className="w-[48%]">
                          <DocumentPicker label="Front View" field="vehicle_photo_front" value={values.vehicle_photo_front} setFieldValue={setFieldValue} />
                        </View>
                        <View className="w-[48%]">
                          <DocumentPicker label="Back View" field="vehicle_photo_back" value={values.vehicle_photo_back} setFieldValue={setFieldValue} />
                        </View>
                        <View className="w-[48%]">
                          <DocumentPicker label="Right View" field="vehicle_photo_right" value={values.vehicle_photo_right} setFieldValue={setFieldValue} />
                        </View>
                        <View className="w-[48%]">
                          <DocumentPicker label="Left View" field="vehicle_photo_left" value={values.vehicle_photo_left} setFieldValue={setFieldValue} />
                        </View>
                      </View>
                    </View>
                  </View>
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

              {/* STEP 5: DOCUMENTS & LICENSES */}
              {currentStep === 5 && (
                <View>
                  <SectionHeader icon={IdentificationIcon} title="Documents & Verification" color="#6366F1" bgColor="bg-indigo-50" />
                  
                  <View className="mb-6">
                    <Text className="text-base font-NunitoBold text-gray-900 mb-4">Driver's License details</Text>
                    <FormikInput name="license_number" placeholder="Enter license number" label="License Number" required />
                    <View className="flex-row gap-4 mt-2">
                       <View className="flex-1">
                        <DateInput
                          label="Issue Date"
                          placeholder="Select date"
                          value={values.license_issue_date ? new Date(values.license_issue_date) : null}
                          onDateChange={(date: Date) => setFieldValue("license_issue_date", date.toISOString().split('T')[0])}
                          error={errors.license_issue_date as string}
                          touched={touched.license_issue_date as boolean}
                          maximumDate={new Date()}
                          required
                        />
                      </View>
                      <View className="flex-1">
                        <DateInput
                          label="Expiry Date"
                          placeholder="Select date"
                          value={values.license_expiry_date ? new Date(values.license_expiry_date) : null}
                          onDateChange={(date: Date) => setFieldValue("license_expiry_date", date.toISOString().split('T')[0])}
                          error={errors.license_expiry_date as string}
                          touched={touched.license_expiry_date as boolean}
                          minimumDate={new Date()}
                          required
                        />
                      </View>
                    </View>
                  </View>

                  <View className="mb-6">
                    <Text className="text-base font-NunitoBold text-gray-900 mb-4">Driver's License Images</Text>
                    <View className="flex-row justify-between">
                      <View className="w-[48%]">
                        <DocumentPicker label="Front View" field="license_front_image" value={values.license_front_image} setFieldValue={setFieldValue} />
                      </View>
                      <View className="w-[48%]">
                        <DocumentPicker label="Back View" field="license_back_image" value={values.license_back_image} setFieldValue={setFieldValue} />
                      </View>
                    </View>
                  </View>

                  <View className="mb-6">
                    <Text className="text-base font-NunitoBold text-gray-900 mb-4">Other Documents</Text>
                    <DocumentPicker label="Government ID (Front)" field="government_id_front" value={values.government_id_front} setFieldValue={setFieldValue} />
                    <DocumentPicker label="Government ID (Back)" field="government_id_back" value={values.government_id_back} setFieldValue={setFieldValue} />
                    <DocumentPicker label="Insurance Document" field="insurance_document" value={values.insurance_document} setFieldValue={setFieldValue} />
                  </View>
                </View>
              )}

              {/* Navigation Buttons */}
              <View className="flex-row gap-4 mt-10">
                {currentStep > 1 && (
                  <TouchableOpacity
                    onPress={handlePrevStep}
                    className="flex-1 py-4 bg-gray-100 rounded-2xl items-center"
                  >
                    <Text className="text-gray-900 font-NunitoBold text-base">Back</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  onPress={() => currentStep === totalSteps ? handleSubmit() : handleNextStep(validateForm, setTouched)}
                  disabled={isSubmitting}
                  className={`${currentStep === 1 ? 'w-full' : 'flex-2'} py-4 bg-primary-500 rounded-2xl items-center shadow-md shadow-primary-200`}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-white font-NunitoBold text-base">
                      {currentStep === totalSteps ? "Save Changes" : "Continue"}
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

export default EditDriverProfile;
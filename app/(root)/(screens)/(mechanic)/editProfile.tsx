import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ChevronLeftIcon } from "react-native-heroicons/solid";
import { CameraIcon, WrenchScrewdriverIcon, EnvelopeIcon, BriefcaseIcon, ShieldCheckIcon } from "react-native-heroicons/outline";
import { useMechanicProfile, usePrimaryUserProfile, userProfileKeys } from "@/hooks/useUserProfile";
import { userAPI } from "@/lib/api/user";
import { showToast } from "@/utils/toastUtils";
import { useQueryClient } from "@tanstack/react-query";
import { Formik } from "formik";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import FormikInput from "@/components/forms/FormikInput";
import FormikButton from "@/components/forms/FormikButton";
import AddressInput from "@/components/forms/AddressInput";
import SelectField from "@/components/forms/SelectField";
import TextArea from "@/components/forms/TextArea";
import { LinearGradient } from "expo-linear-gradient";

// Validation Schema for Mechanic Profile
const editMechanicProfileSchema = Yup.object().shape({
  first_name: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .required("First name is required"),
  last_name: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .required("Last name is required"),
  phone_number: Yup.string()
    .matches(/^[0-9]{10,11}$/, "Phone number must be 10-11 digits")
    .required("Phone number is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  bio: Yup.string().nullable(),
  location: Yup.string().nullable(),
  specialization: Yup.string().nullable(),
  years_of_experience: Yup.string().nullable(),
  cac_number: Yup.string().nullable(),
  govt_id_type: Yup.string().nullable(),
});

const EditMechanicProfile = () => {
  const queryClient = useQueryClient();
  const { data: profileData, isLoading: isLoadingPrimary } = usePrimaryUserProfile();
  const { data: mechanicProfile, isLoading: isLoadingMechanic } = useMechanicProfile(true);
  
  const userData = profileData?.data;
  const mechanicData = mechanicProfile?.data;

  const mechanicProfileInfo = mechanicData?.mechanic_profile;

  const [initialValues, setInitialValues] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
    bio: "",
    location: "",
    specialization: "",
    years_of_experience: "",
    selfie: "",
    cac_number: "",
    govt_id_type: "",
    cac_document: "",
    government_id_front: "",
    government_id_back: "",
  });

  useEffect(() => {
    if (userData || mechanicProfileInfo) {
      setInitialValues({
        first_name: userData?.first_name || mechanicProfileInfo?.user?.first_name || "",
        last_name: userData?.last_name || mechanicProfileInfo?.user?.last_name || "",
        phone_number: userData?.phone_number || mechanicProfileInfo?.user?.phone_number || "",
        email: userData?.email || mechanicProfileInfo?.user?.email || "",
        bio: mechanicProfileInfo?.bio || "",
        location: mechanicProfileInfo?.location || "",
        specialization: (mechanicProfileInfo as any)?.specialization || "",
        years_of_experience: (mechanicProfileInfo as any)?.years_of_experience?.toString() || "",
        selfie: (mechanicProfileInfo as any)?.selfie || (userData as any)?.profile_picture || "",
        cac_number: mechanicProfileInfo?.cac_number || "",
        govt_id_type: mechanicProfileInfo?.govt_id_type || "",
        cac_document: mechanicProfileInfo?.cac_document || "",
        government_id_front: mechanicProfileInfo?.government_id_front || "",
        government_id_back: mechanicProfileInfo?.government_id_back || "",
      });
    }
  }, [userData, mechanicProfileInfo]);

  const handleSave = async (values: any, { setSubmitting }: any) => {
    try {
      setSubmitting(true);
      
      const payload: any = {
        first_name: values.first_name,
        last_name: values.last_name,
        phone_number: values.phone_number,
      };

      await userAPI.updateProfile(payload);
      
      const formData = new FormData();
      formData.append('requestType', 'inbound');

      const mechanicPayload = {
        bio: values.bio,
        location: values.location,
        specialization: values.specialization,
        years_of_experience: values.years_of_experience,
      };

      Object.entries(mechanicPayload).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          formData.append(key, val as string);
        }
      });

      // Handle CAC Number and ID Type
      if (values.cac_number) formData.append('cac_number', values.cac_number);
      if (values.govt_id_type) formData.append('govt_id_type', values.govt_id_type);
      
      if (values.selfie && values.selfie.startsWith('data:')) {
        formData.append('selfie', {
            uri: values.selfie,
            name: `selfie_${Date.now()}.jpg`,
            type: 'image/jpeg'
        } as any);
      }

      // Append documents if they are newly chosen (base64)
      const documents = ['cac_document', 'government_id_front', 'government_id_back'];
      documents.forEach(doc => {
        if (values[doc] && values[doc].startsWith('data:')) {
          formData.append(doc, {
            uri: values[doc],
            name: `${doc}_${Date.now()}.jpg`,
            type: 'image/jpeg'
          } as any);
        }
      });
      
      await userAPI.submitMechanicKYC(formData);

      // Invalidate profile queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: userProfileKeys.all });
      
      showToast.success("Profile updated successfully");
      router.back();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      showToast.error(errorMessage);
      console.error("Update profile error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImagePick = async (field: string, setFieldValue: any) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        showToast.error("Permission to access camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: field === "selfie" ? [1, 1] : [4, 3],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        if (result.assets[0].base64) {
          const base64Image = `data:${result.assets[0].mimeType || 'image/jpeg'};base64,${result.assets[0].base64}`;
          setFieldValue(field, base64Image);
        } else {
          setFieldValue(field, result.assets[0].uri);
        }
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

  if (isLoadingPrimary || isLoadingMechanic) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#D30309" />
      </View>
    );
  }

  const specializationOptions = [
    { label: "General Mechanic", value: "general" },
    { label: "Engine Specialist", value: "engine" },
    { label: "Electrical Systems", value: "electrical" },
    { label: "Brake Specialist", value: "brakes" },
    { label: "Transmission", value: "transmission" },
    { label: "AC & Cooling", value: "ac_cooling" },
    { label: "Body Work", value: "body_work" },
    { label: "Diagnostics", value: "diagnostics" },
  ];

  const experienceOptions = [
    { label: "Less than 1 year", value: "0" },
    { label: "1-2 years", value: "1" },
    { label: "3-5 years", value: "3" },
    { label: "5-10 years", value: "5" },
    { label: "10+ years", value: "10" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-5 py-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3"
        >
          <ChevronLeftIcon size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-NunitoBold text-gray-900">Edit Profile</Text>
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={120}
        extraHeight={140}
        keyboardOpeningTime={0}
        keyboardShouldPersistTaps="handled"
        enableResetScrollToCoords={false}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={editMechanicProfileSchema}
          enableReinitialize
          onSubmit={handleSave}
        >
          {({ handleSubmit, setFieldValue, values, errors, touched, isSubmitting }) => (
            <View className="px-5 pt-6">
              
              {/* Avatar Section */}
              <View className="items-center mb-8">
                <TouchableOpacity 
                  onPress={() => handleImagePick("selfie", setFieldValue)}
                  className="relative"
                >
                  <View className="w-28 h-28 rounded-2xl items-center justify-center border-4 border-white shadow-lg mb-3 overflow-hidden">
                    {values.selfie ? (
                      <Image
                        source={{ uri: values.selfie }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <LinearGradient
                        colors={['#D30309', '#B91C1C']}
                        className="w-full h-full items-center justify-center"
                      >
                        <Text className="text-4xl font-NunitoExtraBold text-white">
                          {values.first_name ? values.first_name.charAt(0).toUpperCase() : "M"}
                        </Text>
                      </LinearGradient>
                    )}
                  </View>
                  <View className="absolute bottom-3 right-0 bg-primary-500 w-9 h-9 rounded-full items-center justify-center border-3 border-white shadow-md">
                    <CameraIcon size={18} color="white" />
                  </View>
                </TouchableOpacity>
                <Text className="text-gray-500 font-NunitoMedium text-sm">
                  Tap to change profile photo
                </Text>
              </View>

              {/* Personal Information Section */}
              <View className="mb-6">
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 bg-primary-50 rounded-lg items-center justify-center mr-2">
                    <EnvelopeIcon size={16} color="#D30309" />
                  </View>
                  <Text className="text-base font-NunitoBold text-gray-900">Personal Information</Text>
                </View>
                
                {/* First Name & Last Name Row */}
                <View className="flex-row gap-4 mb-3">
                  <View className="flex-1">
                    <FormikInput
                      name="first_name"
                      label="First Name"
                      placeholder="John"
                      autoCapitalize="words"
                      required
                    />
                  </View>
                  <View className="flex-1">
                    <FormikInput
                      name="last_name"
                      label="Last Name"
                      placeholder="Doe"
                      autoCapitalize="words"
                      required
                    />
                  </View>
                </View>

                {/* Email (Read Only) */}
                <View className="mb-3">
                  <FormikInput
                    name="email"
                    label="Email Address"
                    placeholder="email@example.com"
                    editable={false}
                    containerStyle="bg-gray-100 border-gray-200"
                    inputStyle="text-gray-500"
                    helperText="Email cannot be changed"
                  />
                </View>

                {/* Phone Number */}
                <FormikInput
                  name="phone_number"
                  label="Phone Number"
                  placeholder="080 0000 0000"
                  keyboardType="phone-pad"
                  required
                />

                {/* Bio */}
                <View className="mb-2 mt-4">
                  <Text className="text-xs font-NunitoBold text-gray-500 uppercase tracking-wider mb-2 ml-1">Bio</Text>
                  <TextArea
                    placeholder="Briefly describe your experience and expertise..."
                    value={values.bio}
                    onChangeText={(text: string) => setFieldValue("bio", text)}
                    error={errors.bio as string}
                    touched={touched.bio as boolean}
                    numberOfLines={4}
                  />
                </View>
              </View>

              {/* Professional Information Section */}
              <View className="mb-6">
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 bg-blue-50 rounded-lg items-center justify-center mr-2">
                    <WrenchScrewdriverIcon size={16} color="#3B82F6" />
                  </View>
                  <Text className="text-base font-NunitoBold text-gray-900">Professional Information</Text>
                </View>

                {/* Specialization */}
                <View className="mb-3">
                  <SelectField
                    name="specialization"
                    label="Specialization"
                    placeholder="Select your specialization"
                    options={specializationOptions}
                    value={values.specialization}
                    onValueChange={(value) => setFieldValue("specialization", value)}
                    error={errors.specialization}
                    touched={touched.specialization}
                  />
                </View>

                {/* Years of Experience */}
                <View className="mb-3">
                  <SelectField
                    name="years_of_experience"
                    label="Years of Experience"
                    placeholder="Select experience"
                    options={experienceOptions}
                    value={values.years_of_experience}
                    onValueChange={(value) => setFieldValue("years_of_experience", value)}
                    error={errors.years_of_experience}
                    touched={touched.years_of_experience}
                  />
                </View>

                {/* Location */}
                <AddressInput
                  label="Workshop Location"
                  value={values.location}
                  onChangeText={(text: string) => setFieldValue("location", text)}
                  onLocationSelect={(location: any) => setFieldValue("location", location?.address || location)}
                  placeholder="Enter your workshop address"
                  error={errors.location as string}
                  touched={touched.location as boolean}
                />
              </View>

              {/* Business & Documents Section */}
              <View className="mb-6">
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 bg-amber-50 rounded-lg items-center justify-center mr-2">
                    <BriefcaseIcon size={16} color="#F59E0B" />
                  </View>
                  <Text className="text-base font-NunitoBold text-gray-900">Business Details</Text>
                </View>

                <FormikInput 
                  name="cac_number" 
                  label="CAC Registration Number" 
                  placeholder="RC000000" 
                />

                <View className="mt-3">
                  <DocumentPicker 
                    label="CAC Registration Document" 
                    field="cac_document" 
                    value={values.cac_document} 
                    setFieldValue={setFieldValue} 
                  />
                </View>
              </View>

              <View className="mb-6">
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 bg-indigo-50 rounded-lg items-center justify-center mr-2">
                    <ShieldCheckIcon size={16} color="#6366F1" />
                  </View>
                  <Text className="text-base font-NunitoBold text-gray-900">Identity Verification</Text>
                </View>

                <SelectField
                  label="Government ID Type"
                  name="govt_id_type"
                  placeholder="Select ID Type"
                  options={[
                    { label: "NIN", value: "NIN" },
                    { label: "Drivers license", value: "drivers_license" },
                    { label: "Voters card", value: "voters_card" },
                    { label: "International passport", value: "international_passport" },
                    { label: "Permanent voter's card", value: "permanent_voters_card" },
                  ]}
                  value={values.govt_id_type || ''}
                  onValueChange={(val: string) => setFieldValue("govt_id_type", val)}
                  error={errors.govt_id_type as string}
                  touched={touched.govt_id_type as boolean}
                />

                <View className="flex-row justify-between mt-4">
                  <View className="w-[48%]">
                    <DocumentPicker 
                      label="ID Front View" 
                      field="government_id_front" 
                      value={values.government_id_front} 
                      setFieldValue={setFieldValue} 
                    />
                  </View>
                  <View className="w-[48%]">
                    <DocumentPicker 
                      label="ID Back View" 
                      field="government_id_back" 
                      value={values.government_id_back} 
                      setFieldValue={setFieldValue} 
                    />
                  </View>
                </View>
              </View>

              {/* Save Button */}
              <View className="mt-4">
                <FormikButton
                  title={isSubmitting ? "Saving Changes..." : "Save Changes"}
                  onPress={() => handleSubmit()}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full"
                />
              </View>

            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default EditMechanicProfile;
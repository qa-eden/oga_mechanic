import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
} from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import {
  ChevronLeftIcon,
  UserIcon,
  MapPinIcon,
  BriefcaseIcon,
  IdentificationIcon
} from "react-native-heroicons/outline";


import AddressInput from "@/components/forms/AddressInput";
import SelectField from "@/components/forms/SelectField";
import InputField from "@/components/InputField";
import TextArea from "@/components/forms/TextArea";
import ImageUpload from "@/components/ImageUpload";
import LivenessCamera from "@/components/LivenessCamera";
import SuccessModal from "@/components/modals/SuccessModal";
import ErrorModal from "@/components/modals/ErrorModal";
import SelfieUpload from "@/components/SelfieUpload";
import { userAPI } from "@/lib/api/user";
import { useProfileStore } from "@/hooks/useProfileStore";
import { getStatesByCountry } from "@/constants/locationData";
import { getLGAs } from "@/constants/nigeriaData";
import { mechanicRoutes } from "@/constants/routes";

// Validation Schema
const validationSchema = Yup.object().shape({
  location: Yup.string().required("Please enter your location"),
  latitude: Yup.string(),
  longitude: Yup.string(),
  state: Yup.string().required("Please select your state"),
  lga: Yup.string().required("Please select your LGA"),
  bio: Yup.string().required("Please tell us about your experience"),
  cac_number: Yup.string().required("CAC document number is required"),
  govt_id_type: Yup.string().required("Please select government ID type"),
});

interface FormValues {
  location: string;
  latitude: string;
  longitude: string;
  state: string;
  lga: string;
  bio: string;
  cac_number: string;
  govt_id_type: string;
}

interface DocumentFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

const CompleteKYC = () => {
  const [cacDocument, setCacDocument] = useState<DocumentFile | null>(null);
  const [selfie, setSelfie] = useState<DocumentFile | null>(null);
  const [governmentIdFront, setGovernmentIdFront] = useState<DocumentFile | null>(null);
  const [governmentIdBack, setGovernmentIdBack] = useState<DocumentFile | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLivenessModal, setShowLivenessModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [initialFormValues, setInitialFormValues] = useState<FormValues>({
    location: "",
    latitude: "",
    longitude: "",
    state: "",
    lga: "",
    bio: "",
    cac_number: "",
    govt_id_type: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getMechanicProfile();
        if (response?.data?.has_mechanic_profile) {
          const profile = response.data.mechanic_profile;
          setInitialFormValues({
            location: profile.location || "",
            latitude: profile.latitude || "",
            longitude: profile.longitude || "",
            state: "", 
            lga: profile.lga || "",
            bio: profile.bio || "",
            cac_number: profile.cac_number || "",
            govt_id_type: profile.govt_id_type || "",
          });
        }
      } catch (error) {
        console.log("Error prefilling mechanic profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoadingProfile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#D30309" />
      </SafeAreaView>
    );
  }

  // Constants
  const nigerianStates = getStatesByCountry('NG');
  const states = nigerianStates.map(state => ({
    label: state.name,
    value: state.name.toLowerCase().replace(/\s+/g, '_')
  }));

  const govtIdTypes = [
    { label: "NIN", value: "NIN" },
    { label: "Drivers license", value: "drivers_license" },
    { label: "Voters card", value: "voters_card" },
    { label: "International passport", value: "international_passport" },
    { label: "Permanent voter's card", value: "permanent_voters_card" },
  ];

  // Document Picking Logic
  const pickDocument = async (type: "cac" | "selfie" | "govt_front" | "govt_back") => {
    // Alert.alert("Debug", `Button clicked for: ${type}`);
    if (type === 'selfie') {
      setShowLivenessModal(true);
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please grant camera roll permissions.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const file: DocumentFile = {
          uri: asset.uri,
          name: `${type}_${Date.now()}.jpg`,
          type: "image/jpeg",
          size: asset.fileSize || 0,
        };

        switch (type) {
          case "cac": setCacDocument(file); break;
          // case "selfie": setSelfie(file); break; // Handled by liveness
          case "govt_front": setGovernmentIdFront(file); break;
          case "govt_back": setGovernmentIdBack(file); break;
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select document.");
    }
  };

  const handleLivenessCapture = (uri: string) => {
    const file: DocumentFile = {
      uri: uri,
      name: `selfie_${Date.now()}.jpg`,
      type: "image/jpeg",
      size: 0, // Unknown size currently
    };
    setSelfie(file);
    setShowLivenessModal(false);
  };

  // Location Selection Logic
  const handleLocationSelect = async (loc: any, setFieldValue: any) => {
    setFieldValue("location", loc.address || loc.name);
    
    if (loc.latitude && loc.longitude) {
      setFieldValue("latitude", String(loc.latitude));
      setFieldValue("longitude", String(loc.longitude));
      
      try {
        const reverseGeocoded = await Location.reverseGeocodeAsync({
          latitude: loc.latitude,
          longitude: loc.longitude
        });

        if (reverseGeocoded.length > 0) {
          const address = reverseGeocoded[0];
          const region = address.region; // State
          const city = address.city || address.subregion; // LGA/City

          if (region) {
            // Find matching state
            const matchedState = states.find(s => s.label.toLowerCase() === region.toLowerCase());
            if (matchedState) {
              setFieldValue("state", matchedState.value);

              // Try to match LGA
              // reverseGeocodeAsync returns: city, district, subregion, street, region, country
              // LGA usually maps to city or subregion in Nigeria for Mapbox/Google
              const potentialLGAs = [city, address.subregion, address.district].filter(Boolean);

              if (potentialLGAs.length > 0) {
                const availableLGAs = getLGAs(matchedState.label);

                // Try to find a match in the available LGAs
                const matchedLGA = availableLGAs.find(lga => {
                  const lgaLower = lga.toLowerCase();
                  return potentialLGAs.some(candidate => {
                    const candidateLower = candidate?.toLowerCase() || '';
                    return candidateLower === lgaLower ||
                      candidateLower.includes(lgaLower) ||
                      lgaLower.includes(candidateLower);
                  });
                });

                if (matchedLGA) {
                  setFieldValue("lga", matchedLGA);
                }
              }
            }
          }
        }
      } catch (error) {
        console.log("Auto-fill location failed", error);
      }
    }
  };

  // Submission Logic
  const handleSubmit = async (values: FormValues) => {
    if (!cacDocument) {
      setErrorMessage("Please select your CAC document to continue.");
      setShowErrorModal(true);
      return;
    }
    if (!selfie) {
      setErrorMessage("Please capture your selfie to continue.");
      setShowErrorModal(true);
      return;
    }
    if (!governmentIdFront) {
      setErrorMessage("Please upload the front of your government ID.");
      setShowErrorModal(true);
      return;
    }
    if (values.govt_id_type !== "international_passport" && !governmentIdBack) {
      setErrorMessage("Please upload the back of your government ID.");
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('requestType', 'inbound');
      formData.append('location', values.location);
      if (values.latitude) formData.append('latitude', values.latitude);
      if (values.longitude) formData.append('longitude', values.longitude);
      formData.append('bio', values.bio);
      formData.append('cac_number', values.cac_number);
      formData.append('govt_id_type', values.govt_id_type);

      // Append files
      if (cacDocument) {
        formData.append('cac_document', {
          uri: cacDocument.uri,
          name: `cac_document_${Date.now()}.jpg`,
          type: 'image/jpeg'
        } as any);
      }

      if (selfie) {
        formData.append('selfie', {
          uri: selfie.uri,
          name: `selfie_${Date.now()}.jpg`,
          type: 'image/jpeg'
        } as any);
      }

      if (governmentIdFront) {
        formData.append('government_id_front', {
          uri: governmentIdFront.uri,
          name: `id_front_${Date.now()}.jpg`,
          type: 'image/jpeg'
        } as any);
      }

      if (governmentIdBack) {
        formData.append('government_id_back', {
          uri: governmentIdBack.uri,
          name: `id_back_${Date.now()}.jpg`,
          type: 'image/jpeg'
        } as any);
      }

      await userAPI.submitMechanicKYC(formData);

      // Update global state
      useProfileStore.getState().setIsProfileComplete(true);

      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('KYC Submission Error:', error);
      
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


  // ... existing imports ...

  // Helper Component for Section Headers
  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <View className="flex-row items-center space-x-2 mb-4">
      <View className="bg-primary-50 p-2 rounded-full">
        <Icon size={20} color="#000" />
      </View>
      <Text className="text-lg font-NunitoBold text-gray-900">{title}</Text>
    </View>
  );

  // ... existing code ...

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <ChevronLeftIcon size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-NunitoBold ml-2 text-gray-900">Mechanic Profile</Text>
      </View>

      <KeyboardAwareScrollView 
        className="flex-1 px-4 pt-6" 
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={120}
        extraHeight={140}
        keyboardOpeningTime={0}
        keyboardShouldPersistTaps="handled"
        enableResetScrollToCoords={false}
      >
        <Text className="text-gray-500 font-NunitoMedium mb-6 text-base leading-5">
          Complete your verification to start accepting jobs.
        </Text>

        <Formik
          enableReinitialize={true}
          initialValues={initialFormValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
            <View className="pb-10">


              {/* Card: Professional Bio */}
              <View className="bg-white px-4 py-2 rounded-2xl mb-5 border border-gray-100 shadow-sm">

                <SectionHeader icon={UserIcon} title="Professional Profile" />

                <SelfieUpload
                  onPress={() => pickDocument("selfie")}
                  imageUri={selfie?.uri}
                />
                <View>
                  <Text className="text-xs font-NunitoBold text-gray-500 uppercase tracking-wider mb-2 ml-1">Bio</Text>
                  <TextArea
                    placeholder="Briefly describe your experience and expertise..."
                    value={values.bio}
                    onChangeText={handleChange("bio")}
                    error={errors.bio}
                    touched={touched.bio}
                    numberOfLines={4}
                  />
                </View>
              </View>

              {/* Card: Location Details */}
              <View className="bg-white px-4 pt-2 rounded-2xl mb-5 border border-gray-100 shadow-sm">
                <SectionHeader icon={MapPinIcon} title="Location Details" />

                <View className="mb-4">
                  <AddressInput
                    label="Business Address"
                    placeholder="Search for your workshop address"
                    value={values.location}
                    onChangeText={handleChange("location")}
                    onLocationSelect={(loc: any) => handleLocationSelect(loc, setFieldValue)}
                    error={errors.location}
                    touched={touched.location}
                    required
                    showCurrentLocationButton={true}
                  />
                </View>

                <View className="flex-row gap-x-3">
                  <View className="flex-1">
                    <SelectField
                      label="State"
                      name="state"
                      placeholder="Select State"
                      options={states}
                      value={values.state}
                      onValueChange={(val) => setFieldValue("state", val)}
                      error={errors.state}
                      touched={touched.state}
                      required
                    />
                  </View>
                  <View className="flex-1">
                    <SelectField
                      label="LGA"
                      name="lga"
                      placeholder="LGA"
                      options={(() => {
                        const selectedState = states.find(s => s.value === values.state);
                        const stateLabel = selectedState ? selectedState.label : values.state;
                        return getLGAs(stateLabel).map((l: string) => ({ label: l, value: l }));
                      })()}
                      value={values.lga}
                      onValueChange={(val) => setFieldValue("lga", val)}
                      error={errors.lga}
                      touched={touched.lga}
                      required
                    />
                  </View>
                </View>
              </View>

              {/* Card: Business Information */}
              <View className="bg-white p-5 rounded-2xl mb-5 border border-gray-100 shadow-sm">
                <SectionHeader icon={BriefcaseIcon} title="Business Verification" />

                <View className="mb-5">
                  <InputField
                    label="CAC Registration Number"
                    placeholder="Enter BN/RC Number"
                    value={values.cac_number}
                    onChangeText={handleChange("cac_number")}
                    error={errors.cac_number}
                    touched={touched.cac_number}
                    required
                  />
                </View>

                <View className="mb-5">
                  <ImageUpload
                    label="Upload CAC Document"
                    isUploaded={!!cacDocument}
                    imageUri={cacDocument?.uri}
                    onPress={() => pickDocument("cac")}
                    required
                  />
                </View>

              </View>

              {/* Card: Identity Verification */}
              <View className="bg-white p-5 rounded-2xl mb-6 border border-gray-100 shadow-sm">
                <SectionHeader icon={IdentificationIcon} title="Identity Verification" />

                <View className="mb-3">
                  <SelectField
                    label="Government ID Type"
                    name="govt_id_type"
                    placeholder="Select ID Type"
                    options={govtIdTypes}
                    value={values.govt_id_type}
                    onValueChange={(val) => setFieldValue("govt_id_type", val)}
                    error={errors.govt_id_type}
                    touched={touched.govt_id_type}
                    required
                  />
                </View>

                <View className="space-y-4">
                  <ImageUpload
                    label="Government ID (Front)"
                    isUploaded={!!governmentIdFront}
                    imageUri={governmentIdFront?.uri}
                    onPress={() => pickDocument("govt_front")}
                    required
                  />

                 <View className="mt-5">
                  {values.govt_id_type !== "international_passport" && (
                    <ImageUpload
                      label="Government ID (Back)"
                      isUploaded={!!governmentIdBack}
                      imageUri={governmentIdBack?.uri}
                      onPress={() => pickDocument("govt_back")}
                      required
                    />
                  )}
                 </View>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={() => handleSubmit()}
                className={`py-4 rounded-xl mb-8 items-center shadow-md ${isSubmitting ? 'bg-primary-300' : 'bg-primary-500'}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-NunitoBold text-lg">Submit Verification</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>

        <Modal
          visible={showLivenessModal}
          animationType="slide"
          onRequestClose={() => setShowLivenessModal(false)}
        >
          <LivenessCamera
            onCapture={handleLivenessCapture}
            onCancel={() => setShowLivenessModal(false)}
          />
        </Modal>

        <SuccessModal
          isVisible={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            router.replace(mechanicRoutes.home as any);
          }}
          title="Verification Submitted 🎉"
          message="Your profile verification has been submitted successfully and will be reviewed and approved in less than 24 hours."
          buttonText="Go to Dashboard"
        />

        <ErrorModal
          isVisible={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          title="Verification Failed"
          message={errorMessage}
          buttonText="Try Again"
        />
    </SafeAreaView>
  );
};

export default CompleteKYC;
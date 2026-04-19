import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
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
  IdentificationIcon
} from "react-native-heroicons/outline";

import AddressInput from "@/components/forms/AddressInput";
import InputField from "@/components/InputField";
import ImageUpload from "@/components/ImageUpload";
import SelfieUpload from "@/components/SelfieUpload";
import LivenessCamera from "@/components/LivenessCamera";
import SuccessModal from "@/components/modals/SuccessModal";
import ErrorModal from "@/components/modals/ErrorModal";
import SelectField from "@/components/forms/SelectField";
import { userAPI } from "@/lib/api/user";
import { useProfileStore } from "@/hooks/useProfileStore";
import { useSubmitMerchantKYC } from "@/hooks/useUserProfile";
import { getStatesByCountry } from "@/constants/locationData";
import { getLGAs } from "@/constants/nigeriaData";
import { sellerRoutes } from "@/constants/routes";

// Validation Schema
const validationSchema = Yup.object().shape({
  store_name: Yup.string().required("Store name is required"),
  location: Yup.string().required("Please enter your location"),
  latitude: Yup.string(),
  longitude: Yup.string(),
  state: Yup.string().required("Please select your state"),
  lga: Yup.string().required("Please select your LGA"),
  cac_number: Yup.string().required("CAC document number is required"),
});

interface FormValues {
  store_name: string;
  location: string;
  latitude: string;
  longitude: string;
  state: string;
  lga: string;
  cac_number: string;
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLivenessModal, setShowLivenessModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const submitKYCMutation = useSubmitMerchantKYC();
  const [initialFormValues, setInitialFormValues] = useState<FormValues>({
    store_name: "",
    location: "",
    latitude: "",
    longitude: "",
    state: "",
    lga: "",
    cac_number: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getMerchantProfile();
        if (response?.data?.has_merchant_profile) {
          const profile = response.data.merchant_profile;
          
          setInitialFormValues({
            store_name: profile.store_name || "",
            location: profile.location || "",
            latitude: profile.latitude || "",
            longitude: profile.longitude || "",
            state: profile.state || "",
            lga: profile.lga || "",
            cac_number: profile.cac_number || "",
          });

          if (profile.cac_document) {
            setCacDocument({
              uri: profile.cac_document,
              name: "cac_document.jpg",
              type: "image/jpeg",
              size: 0,
            });
          }

          if (profile.selfie) {
            setSelfie({
              uri: profile.selfie,
              name: "selfie.jpg",
              type: "image/jpeg",
              size: 0,
            });
          }
        }
      } catch (error) {
        console.error("Error prefilling merchant profile:", error);
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
    value: state.name
  }));

  // Document Picking Logic
  const pickDocument = async (type: "cac" | "selfie") => {
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

        if (type === "cac") setCacDocument(file);
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
      size: 0, 
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
          const region = address.region; 
          const city = address.city || address.subregion;

          if (region) {
            const matchedState = states.find(s => s.label.toLowerCase() === region.toLowerCase());
            if (matchedState) {
              setFieldValue("state", matchedState.label);
              
              const potentialLGAs = [city, address.subregion, address.district].filter(Boolean);

              if (potentialLGAs.length > 0) {
                const availableLGAs = getLGAs(matchedState.label);

                const matchedLga = availableLGAs.find(lga => {
                  const lgaLower = lga.toLowerCase();
                  return potentialLGAs.some(candidate => {
                    const candidateLower = candidate?.toLowerCase() || '';
                    return candidateLower === lgaLower ||
                      candidateLower.includes(lgaLower) ||
                      lgaLower.includes(candidateLower);
                  });
                });

                if (matchedLga) {
                  setFieldValue("lga", matchedLga);
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
  const submitForm = async (values: FormValues) => {
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

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('requestType', 'inbound');
      formData.append('store_name', values.store_name);
      formData.append('location', values.location);
      if (values.state) formData.append('state', values.state);
      if (values.lga) formData.append('lga', values.lga);
      formData.append('cac_number', values.cac_number);

      // Append files directly as FormData blobs/files
      if (cacDocument) {
        formData.append('cac_document', {
          uri: cacDocument.uri,
          name: cacDocument.name,
          type: cacDocument.type,
        } as any);
      }

      if (selfie) {
        formData.append('selfie', {
          uri: selfie.uri,
          name: selfie.name,
          type: selfie.type,
        } as any);
      }

      await submitKYCMutation.mutateAsync(formData);

      // Update global state
      useProfileStore.getState().setIsProfileComplete(true);

      setShowSuccessModal(true);
    } catch (error: any) {
      setErrorMessage(error?.message || "There was an error submitting your verification. Please try again.");
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper Component for Section Headers
  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <View className="flex-row items-center space-x-2 mb-4">
      <View className="bg-primary-50 p-2 rounded-lg">
        <Icon size={20} color="#D30309" strokeWidth={2} />
      </View>
      <Text className="text-lg font-NunitoBold text-gray-900">{title}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="px-6 py-4 bg-white flex-row items-center space-x-4 border-b border-gray-100">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center"
        >
          <ChevronLeftIcon size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-NunitoBold text-gray-900">Merchant Verification</Text>
      </View>

      <KeyboardAwareScrollView
        enableAutomaticScroll={true}
        extraScrollHeight={120} 
        extraHeight={120} 
        keyboardOpeningTime={0} 
        enableResetScrollToCoords={false}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Formik
          initialValues={initialFormValues}
          validationSchema={validationSchema}
          onSubmit={submitForm}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
            <View className="p-6 space-y-8">
              
              {/* Identity Section */}
              <View className="bg-white p-3 rounded-[20px] shadow-sm border border-gray-100">
                <SectionHeader icon={UserIcon} title="Identity Details" />
                
                <View className="space-y-4">
                  <SelfieUpload
                    onPress={() => pickDocument("selfie")}
                    imageUri={selfie?.uri}
                  />
                </View>
              </View>

              {/* Business Location Section */}
              <View className="bg-white p-3 rounded-[20px] my-3 shadow-sm border border-gray-100" style={{ zIndex: 50 }}>
                <SectionHeader icon={MapPinIcon} title="Business Location" />
                
                <View className="space-y-4" style={{ zIndex: 50 }}>
                  <View style={{ zIndex: 60, elevation: 60 }}>
                  <AddressInput
                    label="Business Location"
                    placeholder="Search for your shop address"
                    value={values.location}
                    onChangeText={handleChange("location")}
                    onLocationSelect={(loc: any) => handleLocationSelect(loc, setFieldValue)}
                    error={errors.location}
                    touched={touched.location}
                    required
                    showCurrentLocationButton={true}
                  />
                  </View>


                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <SelectField
                        name="state"
                        label="State"
                        placeholder="Select State"
                        options={states}
                        value={values.state}
                        onValueChange={(val) => {
                          setFieldValue("state", val);
                          setFieldValue("lga", ""); // Reset LGA when state changes
                        }}
                        error={errors.state as string}
                        touched={touched.state}
                        required
                      />
                    </View>
                    <View className="flex-1">
                      <SelectField
                        name="lga"
                        label="LGA"
                        placeholder="Select LGA"
                        options={values.state ? getLGAs(values.state).map(lga => ({ label: lga, value: lga })) : []}
                        value={values.lga}
                        onValueChange={(val) => setFieldValue("lga", val)}
                        error={errors.lga as string}
                        touched={touched.lga}
                        required
                        // @ts-ignore - disabled prop not in SelectFieldProps but might be needed/added later
                        disabled={!values.state}
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Documentation Section */}
              <View className="bg-white p-3 rounded-[20px] shadow-sm border border-gray-100">
                <SectionHeader icon={IdentificationIcon} title="Business Documentation" />
                
                <View className="space-y-4">
                  <InputField
                    label="Store Name"
                    placeholder="Enter your store name"
                    value={values.store_name}
                    onChangeText={handleChange("store_name")}
                    onBlur={handleBlur("store_name")}
                    error={errors.store_name}
                    touched={touched.store_name}
                    required
                  />

                  <InputField
                    label="CAC Registration Number"
                    placeholder="Enter your CAC number"
                    value={values.cac_number}
                    onChangeText={handleChange("cac_number")}
                    onBlur={handleBlur("cac_number")}
                    error={errors.cac_number}
                    touched={touched.cac_number}
                    required
                  />
                  
                  <ImageUpload
                    label="CAC Certificate"
                    onPress={() => pickDocument("cac")}
                    isUploaded={!!cacDocument}
                    imageUri={cacDocument?.uri}
                    required
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={() => handleSubmit()}
                className={`py-4 rounded-xl mb-8 mt-5 items-center shadow-md ${isSubmitting ? 'bg-primary-300' : 'bg-primary-500'}`}
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
            router.replace(sellerRoutes.home as any);
          }}
          title="Verification Submitted 🎉"
          message="Your merchant profile verification has been submitted successfully and will be reviewed and approved in less than 24 hours."
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
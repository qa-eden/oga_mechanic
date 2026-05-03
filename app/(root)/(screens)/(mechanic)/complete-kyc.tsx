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
import MultiSelectField from "@/components/forms/MultiSelectField";
import InputField from "@/components/InputField";
import TextArea from "@/components/forms/TextArea";
import ImageUpload from "@/components/ImageUpload";
import LivenessCamera from "@/components/LivenessCamera";
import SuccessModal from "@/components/modals/SuccessModal";
import ErrorModal from "@/components/modals/ErrorModal";
import SelfieUpload from "@/components/SelfieUpload";
import { userAPI } from "@/lib/api/user";
import { mechanicAPI } from "@/lib/api/mechanic";
import { useProfileStore } from "@/hooks/useProfileStore";
import { useSubmitMechanicKYC } from "@/hooks/useUserProfile";
import { mechanicRoutes } from "@/constants/routes";

// Validation Schema
const validationSchema = Yup.object().shape({
  location: Yup.string().required("Please enter your location"),
  latitude: Yup.string(),
  longitude: Yup.string(),
  bio: Yup.string().required("Please tell us about your experience"),
  nin_number: Yup.string().required("NIN is required"),
  specializations: Yup.array().min(1, "Select at least one specialization").required("Specializations are required"),
  vehicle_expertise: Yup.array().min(1, "Select at least one vehicle expertise").required("Vehicle expertise is required"),
});

interface FormValues {
  location: string;
  latitude: string;
  longitude: string;
  bio: string;
  nin_number: string;
  specializations: string[];
  vehicle_expertise: string[];
}

interface DocumentFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

const CompleteKYC = () => {
  const [ninDocument, setNinDocument] = useState<DocumentFile | null>(null);
  const [selfie, setSelfie] = useState<DocumentFile | null>(null);
  const [certificateOfLearning, setCertificateOfLearning] = useState<DocumentFile | null>(null);

  const submitKYCMutation = useSubmitMechanicKYC();
  const isSubmitting = submitKYCMutation.isPending;
  const [showLivenessModal, setShowLivenessModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Dynamic Dropdown Options
  const [specializationsOptions, setSpecializationsOptions] = useState<{label: string, value: string}[]>([]);
  const [carBrandsOptions, setCarBrandsOptions] = useState<{label: string, value: string}[]>([]);

  const [initialFormValues, setInitialFormValues] = useState<FormValues>({
    location: "",
    latitude: "",
    longitude: "",
    bio: "",
    nin_number: "",
    specializations: [],
    vehicle_expertise: [],
  });

  useEffect(() => {
    const fetchProfileAndOptions = async () => {
      try {
        // Fetch Profile
        const profileResponse = await userAPI.getMechanicProfile();
        if (profileResponse?.data?.has_mechanic_profile) {
          const profile = profileResponse.data.mechanic_profile;
          setInitialFormValues({
            location: profile.location || "",
            latitude: profile.latitude || "",
            longitude: profile.longitude || "",
            bio: profile.bio || "",
            nin_number: profile.nin_number || "",
            specializations: Array.isArray(profile.specializations) ? profile.specializations.map(String) : [],
            vehicle_expertise: Array.isArray(profile.vehicle_expertise) ? profile.vehicle_expertise.map(String) : [],
          });
        }

        // Fetch Dropdown Options
        try {
          const servicesResponse = await mechanicAPI.getServiceTypes();
          const services = servicesResponse?.results || servicesResponse?.data || servicesResponse || [];
          setSpecializationsOptions(services.map((item: any) => ({
            label: item.name || String(item.id),
            value: String(item.id)
          })));

          const expertiseResponse = await mechanicAPI.getVehicleExpertise();
          const expertises = expertiseResponse?.results || expertiseResponse?.data || expertiseResponse || [];
          setCarBrandsOptions(expertises.map((item: any) => ({
            label: item.vehicle_make?.name || item.name || String(item.id),
            value: String(item.vehicle_make?.id || item.id)
          })));
        } catch (optionsError) {
          console.warn("Failed to fetch dropdown options:", optionsError);
        }

      } catch (error) {
        console.log("Error prefilling mechanic profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfileAndOptions();
  }, []);

  if (isLoadingProfile) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#D30309" />
      </SafeAreaView>
    );
  }

  // Document Picking Logic
  const pickDocument = async (type: "nin_document" | "selfie" | "certificate_of_learning") => {
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
          case "nin_document": setNinDocument(file); break;
          case "certificate_of_learning": setCertificateOfLearning(file); break;
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
    }
  };

  // Submission Logic
  const handleSubmit = async (values: FormValues) => {
    if (!ninDocument) {
      setErrorMessage("Please upload your NIN document.");
      setShowErrorModal(true);
      return;
    }
    if (!selfie) {
      setErrorMessage("Please capture your selfie to continue.");
      setShowErrorModal(true);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('requestType', 'inbound');
      formData.append('location', values.location);
      if (values.latitude) formData.append('latitude', values.latitude);
      if (values.longitude) formData.append('longitude', values.longitude);
      formData.append('bio', values.bio);
      formData.append('nin_number', values.nin_number);
      formData.append('specializations', JSON.stringify(values.specializations));
      formData.append('vehicle_expertise', JSON.stringify(values.vehicle_expertise));

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

      // Append files (now as file objects or existing URLs)
      if (ninDocument) {
        const file = getFileObject(ninDocument);
        if (file) formData.append('nin_document', file);
      }

      if (selfie) {
        const file = getFileObject(selfie);
        if (file) formData.append('selfie', file);
      }

      if (certificateOfLearning) {
        const file = getFileObject(certificateOfLearning);
        if (file) formData.append('certificate_of_learning', file);
      }

      console.log('🚀 Submitting Mechanic KYC via Mutation...');
      submitKYCMutation.mutate(formData, {
        onSuccess: () => {
          // Update global state
          useProfileStore.getState().setIsProfileComplete(true);
          setShowSuccessModal(true);
        },
        onError: (error: any) => {
          console.error('KYC Submission Error:', error);
          
          const errMsg = error?.response?.data?.message || 
                         error?.response?.data?.detail || 
                         error?.message || 
                         "There was an error submitting your verification. Please try again.";
          
          setErrorMessage(errMsg);
          setShowErrorModal(true);
        }
      });
    } catch (error: any) {
      console.error('Form Preparation Error:', error);
      setErrorMessage("Failed to prepare submission data.");
      setShowErrorModal(true);
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
              </View>

              {/* Card: Identity & Expertise */}
              <View className="bg-white p-5 rounded-2xl mb-5 border border-gray-100 shadow-sm">
                <SectionHeader icon={BriefcaseIcon} title="Identity & Expertise" />

                <View className="mb-5">
                  <InputField
                    label="NIN Number"
                    placeholder="Enter your 11-digit NIN"
                    value={values.nin_number}
                    onChangeText={handleChange("nin_number")}
                    error={errors.nin_number}
                    touched={touched.nin_number}
                    required
                  />
                </View>

                <View className="mb-5">
                  <ImageUpload
                    label="Upload NIN Document"
                    isUploaded={!!ninDocument}
                    imageUri={ninDocument?.uri}
                    onPress={() => pickDocument("nin_document")}
                    required
                  />
                </View>

                <View className="mb-5">
                  <MultiSelectField
                    label="Areas of Specialization"
                    name="specializations"
                    placeholder="Select specializations"
                    options={specializationsOptions}
                    value={values.specializations}
                    onValueChange={(val) => setFieldValue("specializations", val)}
                  />
                  {touched.specializations && errors.specializations && (
                    <Text className="text-red-500 text-xs mt-1 ml-1">{errors.specializations as string}</Text>
                  )}
                </View>

                <View className="mb-5">
                  <MultiSelectField
                    label="Vehicle Brands Expertise"
                    name="vehicle_expertise"
                    placeholder="Select car brands"
                    options={carBrandsOptions}
                    value={values.vehicle_expertise}
                    onValueChange={(val) => setFieldValue("vehicle_expertise", val)}
                  />
                  {touched.vehicle_expertise && errors.vehicle_expertise && (
                    <Text className="text-red-500 text-xs mt-1 ml-1">{errors.vehicle_expertise as string}</Text>
                  )}
                </View>
                
                <View className="mb-2">
                  <ImageUpload
                    label="Certificate of Learning (Optional)"
                    isUploaded={!!certificateOfLearning}
                    imageUri={certificateOfLearning?.uri}
                    onPress={() => pickDocument("certificate_of_learning")}
                  />
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
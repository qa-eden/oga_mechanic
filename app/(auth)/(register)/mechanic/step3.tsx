"use client";

import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Formik } from "formik";
import * as Yup from "yup";
import * as ImagePicker from "expo-image-picker";
import FormikInput from "@/components/forms/FormikInput";
import FormikButton from "@/components/forms/FormikButton";
import ProgressBar from "@/components/ProgressBar";
import { mechanicRoutes, routes } from "@/constants/routes";
import SelectField from "@/components/forms/SelectField";
import UserAuthHeader from "@/components/UserAuthHeader";
import { useVehicleMakes } from "@/hooks/useVehicleMakes";
import { VehicleMake } from "@/lib/api/products";
import { getStatesByCountry, getCitiesByState } from "@/constants/locationData";
import { getLGAs } from "@/constants/nigeriaData";
import DocumentUpload from "@/components/forms/DocumentUpload";
import ImageUpload from "@/components/ImageUpload";
import AsyncStorage from '@react-native-async-storage/async-storage';

const validationSchema = Yup.object().shape({
  location: Yup.string().required("Please enter your location"),
  state: Yup.string().required("Please select your state"),
  lga: Yup.string().required("Please select your LGA"),
  ccac_document: Yup.string().required("CAC document number is required"),
  govt_id_type: Yup.string().required("Please select government ID type"),
});

interface FormValues {
  location: string;
  state: string;
  lga: string;
  ccac_document: string;
  govt_id_type: string;
}

interface ExpertiseDetail {
  vehicle_make_id: number;
  years_of_experience: number;
  certification_level: string;
}

interface SelectedMake {
  id: number;
  name: string;
  years_of_experience: number;
  certification_level: string;
}

interface DocumentFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

const MechanicStep3 = () => {
  const params = useLocalSearchParams();
  const [cacDocument, setCacDocument] = useState<DocumentFile | null>(null);
  const [selfie, setSelfie] = useState<DocumentFile | null>(null);
  const [governmentIdFront, setGovernmentIdFront] = useState<DocumentFile | null>(null);
  const [governmentIdBack, setGovernmentIdBack] = useState<DocumentFile | null>(null);
  const [selectedMakes, setSelectedMakes] = useState<SelectedMake[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch vehicle makes
  const { data: vehicleMakes, loading: vehicleMakesLoading } = useVehicleMakes();

  // Get Nigerian states from existing location data
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

  const certificationLevels = [
    { label: "Basic", value: "basic" },
    { label: "Intermediate", value: "intermediate" },
    { label: "Advanced", value: "advanced" },
    { label: "Expert", value: "expert" },
    { label: "Certified", value: "certified" },
  ];

  const yearsOfExperience = [
    { label: "0-1 years", value: 1 },
    { label: "2-3 years", value: 2 },
    { label: "4-5 years", value: 3 },
    { label: "6-10 years", value: 5 },
    { label: "10+ years", value: 10 },
  ];

  // Handle adding a vehicle make to expertise
  const addVehicleMake = (make: VehicleMake) => {
    const newSelectedMake: SelectedMake = {
      id: make.id,
      name: make.name,
      years_of_experience: 1,
      certification_level: "basic"
    };
    setSelectedMakes([...selectedMakes, newSelectedMake]);
  };

  // Handle removing a vehicle make from expertise
  const removeVehicleMake = (makeId: number) => {
    setSelectedMakes(selectedMakes.filter(make => make.id !== makeId));
  };

  // Handle updating expertise details
  const updateExpertiseDetail = (makeId: number, field: 'years_of_experience' | 'certification_level', value: number | string) => {
    setSelectedMakes(selectedMakes.map(make =>
      make.id === makeId ? { ...make, [field]: value } : make
    ));
  };

  // Get LGAs based on selected state
  const getLGAsForState = (stateValue: string) => {
    // Convert state value back to proper case for lookup
    const stateName = stateValue.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const lgas = getLGAs(stateName);
    return lgas.map(lga => ({
      label: lga,
      value: lga.toLowerCase().replace(/\s+/g, '_').replace(/[\/\-]/g, '_')
    }));
  };

  const pickDocument = async (type: "cac" | "selfie" | "govt_front" | "govt_back") => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to upload documents."
        );
        return;
      }

      // Show action sheet for image source
      Alert.alert(
        "Select Image",
        "Choose how you want to select your document image",
        [
          {
            text: "Camera",
            onPress: () => takePhoto(type),
          },
          {
            text: "Photo Library",
            onPress: () => pickFromLibrary(type),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to select document. Please try again.");
    }
  };

  const takePhoto = async (type: "cac" | "selfie" | "govt_front" | "govt_back") => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera permissions to take photos."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
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
          case "cac":
            setCacDocument(file);
            break;
          case "selfie":
            setSelfie(file);
            break;
          case "govt_front":
            setGovernmentIdFront(file);
            break;
          case "govt_back":
            setGovernmentIdBack(file);
            break;
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to take photo. Please try again.");
    }
  };

  const pickFromLibrary = async (type: "cac" | "selfie" | "govt_front" | "govt_back") => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 10],
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

        // Check file size (15MB limit)
        const maxSize = 15 * 1024 * 1024; // 15MB in bytes
        if (file.size > maxSize) {
          Alert.alert(
            "File Too Large",
            "Please select an image smaller than 15MB."
          );
          return;
        }

        switch (type) {
          case "cac":
            setCacDocument(file);
            break;
          case "selfie":
            setSelfie(file);
            break;
          case "govt_front":
            setGovernmentIdFront(file);
            break;
          case "govt_back":
            setGovernmentIdBack(file);
            break;
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const handleSubmit = async (values: FormValues) => {
    // Validate required documents
    if (!cacDocument) {
      Alert.alert(
        "Missing Document",
        "Please upload your CAC document."
      );
      return;
    }

    if (!selfie) {
      Alert.alert(
        "Missing Document",
        "Please upload your selfie."
      );
      return;
    }

    if (!governmentIdFront) {
      Alert.alert(
        "Missing Document",
        "Please upload the front of your government ID."
      );
      return;
    }

    // Only require back image for non-passport documents
    if (values.govt_id_type !== "international_passport" && !governmentIdBack) {
      Alert.alert(
        "Missing Document",
        "Please upload the back of your government ID."
      );
      return;
    }

    // Directly call the endpoint
    continueSubmission(values);
  };

  const continueSubmission = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      // Convert selected makes to expertise details format
      const expertiseDetails: ExpertiseDetail[] = selectedMakes.map(make => ({
        vehicle_make_id: make.id,
        years_of_experience: make.years_of_experience,
        certification_level: make.certification_level
      }));

      // Prepare FormData payload (matching seller step4 structure)
      const formData = new FormData();
      formData.append('requestType', 'inbound');
      formData.append('location', values.location);
      formData.append('lga', values.lga);
      formData.append('cac_number', values.ccac_document);
      formData.append('govt_id_type', values.govt_id_type);
      formData.append('expertise_details', JSON.stringify(expertiseDetails));

      // Add files as proper file objects
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
          name: `government_id_front_${Date.now()}.jpg`,
          type: 'image/jpeg'
        } as any);
      }

      if (governmentIdBack) {
        formData.append('government_id_back', {
          uri: governmentIdBack.uri,
          name: `government_id_back_${Date.now()}.jpg`,
          type: 'image/jpeg'
        } as any);
      }

      const token = await AsyncStorage.getItem('auth_token');

      // Use direct fetch to bypass axios interceptor that converts FormData to JSON
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/register/step/4/`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'X-Api-Key': process.env.EXPO_PUBLIC_API_KEY || '',
          // Don't set Content-Type - let browser set it for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const responseData = await response.json();
      console.log('✅ Step 4 registration successful:', responseData);

      // Navigate to step 4 with all data
      router.push({
        pathname: mechanicRoutes.step4,
        params: {
          ...params,
          location: values.location,
          state: values.state,
          lga: values.lga,
          ccac_document: values.ccac_document,
          govt_id_type: values.govt_id_type,
          expertise_details: JSON.stringify(expertiseDetails),
          documentsUploaded: "true",
        },
      });

    } catch (error: any) {
      console.error('❌ Step 4 registration failed:', error);
      Alert.alert(
        "Registration Failed",
        error?.response?.data?.message || error.message || "Failed to submit documents. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = () => {
    router.push(routes.signIn);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        decelerationRate="normal"
        bounces={false}
        overScrollMode="never"
        nestedScrollEnabled={true}
        automaticallyAdjustKeyboardInsets={true}
        keyboardDismissMode="interactive"
        contentContainerStyle={{ paddingBottom: 40 }}
        scrollEnabled={true}
        alwaysBounceVertical={false}
      >
        <View className="px-5">
          <UserAuthHeader />
          {/* Progress Bar */}
          <View className="my-6">
            <ProgressBar step={3} totalSteps={4} />
          </View>

          <Formik
            initialValues={{
              location: "",
              state: "",
              lga: "",
              ccac_document: "",
              govt_id_type: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              isValid,
              setFieldValue,
              values,
              errors,
              touched,
            }) => (
              <View>
                {/* SECTION 1: LOCATION & BUSINESS INFO */}
                <View className="mb-4">
                  <View className="shadow-sm bg-white rounded-xl p-4 mb-6">
                    <Text className="text-lg font-NunitoBold text-gray-900 mb-4">
                      Location & Business Information
                    </Text>

                    {/* Location Input */}
                    <FormikInput
                      name="location"
                      label="Location"
                      placeholder="Enter your location (e.g., Lagos, Ikeja)"
                      keyboardType="default"
                      required
                    />

                    {/* State Select */}
                <SelectField
                      name="state"
                      label="State"
                      placeholder="Select your state"
                      options={states}
                      value={values.state}
                      onValueChange={(value: string) => {
                        setFieldValue("state", value);
                        setFieldValue("lga", ""); // Reset LGA when state changes
                      }}
                      error={errors.state}
                      touched={touched.state}
                  required={true}
                />

                    {/* LGA Select - Only show if state is selected */}
                    {values.state && (
                      <SelectField
                        name="lga"
                        label="Local Government Area (LGA)"
                        placeholder="Select your LGA"
                        options={getLGAsForState(values.state)}
                        value={values.lga}
                        onValueChange={(value: string) => setFieldValue("lga", value)}
                        error={errors.lga}
                        touched={touched.lga}
                        required={true}
                      />
                    )}
                      </View>
                    </View>

                {/* SECTION 2: VEHICLE EXPERTISE */}
                <View className="mb-4">
                  <View className="bg-white shadow-sm rounded-[.8rem] p-4 mb-6">
                    <Text className="text-lg font-NunitoBold text-gray-900 mb-2">
                      Vehicle Expertise
                    </Text>
                    <Text className="text-sm text-gray-600 font-NunitoMedium mb-4">
                      Select vehicle makes you specialize in and your experience level
                    </Text>

                    {/* Available Vehicle Makes */}
                    <View className="mb-4">
                      <Text className="text-sm font-NunitoSemiBold text-gray-700 mb-3">
                        Available Vehicle Makes:
                      </Text>
                      {vehicleMakesLoading ? (
                        <View className="bg-white rounded-lg p-4 items-center">
                          <Text className="text-gray-500">Loading vehicle makes...</Text>
                        </View>
                      ) : (
                        <View className="bg-white rounded-lg p-3">
                          <View className="flex-row flex-wrap">
                            {vehicleMakes?.filter(make =>
                              make.is_active &&
                              !selectedMakes.some(selected => selected.id === make.id)
                            ).map((make) => (
                              <TouchableOpacity
                                key={make.id}
                                onPress={() => addVehicleMake(make)}
                                className="bg-primary-500 border border-primary-500 rounded-[.8rem] px-4 py-2 mr-2 mb-2"
                                activeOpacity={0.7}
                              >
                                <Text className="text-white font-NunitoMedium text-md">
                                  + {make.name}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>

                    {/* Selected Vehicle Makes with Individual Expertise */}
                    {selectedMakes.length > 0 && (
                      <View className="mb-4">
                        <Text className="text-sm font-NunitoSemiBold text-gray-700 mb-3">
                          Configure Expertise for Each Make:
                        </Text>

                        {selectedMakes.map((make) => (
                          <View key={make.id} className="bg-white border border-gray-200 rounded-[.8rem] p-3 mb-3">
                            {/* Make Header */}
                            <View className="flex-row justify-between items-center mb-3">
                              <Text className="text-base font-NunitoBold text-gray-900">
                                {make.name}
                              </Text>
                              <TouchableOpacity
                                onPress={() => removeVehicleMake(make.id)}
                                className="bg-red-100 rounded-full w-6 h-6 items-center justify-center"
                                activeOpacity={0.7}
                              >
                                <Text className="text-red-600 font-bold text-sm">×</Text>
                              </TouchableOpacity>
                            </View>

                            {/* Years of Experience */}
                            <View className="mb-3">
                              <Text className="text-sm font-NunitoSemiBold text-gray-700 mb-2">
                                Years of Experience:
                              </Text>
                              <View className="flex-row flex-wrap">
                                {yearsOfExperience.map((option) => (
                                  <TouchableOpacity
                                    key={option.value}
                                    onPress={() => updateExpertiseDetail(make.id, 'years_of_experience', option.value)}
                                    className={`border rounded-[.6rem] px-3 py-2 mr-2 mb-2 ${make.years_of_experience === option.value
                                      ? 'bg-primary-100 border-primary-400'
                                      : 'bg-gray-50 border-gray-300'
                                      }`}
                                    activeOpacity={0.7}
                                  >
                                    <Text className={`text-sm font-NunitoMedium ${make.years_of_experience === option.value
                                      ? 'text-primary-700'
                                      : 'text-gray-600'
                                      }`}>
                                      {option.label}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            </View>

                            {/* Certification Level */}
                            <View>
                              <Text className="text-sm font-NunitoSemiBold text-gray-700 mb-2">
                                Certification Level:
                              </Text>
                              <View className="flex-row flex-wrap">
                                {certificationLevels.map((level) => (
                                  <TouchableOpacity
                                    key={level.value}
                                    onPress={() => updateExpertiseDetail(make.id, 'certification_level', level.value)}
                                    className={`border rounded-[.8rem] px-3 py-2 mr-2 mb-2 ${make.certification_level === level.value
                                      ? 'bg-green-100 border-green-400'
                                      : 'bg-gray-50 border-gray-300'
                                      }`}
                                    activeOpacity={0.7}
                                  >
                                    <Text className={`text-sm font-NunitoMedium ${make.certification_level === level.value
                                      ? 'text-green-700'
                                      : 'text-gray-600'
                                      }`}>
                                      {level.label}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}

                    {selectedMakes.length === 0 && (
                      <View className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                        <Text className="text-yellow-800 font-NunitoMedium text-sm text-center">
                          Please select at least one vehicle make to continue.
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* SECTION 3: GOVERNMENT IDENTIFICATION & DOCUMENTS */}
                <View className="mb-4">
                  <View className="bg-white shadow-sm rounded-[.8rem] p-4 mb-6">
                    <Text className="text-lg font-NunitoBold text-gray-900 mb-2">
                      Government Identification
                    </Text>
                    <Text className="text-sm text-gray-600 font-NunitoMedium mb-6">
                      Select your ID type and upload required documents
                    </Text>

                    {/* Government ID Type Select */}
                    <SelectField
                      name="govt_id_type"
                      label="Government ID Type"
                      placeholder="Select your government ID type"
                      options={govtIdTypes}
                      value={values.govt_id_type}
                      onValueChange={(value: string) => setFieldValue("govt_id_type", value)}
                      error={errors.govt_id_type}
                      touched={touched.govt_id_type}
                      required={true}
                    />

                    {/* Government ID Uploads - Show immediately after selection */}
                    {values.govt_id_type && (
                      <View className="mt-4">
                        <Text className="text-sm font-NunitoSemiBold text-gray-700 mb-3">
                          Upload Government ID Documents:
                        </Text>

                        {/* Government ID Front Upload */}
                        <View className="mb-4">
                          <ImageUpload
                            label="Front of Government ID"
                            isUploaded={!!governmentIdFront && !!governmentIdFront.uri}
                            onPress={() => pickDocument("govt_front")}
                            uploadedText="Government ID Front Uploaded"
                            maxFileSize="15 MB"
                            required={true}
                            imageUri={governmentIdFront?.uri}
                          />
                        </View>

                        {/* Government ID Back Upload - Only show for non-passport documents */}
                        {values.govt_id_type !== "international_passport" && (
                          <View className="mb-4">
                            <ImageUpload
                              label="Back of Government ID"
                              isUploaded={!!governmentIdBack && !!governmentIdBack.uri}
                              onPress={() => pickDocument("govt_back")}
                              uploadedText="Government ID Back Uploaded"
                              maxFileSize="15 MB"
                              required={true}
                              imageUri={governmentIdBack?.uri}
                            />
                          </View>
                        )}
                      </View>
                    )}
                        </View>
                      </View>

                {/* SECTION 4: ADDITIONAL DOCUMENTS */}
                <View className="mb-4">
                  <View className="bg-white shadow-sm rounded-[.8rem] p-4 mb-6">
                    <Text className="text-lg font-NunitoBold text-gray-900 mb-2">
                      Additional Documents
                      </Text>
                    <Text className="text-sm text-gray-600 font-NunitoMedium mb-6">
                      Upload your CAC document and selfie for verification
                      </Text>


                    {/* CAC Document Input */}
                    <FormikInput
                      name="ccac_document"
                      label="CAC Document Number"
                      placeholder="Enter your CAC document number"
                      keyboardType="default"
                      required
                    />

                    {/* CAC Document Upload */}
                    <View className="mb-4">
                      <DocumentUpload
                        label="CAC Document"
                        placeholder="Upload CAC Document"
                        maxFileSize="15 MB"
                        acceptedTypes={["pdf", "jpg", "jpeg", "png"]}
                        value={cacDocument && cacDocument.uri ? cacDocument : null}
                        onChange={(file) => {
                          if (file) {
                            setCacDocument(file);
                          } else {
                            setCacDocument(null);
                          }
                        }}
                        required={true}
                      />
                    </View>

                    {/* Selfie Upload */}
                    <View className="mb-4">
                      <ImageUpload
                        label="Selfie Photo"
                        isUploaded={!!selfie && !!selfie.uri}
                        onPress={() => pickDocument("selfie")}
                        uploadedText="Selfie Uploaded"
                        maxFileSize="15 MB"
                        required={true}
                        imageUri={selfie?.uri}
                      />
                    </View>
                  </View>
                </View>

                {/* Proceed Button */}
                <View className="mb-6">
                  <FormikButton
                    title="Proceed"
                    disabled={!isValid || !cacDocument || !selfie || !governmentIdFront || (values.govt_id_type !== "international_passport" && !governmentIdBack) || selectedMakes.length === 0}
                    loading={isSubmitting}
                  />
                </View>

                {/* Sign In Link */}
                <View className="items-center mb-8">
                  <Text className="text-gray-600 font-NunitoMedium">
                    Already have an account?{" "}
                    <Text
                      className="text-red-600 font-NunitoBold"
                      onPress={handleSignIn}
                    >
                      Sign in
                    </Text>
                  </Text>
                </View>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MechanicStep3;
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ChevronLeftIcon, PencilIcon } from "react-native-heroicons/solid";
import { 
  UserIcon, 
  EnvelopeIcon,
  BriefcaseIcon,
  XMarkIcon,
  CameraIcon,
  ShieldCheckIcon,
} from "react-native-heroicons/outline";
import { useMechanicProfile, userProfileKeys } from "@/hooks/useUserProfile";
import { mechanicRoutes } from "@/constants/routes";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedPageContainer from "@/components/AnimatedPageContainer";
import { Formik } from "formik";
import * as Yup from "yup";
import FormikInput from "@/components/forms/FormikInput";
import AddressInput from "@/components/forms/AddressInput";
import SelectField from "@/components/forms/SelectField";
import TextArea from "@/components/forms/TextArea";
import { userAPI } from "@/lib/api/user";
import { useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/utils/toastUtils";
import { getStatesByCountry } from "@/constants/locationData";
import { getLGAs } from "@/constants/nigeriaData";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

interface ProfileEditModalProps {
  isVisible: boolean;
  onClose: () => void;
  editingSection: string | null;
  mechanicProfile: any;
  userObj: any;
  handleSectionSave: any;
  handleImagePick: any;
}

const ProfileEditModal = ({
  isVisible,
  onClose,
  editingSection,
  mechanicProfile,
  userObj,
  handleSectionSave,
  handleImagePick,
}: ProfileEditModalProps) => {

  const getSectionSchema = (section: string | null) => {
    const personalSchema = Yup.object().shape({
      first_name: Yup.string().required("First name is required"),
      last_name: Yup.string().required("Last name is required"),
      phone_number: Yup.string().required("Phone number is required"),
      bio: Yup.string().required("Brief bio is required"),
    });

    const addressSchema = Yup.object().shape({
      location: Yup.string().required("Location is required"),
      state: Yup.string().required("State is required"),
      lga: Yup.string().required("LGA is required"),
    });

    const businessSchema = Yup.object().shape({
      nin_number: Yup.string().required("NIN number is required"),
      govt_id_type: Yup.string().required("ID type is required"),
    });

    switch (section) {
      case "personal": return personalSchema;
      case "address": return addressSchema;
      case "business": return businessSchema;
      default: return Yup.object().shape({});
    }
  };

  const getSectionInitialValues = (section: string | null) => {
    if (!mechanicProfile && !userObj) return {};
    switch (section) {
      case "personal":
        return {
          first_name: userObj?.first_name || "",
          last_name: userObj?.last_name || "",
          phone_number: userObj?.phone_number || "",
          bio: mechanicProfile?.bio || "",
          profile_picture: mechanicProfile?.selfie || userObj?.profile_image || "",
        };
      case "address":
        let initialLocation = mechanicProfile?.location || "";
        let initialState = "";
        let initialLga = mechanicProfile?.lga || "";

        // Attempt soft-infer of state
        if (initialLocation && !initialState) {
          const states = getStatesByCountry('NG');
          const matchedState = states.find((s: any) => initialLocation.toLowerCase().includes(s.name.toLowerCase()));
          if (matchedState) initialState = matchedState.name;
        }

        return {
          location: initialLocation,
          state: mechanicProfile?.state || initialState,
          lga: initialLga,
          latitude: mechanicProfile?.latitude || "",
          longitude: mechanicProfile?.longitude || "",
        };
      case "business":
        return {
          nin_number: mechanicProfile?.nin_number || "",
          govt_id_type: mechanicProfile?.govt_id_type || "",
          nin_document: mechanicProfile?.nin_document || "",
          government_id_front: mechanicProfile?.government_id_front || "",
          government_id_back: mechanicProfile?.government_id_back || "",
        };
      default:
        return {};
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-end">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="bg-white rounded-t-[32px] max-h-[90%]"
        >
          <View className="p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-NunitoBold text-gray-900 capitalize">
                Edit {editingSection} Information
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center"
              >
                <XMarkIcon size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Formik
                initialValues={getSectionInitialValues(editingSection)}
                validationSchema={getSectionSchema(editingSection)}
                onSubmit={handleSectionSave}
                enableReinitialize
              >
                {({ handleSubmit, setFieldValue, values, errors, touched, isSubmitting, handleChange, handleBlur, setFieldError, setFieldTouched }) => (
                  <View className="pb-10">
                    {editingSection === "personal" && (
                      <View>
                        <View className="items-center mb-6">
                          <TouchableOpacity onPress={() => handleImagePick(setFieldValue)} className="relative">
                            <View className="w-24 h-24 rounded-2xl items-center justify-center border-4 border-white shadow-lg mb-2 overflow-hidden">
                              {values.profile_picture ? (
                                <Image source={{ uri: values.profile_picture }} className="w-full h-full" resizeMode="cover" />
                              ) : (
                                <LinearGradient colors={["#D30309", "#B91C1C"]} className="w-full h-full items-center justify-center">
                                  <Text className="text-3xl font-NunitoExtraBold text-white">
                                    {values.first_name ? values.first_name.charAt(0).toUpperCase() : "M"}
                                  </Text>
                                </LinearGradient>
                              )}
                            </View>
                            <View className="absolute bottom-1 right-[-4] bg-primary-500 w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow-md">
                              <CameraIcon size={16} color="white" />
                            </View>
                          </TouchableOpacity>
                        </View>
                        
                        <View className="flex-row gap-x-3 mb-2">
                           <View className="flex-1">
                             <FormikInput name="first_name" placeholder="John" label="First Name" required />
                           </View>
                           <View className="flex-1">
                             <FormikInput name="last_name" placeholder="Doe" label="Last Name" required />
                           </View>
                        </View>

                        <FormikInput name="phone_number" placeholder="080 0000 0000" label="Phone Number" keyboardType="phone-pad" required />
                        
                        <View className="mb-4">
                          <Text className="text-xs font-NunitoBold text-gray-500 uppercase tracking-wider mb-2 ml-1">Bio</Text>
                          <TextArea
                            placeholder="Briefly describe your experience and expertise..."
                            value={values.bio}
                            onChangeText={handleChange("bio")}
                            error={errors.bio as string}
                            touched={touched.bio as boolean}
                            numberOfLines={4}
                          />
                        </View>
                      </View>
                    )}

                    {editingSection === "address" && (
                      <View>
                        <AddressInput
                          label="Business Address"
                          value={values.location}
                          onChangeText={(text: string) => {
                            setFieldValue("location", text);
                            // Soft auto-fill search
                            if (text.length > 3) {
                              const states = getStatesByCountry('NG');
                              const matchedState = states.find((s: any) => text.toLowerCase().includes(s.name.toLowerCase()));
                              if (matchedState && !values.state) {
                                setFieldValue("state", matchedState.name);
                              }
                            }
                          }}
                          onLocationSelect={async (loc: any) => {
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
                                      const addr = reverseGeocoded[0];
                                      if (addr.region) {
                                        const matchedState = getStatesByCountry('NG').find(s => s.name.toLowerCase() === addr.region?.toLowerCase());
                                        if (matchedState) {
                                          setFieldValue("state", matchedState.name);
                                          setFieldValue("lga", addr.city || addr.subregion || "");
                                        }
                                      }
                                    }
                                  } catch (e) {
                                    console.log("Reverse geocode error in profileDetails modal:", e);
                                  }
                              }
                          }}
                          placeholder="Search for your workshop address"
                          error={errors.location as string}
                          touched={touched.location as boolean}
                          required
                        />
                        <View className="flex-row gap-x-3 mt-4">
                          <View className="flex-1">
                              <SelectField
                                label="State"
                                name="state"
                                placeholder="Select State"
                                options={getStatesByCountry('NG').map((s: any) => ({ label: s.name || '', value: s.name || '' }))}
                                value={values.state || ''}
                                onValueChange={(val: string) => {
                                  setFieldValue("state", val);
                                  setFieldValue("lga", ""); // Reset lga when state changes
                                }}
                                error={errors.state as string}
                                touched={touched.state as boolean}
                                required
                              />
                          </View>
                          <View className="flex-1">
                              <SelectField
                                label="LGA"
                                name="lga"
                                placeholder="Select LGA"
                                options={values.state ? getLGAs(values.state).map((l: string) => ({ label: l, value: l })) : []}
                                value={values.lga || ''}
                                onValueChange={(val: string) => setFieldValue("lga", val)}
                                error={errors.lga as string}
                                touched={touched.lga as boolean}
                                required
                              />
                          </View>
                        </View>
                      </View>
                    )}

                    {editingSection === "business" && (
                      <View>
                          <FormikInput name="nin_number" placeholder="Enter 11-digit NIN" label="NIN Number" required />
                          <View className="mt-2">
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
                                required
                              />
                          </View>
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() => handleSubmit()}
                      disabled={isSubmitting}
                      className="mt-8 bg-primary-500 py-4 rounded-2xl items-center shadow-md active:opacity-90 flex-row justify-center"
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color="white" size="small" className="mr-2" />
                      ) : null}
                      <Text className="text-white text-base font-NunitoBold">
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Formik>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const SectionHeader = ({ icon: Icon, title, color = "#D30309", bgColor = "bg-primary-50", onEdit }: any) => (
  <View className="flex-row items-center justify-between mb-4">
    <View className="flex-row items-center">
      <View className={`w-8 h-8 ${bgColor} rounded-lg items-center justify-center mr-2`}>
        <Icon size={16} color={color} />
      </View>
      <Text className="text-base font-NunitoBold text-gray-900">{title}</Text>
    </View>
    {onEdit && (
      <TouchableOpacity 
        onPress={onEdit}
        activeOpacity={0.6}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"
      >
        <PencilIcon size={12} color="#4B5563" className="mr-1.5" />
        <Text className="text-xs font-NunitoBold text-gray-600">Edit</Text>
      </TouchableOpacity>
    )}
  </View>
);

const ProfileDetails = () => {
  const queryClient = useQueryClient();
  const { data: profileData, isLoading: isLoadingProfile } = useMechanicProfile();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const mechanicProfile = profileData?.data?.mechanic_profile || (profileData as any)?.mechanic_profile;
  const userObj = mechanicProfile?.user;
  const displayName = userObj?.first_name && userObj?.last_name 
      ? `${userObj.first_name} ${userObj.last_name}`.trim() 
      : "Mechanic";
  const profileImage = mechanicProfile?.selfie || userObj?.profile_image || userObj?.image || "";

  const ProfileRow = ({ label, value, isBio = false }: { label: string; value: string, isBio?: boolean }) => (
    <View className={`py-4 border-b border-gray-50 last:border-0`}>
      <Text className="text-gray-500 font-NunitoMedium text-xs uppercase tracking-wider mb-1">{label}</Text>
      <Text className={`text-base font-NunitoMedium text-gray-900 ${isBio ? 'leading-6' : ''}`}>
        {value || "Not set"}
      </Text>
    </View>
  );

  const handleSectionSave = async (values: any, { setSubmitting }: any) => {
    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('requestType', 'inbound');

      const getFileObject = (uri: string) => {
        if (!uri) return null;
        if (uri.startsWith('http')) return uri;
        return {
          uri,
          name: `profile_${Date.now()}.jpg`,
          type: 'image/jpeg'
        } as any;
      };

      if (values.profile_picture && (values.profile_picture.startsWith('file://') || values.profile_picture.startsWith('content://') || values.profile_picture.startsWith('data:'))) {
        const profileFile = getFileObject(values.profile_picture);
        if (profileFile) {
          formData.append('selfie', profileFile);
        }
      }
      
      const fullValues = {
        bio: mechanicProfile?.bio || "",
        location: mechanicProfile?.location || "",
        state: mechanicProfile?.state || "",
        lga: mechanicProfile?.lga || "",
        latitude: mechanicProfile?.latitude || "",
        longitude: mechanicProfile?.longitude || "",
        nin_number: mechanicProfile?.nin_number || "",
        govt_id_type: mechanicProfile?.govt_id_type || "",
        // Merge with form values
        ...values
      };

      Object.entries(fullValues).forEach(([key, val]) => {
        if (val !== undefined && val !== null && key !== 'first_name' && key !== 'last_name' && key !== 'phone_number' && key !== 'profile_picture' && key !== 'nin_document') {
          formData.append(key, val as string);
        }
      });

      // Handle user basic info natively handled by the user table usually
      if (values.first_name || values.last_name || values.phone_number) {
         try {
           await userAPI.updateProfile({
              first_name: values.first_name || userObj?.first_name,
              last_name: values.last_name || userObj?.last_name,
              phone_number: values.phone_number || userObj?.phone_number,
           });
         } catch(e) {
           console.log("Could not update root user info separately.");
         }
      }


      await userAPI.submitMechanicKYC(formData);
      queryClient.invalidateQueries({ queryKey: userProfileKeys.all });
      showToast.success("Section updated successfully");
      setIsModalVisible(false);
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update profile";
      showToast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImagePick = async (setFieldValue: any) => {
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
        setFieldValue("profile_picture", `data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch (error) {
      showToast.error("Failed to pick image");
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
      
      <ProfileEditModal 
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        editingSection={editingSection}
        mechanicProfile={mechanicProfile}
        userObj={userObj}
        handleSectionSave={handleSectionSave}
        handleImagePick={handleImagePick}
      />
      
      <View className="px-5 py-4 border-b border-gray-100 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3"
          >
            <ChevronLeftIcon size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-NunitoBold text-gray-900">Mechanic Details</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push(mechanicRoutes.EditProfile as any)}
          className="w-10 h-10 bg-primary-50 rounded-full items-center justify-center"
        >
          <PencilIcon size={20} color="#D30309" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: Platform.OS === 'android' ? 70 : 40 }} 
        showsVerticalScrollIndicator={false}
      >
        <AnimatedPageContainer animationType="fadeInUp" duration={600}>
          <View className="px-5 pt-6">
            <View className="items-center mb-8">
              <View className="w-28 h-28 rounded-2xl items-center justify-center border-4 border-white shadow-lg mb-3 overflow-hidden">
                {profileImage ? (
                  <Image source={{ uri: profileImage }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <LinearGradient colors={["#D30309", "#B91C1C"]} className="w-full h-full items-center justify-center">
                    <Text className="text-4xl font-NunitoExtraBold text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </Text>
                  </LinearGradient>
                )}
              </View>
              <Text className="text-xl font-NunitoBold text-gray-900">{displayName}</Text>
              <Text className="text-gray-500 font-NunitoMedium text-sm">{userObj?.email}</Text>
            </View>

            {/* Personal Information */}
            <View className="mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <SectionHeader 
                icon={UserIcon} 
                title="Professional Profile" 
                onEdit={() => {
                  setEditingSection("personal");
                  setIsModalVisible(true);
                }}
              />
              <ProfileRow label="First Name" value={userObj?.first_name} />
              <ProfileRow label="Last Name" value={userObj?.last_name} />
              <ProfileRow label="Phone Number" value={userObj?.phone_number} />
              <ProfileRow label="Bio" value={mechanicProfile?.bio} isBio={true} />
            </View>

            {/* Address Details */}
            <View className="mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <SectionHeader 
                icon={EnvelopeIcon} 
                title="Location Details" 
                color="#3B82F6" 
                bgColor="bg-blue-50" 
                onEdit={() => {
                  setEditingSection("address");
                  setIsModalVisible(true);
                }}
              />
              <ProfileRow label="Workshop Address" value={mechanicProfile?.location} />
              <View className="flex-row gap-x-4">
                 <View className="flex-1">
                   <Text className="text-gray-500 font-NunitoMedium text-xs uppercase tracking-wider mb-1 mt-4">State</Text>
                   <Text className="text-base font-NunitoMedium text-gray-900">{mechanicProfile?.state || "Not set"}</Text>
                 </View>
                 <View className="flex-1">
                   <Text className="text-gray-500 font-NunitoMedium text-xs uppercase tracking-wider mb-1 mt-4">LGA</Text>
                   <Text className="text-base font-NunitoMedium text-gray-900">{mechanicProfile?.lga || "Not set"}</Text>
                 </View>
              </View>
            </View>

            {/* Business Information */}
            <View className="mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <SectionHeader 
                icon={BriefcaseIcon} 
                title="Business Verification" 
                color="#F59E0B" 
                bgColor="bg-amber-50" 
                onEdit={() => {
                  setEditingSection("business");
                  setIsModalVisible(true);
                }}
              />
              <ProfileRow label="NIN Number" value={mechanicProfile?.nin_number} />
              <ProfileRow label="Government ID Type" value={mechanicProfile?.govt_id_type?.replace(/_/g, ' ')} />
            </View>

            {/* Documentation & Verification */}
            <View className="mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <SectionHeader 
                icon={ShieldCheckIcon} 
                title="Documentation & Verification" 
                color="#6366F1" 
                bgColor="bg-indigo-50" 
                onEdit={() => {
                  router.push(mechanicRoutes.EditProfile as any);
                }}
              />
              <View className="flex-row items-center justify-between py-3 border-b border-gray-50">
                <Text className="text-gray-500 font-NunitoMedium text-sm">NIN Document</Text>
                <Text className={mechanicProfile?.nin_document ? "text-green-600 font-NunitoBold" : "text-amber-600 font-NunitoBold"}>
                  {mechanicProfile?.nin_document ? "Uploaded" : "Pending"}
                </Text>
              </View>
              <View className="flex-row items-center justify-between py-3 border-b border-gray-50">
                <Text className="text-gray-500 font-NunitoMedium text-sm">Govt ID Front</Text>
                <Text className={mechanicProfile?.government_id_front ? "text-green-600 font-NunitoBold" : "text-amber-600 font-NunitoBold"}>
                  {mechanicProfile?.government_id_front ? "Uploaded" : "Pending"}
                </Text>
              </View>
              <View className="flex-row items-center justify-between py-3 border-b border-gray-50">
                <Text className="text-gray-500 font-NunitoMedium text-sm">Govt ID Back</Text>
                <Text className={mechanicProfile?.government_id_back ? "text-green-600 font-NunitoBold" : "text-amber-600 font-NunitoBold"}>
                  {mechanicProfile?.government_id_back ? "Uploaded" : "Pending"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push(mechanicRoutes.EditProfile as any)}
              className="mt-4 bg-primary-500 py-4 rounded-2xl items-center shadow-md active:opacity-90"
            >
              <Text className="text-white text-base font-NunitoBold">Full Profile Update</Text>
            </TouchableOpacity>
          </View>
        </AnimatedPageContainer>
      </ScrollView>
    </SafeAreaView>
  );
};


export default ProfileDetails;
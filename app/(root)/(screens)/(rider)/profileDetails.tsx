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
  TruckIcon, 
  CreditCardIcon,
  XMarkIcon,
  CameraIcon,
  ShieldCheckIcon,
} from "react-native-heroicons/outline";
import { useRiderProfile, useBanks, useVerifyBank } from "@/hooks/useUserProfile";
import { riderRoutes } from "@/constants/routes";
import { LinearGradient } from "expo-linear-gradient";
import AnimatedPageContainer from "@/components/AnimatedPageContainer";
import { Formik } from "formik";
import * as Yup from "yup";
import FormikInput from "@/components/forms/FormikInput";
import AddressInput from "@/components/forms/AddressInput";
import SelectField from "@/components/forms/SelectField";
import DateInput from "@/components/forms/DateInput";
import RadioGroup from "@/components/forms/RadioGroup";
import InputField from "@/components/InputField";
import { userAPI } from "@/lib/api/user";
import { useQueryClient } from "@tanstack/react-query";
import { showToast } from "@/utils/toastUtils";
import { getStatesByCountry, getCitiesByState } from "@/constants/locationData";
import * as ImagePicker from "expo-image-picker";

interface ProfileEditModalProps {
  isVisible: boolean;
  onClose: () => void;
  editingSection: string | null;
  riderProfile: any;
  userObj: any;
  banksData: any;
  isVerifyingBank: boolean;
  accountName: string;
  setAccountName: (name: string) => void;
  handleBankAccountLookup: any;
  handleSectionSave: any;
  handleImagePick: any;
}

const ProfileEditModal = ({
  isVisible,
  onClose,
  editingSection,
  riderProfile,
  userObj,
  banksData,
  isVerifyingBank,
  accountName,
  setAccountName,
  handleBankAccountLookup,
  handleSectionSave,
  handleImagePick,
}: ProfileEditModalProps) => {
  const getSectionSchema = (section: string | null) => {
    const personalSchema = Yup.object().shape({
      full_name: Yup.string().required("Full name is required"),
      phone_number: Yup.string().required("Phone number is required"),
      gender: Yup.string().required("Gender is required"),
      date_of_birth: Yup.string().required("Date of birth is required"),
    });

    const addressSchema = Yup.object().shape({
      state: Yup.string().required("State is required"),
      location: Yup.string().required("Location is required"),
      city: Yup.string().required("City is required"),
    });

    const rideSchema = Yup.object().shape({
      ride_type: Yup.string().required("Required"),
      license_plate: Yup.string().required("Required"),
    });

    const bankingSchema = Yup.object().shape({
      bank_name: Yup.string().required("Required"),
      account_number: Yup.string().required("Required"),
    });

    switch (section) {
      case "personal": return personalSchema;
      case "address": return addressSchema;
      case "ride": return rideSchema;
      case "banking": return bankingSchema;
      default: return Yup.object().shape({});
    }
  };

  const getSectionInitialValues = (section: string | null) => {
    if (!riderProfile) return {};
    switch (section) {
      case "personal":
        return {
          full_name: riderProfile.full_name || (userObj?.first_name && userObj?.last_name ? `${userObj.first_name} ${userObj.last_name}`.trim() : ""),
          phone_number: riderProfile.phone_number || userObj?.phone_number || "",
          gender: riderProfile.gender || "",
          date_of_birth: riderProfile.date_of_birth || "",
          profile_picture: riderProfile?.selfie || userObj?.profile_image || userObj?.image || "",
        };
      case "address":
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

        return {
          state: initialState,
          location: initialLocation,
          city: initialCity,
        };
      case "ride":
        return {
          ride_type: riderProfile.ride_type || "",
          license_plate: riderProfile.license_plate || "",
        };
      case "banking":
        return {
          bank_name: riderProfile.bank_name || "",
          account_number: riderProfile.account_number || "",
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
                                    {values.full_name ? values.full_name.charAt(0).toUpperCase() : "R"}
                                  </Text>
                                </LinearGradient>
                              )}
                            </View>
                            <View className="absolute bottom-1 right-[-4] bg-primary-500 w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow-md">
                              <CameraIcon size={16} color="white" />
                            </View>
                          </TouchableOpacity>
                        </View>
                        <FormikInput name="full_name" placeholder="John Doe" label="Full Name" required />
                        <FormikInput name="phone_number" placeholder="080 0000 0000" label="Phone Number" keyboardType="phone-pad" required />
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

                    {editingSection === "address" && (
                      <View>
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
                          onValueChange={(val: string) => {
                            setFieldValue("state", val);
                            setFieldValue("city", ""); // Reset city when state changes
                          }}
                          error={errors.state as string}
                          touched={touched.state as boolean}
                          required
                        />
                        <SelectField
                          label="City"
                          name="city"
                          placeholder="Select City"
                          options={values.state ? getCitiesByState('NG', values.state).map(c => ({ label: c, value: c })) : []}
                          value={values.city}
                          onValueChange={(val: string) => setFieldValue("city", val)}
                          error={errors.city as string}
                          touched={touched.city as boolean}
                          required
                        />
                      </View>
                    )}

                    {editingSection === "ride" && (
                      <View>
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
                          required
                        />

                        <FormikInput name="license_plate" placeholder="ABC 123 XY" label="License Plate" required />
                      </View>
                    )}

                    {editingSection === "banking" && (
                      <View>
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

const RiderProfileDetails = () => {
  const queryClient = useQueryClient();
  const { data: profileData, isLoading: isLoadingProfile } = useRiderProfile();
  const { data: banksData } = useBanks();
  const { mutate: verifyBank, isPending: isVerifyingBank } = useVerifyBank();
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [accountName, setAccountName] = useState<string>("");

  const riderProfile = profileData?.data?.rider_profile;
  const userObj = riderProfile?.user;
  const displayName = riderProfile?.full_name || (userObj?.first_name && userObj?.last_name ? `${userObj.first_name} ${userObj.last_name}`.trim() : "Rider");
  const profileImage = riderProfile?.selfie || userObj?.profile_image || userObj?.image || "";

  const ProfileRow = ({ label, value }: { label: string; value: string }) => (
    <View className="py-4 border-b border-gray-50 last:border-0">
      <Text className="text-gray-500 font-NunitoMedium text-xs uppercase tracking-wider mb-1">{label}</Text>
      <Text className="text-base font-NunitoBold text-gray-900">{value || "Not set"}</Text>
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

  const handleSectionSave = async (values: any, { setSubmitting }: any) => {
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('requestType', 'inbound');
      
      const fullValues = {
        full_name: riderProfile?.full_name || "",
        email: userObj?.email || "",
        phone_number: riderProfile?.phone_number || "",
        gender: riderProfile?.gender || "",
        date_of_birth: riderProfile?.date_of_birth || "",
        state: riderProfile?.state || "",
        location: riderProfile?.location || "",
        city: riderProfile?.city || "",
        ride_type: riderProfile?.ride_type || "",
        license_plate: riderProfile?.license_plate || "",
        bank_name: riderProfile?.bank_name || "",
        account_number: riderProfile?.account_number || "",
        ...values
      };

      Object.entries(fullValues).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          formData.append(key, val as string);
        }
      });

      if (values.profile_picture && values.profile_picture.startsWith('data:')) {
        formData.append('profile_picture', {
            uri: values.profile_picture,
            name: `profile_${Date.now()}.jpg`,
            type: 'image/jpeg'
        } as any);
      }

      await userAPI.submitRiderKYC(formData);
      queryClient.invalidateQueries({ queryKey: ['rider', 'profile'] });
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
      
      {/* Header */}
      <View className="px-5 py-4 border-b border-gray-100 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-3"
          >
            <ChevronLeftIcon size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-NunitoBold text-gray-900">Profile Details</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push(riderRoutes.EditProfile as any)}
          className="w-10 h-10 bg-primary-50 rounded-full items-center justify-center"
        >
          <PencilIcon size={20} color="#D30309" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} 
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

            <View className="mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <SectionHeader 
                icon={UserIcon} 
                title="Personal Information" 
                onEdit={() => {
                  setEditingSection("personal");
                  setIsModalVisible(true);
                }}
              />
              <ProfileRow label="Full Name" value={displayName} />
              <ProfileRow label="Phone Number" value={riderProfile?.phone_number || userObj?.phone_number} />
              <View className="flex-row">
                <View className="flex-1"><ProfileRow label="Date of Birth" value={riderProfile?.date_of_birth} /></View>
                <View className="flex-1"><ProfileRow label="Gender" value={riderProfile?.gender} /></View>
              </View>
            </View>

            <View className="mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <SectionHeader 
                icon={EnvelopeIcon} 
                title="Address Details" 
                color="#3B82F6" 
                bgColor="bg-blue-50" 
                onEdit={() => {
                  setEditingSection("address");
                  setIsModalVisible(true);
                }}
              />
              <ProfileRow label="Home Address" value={riderProfile?.location} />
              <View className="flex-row">
                <View className="flex-1"><ProfileRow label="State" value={riderProfile?.state} /></View>
                <View className="flex-1"><ProfileRow label="City" value={riderProfile?.city} /></View>
              </View>
            </View>

            <View className="mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <SectionHeader 
                icon={TruckIcon} 
                title="Ride Details" 
                color="#10B981" 
                bgColor="bg-green-50" 
                onEdit={() => {
                  setEditingSection("ride");
                  setIsModalVisible(true);
                }}
              />
              <ProfileRow label="Ride Type" value={riderProfile?.ride_type} />
              <ProfileRow label="License Plate" value={riderProfile?.license_plate} />
            </View>

            <View className="mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <SectionHeader 
                icon={CreditCardIcon} 
                title="Banking Information" 
                color="#F59E0B" 
                bgColor="bg-amber-50" 
                onEdit={() => {
                  setEditingSection("banking");
                  setIsModalVisible(true);
                }}
              />
              <ProfileRow label="Bank Name" value={riderProfile?.bank_name} />
              <ProfileRow label="Account Number" value={riderProfile?.account_number} />
            </View>

            {/* KYC Status */}
            <View className="mb-6 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <SectionHeader 
                icon={ShieldCheckIcon} 
                title="Verification Status" 
                color="#6366F1" 
                bgColor="bg-indigo-50" 
              />
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-NunitoBold text-gray-900">KYC Status</Text>
                <View className={`px-3 py-1 rounded-lg ${
                  riderProfile?.is_approved 
                    ? 'bg-green-100' 
                    : 'bg-orange-100'
                }`}>
                  <Text className={`text-sm font-NunitoBold ${
                    riderProfile?.is_approved 
                      ? 'text-green-700' 
                      : 'text-orange-700'
                  }`}>
                    {riderProfile?.is_approved ? 'Verified' : 'Pending'}
                  </Text>
                </View>
              </View>
              {riderProfile?.disapproved && (
                <View className="mt-3">
                  <Text className="text-sm font-NunitoMedium text-red-600">
                    Disapproval Reason: {riderProfile.disapproval_reason || 'Not specified'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </AnimatedPageContainer>
      </ScrollView>

      <ProfileEditModal 
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        editingSection={editingSection}
        riderProfile={riderProfile}
        userObj={userObj}
        banksData={banksData}
        isVerifyingBank={isVerifyingBank}
        accountName={accountName}
        setAccountName={setAccountName}
        handleBankAccountLookup={handleBankAccountLookup}
        handleSectionSave={handleSectionSave}
        handleImagePick={handleImagePick}
      />
    </SafeAreaView>
  );
};

export default RiderProfileDetails;

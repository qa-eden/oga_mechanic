import ProfileTabs from "@/components/templates/ProfileTabs";
import ProfileHeader from "@/components/ProfileHeader";
import {
  userInfo,
  icons,
  ProfileSettings,
  ProfileSopprt,
} from "@/constants";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  // Modal,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LAYOUT } from "@/constants/units";
import { router } from "expo-router";
import { routes } from "@/constants/routes";
import { UserIcon } from "react-native-heroicons/solid";
import SwitchUserModal from "@/components/modals/SwitchUserModal";
// import { useUserStore } from "@/stores/userStore";
import LogoutModal from "@/components/modals/LogoutModal";
import { usePrimaryUserProfile } from "@/hooks/useUserProfile";
import CustomAlert from "@/components/CustomAlert";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLogout } from "@/hooks/useLogout";
import { PrimaryUserProfileResponse } from "@/lib/api/user";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import LoadingSpinner from "@/components/LoadingSpinner";

const Profile = () => {
  const [isEnabledFaceId, setIsEnabledFaceId] = useState(false);
  const [isEnabledEnablePass, setIsEnabledEnablePass] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSwitchUserModal, setShowSwitchUserModal] = useState(false);

  const { SCROLL_PADDING_BOTTOM } = LAYOUT;

  // Fetch user profile data
  const {
    data: profileData,
    isLoading,
    error,
    refetch
  } = usePrimaryUserProfile();

  const { visible, alertConfig, hideAlert, showInfo } = useCustomAlert();
  const logoutMutation = useLogout();

  // Pull to refresh functionality
  const { refreshControl } = usePullToRefresh({
    onRefresh: async () => {
      await refetch();
    }
  });


  const toggleSwitch = (
    setState: React.Dispatch<React.SetStateAction<boolean>>,
    value: boolean
  ) => {
    setState(value);
  };


  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);

    try {
      // Get refresh token from AsyncStorage
      const refreshToken = await AsyncStorage.getItem('refresh_token');

      if (refreshToken) {
        // Call logout API with refresh token
        logoutMutation.mutate({ refresh: refreshToken });
      } else {
        // If no refresh token, just clear local storage and navigate
        await AsyncStorage.multiRemove([
          'auth_token',
          'refresh_token',
          'user_data',
          'is_logged_in'
        ]);
        router?.push(routes?.signIn);
      }
    } catch (error) {
      // Fallback: clear storage and navigate
      await AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'user_data',
        'is_logged_in'
      ]);
      router?.push(routes?.signIn);
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };


  const handleSwitchUser = (userType: string) => {
    // Handle user switching logic here
    // You can add navigation logic or state management here
  };

  const ProfilePref = {
    name: "PREFERENCES",
    options: [
      {
        id: 1,
        name: "Enable Fingerprint/Face ID",
        image: icons.faceId,
        route: "editProfile",
        set: setIsEnabledFaceId,
        state: isEnabledFaceId,
      },
      {
        id: 2,
        name: "Enable password login",
        image: icons.enablePass,
        route: "notifications",
        set: setIsEnabledEnablePass,
        state: isEnabledEnablePass,
      },
    ],
  };
  // Show loading state
  if (isLoading) {
    return (
      <LoadingSpinner
        message="Loading Profile..."
        size="medium"
        logoSize={40}
      />
    );
  }

  // Get user data from API or fallback to static data
  const userData = (profileData as PrimaryUserProfileResponse)?.data;
  const displayName = userData?.first_name && userData?.last_name
    ? `${userData.first_name} ${userData.last_name}`
    : userInfo.name;

  const displayEmail = userData?.email || '';
  const displayPhone = userData?.phone_number || userInfo.phone;
  const isVerified = userData?.is_verified || false;
  const activeRole = (profileData as PrimaryUserProfileResponse)?.active_role || 'primary_user';

  return (
    <SafeAreaView className="bg-white flex-1" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView
        className="flex-1 px-5 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: SCROLL_PADDING_BOTTOM,
        }}
        refreshControl={<RefreshControl {...refreshControl} />}
      >
        <View className="flex-col justify-center items-center">
          <ProfileHeader title="Profile" />

          <View className="w-[70px] h-[70px] bg-[#EBEBEB] flex justify-center items-center rounded-full">
            <UserIcon size={32} color="#666" />
          </View>

          <View className="flex-row items-center gap-2 pt-3">
            <Text className="font-NunitoBold text-primary-800 text-[1.5rem]">
              {displayName || 'User'}
            </Text>
            {isVerified && (
              <View className="bg-green-100 px-2 py-1 rounded-full">
                <Text className="text-green-800 text-xs font-NunitoMedium">
                  ✓ Verified
                </Text>
              </View>
            )}
          </View>

          {/* Email display */}
          {displayEmail && (
            <Text className="font-NunitoMedium text-gray-600 text-sm pt-1">
              {displayEmail}
            </Text>
          )}

          {/* Role display */}
          <View className="bg-blue-50 px-3 py-1 rounded-full mt-2">
            <Text className="text-blue-800 text-xs font-NunitoMedium capitalize">
              {activeRole.replace('_', ' ')} Account
            </Text>
          </View>

          {/* Member since */}
          {userData?.date_joined && (
            <Text className="text-gray-500 text-xs mt-2 font-NunitoMedium">
              Member since {new Date(userData.date_joined).toLocaleDateString()}
            </Text>
          )}

          <View className="flex-row items-center justify-center gap-2 pt-2">
            <icons.redPhone width={20} height={20} />
            <Text className="text-[14px] font-NunitoBold text-gray-600">
              {displayPhone}
            </Text>
          </View>
        </View>

        {/* Car Information Section */}
        {userData && (userData.car_make || userData.car_model || userData.car_year || userData.license_plate) && (
          <View className="shadow-md shadow-gray-300 bg-white mt-6 rounded-[1rem] px-4 py-4 mb-4">
            <Text className="uppercase text-[#999999] pb-3 font-NunitoBold">
              Vehicle Information
            </Text>

            {userData.car_make && userData.car_model && (
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-gray-700 font-NunitoMedium">Vehicle</Text>
                <Text className="text-gray-900 font-NunitoBold">
                  {userData.car_make} {userData.car_model}
                </Text>
              </View>
            )}

            {userData.car_year && (
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-gray-700 font-NunitoMedium">Year</Text>
                <Text className="text-gray-900 font-NunitoBold">{userData.car_year}</Text>
              </View>
            )}

            {userData.license_plate && (
              <View className="flex-row items-center justify-between py-2">
                <Text className="text-gray-700 font-NunitoMedium">License Plate</Text>
                <Text className="text-gray-900 font-NunitoBold">{userData.license_plate}</Text>
              </View>
            )}
          </View>
        )}

        <View className="shadow-md shadow-gray-300 bg-white mt-9 rounded-[1rem] px-4 py-2 mb-6">
          <View className="pt-4">
            <Text className="uppercase text-[#999999] pb-2">
              {ProfileSettings?.name}
            </Text>
            {ProfileSettings.options.map((item) => (
              <ProfileTabs
                key={String(item.id)}
                text={item.name}
                iconLeft={(props) => item?.image && item.image(props)}
                onPress={() => {
                  if (item.name === "Switch User") {
                    setShowSwitchUserModal(true);
                  }
                  // Add other navigation logic here for other items
                }}
              />
            ))}
          </View>

          <View className="pt-4 pb-2">
            <Text className="uppercase text-[#999999] pb-2">
              {ProfilePref?.name}
            </Text>
            {ProfilePref.options.map((item) => (
              <ProfileTabs
                key={String(item.id)}
                activeOpacity={0.8}
                text={item.name}
                iconLeft={(props) => item?.image && item.image(props)}
                iconRight={
                  <Switch
                    trackColor={{ false: "#ccc", true: "#50BE4E" }}
                    thumbColor={item.state ? "white" : "#f4f3f4"}
                    // ios_backgroundColor="#3e3e3e"
                    onValueChange={(value) => toggleSwitch(item.set, value)}
                    value={item.state}
                  />
                }
              />
            ))}
          </View>

          <View className="pt-4 pb-2">
            <Text className="uppercase text-[#999999] pb-2">
              {ProfileSopprt?.name}
            </Text>
            {ProfileSopprt.options.map((item) => (
              <ProfileTabs
                key={String(item.id)}
                text={item.name}
                iconLeft={(props) => item?.image && item.image(props)}
              />
            ))}
          </View>
        </View>

        <View className="py-3">
          <TouchableOpacity
            onPress={handleLogout}
            disabled={logoutMutation.isPending}
            className={`flex-row items-center justify-center gap-2 border border-primary-300 rounded-full py-5 ${logoutMutation.isPending ? 'opacity-50' : ''
              }`}
          >
            {logoutMutation.isPending ? (
              <ActivityIndicator size="small" color="#D30309" />
            ) : null}
            <Text className="text-primary-500 text-[1.3rem] font-NunitoBold">
              {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <LogoutModal
        visible={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />

      {/* Switch User Modal */}
      <SwitchUserModal
        isVisible={showSwitchUserModal}
        onClose={() => setShowSwitchUserModal(false)}
        onSwitchUser={handleSwitchUser}
      />

      {/* Custom Alert */}
      {alertConfig && (
        <CustomAlert
          visible={visible}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={hideAlert}
          type={alertConfig.type}
          autoDismiss={alertConfig.autoDismiss}
          autoDismissDelay={alertConfig.autoDismissDelay}
        />
      )}
    </SafeAreaView>
  );
};

export default Profile;

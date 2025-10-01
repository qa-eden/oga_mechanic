import ProfileTabs from "@/components/templates/ProfileTabs";
import ProfileHeader from "@/components/ProfileHeader";
import {
  images,
  userInfo,
  icons,
  ProfileSettings,
  ProfileSopprt,
  MechanicProfileSettings,
} from "@/constants";
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import { LAYOUT } from "@/constants/units";
import { router } from "expo-router";
import { routes, mechanicRoutes } from "@/constants/routes";
import { MapPinIcon } from "react-native-heroicons/solid";
import SwitchUserModal from "@/components/modals/SwitchUserModal";
import LogoutModal from "@/components/modals/LogoutModal";
import { useCentralizedLogout } from "@/hooks/useCentralizedLogout";

const DiverProfile = () => {
  const [isEnabledFaceId, setIsEnabledFaceId] = useState(false);
  const [isEnabledEnablePass, setIsEnabledEnablePass] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSwitchUserModal, setShowSwitchUserModal] = useState(false);
  
  // Use centralized logout hook
  const { logout, isLoggingOut } = useCentralizedLogout();

  // const { SCROLL_PADDING_BOTTOM } = LAYOUT;

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
    await logout();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleSwitchUser = (userType: string) => {
    // Handle user switching logic here
    console.log("Switching to user type:", userType);
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
  return (
    <SafeAreaView className="bg-white flex-1" edges={["top"]}>
      <ScrollView
        className="flex-1 px-5 pt-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          // paddingBottom: SCROLL_PADDING_BOTTOM,
        }}
      >
        <View className="flex-col justify-center items-center">
          <ProfileHeader title="Profile" />

          <View className="w-[70px] h-[70px] bg-[#EBEBEB] flex justify-center items-center rounded-full">
            <Image
              source={images.dummyProfile}
              className="w-[60px] h-[60px] rounded-full"
              resizeMode="cover"
              alt="Profile"
            />
          </View>

          <Text className="font-NunitoBold text-primary-800 text-[1.5rem] pt-3">
            {userInfo.name}
          </Text>
          <View className="flex-row items-center gap-2 pt-2">
            <View className="flex-row items-center justify-center gap-2 pr-3 py-1">
              <MapPinIcon size={16} color={"#D30309"} />
              <Text className="text-[14px] font-NunitoBold text-gray-600">
                {userInfo.location}
              </Text>
            </View>
            <View className="flex-row items-center justify-center gap-2 pl-3 py-1 border-l-2 border-gray-200">
              <icons.redPhone width={20} height={20} />
              <Text className="text-[14px] font-NunitoBold text-gray-600">
                {userInfo.phone}
              </Text>
            </View>
          </View>
        </View>

        <View className="shadow-md shadow-gray-300 bg-white mt-9 rounded-[1rem] px-4 py-2 mb-6">
          <View className="pt-4">
            <Text className="uppercase text-[#999999] pb-2">
              {ProfileSettings?.name}
            </Text>
            {MechanicProfileSettings.options.map((item) => (
              <ProfileTabs
                key={String(item.id)}
                text={item.name}
                iconLeft={(props) => item?.image && item.image(props)}
                onPress={() => {
                  if (item.name === "My Profile") {
                    router.push(mechanicRoutes.EditProfile);
                  } else if (item.name === "Switch User") {
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
            disabled={isLoggingOut}
            className={`flex-row items-center justify-center gap-2 border border-primary-300 rounded-full py-5 ${
              isLoggingOut ? 'opacity-50' : ''
            }`}
          >
            {isLoggingOut && (
              <ActivityIndicator size="small" color="#D30309" />
            )}
            <Text className="text-primary-500 text-[1.3rem] font-NunitoBold">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
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
    </SafeAreaView>
  );
};

export default DiverProfile
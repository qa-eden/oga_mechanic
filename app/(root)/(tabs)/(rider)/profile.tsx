import ProfileTabs from "@/components/templates/ProfileTabs";
import ProfileHeader from "@/components/ProfileHeader";
import {
  images,
  userInfo,
  icons,
  ProfileSettings,
  ProfileSopprt,
} from "@/constants";
import SwitchUserModal from "@/components/modals/SwitchUserModal";
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Switch,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LAYOUT } from "@/constants/units";
import { router } from "expo-router";
import { routes, riderRoutes } from "@/constants/routes";
import { MapPinIcon } from "react-native-heroicons/solid";
import LogoutModal from "@/components/modals/LogoutModal";

const RiderProfile = () => {
  const [isEnabledFaceId, setIsEnabledFaceId] = useState(false);
  const [isEnabledEnablePass, setIsEnabledEnablePass] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSwitchUserModal, setShowSwitchUserModal] = useState(false);

  const { SCROLL_PADDING_BOTTOM } = LAYOUT;

  const toggleSwitch = (
    setState: React.Dispatch<React.SetStateAction<boolean>>,
    value: boolean
  ) => {
    setState(value);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    router?.push(routes?.signIn);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleSwitchUser = (userType: string) => {
    // Handle user switching logic here
    console.log("Switching to user type:", userType);
    // You can add navigation logic or state management here
  };

  // Rider Profile Settings
  const RiderProfileSettings = {
    name: "Profile settings",
    options: [
      {
        id: 1,
        name: "My Profile",
        image: icons.UserCircle,
        route: "editProfile",
      },
      {
        id: 2,
        name: "Vehicle Information",
        image: icons.car,
        route: "vehicleInfo",
      },
      {
        id: 3,
        name: "Add Bank Details",
        image: icons.bankIcon,
        route: "bankDetails",
      },
      {
        id: 4,
        name: "Change Password",
        image: icons.tick1,
        route: "changePassword",
      },
      {
        id: 5,
        name: "Switch Account",
        image: icons.user,
        route: "switchAccount",
      },
    ],
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
          paddingBottom: SCROLL_PADDING_BOTTOM,
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
              {RiderProfileSettings?.name}
            </Text>
            {RiderProfileSettings.options.map((item) => (
              <ProfileTabs
                key={String(item.id)}
                text={item.name}
                iconLeft={(props) => item?.image && item.image(props)}
                onPress={() => {
                  if (item.name === "My Profile") {
                    // router.push(riderRoutes.EditProfile);
                    console.log("Edit Profile");
                  } else if (item.name === "Vehicle Information") {
                    console.log("Vehicle Information");
                  } else if (item.name === "Add Bank Details") {
                    console.log("Add Bank Details");
                  } else if (item.name === "Change Password") {
                    console.log("Change Password");
                  } else if (item.name === "Switch Account") {
                    setShowSwitchUserModal(true);
                  }
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
            className="flex-row items-center justify-center gap-2 border border-primary-300 rounded-full py-5"
          >
            <Text className="text-primary-500 text-[1.3rem] font-NunitoBold">
              Logout
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

export default RiderProfile;
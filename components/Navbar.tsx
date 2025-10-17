import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import React from "react";
import {
  SunIcon,
  MoonIcon,
  CloudIcon,
  BellIcon,
  UserIcon,
} from "react-native-heroicons/outline";
import { usePrimaryUserProfile } from "@/hooks/useUserProfile";

const getTimeOfDay = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return {
      label: "Morning",
      icon: <SunIcon size={24} color="#FF6B35" />,
    };
  } else if (hour >= 12 && hour < 18) {
    return {
      label: "Afternoon",
      icon: <CloudIcon size={24} color="#4ECDC4" />,
    };
  } else {
    return {
      label: "Evening",
      icon: <MoonIcon size={24} color="#545677" />,
    };
  }
};

const Navbar = () => {
  const { label, icon } = getTimeOfDay();
  
  // Use primary profile for all roles (no more role-specific endpoints)
  const { data: profileData, isLoading } = usePrimaryUserProfile();
  
  // Get user data from API or fallback to static data
  const userData = profileData?.data;
  const displayName = userData?.first_name || 'User';
  const isVerified = userData?.is_verified || false;

  return (
    <View className="flex-row justify-between items-center pt-3">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View className="flex flex-row items-center gap-2">
        <View className="w-[45px] h-[45px] bg-[#EBEBEB] flex justify-center items-center rounded-full">
          <UserIcon size={24} color="#666" />

          {/* <Image
            source={images.dummyProfile}
            className="w-[40px] h-[40px] rounded-full"
            resizeMode="cover"
            alt="Profile"
          /> */}
        </View>

        <View>
          <View className="flex flex-row items-center gap-1">
            <Text className="font-NunitoBold text-[1.2rem]">Hi, {displayName || 'User'}</Text>
            {icon}
            {/* {isVerified && (
              <View className="bg-green-100 px-1 py-0.5 rounded-full ml-1">
                <Text className="text-green-800 text-xs font-NunitoMedium">
                  ✓
                </Text>
              </View>
            )} */}
          </View>
          <Text className="text-[12px] text-text-100 pt-[.1rem]">
            Everything your car needs is here.
          </Text>
        </View>
      </View>

      <TouchableOpacity className="w-[45px] h-[45px] bg-primary-100 flex justify-center items-center rounded-full">
        <BellIcon size={24} color="#D30309" />
      </TouchableOpacity>
    </View>
  );
};

export default Navbar;

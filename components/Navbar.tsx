import { View, Text, TouchableOpacity, StatusBar, Image } from "react-native";
import React, { useState, useEffect } from "react";
import {
  SunIcon,
  MoonIcon,
  CloudIcon,
  BellIcon,
  UserIcon,
} from "react-native-heroicons/outline";
import { usePrimaryUserProfile, useMechanicProfile, useUserRoles, userProfileKeys } from "@/hooks/useUserProfile";
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const queryClient = useQueryClient();
  
  // Get user roles to check active role - refetch on mount to get latest role
  const { data: rolesData, refetch: refetchRoles } = useUserRoles();
  
  // Check active role from roles data or AsyncStorage
  useEffect(() => {
    const checkActiveRole = async () => {
      // First try to get from roles API response
      if (rolesData?.data?.active_role?.name) {
        const newRole = rolesData.data.active_role.name;
        
        // Only update if role has changed
        setActiveRole((prevRole) => {
          if (prevRole !== newRole) {
            // Invalidate profile queries when role changes
            queryClient.invalidateQueries({ queryKey: ['mechanic', 'profile'] });
            queryClient.invalidateQueries({ queryKey: userProfileKeys.primary() });
            
            // Update AsyncStorage with the latest role
            AsyncStorage.setItem('current_active_role', newRole).catch((error) => {
              console.error('Error storing active role:', error);
            });
            
            return newRole;
          }
          return prevRole;
        });
        return;
      }
      
      // Fallback to AsyncStorage
      try {
        const storedRole = await AsyncStorage.getItem('current_active_role');
        if (storedRole) {
          setActiveRole((prevRole) => {
            if (prevRole !== storedRole) {
              return storedRole;
            }
            return prevRole;
          });
        }
      } catch (error) {
        console.error('Error reading active role from storage:', error);
      }
    };
    
    checkActiveRole();
  }, [rolesData, queryClient]);
  
  // Refetch roles when component mounts to ensure we have the latest role
  useEffect(() => {
    refetchRoles();
  }, [refetchRoles]);
  
  // Check if user is logged in as mechanic
  const isMechanic = activeRole === 'mechanic';
  
  // For mechanic, use mechanic profile directly (without calling primary first)
  // For other roles, use primary profile
  // Only enable the appropriate hook based on active role to avoid unnecessary API calls
  const { data: mechanicProfileData, isLoading: mechanicLoading } = useMechanicProfile(isMechanic);
  
  // Conditionally fetch primary profile only when NOT mechanic
  const { data: primaryProfileData, isLoading: primaryLoading } = usePrimaryUserProfile(!isMechanic);
  
  // Determine which profile data to use
  // When logged in as mechanic, only use mechanic profile (don't use primary)
  const profileData = isMechanic ? mechanicProfileData?.data : primaryProfileData?.data;
  const isLoading = isMechanic ? mechanicLoading : primaryLoading;
  
  // Get user data from appropriate profile
  const userData = profileData;
  const displayName = isMechanic 
    ? (userData?.user?.first_name || userData?.first_name || 'User')
    : (userData?.first_name || 'User');
  const isVerified = userData?.is_verified || false;
  
  // Get profile picture - for mechanic, use selfie; for others, use profile_image
  const profilePicture = isMechanic 
    ? userData?.selfie 
    : userData?.profile_image || userData?.profile_picture;

  return (
    <View className="flex-row justify-between items-center pt-3">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View className="flex flex-row items-center gap-2">
        <View className="w-[45px] h-[45px] bg-[#EBEBEB] flex justify-center items-center rounded-full overflow-hidden">
          {profilePicture ? (
            <Image
              source={{ uri: profilePicture }}
              className="w-[45px] h-[45px] rounded-full"
              resizeMode="cover"
              alt="Profile"
            />
          ) : (
            <UserIcon size={24} color="#666" />
          )}
        </View>

        <View>
          <View className="flex flex-row items-center gap-1">
            <Text className="font-NunitoBold text-[1.2rem]">Good {label}, {displayName || 'User'}</Text>
            {/* {icon} */}
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

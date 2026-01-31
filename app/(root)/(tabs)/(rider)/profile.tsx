import {
  userInfo,
  icons,
  ProfileSopprt,
  RiderProfileSettings,
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
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LAYOUT } from "@/constants/units";
import { router } from "expo-router";
import { riderRoutes } from "@/constants/routes";
import { ChevronRightIcon, ArrowRightOnRectangleIcon } from "react-native-heroicons/solid";
import SwitchUserModal from "@/components/modals/SwitchUserModal";
import LogoutModal from "@/components/modals/LogoutModal";
import { useCentralizedLogout } from "@/hooks/useCentralizedLogout";
import { usePrimaryUserProfile } from "@/hooks/useUserProfile";
import { PrimaryUserProfileResponse } from "@/lib/api/user";
import LoadingSpinner from "@/components/LoadingSpinner";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

const RiderProfile = () => {
  const [isEnabledFaceId, setIsEnabledFaceId] = useState(false);
  const [isEnabledEnablePass, setIsEnabledEnablePass] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSwitchUserModal, setShowSwitchUserModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { SCROLL_PADDING_BOTTOM } = LAYOUT;

  // Use centralized logout hook
  const { logout, isLoggingOut } = useCentralizedLogout();

  // Fetch profile data
  const { data: profileData, isLoading: isProfileLoading, refetch: refetchProfile } = usePrimaryUserProfile();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchProfile();
    setRefreshing(false);
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

  const handleSwitchUser = (_userType: string) => {
    // Handle user switching logic here
  };

  const MenuItem = ({ 
    title, 
    icon: Icon, 
    onPress, 
    showChevron = true,
    rightElement,
    isDestructive = false
  }: { 
    title: string; 
    icon?: any; 
    onPress?: () => void;
    showChevron?: boolean;
    rightElement?: React.ReactNode;
    isDestructive?: boolean;
  }) => (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center justify-between py-4 border-b border-gray-50 last:border-0"
    >
      <View className="flex-row items-center gap-3">
        {Icon && (
          <View className={`w-10 h-10 rounded-full items-center justify-center ${isDestructive ? 'bg-red-50' : 'bg-gray-50'}`}>
            {typeof Icon === 'function' ? Icon({ size: 20, color: isDestructive ? '#EF4444' : '#4B5563' }) : <Icon size={20} color={isDestructive ? '#EF4444' : '#4B5563'} />}
          </View>
        )}
        <Text className={`text-base font-NunitoBold ${isDestructive ? 'text-red-500' : 'text-gray-900'}`}>
          {title}
        </Text>
      </View>
      
      {rightElement ? (
        rightElement
      ) : showChevron ? (
        <ChevronRightIcon size={20} color="#9CA3AF" />
      ) : null}
    </TouchableOpacity>
  );

  // Show loading state
  if (isProfileLoading) {
    return (
      <LoadingSpinner
        message="Loading Profile..."
        size="medium"
      />
    );
  }

  // Get user data from API or fallback to static data
  const userData = (profileData as PrimaryUserProfileResponse)?.data;
  const displayName = userData?.first_name && userData?.last_name
    ? `${userData.first_name} ${userData.last_name}`
    : userInfo.name;

  const displayEmail = userData?.email || '';
  const isVerified = userData?.is_verified || false;
  const activeRole = (profileData as PrimaryUserProfileResponse)?.active_role || 'rider';
  const profileImage = (userData as any)?.profile_picture || (userData as any)?.image || null;
  
  // Stats data (placeholder - replace with actual rider stats when available)
  const completedRides = 0;
  const pendingRides = 0;
  const totalEarnings = 0;

  return (
    <SafeAreaView className="bg-gray-50 flex-1" edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: SCROLL_PADDING_BOTTOM,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#D30309']}
            tintColor="#D30309"
          />
        }
      >
        <View className="px-5 pt-4">
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <View className="mb-6">
              <Text className="text-2xl font-NunitoExtraBold text-gray-900">
                Rider Account
              </Text>
            </View>

            {/* Profile Card */}
            <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <View className="flex-row items-center">
                {/* Avatar */}
                <View className="relative mr-4">
                  {profileImage ? (
                    <Image
                      source={{ uri: profileImage }}
                      className="w-16 h-16 rounded-2xl"
                      resizeMode="cover"
                    />
                  ) : (
                    <LinearGradient
                      colors={['#D30309', '#B91C1C']}
                      className="w-16 h-16 rounded-2xl items-center justify-center"
                    >
                      <Text className="text-2xl font-NunitoExtraBold text-white">
                        {displayName ? displayName.charAt(0).toUpperCase() : 'R'}
                      </Text>
                    </LinearGradient>
                  )}
                  {isVerified && (
                    <View className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full items-center justify-center border-2 border-white">
                      <Text className="text-white text-[10px]">✓</Text>
                    </View>
                  )}
                </View>

                {/* User Info */}
                <View className="flex-1">
                  <Text className="text-lg font-NunitoBold text-gray-900 mb-0.5">
                    {displayName || 'Rider'}
                  </Text>
                  {displayEmail && (
                    <Text className="text-gray-500 text-sm font-NunitoMedium">
                      {displayEmail}
                    </Text>
                  )}
                </View>

                {/* Role Badge */}
                <View className="bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100">
                  <Text className="text-primary-600 text-xs font-NunitoBold capitalize">
                    {activeRole.replace('_', ' ')}
                  </Text>
                </View>
              </View>

              {/* Stats Row */}
              <View className="flex-row mt-4 pt-4 border-t border-gray-200">
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: riderRoutes.home as any, params: { tab: 'order' } })}
                  className="flex-1 items-center justify-center py-2 bg-gray-50 rounded-xl mx-2"
                >
                  <Text className="text-gray-900 text-lg font-NunitoBold mb-0.5">
                    {completedRides}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-gray-500 text-xs font-NunitoBold mr-1">Completed</Text>
                    <ChevronRightIcon size={12} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => router.push({ pathname: riderRoutes.home as any, params: { tab: 'order' } })}
                  className="flex-1 items-center justify-center py-2 bg-gray-50 rounded-xl mx-2"
                >
                  <Text className="text-gray-900 text-lg font-NunitoBold mb-0.5">
                    {pendingRides}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-gray-500 text-xs font-NunitoBold mr-1">Pending</Text>
                    <ChevronRightIcon size={12} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => router.push(riderRoutes.earnings as any)}
                  className="flex-1 items-center justify-center py-2 bg-gray-50 rounded-xl mx-2"
                >
                  <Text className="text-gray-900 text-lg font-NunitoBold mb-0.5">
                    ₦{totalEarnings >= 1000 ? `${(totalEarnings / 1000).toFixed(1)}k` : totalEarnings}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="text-gray-500 text-xs font-NunitoBold mr-1">Earnings</Text>
                    <ChevronRightIcon size={12} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Account Settings Section */}
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View className="bg-white rounded-2xl mt-6 px-4 border border-gray-100 shadow-sm">
              <View className="py-2">
                <Text className="text-xs font-NunitoBold text-gray-400 uppercase tracking-wider pt-3 pb-1">
                  Account Settings
                </Text>
                {RiderProfileSettings.options.map((item) => (
                  <MenuItem
                    key={String(item.id)}
                    title={item.name}
                    icon={item.image}
                    onPress={() => {
                      if (item.name === "Switch Role") {
                        setShowSwitchUserModal(true);
                      } else if (item.route) {
                        router.push(item.route as any);
                      }
                    }}
                  />
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Preferences Section */}
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <View className="bg-white rounded-2xl mt-4 px-4 border border-gray-100 shadow-sm">
              <View className="py-2">
                <Text className="text-xs font-NunitoBold text-gray-400 uppercase tracking-wider pt-3 pb-1">
                  Preferences
                </Text>
                <MenuItem
                  title="Enable Fingerprint/Face ID"
                  icon={icons.faceId}
                  showChevron={false}
                  rightElement={
                    <Switch
                      trackColor={{ false: "#E5E7EB", true: "#22C55E" }}
                      thumbColor="white"
                      onValueChange={setIsEnabledFaceId}
                      value={isEnabledFaceId}
                    />
                  }
                />
                <MenuItem
                  title="Enable password login"
                  icon={icons.enablePass}
                  showChevron={false}
                  rightElement={
                    <Switch
                      trackColor={{ false: "#E5E7EB", true: "#22C55E" }}
                      thumbColor="white"
                      onValueChange={setIsEnabledEnablePass}
                      value={isEnabledEnablePass}
                    />
                  }
                />
              </View>
            </View>
          </Animated.View>

          {/* Support Section */}
          <Animated.View entering={FadeInDown.delay(400).duration(500)}>
            <View className="bg-white rounded-2xl mt-4 px-4 border border-gray-100 shadow-sm">
              <View className="py-2">
                <Text className="text-xs font-NunitoBold text-gray-400 uppercase tracking-wider pt-3 pb-1">
                  Support
                </Text>
                {ProfileSopprt.options.map((item) => (
                  <MenuItem
                    key={String(item.id)}
                    title={item.name}
                    icon={item.image}
                  />
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Logout Button */}
          <Animated.View entering={FadeInDown.delay(500).duration(500)}>
            <TouchableOpacity
              onPress={handleLogout}
              disabled={isLoggingOut}
              className={`flex-row items-center justify-center gap-3 bg-red-50 border border-red-100 rounded-2xl py-4 mt-6 ${
                isLoggingOut ? 'opacity-50' : ''
              }`}
            >
              {isLoggingOut ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <ArrowRightOnRectangleIcon size={22} color="#EF4444" />
              )}
              <Text className="text-red-500 text-base font-NunitoBold">
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </Text>
            </TouchableOpacity>

            {/* Version Info */}
            <View className="items-center mt-6 mb-4">
              <Text className="text-gray-400 text-xs font-NunitoMedium">
                Version 1.0.0
              </Text>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Modals */}
      <LogoutModal
        visible={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />

      <SwitchUserModal
        isVisible={showSwitchUserModal}
        onClose={() => setShowSwitchUserModal(false)}
        onSwitchUser={handleSwitchUser}
      />
    </SafeAreaView>
  );
};

export default RiderProfile;
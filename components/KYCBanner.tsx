import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { ShieldCheckIcon, ChevronRightIcon, SparklesIcon, ClockIcon } from "react-native-heroicons/solid";
import { router } from "expo-router";
import { roleKYCRoutes, routes } from "@/constants/routes";

interface KYCBannerProps {
  isVisible: boolean;
  role: string;
  isPending?: boolean;
}

const KYCBanner = ({ isVisible, role, isPending }: KYCBannerProps) => {
  if (!isVisible) return null;

  const getRoleKYCRoute = (role: string): string => {
    return roleKYCRoutes[role] || routes.register;
  };

  const handlePress = () => {
    if (isPending) {
      Alert.alert(
        "Under Review",
        "Your profile is currently under review by an admin. You will be notified once approved."
      );
      return;
    }
    const route = getRoleKYCRoute(role);
    router.push(route as any);
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={handlePress}
      className={`mx-0 mb-6 rounded-[20px] overflow-hidden relative ${
        isPending ? 'bg-amber-600' : 'bg-white border border-gray-100 shadow-sm'
      }`}
      style={isPending ? {
        shadowColor: '#D97706',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
      } : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Decorative background elements - only for pending state */}
      {isPending && (
        <>
          <View className="absolute top-0 right-[-20px] w-32 h-32 bg-amber-500 rounded-full opacity-50" />
          <View className="absolute bottom-[-20px] left-1/4 w-24 h-24 bg-amber-700 rounded-full opacity-40" />
        </>
      )}

      <View className="flex-row items-center p-4 relative z-10">
        <View className={`${isPending ? 'bg-white/20' : 'bg-primary-50'} p-3 rounded-[16px] mr-4 relative flex-shrink-0`}>
          {isPending ? (
            <ClockIcon size={24} color="#FFFFFF" />
          ) : (
            <ShieldCheckIcon size={24} color="#D30309" />
          )}
          {!isPending && (
            <View className="absolute -top-1 -right-1">
               <SparklesIcon size={12} color="#FBBF24" />
            </View>
          )}
        </View>
        
        <View className="flex-1 mr-3">
          <Text className={`${isPending ? 'text-white' : 'text-gray-900'} font-NunitoExtraBold text-[15px] mb-0.5 tracking-tight`}>
            {isPending ? "Verification Pending" : "Finish Your Profile"}
          </Text>
          <Text className={`${isPending ? 'text-white/80' : 'text-gray-500'} font-NunitoMedium text-[12px] leading-[16px]`}>
            {isPending 
              ? "Your merchant profile is currently under review."
              : `Complete your KYC to start receiving repair requests.`}
          </Text>
        </View>

        <View className={`${isPending ? 'bg-white' : 'bg-gray-50'} w-9 h-9 rounded-full items-center justify-center flex-shrink-0`}>
          <ChevronRightIcon size={18} color={isPending ? "#D97706" : "#9CA3AF"} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default KYCBanner;

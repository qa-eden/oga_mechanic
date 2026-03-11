import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { ShieldCheckIcon, ChevronRightIcon, SparklesIcon, ClockIcon } from "react-native-heroicons/solid";
import { router } from "expo-router";
import { roleKYCRoutes } from "@/constants/routes";

interface KYCBannerProps {
  isVisible: boolean;
  role: string;
  isPending?: boolean;
}

const KYCBanner = ({ isVisible, role, isPending }: KYCBannerProps) => {
  if (!isVisible) return null;

  const getRoleKYCRoute = (role: string): string => {
    return roleKYCRoutes[role] || "/(auth)/(register)/sign_up";
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
      className={`mx-0 mb-6 ${isPending ? 'bg-amber-600' : 'bg-primary-600'} rounded-[20px] overflow-hidden relative`}
      style={{
        shadowColor: isPending ? '#D97706' : '#D30309',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      {/* Decorative background elements */}
      <View className={`absolute top-0 right-[-20px] w-32 h-32 ${isPending ? 'bg-amber-500' : 'bg-primary-500'} rounded-full opacity-50`} />
      <View className={`absolute bottom-[-20px] left-1/4 w-24 h-24 ${isPending ? 'bg-amber-700' : 'bg-primary-700'} rounded-full opacity-40`} />

      <View className="flex-row items-center p-5 relative z-10">
        <View className="bg-white/20 p-3 rounded-[16px] mr-4 relative flex-shrink-0">
          {isPending ? (
            <ClockIcon size={28} color="#FFFFFF" />
          ) : (
            <ShieldCheckIcon size={28} color="#FFFFFF" />
          )}
          {!isPending && (
            <View className="absolute -top-1 -right-1">
               <SparklesIcon size={14} color="#FBBF24" />
            </View>
          )}
        </View>
        
        <View className="flex-1 mr-3">
          <Text className="text-white font-NunitoExtraBold text-[16px] mb-1 tracking-tight">
            {isPending ? "Verification Pending" : "Complete your profile"}
          </Text>
          <Text className="text-white/80 font-NunitoMedium text-[13px] leading-[18px]">
            {isPending 
              ? "Your merchant profile is currently under review. This usually takes less than 24 hours."
              : `Verify your identity to unlock all ${role} features and start earning.`}
          </Text>
        </View>

        <View className="bg-white w-10 h-10 rounded-full items-center justify-center flex-shrink-0"
           style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
          }}
        >
          <ChevronRightIcon size={20} color={isPending ? "#D97706" : "#D30309"} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default KYCBanner;

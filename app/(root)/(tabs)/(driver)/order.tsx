import React, { useState } from 'react'
import { Text, TouchableOpacity, View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from "expo-status-bar";
// import { MapPinIcon } from 'react-native-heroicons/solid';
// import { icons } from '@/constants';
import BookingCard from '@/components/cards/BookingCard';
import { useProfileStore } from '@/hooks/useProfileStore';
import ProfileCompletionModal from '@/components/modals/ProfileCompletionModal';
import { driverRoutes } from '@/constants/routes';
import { router } from 'expo-router';
import { useDriverProfile } from '@/hooks/useUserProfile';
import AnimatedPageContainer from '@/components/AnimatedPageContainer';

const DriverOrder = () => {
  const [activeTab, setActiveTab] = useState("recent");
  const isProfileComplete = useProfileStore((state) => state.isProfileComplete);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { data: profileData } = useDriverProfile();

  const isPendingApproval = Boolean(profileData?.data?.kyc?.is_complete && !profileData?.data?.driver_profile?.is_approved);

  // Sample booking data
  const recentBookings = [
    {
      id: 1,
      type: "One way trip",
      dateTime: "28 Feb, 10:10 AM",
      estimateUsage: "5 Hrs",
      totalDistance: "85 km",
      pickup: {
        address: "108, Auchandi Bawana Rd, Bawana Village, Lag...",
        color: "#3B82F6"
      },
      dropoff: {
        address: "E-15, Block E, East of Kailash, Ikeja FAAN Quart...",
        color: "#10B981"
      },
      price: "₦15,000"
    },
    {
      id: 2,
      type: "One way trip",
      dateTime: "28 Feb, 10:10 AM",
      estimateUsage: "5 Hrs",
      totalDistance: "85 km",
      pickup: {
        address: "108, Auchandi Bawana Rd, Bawana Village, Lag...",
        color: "#3B82F6"
      },
      dropoff: {
        address: "E-15, Block E, East of Kailash, Ikeja FAAN Quart...",
        color: "#10B981"
      },
      price: "₦15,000"
    },
    {
      id: 3,
      type: "One way trip",
      dateTime: "28 Feb, 10:10 AM",
      estimateUsage: "5 Hrs",
      totalDistance: "85 km",
      pickup: {
        address: "108, Auchandi Bawana Rd, Bawana Village, Lag...",
        color: "#3B82F6"
      },
      dropoff: {
        address: "E-15, Block E, East of Kailash, Ikeja FAAN Quart...",
        color: "#10B981"
      },
      price: "₦15,000"
    }
  ];

  const completedBookings = [
    {
      id: 1,
      type: "Round trip",
      dateTime: "27 Feb, 09:30 AM",
      estimateUsage: "8 Hrs",
      totalDistance: "120 km",
      pickup: {
        address: "Lagos Island, Victoria Island, Lagos...",
        color: "#3B82F6"
      },
      dropoff: {
        address: "Ikeja, Lagos State, Nigeria...",
        color: "#10B981"
      },
      price: "₦25,000"
    }
  ];

  const renderBookingCard = (booking: any) => (
    <BookingCard
      key={booking.id}
      id={booking.id}
      type={booking.type}
      dateTime={booking.dateTime}
      estimateUsage={booking.estimateUsage}
      totalDistance={booking.totalDistance}
      pickup={booking.pickup}
      dropoff={booking.dropoff}
      price={booking.price}
      onPress={() => {
        if (!isProfileComplete || isPendingApproval) {
          setShowProfileModal(true);
          return;
        }
        router.push(driverRoutes.takebookings);
      }}
    />
  );

  return (
    <SafeAreaView className="flex-1 pb-4 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />

      <AnimatedPageContainer animationType="fadeInDown" duration={500}>
        {/* Header */}
        <View className="bg-white px-4 py-4 border-b border-gray-100">
          <Text className="text-2xl font-NunitoBold text-center text-gray-800">
            Bookings
          </Text>
        </View>

        {/* Tab Navigation */}
        <View className="bg-white px-4 py-3 border-b border-gray-100">
          <View className="flex-row bg-gray-100 rounded-[.3rem] p-1 overflow-hidden">
            {[
              { key: "recent", label: "Recent bookings" },
              { key: "completed", label: "Completed bookings" }
            ].map((tab, index) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`flex-1 py-3 flex justify-center items-center rounded-[.3rem] ${index < 1 ? "mr-0" : ""
                  } ${activeTab === tab.key
                    ? "bg-primary-500 shadow-sm px-1"
                    : "bg-transparent"
                  }`}
              >
                <Text className={`font-NunitoBold text-center text-[.95rem] ${activeTab === tab.key ? "text-white" : "text-gray-500"
                  }`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
          {activeTab === "recent" && (
            <View className="flex flex-col gap-4">
              {recentBookings.map(renderBookingCard)}
            </View>
          )}
          
          {activeTab === "completed" && (
            <View>
              {completedBookings.map(renderBookingCard)}
            </View>
          )}
        </ScrollView>
      </AnimatedPageContainer>

      <ProfileCompletionModal
        isVisible={showProfileModal}
        roleName="driver"
        onComplete={() => setShowProfileModal(false)}
        onClose={() => setShowProfileModal(false)}
        isPending={isPendingApproval}
      />
    </SafeAreaView>
  )
}

export default DriverOrder
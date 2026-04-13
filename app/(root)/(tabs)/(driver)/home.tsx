import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Image, StatusBar, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronDownIcon,
  ArrowRightIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TruckIcon,
} from 'react-native-heroicons/outline';

import {
  MapPinIcon,
} from 'react-native-heroicons/solid';
import { icons } from '@/constants';
import OngoingBookingCard from '@/components/cards/OngoingBookingCard';
import BookingCard from '@/components/cards/BookingCard';
import { router } from 'expo-router';
import { driverRoutes } from '@/constants/routes';
import { useDriverProfile } from '@/hooks/useUserProfile';
import { useProfileStore } from '@/hooks/useProfileStore';
import ProfileCompletionModal from '@/components/modals/ProfileCompletionModal';
import KYCBanner from '@/components/KYCBanner';
import AnimatedPageContainer from '@/components/AnimatedPageContainer';
import Navbar from '@/components/Navbar';
import BiddingCarousel from "@/components/bidding/BiddingCarousel";

const Home = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState("No 5, Agbondodo str, Ijai...");
  const [debugCount, setDebugCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Profile check
  const { data: profileData, isLoading: profileLoading } = useDriverProfile();
  const setIsProfileComplete = useProfileStore((state) => state.setIsProfileComplete);
  const isNewSwitch = useProfileStore((state) => state.isNewSwitch);
  const setIsNewSwitch = useProfileStore((state) => state.setIsNewSwitch);
  const isProfileComplete = useProfileStore((state) => state.isProfileComplete);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const isPendingApproval = Boolean(
    profileData?.data?.kyc?.is_complete && 
    !profileData?.data?.driver_profile?.is_approved
  );

  const hasShownModalRef = React.useRef(false);
  const timerIdRef = React.useRef<NodeJS.Timeout | null>(null);

  // Check profile status on load
  useEffect(() => {
    if (profileData && !profileLoading) {
      const isComplete = profileData.data?.kyc?.is_complete ?? false;
      setIsProfileComplete(isComplete);
      
      // ONLY show automatically if we just switched roles and it's not complete
      if (isNewSwitch && !isComplete && !hasShownModalRef.current) {
        // Start timer only if not already started
        if (!timerIdRef.current) {
          timerIdRef.current = setTimeout(() => {
            setShowProfileModal(true);
            hasShownModalRef.current = true;
            setIsNewSwitch(false); // Reset the switch flag
            timerIdRef.current = null;
          }, 3000); // Reduced to 3 seconds
        }
      } else if (!isNewSwitch) {
          // If not a new switch, make sure timer is cleared
          if (timerIdRef.current) {
              clearTimeout(timerIdRef.current);
              timerIdRef.current = null;
          }
      }
    }

    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [profileData, profileLoading, setIsProfileComplete, isNewSwitch]);

  // Daily performance metrics data
  const dailyMetrics = [
    {
      id: 1,
      icon: CurrencyDollarIcon,
      label: "Today's Earning",
      value: "₦123,000",
      bgColor: "bg-red-50",
      iconColor: "#EF4444"
    },
    {
      id: 2,
      icon: TruckIcon,
      label: "Today's Trips",
      value: "10",
      bgColor: "bg-blue-50",
      iconColor: "#3B82F6"
    },
    {
      id: 3,
      icon: ClockIcon,
      label: "Today's Login",
      value: "17 Hrs",
      bgColor: "bg-orange-50",
      iconColor: "#F97316"
    }
  ];

  // Ongoing bookings data
  const ongoingBookings = [
    {
      id: 1,
      count: 2,
      type: "One Way",
      timeRemaining: "Ends In: 1 Hr 12 mins",
      dateTime: "28 Feb, 10:10 AM"
    }
  ];

  // Nearby bookings data
  const nearbyBookings = [
    {
      id: 1,
      type: "Round Trip",
      dateTime: "28 Feb, 10:10 AM",
      estimateUsage: "5 Hrs",
      totalDistance: "85 km",
      pickup: {
        address: "108, Auchandi Bawana Rd, Bawana Village, Lag...",
        color: "#2F6FED"
      },
      dropoff: {
        address: "E-15, Block E, East of Kailash, Ikeja FAAN Quart...",
        color: "#00A85A"
      },
      price: "₦15,000"
    },
    {
      id: 2,
      type: "Round Trip",
      dateTime: "28 Feb, 10:10 AM",
      estimateUsage: "5 Hrs",
      totalDistance: "85 km",
      pickup: {
        address: "108, Auchandi Bawana Rd, Bawana Village, Lag...",
        color: "#2F6FED"
      },
      dropoff: {
        address: "E-15, Block E, East of Kailash, Ikeja FAAN Quart...",
        color: "#00A85A"
      },
      price: "₦15,000"
    },
  ];

  useEffect(() => {
    // Test logging every 5 seconds
    const interval = setInterval(() => {
      setDebugCount(prev => prev + 1);
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const toggleOnlineStatus = () => {
    Alert.alert('Status Changed', `You are now ${!isOnline ? 'online' : 'offline'}`);
    setIsOnline(!isOnline);
  };

  const handleLocationPress = () => {
    Alert.alert('Location', 'Location selector tapped');
  };

  // Pull to refresh function
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call - replace with actual data fetching
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Driver home data refreshed');
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return (
    <SafeAreaView className="h-screen">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#D30309']} // Android
            tintColor="#D30309" // iOS
            title="Pull to refresh"
            titleColor="#666"
          />
        }
      >
        <AnimatedPageContainer animationType="fadeInDown" duration={600}>
          {/* Header Section */}
          {/* Navbar */}
          <View className="bg-white px-5 py-2">
            <Navbar />
          </View>

          <View className="bg-white px-5 pb-4">

          <View className="flex-row items-center justify-between pt-4">
            {/* Location */}
            <TouchableOpacity className="flex-row items-center " onPress={handleLocationPress}>
              <MapPinIcon size={20} color="#6B7280" />
              <Text className="text-gray-700 ml-2">{selectedLocation}</Text>
              <ChevronDownIcon size={16} color="#6B7280" />
            </TouchableOpacity>

            {/* Online/Offline Toggle */}
            <TouchableOpacity
              onPress={toggleOnlineStatus}
              className={`py-3 px-6 rounded-xl self-end ${isOnline ? 'bg-primary-500' : 'bg-yellow-500'}`}
            >
              <Text className="text-white font-semibold text-center">
                {isOnline ? 'Go offline' : 'Go online'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-5 mb-1 mt-4">
          <KYCBanner isVisible={!isProfileComplete || isPendingApproval} role="driver" isPending={isPendingApproval} />
        </View>

        {/* Add Bidding Carousel */}
        <BiddingCarousel />

        {/* Daily Performance Metrics */}
        <View className="px-5 mb-6">
          <View className="flex-row gap-2">
            {dailyMetrics.map((metric) => {
              const IconComponent = metric.icon;
              return (
                <View 
                  key={metric.id} 
                  className="flex-1 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 items-center justify-between min-h-[120px]"
                >
                  <View className="items-center">
                    <View className={`w-10 h-10 rounded-full ${metric.bgColor} items-center justify-center mb-3`}>
                      <IconComponent size={20} color={metric.iconColor} />
                    </View>
                    <View className="mb-1">
                      <Text 
                        className="text-gray-500 text-[10px] font-NunitoBold uppercase tracking-wider text-center"
                      >
                        {metric.label}
                      </Text>
                    </View>
                  </View>
                  <Text 
                    className="text-base font-NunitoExtraBold text-gray-900 text-center"
                  >
                    {metric.value}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Ongoing Bookings */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-3">On Going Bookings</Text>
          {ongoingBookings.map((booking) => (
            <OngoingBookingCard
              key={booking.id}
              id={booking.id}
              count={booking.count}
              type={booking.type}
              timeRemaining={booking.timeRemaining}
              dateTime={booking.dateTime}
            />
          ))}
        </View>

        {/* Recommended Bookings - Show when offline */}
        {!isOnline ? (
          <View className="px-5 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">Recommended Bookings</Text>
            <View className="bg-white rounded-xl border border-gray-200 p-8 items-center">
              <View className="w-40 h-40 bg-gray-100 rounded-full items-center justify-center mb-4">
                <icons.empty className='w-full h-full' />
              </View>
              <Text className="text-lg font-bold text-gray-900 mb-2">No Bookings Found</Text>
              <Text className="text-sm text-gray-500 text-center leading-5">
                You can't view recommended bookings while you are offline, go online to see available request.
              </Text>
            </View>
          </View>
        ) : (
          <View className="px-5 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900">Close by bookings</Text>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => {
                  if (!isProfileComplete || isPendingApproval) {
                    setShowProfileModal(true);
                    return;
                  }
                  router.push({
                    pathname: "/(root)/(tabs)/(driver)/home",
                    params: { tab: "consultation" }
                  })
                }}
              >
                <Text className="text-red-500 font-medium mr-1">View All</Text>
                <ArrowRightIcon size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <View className="flex flex-col gap-4">
              {nearbyBookings.map((booking) => (
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
              ))}
            </View>
          </View>
        )}

          {/* Bottom Spacing */}
          <View className="h-20" />
        </AnimatedPageContainer>
      </ScrollView>

      {/* Profile Completion Modal */}
      <ProfileCompletionModal
        isVisible={showProfileModal}
        roleName="driver"
        onComplete={() => setShowProfileModal(false)}
        onClose={() => setShowProfileModal(false)}
        isPending={isPendingApproval}
      />
    </SafeAreaView>
  );
};

export default Home;
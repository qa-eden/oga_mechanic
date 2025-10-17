"use client";

import { View, Text, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { images } from "@/constants";
import BackArrowBtn from "@/components/BackArrowBtn";
import CustomButton from "@/components/CustomButton";
import * as Location from "expo-location";
import { routes } from "@/constants/routes";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  ClockIcon,
  PhoneIcon,
} from "react-native-heroicons/solid";
import MapSection from "@/components/templates/MapSection";

interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  photo: any;
  location: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  vehicle: string;
}

const RideTracking = () => {
  const params = useLocalSearchParams();
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [estimatedTime, setEstimatedTime] = useState(2); // minutes
  const [region, setRegion] = useState({
    latitude: 6.5244, // Lagos coordinates as default
    longitude: 3.3792,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Mock driver data - in real app, this would come from API
  const [driver] = useState<DriverInfo>({
    id: "driver1",
    name: "Micheal Adenuga",
    phone: "08056432765",
    photo: images.mechanic1, // Using existing mechanic image as driver photo
    location: { latitude: 6.5244, longitude: 3.3792 },
    rating: 4.8,
    vehicle: "Toyota Camry",
  });

  const ridePrice = params.ridePrice || "NGN7,800";
  const paymentMethod = params.paymentMethod || "Cash";

  // Get user location on component mount
  useEffect(() => {
    let subscription: Location.LocationSubscription;
    (async () => {
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 2000, distanceInterval: 2 },
        (location) => setUserLocation(location)
      );
    })();
    return () => subscription && subscription.remove();
  }, []);

  // Simulate driver approaching (decrease time every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setEstimatedTime((prev) => {
        if (prev > 0) {
          return prev - 1;
        }
        return 0;
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleCallDriver = () => {
    // In real app, this would initiate a phone call
    alert(`Calling ${driver.name} at ${driver.phone}`);
  };

  const handleMessageDriver = () => {
    // Navigate to chat screen with driver
    router.push({
      pathname: routes?.chatDriver,
      params: {
        mechanicId: driver.id,
        mechanicName: driver.name,
        mechanicImage: driver.photo,
      },
    });
  };

  const handleProceed = () => {
    // Navigate to ride completion or payment screen
    alert("Ride completed! Thank you for using our service.");
    router.push(routes?.home);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white">
        <BackArrowBtn />
        <Text className="text-xl font-NunitoBold text-gray-900">
          Order a ride
        </Text>
        <View className="w-8" />
      </View>

      {/* Map View */}
      <MapSection
        region={region}
        userLocation={userLocation ? {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
        } : undefined}
        driverLocation={driver.location}
        driverName={driver.name}
        driverVehicle={driver.vehicle}
        driverRating={driver.rating}
        renderOverlays={null}
      />
      {/* Bottom Sheet */}
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-5 pt-6 pb-8">
        <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />

        {/* Ride Status */}
        <View className="items-center mb-6">
          <Text className="text-xl font-NunitoBold text-red-600 mb-2">
            Your ride is on the way
          </Text>
          <View className="flex-row items-center">
            <View className="w-5 h-5 bg-gray-200 rounded-full items-center justify-center mr-2">
              <ClockIcon size={20} color="#6B7280" />
            </View>
            <Text className="text-base font-NunitoMedium text-gray-700">
              {estimatedTime} minute{estimatedTime !== 1 ? "s" : ""} away
            </Text>
          </View>
        </View>

        {/* Driver Information */}
        <View className="mb-6">
          <Text className="text-lg font-NunitoBold text-gray-900 mb-3">
            Your driver
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-16 h-16 rounded-full overflow-hidden mr-4">
                <driver.photo width={64} height={64} />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-NunitoBold text-gray-900 mb-1">
                  {driver.name}
                </Text>
                <TouchableOpacity
                  onPress={handleCallDriver}
                  className="flex-row items-center"
                >
                  <PhoneIcon color="#6B7280" size={20} />
                  <Text className="text-sm text-gray-600 font-NunitoMedium ml-2">
                    {driver.phone}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleMessageDriver}
              className=" p-2 flex-row items-center rounded-[.5rem] gap-1 bg-gray-100 border border-gray-300"
              activeOpacity={0.8}
            >
              <ChatBubbleOvalLeftEllipsisIcon color={"black"} />
              <Text className=" text-gray-800 font-NunitoBold text-lg">
                Message
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Method */}
        <View className="mb-6">
          <Text className="text-lg font-NunitoBold text-gray-900 mb-3">
            Payment method
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-8 h-6 mr-3 bg-blue-100 rounded items-center justify-center">
                <Text className="text-blue-600 font-NunitoBold text-xs">
                  💳
                </Text>
              </View>
              <Text className="text-base font-NunitoBold text-gray-900">
                {paymentMethod}
              </Text>
            </View>
            <Text className="text-lg font-NunitoBold text-gray-900">
              {ridePrice}
            </Text>
          </View>
        </View>

        {/* Proceed Button */}
        <CustomButton
          title="Proceed"
          onPress={handleProceed}
          bgVariant="primary"
          textVariant="default"
        />
      </View>
    </SafeAreaView>
  );
};

export default RideTracking;

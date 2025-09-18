"use client";

import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { images } from "@/constants";
import BackArrowBtn from "@/components/BackArrowBtn";
import CustomButton from "@/components/CustomButton";
import { routes } from "@/constants/routes";
import { ChevronRightIcon } from "react-native-heroicons/outline";
import * as Location from "expo-location";
import MapSection from "@/components/templates/MapSection";
import SelectionModal, { SelectionOption } from "@/components/modals/SelectionModal";

interface RideOption {
  id: string;
  name: string;
  time: string;
  duration: string;
  price: string;
  isFaster?: boolean;
  selected: boolean;
  driverLocation: {
    latitude: number;
    longitude: number;
  };
}

interface Driver {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  vehicle: string;
}

const ChooseRide = () => {
  const params = useLocalSearchParams();
  const [selectedPayment, setSelectedPayment] = useState("Cash");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState({
    latitude: 6.5244, // Lagos coordinates as default
    longitude: 3.3792,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Mock drivers data
  const [drivers] = useState<Driver[]>([
    {
      id: "driver1",
      name: "John Doe",
      location: { latitude: 6.5244, longitude: 3.3792 },
      rating: 4.8,
      vehicle: "Toyota Camry",
    },
    {
      id: "driver2",
      name: "Jane Smith",
      location: { latitude: 6.5254, longitude: 3.3782 },
      rating: 4.6,
      vehicle: "Honda Civic",
    },
    {
      id: "driver3",
      name: "Mike Johnson",
      location: { latitude: 6.5234, longitude: 3.3802 },
      rating: 4.9,
      vehicle: "Ford Focus",
    },
  ]);

  const [rideOptions, setRideOptions] = useState<RideOption[]>([
    {
      id: "ride1",
      name: "Ride 1",
      time: "7:45pm",
      duration: "7 minutes away",
      price: "NGN7,800",
      isFaster: true,
      selected: true,
      driverLocation: { latitude: 6.5244, longitude: 3.3792 },
    },
    {
      id: "ride2",
      name: "Ride 2",
      time: "7:55pm",
      duration: "10 minutes away",
      price: "NGN6,600",
      selected: false,
      driverLocation: { latitude: 6.5254, longitude: 3.3782 },
    },
    {
      id: "ride3",
      name: "Ride 3",
      time: "8:07pm",
      duration: "18 minutes away",
      price: "NGN6,600",
      selected: false,
      driverLocation: { latitude: 6.5234, longitude: 3.3802 },
    },
    {
      id: "ride4",
      name: "Ride 4",
      time: "8:07pm",
      duration: "18 minutes away",
      price: "NGN6,600",
      selected: false,
      driverLocation: { latitude: 6.5264, longitude: 3.3772 },
    },
    {
      id: "ride5",
      name: "Ride 5",
      time: "8:07pm",
      duration: "18 minutes away",
      price: "NGN6,600",
      selected: false,
      driverLocation: { latitude: 6.5224, longitude: 3.3812 },
    },
  ]);

  // Get user location on component mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);

      // Update map region to user location
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  const handleRideSelect = (selectedId: string) => {
    setRideOptions((prev) =>
      prev.map((option) => ({
        ...option,
        selected: option.id === selectedId,
      }))
    );
  };

  const handlePaymentPress = () => {
    setShowPaymentModal(true);
  };

  const handleSelectPayment = (method: string) => {
    setSelectedPayment(method);
    setShowPaymentModal(false);
  };

  const handleProceed = () => {
    const selectedRide = rideOptions.find((ride) => ride.selected);
    if (!selectedRide) {
      alert("Please select a ride");
      return;
    }

    // Navigate to ride-tracking screen with selected ride and payment info
    router.push({
      pathname: routes.rideTracking,
      params: {
        rideName: selectedRide.name,
        rideTime: selectedRide.time,
        ridePrice: selectedRide.price,
        paymentMethod: selectedPayment,
      },
    });
  };

  const toggleBottomSheet = () => {
    console.log("hello");

    if (isToggling) return; // Prevent multiple rapid clicks

    setIsToggling(true);
    setIsExpanded(!isExpanded);

    // Reset toggle flag after a short delay
    setTimeout(() => {
      setIsToggling(false);
    }, 300);
  };

  const paymentOptions: SelectionOption[] = [
    {
      label: "Cash",
      value: "Cash",
      icon: <Text className="text-2xl mr-1 bg-gray-100 p-2 rounded-full">💵</Text>,
    },
    {
      label: "Transfer",
      value: "Transfer",
      icon: <Text className="text-2xl mr-1 bg-gray-100 p-2 rounded-full">💳</Text>,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white">
        <BackArrowBtn />
        <Text className="text-xl font-NunitoBold text-gray-900">
          Order a rides
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
        renderOverlays={null}
      />

      {/* Bottom Sheet */}
      <View
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-5 pt-1 pb-8 ${
          isExpanded ? "h-[80vh]" : ""
        }`}
      >
        <TouchableOpacity
          onPress={toggleBottomSheet}
          className=" flex-row justify-center items-center pt-4"
        >
          <View className="w-20 h-1 bg-gray-300 rounded-full self-center mb-6" />
        </TouchableOpacity>

        {/* Choose a ride header */}
        <Text className="text-xl font-NunitoBold text-red-600 mb-4">
          Choose a ride
        </Text>

        {/* Ride Options */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          className={isExpanded ? "flex-1" : "max-h-64"}
        >
          {rideOptions.map((ride) => (
            <TouchableOpacity
              key={ride.id}
              onPress={() => handleRideSelect(ride.id)}
              className={`flex-row items-center bg-white border-2 rounded-xl p-4 mb-3 ${
                ride.selected ? "border-red-500 bg-red-50" : "border-gray-200"
              }`}
              activeOpacity={0.8}
            >
              {/* Car Icon */}
              <View className="w-18 h-12 rounded-lg items-center justify-center mr-4">
                <images.onboarding1 width={60} />
              </View>

              {/* Ride Details */}
              <View className="flex-1">
                <Text className="text-lg font-NunitoBold text-gray-900 mb-1">
                  {ride.name}
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-sm text-gray-600 font-NunitoMedium">
                    {ride.time}
                  </Text>
                  <View className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
                  <Text className="text-sm text-gray-600 font-NunitoMedium">
                    {ride.duration}
                  </Text>
                </View>
              </View>

              {/* Price */}
              <Text className="text-lg font-NunitoBold text-gray-900">
                {ride.price}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Payment Method */}
        <TouchableOpacity
          onPress={handlePaymentPress}
          className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4 my-4"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <View className="w-8 h-6 mr-3 bg-blue-100 rounded items-center justify-center">
              <Text className="text-blue-600 font-NunitoBold text-xs">
                💳
              </Text>
            </View>
            <Text className="text-base font-NunitoBold text-gray-900">
              {selectedPayment}
            </Text>
          </View>
          <ChevronRightIcon size={20} color="#6B7280" />
        </TouchableOpacity>

        <SelectionModal
          isVisible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Select Payment method"
          options={paymentOptions}
          selectedValue={selectedPayment}
          onSelect={(method) => {
            setSelectedPayment(method);
            setShowPaymentModal(false);
          }}
        />

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

export default ChooseRide;

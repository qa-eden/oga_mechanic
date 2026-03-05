"use client";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  Image,
  Dimensions,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import UserAuthHeader from "@/components/UserAuthHeader";
import { OrderRideOptions } from "@/constants";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import { CalendarIcon, ClockIcon } from "react-native-heroicons/solid";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { routes } from "@/constants/routes";
import { useLocation } from "@/contexts/LocationContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import MapView, { Marker, PROVIDER_DEFAULT } from "@/components/MapComponent";
import { icons } from "@/constants";
import * as Location from "expo-location";
import { FontAwesome } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import BookRideView from "@/components/orderRide/BookRideView";
import RidesView from "@/components/orderRide/RidesView";

const { width, height } = Dimensions.get("window");

interface ScheduledRide {
  date: Date | null;
  time: string;
  isScheduled: boolean;
}

// Mock data for nearby drivers
const NEARBY_DRIVERS = [
  { id: 1, latitude: 0.002, longitude: 0.002, rotation: 45 },
  { id: 2, latitude: -0.002, longitude: -0.003, rotation: 120 },
  { id: 3, latitude: 0.003, longitude: -0.001, rotation: 200 },
  { id: 4, latitude: -0.001, longitude: 0.003, rotation: 300 },
];

const EnterAddressForRide = () => {
  const [currentOption, setCurrentOption] = useState(OrderRideOptions[0]);
  const [scheduledRide, setScheduledRide] = useState<ScheduledRide>({
    date: null,
    time: "",
    isScheduled: false,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const {
    state: { fromLocation, toLocation },
    isScheduling,
    setIsScheduling
  } = useLocation();

  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState({
    latitude: fromLocation?.latitude || 37.78825,
    longitude: fromLocation?.longitude || -122.4324,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  });

  // State to track if we are in the process of scheduling a ride (going to location selection and back)
  // Replaced by Context state due to persistence issues
  // const [isSchedulingFlow, setIsSchedulingFlow] = useState(false);

  useEffect(() => {
    (async () => {
      if (!fromLocation?.latitude) {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
      }
    })();
  }, [fromLocation]);

  useEffect(() => {
    if (fromLocation?.latitude && fromLocation?.longitude) {
      const newRegion = {
        latitude: fromLocation.latitude,
        longitude: fromLocation.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.0121,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
    }
  }, [fromLocation]);

  // Trigger Date Picker if we returned from location selection in scheduling flow
  useEffect(() => {
    if (isScheduling && fromLocation.name && toLocation.name) {
      setShowDatePicker(true);
      setScheduledRide(prev => ({ ...prev, isScheduled: true }));
      setIsScheduling(false); // Reset flow
    }
  }, [fromLocation, toLocation, isScheduling]);

  const handleLocationInputPress = (type: "from" | "to") => {
    router.push({
      pathname: routes?.locationSelection,
      params: { type },
    });
  };

  const handleScheduleRide = () => {
    // Start scheduling flow
    setIsScheduling(true);
    // Navigate to location selection, indicating we are scheduling
    router.push({
      pathname: routes?.locationSelection,
      params: { isScheduled: "true" }
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setScheduledRide((prev) => ({
        ...prev,
        date: selectedDate,
      }));
      // After date, show time picker on Android immediately? Or wait? 
      // User experience: usually pick date then time.
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
        setTimeout(() => setShowTimePicker(true), 100); // Small delay
      } else {
        // iOS DateTimePicker might handle both or we show time picker next
        // For now let's just close date picker. User can click time if separate.
      }
    }
    if (Platform.OS === "android" || event.type === "set") {
      setShowDatePicker(false);
      // For iOS we might want to keep it open or have a "Done" button
    }

    // Auto-show time picker after date selection for smoother flow
    if (event.type === "set" || Platform.OS === "ios") {
      setTimeout(() => setShowTimePicker(true), 500);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime) {
      const timeString = selectedTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setScheduledRide((prev) => ({
        ...prev,
        time: timeString,
      }));

      // Auto-navigate after successful time selection
      // We assume date is already set from previous step
      router.push({
        pathname: routes?.chooseRide,
        params: {
          from: JSON.stringify(fromLocation),
          to: JSON.stringify(toLocation),
          rideType: OrderRideOptions[0].name, // Default
          fare: "",
          isScheduled: "true",
          scheduledDate: scheduledRide.date?.toISOString() || new Date().toISOString(),
          scheduledTime: timeString,
        },
      });
    }
    if (Platform.OS === "android" || event.type === "set") {
      setShowTimePicker(false);
    }
  };



  // Render "Home" state (Before destination selection)
  const [activeTab, setActiveTab] = useState<"book" | "rides">("book");

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(activeTab === "book" ? height * 0.55 : height * 0.8, {
        duration: 300,
        easing: Easing.out(Easing.quad),
      }),
    };
  }, [activeTab]);

  const renderHomeState = () => (
    <Animated.View
      entering={FadeInUp.delay(200).springify()}
      className="absolute bottom-0 w-full bg-white rounded-t-[30px] shadow-2xl shadow-black/20 pb-8"
      style={animatedStyle}
    >
      {/* Handle Bar */}
      <View className="items-center pt-3 pb-2">
        <View className="w-12 h-1 bg-gray-200 rounded-full" />
      </View>

      {/* Main Tab Switcher (Segmented Control Style) */}
      <View className="px-5 mb-6 mt-2">
        <View className="flex-row bg-gray-100 p-1 rounded-xl">
          {[
            { id: 'book', label: 'Book' },
            { id: 'rides', label: 'Rides' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as "book" | "rides")}
                 className={`flex-1 py-3 items-center rounded-xl transition-all ${
                  isActive ? "bg-white shadow-sm" : ""
                }`}
              >
                <Text
                  className={`font-NunitoBold text-md ${
                    isActive ? "text-primary-600" : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content Area */}
      <View className="flex-1">
        {activeTab === "book" ? (
          <BookRideView
            handleScheduleRide={handleScheduleRide}
            handleLocationInputPress={handleLocationInputPress}
          />
        ) : (
          <RidesView
            handleScheduleRide={handleScheduleRide}
          />
        )}
      </View>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Full Screen Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={{
          width: width,
          height: height,
          position: "absolute",
        }}
        initialRegion={region}
        showsUserLocation={true}
        userInterfaceStyle="light"
      >
        {/* Mock Nearby Drivers */}
        {NEARBY_DRIVERS.map((driver) => (
          <Marker
            key={driver.id}
            coordinate={{
              latitude: region.latitude + driver.latitude,
              longitude: region.longitude + driver.longitude,
            }}
            rotation={driver.rotation}
          >
            <View className="bg-white p-2 rounded-full shadow-md shadow-black/20">
              <FontAwesome name="car" size={18} color="#2563EB" />
            </View>
          </Marker>
        ))}
      </MapView>

      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Floating Menu Button (Always Visible) */}
        <View className="px-5 pt-2 absolute top-12 left-0 z-20">
          <TouchableOpacity onPress={() => router.back()} className="bg-white p-3 rounded-full shadow-md w-12 h-12 items-center justify-center">
            <FontAwesome name="arrow-left" size={20} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {renderHomeState()}
      </SafeAreaView>
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View className="flex-1 bg-black/30 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-10">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-NunitoBold text-gray-900">
                Select Date
              </Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text className="text-primary-500 font-NunitoBold">Cancel</Text>
              </TouchableOpacity>
            </View>
            <View className="items-center">
              <DateTimePicker
                value={scheduledRide.date || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                minimumDate={new Date()}
                style={{ width: "100%" }}
                textColor="#000000"
                themeVariant="light"
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View className="flex-1 bg-black/30 justify-end">
          <View className="bg-white rounded-t-3xl p-6 pb-10">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-NunitoBold text-gray-900">
                Select Time
              </Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text className="text-primary-500 font-NunitoBold">Cancel</Text>
              </TouchableOpacity>
            </View>
            <View className="items-center">
              <DateTimePicker
                value={scheduledRide.date || new Date()}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleTimeChange}
                style={{ width: "100%" }}
                textColor="#000000"
                themeVariant="light"
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EnterAddressForRide;
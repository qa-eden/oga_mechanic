"use client";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import UserAuthHeader from "@/components/UserAuthHeader";
import { OrderRideOptions } from "@/constants";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import { CalendarIcon, ClockIcon } from "react-native-heroicons/solid";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { routes } from "@/constants/routes";
import LocationPicker from "@/components/LocationPicker";
import { useLocation } from "@/contexts/LocationContext";
import DateTimePicker from "@react-native-community/datetimepicker";

interface ScheduledRide {
  date: Date | null;
  time: string;
  isScheduled: boolean;
}

const EnterAddressForRide = () => {
  const [currentOption, setCurrentOption] = useState(OrderRideOptions[0]);
  const [scheduledRide, setScheduledRide] = useState<ScheduledRide>({
    date: null,
    time: "",
    isScheduled: false,
  });
  const [fare, setFare] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const {
    state: { fromLocation, toLocation },
  } = useLocation();

  const handleLocationInputPress = (type: "from" | "to") => {
    router.push({
      pathname: routes?.locationSelection,
      params: { type },
    });
  };

  const handleScheduleRide = () => {
    setScheduledRide((prev) => ({
      ...prev,
      isScheduled: !prev.isScheduled,
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setScheduledRide((prev) => ({
        ...prev,
        date: selectedDate,
      }));
    }
    // Close modal immediately after selection
    if (Platform.OS === "android" || event.type === "set") {
      setShowDatePicker(false);
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
    }
    // Close modal immediately after selection
    if (Platform.OS === "android" || event.type === "set") {
      setShowTimePicker(false);
    }
  };

  const handleBookRide = () => {
    // Validate required fields
    if (!fromLocation.name || !toLocation.name) {
      Alert.alert(
        "Missing Information",
        "Please select both pickup and destination locations.",
        [{ text: "OK" }]
      );
      return;
    }

    if (!fare.trim()) {
      Alert.alert("Missing Fare", "Please enter your fare offer.", [
        { text: "OK" },
      ]);
      return;
    }

    if (
      scheduledRide.isScheduled &&
      (!scheduledRide.date || !scheduledRide.time)
    ) {
      Alert.alert(
        "Missing Schedule",
        "Please select date and time for your scheduled ride.",
        [{ text: "OK" }]
      );
      return;
    }

    // Navigate to choose ride screen instead of showing alert
    router.push({
      pathname: routes?.chooseRide,
      params: {
        from: JSON.stringify(fromLocation),
        to: JSON.stringify(toLocation),
        rideType: currentOption.name,
        fare: fare,
        isScheduled: scheduledRide.isScheduled.toString(),
        scheduledDate: scheduledRide.date?.toISOString() || "",
        scheduledTime: scheduledRide.time,
      },
    });
  };

  return (
    <>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <ScrollView
          className="flex-1 px-5 pt-2"
          showsVerticalScrollIndicator={false}
        >
          <View className="">
            <UserAuthHeader header="Order a ride" />

            <View className="flex-row justify-between items-center my-4 border border-primary-200 px-4 py-1 rounded-[.6rem]">
              <TouchableOpacity
                onPress={() => handleLocationInputPress("to")}
                className="flex-row items-center gap-5 py-3 border-r pr-[2rem] border-primary-200"
              >
                <MagnifyingGlassIcon />
                <Text>Where are you going today ?</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleScheduleRide}
                className={`flex-row items-center rounded-[.6rem] p-2 ${
                  scheduledRide.isScheduled ? "bg-primary-100" : "bg-gray-100"
                }`}
                activeOpacity={0.7}
              >
                <CalendarIcon
                  size={16}
                  color={scheduledRide.isScheduled ? "#A80207" : "#6B7280"}
                />
                <Text
                  className={`pl-1 ${
                    scheduledRide.isScheduled
                      ? "text-primary-500"
                      : "text-gray-500"
                  }`}
                >
                  Later
                </Text>
              </TouchableOpacity>
            </View>

            {/* Schedule Ride Section */}
            {scheduledRide.isScheduled && (
              <View className="mx-1 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Text className="text-lg font-NunitoBold text-gray-900 mb-3">
                  Schedule Your Ride
                </Text>
                <View className="flex-row items-center mb-3">
                  <ClockIcon size={20} color="#6B7280" />
                  <Text className="ml-2 text-gray-700 font-NunitoMedium">
                    Pickup Date & Time
                  </Text>
                </View>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="flex-1 bg-white border border-gray-300 rounded-[1rem] p-3"
                  >
                    <Text className="text-sm text-gray-500 font-NunitoMedium">
                      Date
                    </Text>
                    <Text className="text-base font-NunitoBold text-gray-900">
                      {scheduledRide.date
                        ? scheduledRide.date.toLocaleDateString()
                        : "Select Date"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowTimePicker(true)}
                    className="flex-1 bg-white border border-gray-300 rounded-[1rem] p-3"
                  >
                    <Text className="text-sm text-gray-500 font-NunitoMedium">
                      Time
                    </Text>
                    <Text className="text-base font-NunitoBold text-gray-900">
                      {scheduledRide.time || "Select Time"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Ride Type Selection */}
            <View className="">
              <FlatList
                scrollEnabled={false} // Disables horizontal scroll
                data={OrderRideOptions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setCurrentOption(item)}
                    className={`flex-1 rounded-xl items-center shadow-sm justify-center ${
                      currentOption.id === item.id
                        ? "bg-primary-100 shadow-primary-500"
                        : "shadow-gray-100 bg-white shadow-sm"
                    }`}
                    style={{
                      elevation: 3, // for Android shadow
                      height: 100, // fixed height for consistent layout
                    }}
                  >
                    <View className="bg-primary-50 rounded-full ">
                      <item.image width={60} height={60} color="#2563EB" />
                    </View>

                    <Text
                      className={` font-semibold text-center pt-2 ${
                        currentOption.id === item.id
                          ? "text-primary-500"
                          : "text-gray-500"
                      }`}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: "space-between",
                  gap: 12,
                }}
                contentContainerStyle={{
                  paddingHorizontal: 2,
                  paddingVertical: 7,
                }}
                showsVerticalScrollIndicator={false}
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                windowSize={7}
                removeClippedSubviews={true}
              />
            </View>

            <View className="my-4">
              <LocationPicker
                type="from"
                onLocationPress={handleLocationInputPress}
                showCurrentLocation={true}
              />
              <LocationPicker
                type="to"
                onLocationPress={handleLocationInputPress}
                showCurrentLocation={false}
              />
            </View>

            <View className="mt-2">
              <InputField
                label="Offer your fare"
                placeholder="Enter amount"
                keyboardType="numeric"
                value={fare}
                onChangeText={setFare}
              />
            </View>

            <View className="mt-8 mb-8">
              <CustomButton
                title={
                  scheduledRide.isScheduled ? "Schedule Ride" : "Choose a ride"
                }
                onPress={handleBookRide}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View className="flex-1 bg-gray-600 bg-opacity-20 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
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
                style={{
                  width: Platform.OS === "ios" ? 300 : "100%",
                  height: Platform.OS === "ios" ? 200 : 50,
                }}
                textColor="#000000"
                themeVariant="light"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View className="flex-1 bg-gray-600 bg-opacity-20 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
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
                style={{
                  width: Platform.OS === "ios" ? 300 : "100%",
                  height: Platform.OS === "ios" ? 200 : 50,
                }}
                textColor="#000000"
                themeVariant="light"
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default EnterAddressForRide;

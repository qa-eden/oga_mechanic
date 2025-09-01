import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import CustomButton from '@/components/CustomButton';
import { driverRoutes } from '@/constants/routes';

const TripCompletedScreen = () => {
    const [tripData] = React.useState({
        tripType: "One Way",
        vehicle: "Manual - Hatchback",
        startTime: "2:53 PM",
        endTime: "5:53 PM",
        customerName: "Big Suzz",
        tripId: "#0CAC6C64",
        pickupAddress: "108, Auchandi Bawana Rd, Bawana Village, Lagos Nigeria",
        dropoffAddress: "E-15, Block E, East of Kailash, Ikeja FAAN Quarters, Lagos",
        tripDuration: "3h 00min",
        distance: "85 km",
        date: "April 14, 2025",
        estimatedFare: "₦15,000",
        earnedMoney: "₦15,000",
    });

    const handleGoHome = () => {
        router.push(driverRoutes?.home);
    };

    const handleViewBookings = () => {
        router.push(driverRoutes?.order);
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="white" />

            {/* Header */}
            <SafeAreaView className="bg-white">
                <View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-200">
                    <TouchableOpacity onPress={handleGoHome}>
                        <Text className="text-2xl font-bold">✕</Text>
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">Trip summary</Text>
                    <View className="w-8" />
                </View>
            </SafeAreaView>

            {/* Trip Summary Content */}
            <View className="flex-1 px-5 pb-6">
                {/* Pickup & Destination Card */}
                <View className="border-gray-300 border rounded-xl p-4 mb-4">
                    <Text className="text-primary-500 font-bold text-md mb-3">PICKUP & DESTINATION</Text>

                    {/* Pickup */}
                    <View className="flex-row items-start mb-3">
                        <View className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-3" />
                        <View className="flex-1">
                            <Text className="font-bold text-gray-900 mb-1">Pickup</Text>
                            <Text className="text-gray-700 text-sm leading-5">{tripData.pickupAddress}</Text>
                        </View>
                    </View>

                    {/* Connecting Line */}
                    <View className="ml-1.5 mb-3">
                        <View className="w-px h-6 bg-gray-400 border-l border-gray-400" />
                    </View>

                    {/* Destination */}
                    <View className="flex-row items-start">
                        <View className="w-3 h-3 bg-red-500 rounded-full mt-2 mr-3" />
                        <View className="flex-1">
                            <Text className="font-bold text-gray-900 mb-1">Destination</Text>
                            <Text className="text-gray-700 text-sm leading-5">{tripData.dropoffAddress}</Text>
                        </View>
                    </View>
                </View>

                {/* Basic Details Card */}
                <View className="border border-gray-300 rounded-xl p-4 mb-4">
                    <Text className="text-primary-500 font-bold text-md mb-3">BASIC DETAILS</Text>

                    <View className="space-y-2">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-700">Client Name</Text>
                            <Text className="font-semibold text-gray-900">{tripData.customerName}</Text>
                        </View>
                        <View className="flex-row justify-between py-2">
                            <Text className="text-gray-700">Trip ID</Text>
                            <Text className="font-semibold text-gray-900">{tripData.tripId}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-700">Trip Distance</Text>
                            <Text className="font-semibold text-gray-900">{tripData.distance}</Text>
                        </View>
                        <View className="flex-row justify-between py-2">
                            <Text className="text-gray-700">Trip Duration</Text>
                            <Text className="font-semibold text-gray-900">{tripData.tripDuration}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-700">Date & Time</Text>
                            <Text className="font-semibold text-gray-900">{tripData.date} - {tripData.startTime}</Text>
                        </View>
                    </View>
                </View>

                {/* Estimated Fare Details Card */}
                <View className="border border-gray-300 rounded-xl p-4 mb-4">
                    <Text className="text-primary-500 font-bold text-md mb-3">ESTIMATED FARE DETAILS</Text>

                    <View className="space-y-3">
                        <View className="flex-row justify-between pb-3">
                            <Text className="text-gray-700">Estimated Total Fare</Text>
                            <Text className="font-semibold text-gray-900">{tripData.estimatedFare}</Text>
                        </View>

                        <View className="border-t border-gray-300 pt-6">
                            <View className="flex-col items-center justify-center gap-2">
                                <Text className="text-primary-500">Earned money from trip:</Text>
                                <Text className="text-2xl font-bold text-primary-500">{tripData.earnedMoney}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <CustomButton title="See All Bookings" onPress={handleViewBookings} />
            </View>
        </View>
    );
};

export default TripCompletedScreen;

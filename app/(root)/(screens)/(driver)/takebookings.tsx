import React, { useState } from 'react'
import { Text, View, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
// import { ArrowLeftIcon } from 'react-native-heroicons/outline'
import { MapPinIcon as MapPinSolid } from 'react-native-heroicons/solid'
import { router } from 'expo-router'
import CustomMapView from '@/components/MapView'
import SwipeableButton from '@/components/SwipeableButton'
import BackArrowBtn from '@/components/BackArrowBtn'

const Takebookings = () => {
    const [isAccepted, setIsAccepted] = useState(false)

    const handleAcceptBooking = () => {
        setIsAccepted(true)
        console.log('Booking accepted')
        router.push('/(root)/(screens)/(driver)/on-route')
    }

    // Map coordinates for Lagos, Nigeria
    const initialRegion = {
        latitude: 6.5244,
        longitude: 3.3792,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    }

    const pickupLocation = {
        latitude: 6.5244,
        longitude: 3.3792,
    }

    const destinationLocation = {
        latitude: 6.6018,
        longitude: 3.3515,
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
                <BackArrowBtn />
                <Text className="text-2xl font-bold text-gray-900">Take bookings</Text>
                <View className="w-10" />
            </View>

            {/* Map Section */}
            <View className="flex-1">
                <CustomMapView
                    region={initialRegion}
                    showUserLocation={true}
                    showTraffic={true}
                    markers={[
                        {
                            id: 'pickup',
                            coordinate: pickupLocation,
                            icon: (
                                <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center border-2 border-white">
                                    <View className="w-2 h-2 bg-white rounded-full" />
                                </View>
                            )
                        },
                        {
                            id: 'destination',
                            coordinate: destinationLocation,
                            icon: (
                                <View className="w-8 h-8 bg-green-500 rounded-full items-center justify-center border-2 border-white">
                                    <MapPinSolid size={16} color="white" />
                                </View>
                            )
                        }
                    ]}
                    polylines={[
                        {
                            id: 'route',
                            coordinates: [
                                pickupLocation,
                                { latitude: 6.5244, longitude: 3.3792 }, // Start
                                { latitude: 6.5244, longitude: 3.3805 }, // Go east
                                { latitude: 6.5248, longitude: 3.3805 }, // Curve north
                                { latitude: 6.5248, longitude: 3.3812 }, // Go east again
                                { latitude: 6.5255, longitude: 3.3812 }, // Curve north
                                { latitude: 6.5255, longitude: 3.3820 }, // Go east
                                { latitude: 6.5262, longitude: 3.3820 }, // Curve north
                                { latitude: 6.5262, longitude: 3.3825 }, // Final east
                                destinationLocation
                            ],
                            strokeColor: '#EF4444',
                            strokeWidth: 4
                        }
                    ]}
                />
            </View>

            {/* Booking Details Card - Full Screen Bottom Sheet */}
            <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg border-t border-gray-200 max-h-[60%]">

                <View className="w-12 h-1 bg-gray-300 rounded-full self-center mt-3 mb-2" />

                <View className="px-6 pb-8">

                    <Text className="text-2xl font-bold text-center text-gray-900 mb-2">One Way</Text>

                    <View className="mb-2 border border-gray-200 p-2 rounded-xl">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center mb-2">
                                <View className="w-4 h-4 bg-blue-600 border-2 border-blue-300 rounded-full mr-3" />
                                <Text className="font-semibold text-gray-900">Pickup</Text>
                            </View>

                            <View className="flex-row items-center mb-1">
                                <Text className="text-sm text-gray-600 mr-2">09:45AM</Text>
                                <Text className="text-sm text-gray-600">•</Text>
                                <Text className="text-sm text-gray-600 ml-2">9.69KM</Text>
                            </View>
                        </View>
                        <View className="ml-7">

                            <Text className="text-sm text-gray-700 leading-5">
                                108, Auchandi Bawana Rd, Bawana Village, Lagos Nigeria
                            </Text>
                        </View>
                    </View>

                    <View className="mb-4 border border-gray-200 p-2 rounded-xl">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center mb-2">
                                <MapPinSolid size={20} color="#EF4444" />
                                <Text className="font-semibold text-gray-900 ml-2">Destination</Text>
                            </View>

                            <View className="flex-row items-center mb-1">
                                <Text className="text-sm text-gray-600 mr-2">85KM</Text>
                                <Text className="text-sm text-gray-600">•</Text>
                                <Text className="text-sm text-gray-600 ml-2">5 Hrs</Text>
                            </View>
                        </View>
                        <View className="ml-7">

                            <Text className="text-sm text-gray-700 leading-5">
                                E-15, Block E, East of Kailash, Ikeja FAAN Quarters, Lagos
                            </Text>
                        </View>
                    </View>

                    <View className="border border-gray-200 rounded-xl p-3 mb-4">
                        <View className="flex-row mb-2">
                            <Text className="text-2xl font-bold text-gray-600">₦15,000</Text>
                        </View>
                        <Text className="text-sm text-gray-700 ">Your estimated earnings</Text>
                    </View>

                    <View className="flex-row items-center justify-center">
                        <SwipeableButton
                            backgroundColor="#08875D"
                            text="Swipe to Accept"
                            successText="Booking Accepted!"
                            onComplete={handleAcceptBooking}
                            height={56}
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Takebookings
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPinIcon, PhoneIcon, ChatBubbleLeftRightIcon, ChevronDoubleRightIcon, ClockIcon, UserIcon, UserCircleIcon } from 'react-native-heroicons/solid';
import { router } from 'expo-router';
import CustomMapView from '@/components/MapView';
import SwipeableButton from '@/components/SwipeableButton';
import BackArrowBtn from '@/components/BackArrowBtn';
import CallOptionsModal from '@/components/modals/CallOptionsModal';

const OnRouteScreen = () => {
    const [currentLocation, setCurrentLocation] = useState({
        latitude: 6.5244,
        longitude: 3.3792,
    });

    const [showCallModal, setShowCallModal] = useState(false);
    const [tripStatus, setTripStatus] = useState<'on-route' | 'starting' | 'in-progress' | 'completed'>('on-route');
    const [resetKey, setResetKey] = useState(0);

    // Reset button when page loads
    useEffect(() => {
        setResetKey(prev => prev + 1);
    }, []);

    // Booking data
    const bookingData = {
        tripType: "One Way",
        vehicle: "Manual - Hatchback",
        startTime: "10:00 AM",
        customerName: "Big Suzz",
        address: "E-15, Block E, East of Kailash, Ikeja FAAN Quarters, Lagos",
        pickupLocation: { latitude: 6.5244, longitude: 3.3792 },
        destinationLocation: { latitude: 6.5262, longitude: 3.3825 },
        phoneNumber: "+234 9076543211",
    };

    // Realistic route with multiple waypoints
    const routeCoordinates = [
        bookingData.pickupLocation,
        { latitude: 6.5244, longitude: 3.3805 }, // Go east
        { latitude: 6.5248, longitude: 3.3805 }, // Curve north
        { latitude: 6.5248, longitude: 3.3812 }, // Go east again
        { latitude: 6.5255, longitude: 3.3812 }, // Curve north
        { latitude: 6.5255, longitude: 3.3820 }, // Go east
        { latitude: 6.5262, longitude: 3.3820 }, // Curve north
        { latitude: 6.5262, longitude: 3.3825 }, // Final approach
        bookingData.destinationLocation
    ];

    const handleStartTrip = () => {
        console.log('Trip started');
        setTripStatus('starting');
        // Wait 5 seconds before changing to "End Trip" button
        setTimeout(() => {
            console.log('Trip is now in progress - ready to end');
            setTripStatus('in-progress');
        }, 5000);
    };

    const handleEndTrip = () => {
        console.log('Trip ended');
        setTripStatus('completed');
        // Add a small delay before navigating
        setTimeout(() => {
            // Navigate to trip completed screen
            router.push('/(root)/(screens)/(driver)/trip-completed');
        }, 1000);
    };

    const handleContact = () => {
        setShowCallModal(true);
    };

    const handleInAppCall = () => {
        console.log('In-app call initiated');
        setShowCallModal(false);
        // Navigate to ongoing call screen
        router.push('/(root)/(screens)/(driver)/ongoing-call');
    };

    const handlePhoneCall = () => {
        console.log('Phone call initiated');
        setShowCallModal(false);
        // Open device's phone app with the number
        const phoneNumber = bookingData.phoneNumber.replace(/\s/g, '');
        const url = `tel:${phoneNumber}`;

        // For Expo, you would use Linking
        // import { Linking } from 'react-native';
        // Linking.openURL(url);

        // For now, just show an alert
        Alert.alert(
            'Phone Call',
            `Would you like to call ${bookingData.phoneNumber}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', onPress: () => console.log('Opening phone app...') }
            ]
        );
    };

    const handleChat = () => {
        console.log('Open chat');
        // Navigate to chat screen with customer data
        router.push({
            pathname: '/(root)/(screens)/(orderRide)/chat-driver',
            params: {
                mechanicName: bookingData.customerName,
                mechanicPhone: bookingData.phoneNumber,
                mechanicImage: require('@/assets/icons/user.svg'),
            },
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="white" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-5 py-2 border-b border-gray-200">
                <BackArrowBtn />
                <Text className="text-xl font-bold text-gray-900">
                    {tripStatus === 'on-route' ? 'On Route' : 
                     tripStatus === 'starting' ? 'Starting Trip...' : 
                     tripStatus === 'in-progress' ? 'Trip in Progress' : 
                     'Trip Completed'}
                </Text>
                <View className="w-8" />
            </View>

            {/* Map Section */}
            <View className="flex-1">
                <CustomMapView
                    region={{
                        latitude: 6.5253,
                        longitude: 3.3808,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    showUserLocation={true}
                    showTraffic={true}
                    markers={[
                        {
                            id: 'pickup',
                            coordinate: bookingData.pickupLocation,
                            icon: (
                                <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center border-2 border-white">
                                    <View className="w-2 h-2 bg-white rounded-full" />
                                </View>
                            )
                        },
                        {
                            id: 'destination',
                            coordinate: bookingData.destinationLocation,
                            icon: (
                                <View className="w-8 h-8 bg-green-500 rounded-full items-center justify-center border-2 border-white">
                                    <MapPinIcon size={16} color="white" />
                                </View>
                            )
                        }
                    ]}
                    polylines={[
                        {
                            id: 'route',
                            coordinates: routeCoordinates,
                            strokeColor: '#EF4444',
                            strokeWidth: 4
                        }
                    ]}
                />
            </View>

            {/* Booking Details Card */}
            <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl px-5 pt-6 pb-8">
                {/* Handle */}
                <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-2" />

                {/* Trip Type and Vehicle */}
                <View className="mb-2">
                    <Text className="text-xl font-bold text-gray-900 mb-1 text-center">{bookingData.tripType}</Text>
                    <Text className="text-base text-gray-600 text-center">{bookingData.vehicle}</Text>
                    {tripStatus === 'starting' && (
                        <View className="mt-2 px-3 py-1 bg-blue-100 rounded-full self-center">
                            <Text className="text-xs text-blue-700 font-medium">Starting Trip...</Text>
                        </View>
                    )}
                    {tripStatus === 'in-progress' && (
                        <View className="mt-2 px-3 py-1 bg-orange-100 rounded-full self-center">
                            <Text className="text-xs text-orange-700 font-medium">Trip in Progress</Text>
                        </View>
                    )}
                </View>

                {/* Booking Information */}
                <View className="mb-6 space-y-3 border border-gray-200 rounded-xl p-2">
                    <View className="flex-row justify-between items-center border-b border-gray-200 p-3">
                        <View className="flex-row items-center justify-center mr-3">
                            <ClockIcon size={25} color="#059669" />
                            <Text className="text-md font-semibold text-gray-700 ml-2">Start In</Text>
                        </View>
                        <Text className="text-base font-medium text-gray-600">{bookingData.startTime}</Text>
                    </View>

                    <View className="flex-row justify-between items-center border-b border-gray-200 p-3">
                        <View className="flex-row items-center justify-center mr-3">
                            <UserCircleIcon size={25} color="#000" />
                            <Text className="text-md font-semibold text-gray-700 ml-2">Customer Name</Text>
                        </View>
                        <Text className="text-base font-medium text-gray-600">{bookingData.customerName}</Text>
                    </View>

                    <View className="flex-row p-2 items-start">
                        <View className=" items-center justify-center mr-3 mt-1">
                            <MapPinIcon size={25} color="#059669" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-semibold text-gray-900 leading-5">{bookingData.address}</Text>
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row space-x-3 mb-4 border border-gray-200 rounded-xl p-2">
                    <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center py-3 border-r border-gray-200"
                        onPress={handleContact}
                    >
                        <PhoneIcon size={20} color="#3B82F6" />
                        <Text className="text-blue-600 font-semibold ml-2">Contact</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center py-3"
                        onPress={handleChat}
                    >
                        <ChatBubbleLeftRightIcon size={20} color="#3B82F6" />
                        <Text className="text-blue-600 font-semibold ml-2">Chat</Text>
                    </TouchableOpacity>
                </View>

                {/* Conditional Trip Button */}
                <View className="flex-row items-center justify-center">
                    {tripStatus === 'on-route' ? (
                        <SwipeableButton
                            backgroundColor="#059669"
                            text="Start Trip"
                            successText="Trip Started!"
                            onComplete={handleStartTrip}
                            height={56}
                            resetKey={resetKey}
                        />
                    ) : tripStatus === 'starting' ? (
                        <View className="w-full h-14 bg-gray-200 rounded-xl items-center justify-center">
                            <Text className="text-gray-600 font-semibold">Starting Trip...</Text>
                        </View>
                    ) : tripStatus === 'in-progress' ? (
                        <SwipeableButton
                            backgroundColor="#D30309"
                            text="End Trip"
                            successText="Trip Ended!"
                            onComplete={handleEndTrip}
                            height={56}
                            resetKey={resetKey}
                        />
                    ) : null}
                </View>
            </View>

            {/* Call Options Modal */}
            <CallOptionsModal
                isVisible={showCallModal}
                onClose={() => setShowCallModal(false)}
                phoneNumber={bookingData.phoneNumber}
                onInAppCall={handleInAppCall}
                onPhoneCall={handlePhoneCall}
            />
        </SafeAreaView>
    );
};

export default OnRouteScreen;

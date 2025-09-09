import React, { useState } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Image,
    Alert
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { CameraIcon, CheckIcon } from 'react-native-heroicons/outline'
import { sellerRoutes } from '@/constants/routes'
import UserAuthHeader from '@/components/UserAuthHeader'
import ProgressBar from '@/components/ProgressBar'
import HeaderAndDescTextCenter from '@/components/HeaderAndDescTextCenter'

const Step4 = () => {
    const params = useLocalSearchParams()
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
    const [isCapturing, setIsCapturing] = useState(false)

    const handlePhotoCapture = async () => {
        try {
            setIsCapturing(true)
            
            // Request camera permissions
            const { status } = await ImagePicker.requestCameraPermissionsAsync()
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Camera permission is required to take your photo')
                return
            }

            // Launch camera
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1], // Square aspect ratio for profile photo
                quality: 0.8,
            })

            if (!result.canceled && result.assets[0]) {
                setCapturedPhoto(result.assets[0].uri)
            }
        } catch (error) {
            console.error('Camera error:', error)
            Alert.alert('Error', 'Failed to take photo. Please try again.')
        } finally {
            setIsCapturing(false)
        }
    }

    const handleRetakePhoto = () => {
        setCapturedPhoto(null)
    }

    const handleSubmit = () => {
        if (!capturedPhoto) {
            Alert.alert('Photo Required', 'Please capture your photo to continue')
            return
        }

        // Navigate to completion or next step with all form data
        console.log('Step 5 submitted with photo:', capturedPhoto)
        console.log('Previous step data:', params)
        
        // Navigate to step 5 with all collected data
        router.push({
            pathname: sellerRoutes.step5,
            params: {
                ...params,
                profilePhoto: capturedPhoto
            }
        })
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Header */}
            <View className="px-6 py-2">
                <UserAuthHeader />

                <View className="py-4">
                    <ProgressBar step={4} totalSteps={5} />
                </View>
            </View>

            {/* Main Content */}
            <View className="px-6 flex-1 justify-center">
                <HeaderAndDescTextCenter
                    header="Live photo capture"
                    text1="Upload your life photo"
                    containerStyle="!px-0 !pb-8"
                />

                {/* Photo Capture Area */}
                <View className="items-center space-y-6">
                    {/* Circular Photo Placeholder */}
                    <TouchableOpacity
                        onPress={capturedPhoto ? undefined : handlePhotoCapture}
                        disabled={isCapturing}
                        className={`w-48 h-48 rounded-full border-4 border-gray-300 items-center justify-center ${
                            capturedPhoto ? 'border-green-500' : 'border-gray-300'
                        } ${isCapturing ? 'opacity-50' : ''}`}
                        activeOpacity={0.7}
                    >
                        {capturedPhoto ? (
                            <View className="relative">
                                <Image
                                    source={{ uri: capturedPhoto }}
                                    className="w-44 h-44 rounded-full"
                                    resizeMode="cover"
                                />
                                <View className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full items-center justify-center">
                                    <CheckIcon size={16} color="white" />
                                </View>
                            </View>
                        ) : (
                            <View className="items-center">
                                <CameraIcon size={48} color="#9CA3AF" />
                                <Text className="text-gray-500 text-sm mt-2">Tap to capture</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Instructions */}
                    <View className="items-center space-y-4">
                        <Text className="text-lg font-NunitoMedium text-gray-800">
                            Strike a Pose
                        </Text>
                        
                        <View className="bg-gray-50 rounded-xl p-4 w-full">
                            <Text className="text-sm font-NunitoMedium text-gray-700 mb-2">
                                To verify successfully:
                            </Text>
                            <View className="space-y-1">
                                <Text className="text-sm text-gray-600">
                                    • Your face must be clearly visible
                                </Text>
                                <Text className="text-sm text-gray-600">
                                    • You must be focused on the camera
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="w-full space-y-3 pt-6">
                        {capturedPhoto ? (
                            <>
                                <TouchableOpacity
                                    onPress={handleSubmit}
                                    className="w-full bg-[#D30309] rounded-full py-5 px-2 flex flex-row justify-center items-center"
                                >
                                    <Text className="text-[1.1rem] font-bold text-white">
                                        Complete Registration
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    onPress={handleRetakePhoto}
                                    className="w-full bg-gray-200 mt-2 rounded-full py-4 px-2 flex flex-row justify-center items-center"
                                >
                                    <Text className="text-[1rem] font-medium text-gray-700">
                                        Retake Photo
                                    </Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity
                                onPress={handlePhotoCapture}
                                disabled={isCapturing}
                                className={`w-full rounded-full py-5 px-2 flex flex-row justify-center items-center ${
                                    isCapturing ? 'bg-gray-300' : 'bg-[#D30309]'
                                }`}
                            >
                                <Text className={`text-[1.1rem] font-bold ${
                                    isCapturing ? 'text-gray-500' : 'text-white'
                                }`}>
                                    {isCapturing ? 'Capturing...' : 'Capture Photo'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Step4
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    StatusBar,
    Image,
    ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { sellerRoutes } from '@/constants/routes';
import UserAuthHeader from '@/components/UserAuthHeader';
import ProgressBar from '@/components/ProgressBar';
import HeaderAndDescTextCenter from '@/components/HeaderAndDescTextCenter';
import CustomButton from '@/components/CustomButton';
import CustomAlert from '@/components/CustomAlert';

export default function SellerStep4() {
    const params = useLocalSearchParams();
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'success' as 'success' | 'error' | 'warning' | 'info',
    });

    const handleTakePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Camera permission is required to take a photo.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setCapturedPhoto(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to take photo. Please try again.');
        }
    };

    const handleSubmit = async () => {
        if (!capturedPhoto) {
            setAlertConfig({
                title: 'Photo Required',
                message: 'Please take a live photo before proceeding.',
                type: 'error',
            });
            setShowAlert(true);
            return;
        }

        setIsSubmitting(true);

        try {
            // Helper function to handle image upload if it's a local URI
            const getFileObject = (uri: string, type: string) => {
                if (!uri) return null;
                // If it's already a URL, we don't need to wrap it as a file object
                if (uri.startsWith('http')) return uri;
                
                return {
                    uri,
                    name: `${type}_${Date.now()}.jpg`,
                    type: 'image/jpeg'
                } as any;
            };

            const cacDocumentFile = getFileObject(params.cacDocumentUri as string, 'cac');
            const selfieFile = getFileObject(capturedPhoto, 'selfie');

            const token = await AsyncStorage.getItem('auth_token');

            const formData = new FormData();
            formData.append('requestType', 'inbound');
            formData.append('location', params.state as string);
            formData.append('lga', params.lga as string);
            formData.append('cac_number', params.cacNumber as string);

            // Append Files (now as file objects or existing URLs)
            if (cacDocumentFile) formData.append('cac_document', cacDocumentFile);
            if (selfieFile) formData.append('selfie', selfieFile);

            // Use direct fetch to bypass axios interceptor that converts FormData to JSON
            const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/register/step/4/`, {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'X-Api-Key': process.env.EXPO_PUBLIC_API_KEY || '',
                    // Don't set Content-Type - let browser set it for FormData
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorData}`);
            }

            const responseData = await response.json();

            // Navigate to Step 5
        router.push({
            pathname: sellerRoutes.step5,
            params: {
                ...params,
                    profilePhoto: capturedPhoto,
                },
            });
        } catch (error: any) {

            setAlertConfig({
                title: 'Registration Error',
                message: error.response?.data?.message || error.message || 'An error occurred. Please try again.',
                type: 'error',
            });
            setShowAlert(true);

            setTimeout(() => {
                setShowAlert(false);
            }, 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                    text1="Upload your live photo"
                    containerStyle="!px-0 !pb-8"
                />

                {/* Photo Capture Area */}
                <View className="items-center space-y-6">
                    <TouchableOpacity
                        onPress={handleTakePhoto}
                        className="w-48 h-48 bg-gray-100 rounded-full items-center justify-center border-2 border-dashed border-gray-300"
                    >
                        {capturedPhoto ? (
                                <Image
                                    source={{ uri: capturedPhoto }}
                                className="w-full h-full rounded-full"
                                    resizeMode="cover"
                                />
                        ) : (
                            <View className="items-center">
                                <Text className="text-6xl mb-2">📷</Text>
                                <Text className="text-gray-500 text-center">
                                    Tap to take{'\n'}your photo
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <Text className="text-gray-600 text-center text-sm mt-4">
                        Make sure your face is clearly visible and well-lit
                                </Text>
                    </View>

                {/* Submit Button */}
                <View className="mt-8">
                    <CustomButton
                        title={isSubmitting ? 'Submitting...' : 'Continue'}
                                    onPress={handleSubmit}
                        disabled={!capturedPhoto || isSubmitting}
                        loading={isSubmitting}
                    />
                </View>

                {/* Retake Button */}
                {capturedPhoto && (
                    // <View className="mt-4">
                    //     <TouchableOpacity
                    //         onPress={() => setCapturedPhoto(null)}
                    //         className="py-3 px-6 rounded-xl items-center border border-gray-300"
                    //     >
                    //         <Text className="text-gray-600 font-medium">Retake Photo</Text>
                    //     </TouchableOpacity>
                    // </View>
                    <CustomButton
                    title={'Retake Photo'}
                        onPress={() => setCapturedPhoto(null)}
                        loading={false}
                        bgVariant="outline"
                        textVariant="outline"
                        className="mt-4"
                />
                )}
            </View>

            {/* Alert Modal */}
            <CustomAlert
                visible={showAlert}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setShowAlert(false)}
            />
        </SafeAreaView>
    );
}
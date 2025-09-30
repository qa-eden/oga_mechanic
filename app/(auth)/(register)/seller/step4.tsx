import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Image,
  Alert,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { CameraIcon, CheckIcon } from 'react-native-heroicons/outline';
import { sellerRoutes } from '@/constants/routes';
import UserAuthHeader from '@/components/UserAuthHeader';
import ProgressBar from '@/components/ProgressBar';
import HeaderAndDescTextCenter from '@/components/HeaderAndDescTextCenter';
import { userAPI } from '@/lib/api/user';
import CustomAlert from '@/components/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Step4 = () => {
  const params = useLocalSearchParams();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'error' as 'success' | 'error' | 'warning' | 'info',
  });

    const handlePhotoCapture = async () => {
        try {
      setIsCapturing(true);
            
            // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is required to take your photo');
        return;
            }

            // Launch camera
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
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
        } finally {
      setIsCapturing(false);
    }
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
  };

  const handleSubmit = async () => {
    if (!capturedPhoto) {
      setAlertConfig({
        title: 'Photo Required',
        message: 'Please capture your photo to continue',
        type: 'error',
      });
      setShowAlert(true);
      return;
    }

    if (isSubmitting) {
      console.log('⚠️ Already submitting, ignoring');
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate parameters
      if (!params.state || !params.lga || !params.cacNumber || !params.cacDocumentUri) {
        throw new Error('Missing required business details');
      }

      // Validate file existence and size
      const validateFile = async (uri: string, name: string) => {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
          throw new Error(`File not found: ${name}`);
        }
        if (fileInfo.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error(`${name} file is too large (max 5MB)`);
        }
        return uri;
      };

      const cacDocumentUri = await validateFile(params.cacDocumentUri as string, 'CAC Document');
      const selfieUri = await validateFile(capturedPhoto, 'Selfie');

      // Normalize URIs for platform
      const normalizeUri = (uri: string) => {
        if (Platform.OS === 'ios' && !uri.startsWith('file://')) {
          return `file://${uri}`;
        }
        return uri;
      };

      // Determine MIME type dynamically
      const getMimeType = (uri: string) => {
        if (uri.endsWith('.pdf')) return 'application/pdf';
        if (uri.endsWith('.jpg') || uri.endsWith('.jpeg')) return 'image/jpeg';
        if (uri.endsWith('.png')) return 'image/png';
        return 'application/octet-stream';
      };

      // Log file details for debugging
      console.log('📋 File details:');
      console.log('CAC Document URI:', normalizeUri(cacDocumentUri));
      console.log('Selfie URI:', normalizeUri(selfieUri));

      // Use your friend's proven method for file upload
      console.log('🚀 Using proven file upload method...');
      
      const token = await AsyncStorage.getItem('auth_token');
      
      // Create FormData exactly like your friend's approach
      const formData = new FormData();
      
      // Add ALL required fields to FormData
      formData.append('location', params.state as string);
      formData.append('lga', params.lga as string);
      formData.append('cac_number', params.cacNumber as string);
      formData.append('requestType', 'inbound');
      
      console.log('📋 Text fields added:', {
        location: params.state,
        lga: params.lga,
        cac_number: params.cacNumber,
        requestType: 'inbound'
      });
      
      // Add files using your friend's exact format
      formData.append('cac_document', {
        uri: normalizeUri(cacDocumentUri),
        name: `cac_document_${Date.now()}.jpg`,
        type: 'image/jpeg'
      } as any);
      
      formData.append('selfie', {
        uri: normalizeUri(selfieUri),
        name: `selfie_${Date.now()}.jpg`,
        type: 'image/jpeg'
      } as any);
      
      console.log('📋 Complete FormData _parts:', (formData as any)._parts);
      console.log('📋 FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}:`, typeof value === 'object' ? JSON.stringify(value) : value);
      }
      
      console.log('🚀 Sending complete payload to:', `${process.env.EXPO_PUBLIC_API_URL}/register/step/4/`);
      console.log('🔑 Authorization token:', token ? 'Present' : 'Missing');
      
      // Use fetch exactly like your friend's approach
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/register/step/4/`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ Upload success:', responseData);

      // Navigate to Step 5
        router.push({
            pathname: sellerRoutes.step5,
            params: {
                ...params,
          profilePhoto: capturedPhoto,
        },
      });
    } catch (error: any) {
      console.error('❌ Error in handleSubmit:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      setAlertConfig({
        title: 'Registration Error',
        message: error.response?.data?.message || error.message || 'An error occurred. Please try again.',
        type: 'error',
      });
      setShowAlert(true);

      // Auto-hide alert after 5 seconds
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
            <Text className="text-lg font-NunitoMedium text-gray-800">Strike a Pose</Text>
                        <View className="bg-gray-50 rounded-xl p-4 w-full">
                            <Text className="text-sm font-NunitoMedium text-gray-700 mb-2">
                                To verify successfully:
                            </Text>
                            <View className="space-y-1">
                <Text className="text-sm text-gray-600">• Your face must be clearly visible</Text>
                <Text className="text-sm text-gray-600">• You must be focused on the camera</Text>
                            </View>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="w-full space-y-3 pt-6">
                        {capturedPhoto ? (
                            <>
                                <TouchableOpacity
                                    onPress={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full rounded-full py-5 px-2 flex flex-row justify-center items-center ${
                    isSubmitting ? 'bg-gray-300' : 'bg-[#D30309]'
                  }`}
                >
                  <Text
                    className={`text-[1.1rem] font-bold ${
                      isSubmitting ? 'text-gray-500' : 'text-white'
                    }`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleRetakePhoto}
                                    className="w-full bg-gray-200 mt-2 rounded-full py-4 px-2 flex flex-row justify-center items-center"
                                >
                  <Text className="text-[1rem] font-medium text-gray-700">Retake Photo</Text>
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
                <Text
                  className={`text-[1.1rem] font-bold ${
                                    isCapturing ? 'text-gray-500' : 'text-white'
                  }`}
                >
                                    {isCapturing ? 'Capturing...' : 'Capture Photo'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>

      {/* Error Alert Modal */}
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setShowAlert(false)}
      />
        </SafeAreaView>
  );
};

export default Step4;
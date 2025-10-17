import React, { useState, useMemo } from 'react'
import {
    View,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { router, useLocalSearchParams } from 'expo-router'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { routes, sellerRoutes } from '@/constants/routes'
import FormikInput from '@/components/forms/FormikInput'
import AddressInput from '@/components/forms/AddressInput'
import ImageUpload from '@/components/ImageUpload'
import UserAuthHeader from '@/components/UserAuthHeader'
import ProgressBar from '@/components/ProgressBar'
import HeaderAndDescTextCenter from '@/components/HeaderAndDescTextCenter'
import FormikButton from '@/components/forms/FormikButton'
import AuthNavigateLink from '@/components/AuthNavigateLink'
import SelectField from '@/components/forms/SelectField'
import { userAPI } from '@/lib/api/user'
import CustomAlert from '@/components/CustomAlert'
import { getStates, getLGAs } from '@/constants/nigeriaData'

// Validation schema
const validationSchema = Yup.object().shape({
    state: Yup.string()
        .trim()
        .required('State is required'),
    lga: Yup.string()
        .trim()
        .required('LGA is required'),
    address: Yup.string()
        .trim()
        .required('Address is required')
        .min(10, 'Address must be at least 10 characters'),
    cacNumber: Yup.string()
        .trim()
        .required('CAC number is required')
        .min(5, 'CAC number must be at least 5 characters'),
    cacDocument: Yup.mixed()
        .nullable()
        .required('CAC document is required')
})

const Step3 = () => {
    const params = useLocalSearchParams()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        type: 'error' as 'success' | 'error' | 'warning' | 'info'
    })

    // Get Nigerian states and create options
    const stateOptions = useMemo(() => {
        const states = getStates()
        return states.map((state: string) => ({
            label: state,
            value: state
        }))
    }, [])

    // Get LGAs for selected state
    const getLGAOptions = (selectedState: string) => {
        if (!selectedState) return []
        const lgas = getLGAs(selectedState)
        return lgas.map((lga: string) => ({
            label: lga,
            value: lga
        }))
    }

    const initialValues = {
        country: 'Nigeria',
        state: '',
        lga: '',
        address: '',
        cacNumber: '',
        cacDocument: null as any
    }

    const handleSubmit = async (values: typeof initialValues) => {
        
        // Prevent multiple submissions
        if (isSubmitting) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            
            // Just navigate to next step without API call
            // API call will be made in step 4 with both CAC document and selfie
            const navigationParams = {
                ...params,
                // Pass individual values to avoid object serialization issues
                state: values.state,
                lga: values.lga,
                address: values.address,
                cacNumber: values.cacNumber,
                // Only pass the URI string, not the entire object
                cacDocumentUri: values.cacDocument?.uri || values.cacDocument?.path || null
            };
            
            
            router.push({
                pathname: sellerRoutes.step4,
                params: navigationParams
            });
            
        } catch (error: any) {
            setIsSubmitting(false);
            
            // Show error alert
            setAlertConfig({
                title: 'Navigation Error',
                message: 'Unable to proceed to next step. Please try again.',
                type: 'error'
            });
            setShowAlert(true);
            
            // Auto-hide error after 3 seconds
            setTimeout(() => {
                setShowAlert(false);
            }, 3000);
        }
    }

    const handleDocumentUpload = async (setFieldValue: any) => {
        Alert.alert(
            'Upload CAC Document',
            'Choose how you want to upload your CAC document',
            [
                {
                    text: 'Camera',
                    onPress: async () => {
                        try {
                            // Request camera permissions
                            const { status } = await ImagePicker.requestCameraPermissionsAsync()
                            if (status !== 'granted') {
                                Alert.alert('Permission Required', 'Camera permission is required to take photos')
                                return
                            }

                            // Launch camera
                            const result = await ImagePicker.launchCameraAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: true,
                                aspect: [4, 3],
                                quality: 0.8,
                            })

                            if (!result.canceled && result.assets[0]) {
                                const asset = result.assets[0]
                                setFieldValue('cacDocument', {
                                    uri: asset.uri,
                                    name: `cac_document_${Date.now()}.jpg`,
                                    type: 'image/jpeg',
                                    size: asset.fileSize || 0
                                })
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to take photo. Please try again.')
                        }
                    }
                },
                {
                    text: 'Gallery',
                    onPress: async () => {
                        try {
                            // Request media library permissions
                            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
                            if (status !== 'granted') {
                                Alert.alert('Permission Required', 'Gallery permission is required to select photos')
                                return
                            }

                            // Launch image picker
                            const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                allowsEditing: true,
                                aspect: [4, 3],
                                quality: 0.8,
                            })

                            if (!result.canceled && result.assets[0]) {
                                const asset = result.assets[0]
                                setFieldValue('cacDocument', {
                                    uri: asset.uri,
                                    name: `cac_document_${Date.now()}.jpg`,
                                    type: 'image/jpeg',
                                    size: asset.fileSize || 0
                                })
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to select photo. Please try again.')
                        }
                    }
                },
                {
                    text: 'Files',
                    onPress: async () => {
                        try {
                            // Launch document picker
                            const result = await DocumentPicker.getDocumentAsync({
                                type: ['application/pdf', 'image/jpeg', 'image/png'],
                                copyToCacheDirectory: true,
                            })

                            if (!result.canceled && result.assets[0]) {
                                const asset = result.assets[0]
                                setFieldValue('cacDocument', {
                                    uri: asset.uri,
                                    name: asset.name,
                                    type: asset.mimeType || 'application/pdf',
                                    size: asset.size || 0
                                })
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to select document. Please try again.')
                        }
                    }
                },
                { text: 'Cancel', style: 'cancel' }
            ]
        )
    }


  return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View className="px-6 py-2">
                        <UserAuthHeader />

                        <View className="py-4">
                            <ProgressBar step={3} totalSteps={5} />
                        </View>
                    </View>

                    {/* Main Content */}
                    <View className="px-6 flex-1">
                        <HeaderAndDescTextCenter
                            header="Add other details"
                            text1="Kindly input your other details to continue"
                            containerStyle="!px-0 !pb-2"
                        />

                        {/* Formik Form */}
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ handleSubmit: formikHandleSubmit, isValid, dirty, setFieldValue, values, errors, touched }) => {
                                
                                return (
                                <View className="space-y-6">
                                    {/* State Select */}
                                    <SelectField
                                        name="state"
                                        label="State"
                                        placeholder="Select state"
                                        options={stateOptions}
                                        value={values.state}
                                        onValueChange={(value) => {
                                            setFieldValue('state', value)
                                            setFieldValue('lga', '') // Reset LGA when state changes
                                        }}
                                        error={errors.state}
                                        touched={touched.state}
                                        required
                                    />

                                    {/* LGA Select */}
                                    <SelectField
                                        name="lga"
                                        label="LGA"
                                        placeholder={values.state ? "Select local government area" : "Select state first"}
                                        options={getLGAOptions(values.state)}
                                        value={values.lga}
                                        onValueChange={(value) => setFieldValue('lga', value)}
                                        error={errors.lga}
                                        touched={touched.lga}
                                        required
                                    />

                                    {/* Address */}
                                    <AddressInput
                                        label="Address"
                                        placeholder="Enter your business address"
                                        value={values.address}
                                        onChangeText={(text) => setFieldValue('address', text)}
                                        error={errors.address}
                                        touched={touched.address}
                                        required
                                    />

                                    {/* CAC Number */}
                                    <FormikInput
                                        name="cacNumber"
                                        label="CAC number"
                                        placeholder="Enter your CAC number"
                                        type="text"
                                    />

                                    {/* CAC Document Upload */}
                                    <ImageUpload
                                        label="CAC document"
                                        isUploaded={!!values.cacDocument}
                                        onPress={() => handleDocumentUpload(setFieldValue)}
                                        uploadedText="CAC Document Uploaded"
                                        maxFileSize="15 MB"
                                        required
                                        imageUri={values.cacDocument?.uri}
                                    />

                                    {/* Bottom Actions */}
                                    <View className="pt-6">
                                        <FormikButton
                                            title={isSubmitting ? "Processing..." : "Proceed"}
                                            type="submit"
                                            onPress={() => formikHandleSubmit()}
                                            disabled={!isValid || !dirty || isSubmitting}
                                            loading={isSubmitting}
                                            loadingText="Processing..."
                                        />

                                        <AuthNavigateLink
                                            onPress={() => router.push(routes.signIn)}
                                            text="Already have an account?"
                                            textLink="Sign in"
                                            containerClassName="mt-4"
                                        />
                                    </View>

                                </View>
                                )
                            }}
                        </Formik>
    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            
            {/* Error Alert Modal */}
            <CustomAlert
                visible={showAlert}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setShowAlert(false)}
            />
        </SafeAreaView>
  )
}

export default Step3
import React, { useState } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { router, useLocalSearchParams } from 'expo-router'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { Country } from 'react-native-country-picker-modal'
import { routes, sellerRoutes } from '@/constants/routes'
import FormikInput from '@/components/forms/FormikInput'
import AddressInput from '@/components/forms/AddressInput'
import ImageUpload from '@/components/ImageUpload'
import UserAuthHeader from '@/components/UserAuthHeader'
import ProgressBar from '@/components/ProgressBar'
import HeaderAndDescTextCenter from '@/components/HeaderAndDescTextCenter'
import FormikButton from '@/components/forms/FormikButton'
import AuthNavigateLink from '@/components/AuthNavigateLink'
import CountryStatePicker from '@/components/CountryStatePicker'
import LGAPicker from '@/components/LGAPicker'

// Validation schema
const validationSchema = Yup.object().shape({
    country: Yup.string()
        .trim()
        .required('Country is required'),
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
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
    const [selectedState, setSelectedState] = useState('')
    const [selectedLGA, setSelectedLGA] = useState('')
    const [showCountryPicker, setShowCountryPicker] = useState(false)
    const [showStatePicker, setShowStatePicker] = useState(false)
    const [showLGAPicker, setShowLGAPicker] = useState(false)

    const initialValues = {
        country: '',
        state: '',
        lga: '',
        address: '',
        cacNumber: '',
        cacDocument: null as any
    }

    const handleSubmit = (values: typeof initialValues) => {
        // Navigate to next step with all form data
        console.log('Step 3 submitted with values:', values)
        console.log('Previous step data:', params)
        router.push({
            pathname: sellerRoutes.step4,
            params: {
                ...params,
                ...values
            }
        })
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
                            console.error('Camera error:', error)
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
                            console.error('Gallery error:', error)
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
                            console.error('Document picker error:', error)
                            Alert.alert('Error', 'Failed to select document. Please try again.')
                        }
                    }
                },
                { text: 'Cancel', style: 'cancel' }
            ]
        )
    }

    const handleCountryChange = (country: Country, setFieldValue?: (field: string, value: any) => void) => {
        setSelectedCountry(country)
        setSelectedState('') // Reset state when country changes
        setSelectedLGA('') // Reset LGA when country changes
        if (setFieldValue) {
            setFieldValue('country', country.name)
            setFieldValue('state', '')
            setFieldValue('lga', '')
        }
    }

    const handleStateChange = (state: string, setFieldValue?: (field: string, value: any) => void) => {
        setSelectedState(state)
        setSelectedLGA('') // Reset LGA when state changes
        if (setFieldValue) {
            setFieldValue('state', state)
            setFieldValue('lga', '')
        }
    }

    const handleLGAChange = (lga: string, setFieldValue?: (field: string, value: any) => void) => {
        setSelectedLGA(lga)
        if (setFieldValue) {
            setFieldValue('lga', lga)
        }
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
                                // Debug form state
                                console.log('Form state:', { isValid, dirty, values, errors })
                                return (
                                <View className="space-y-6">
                                    {/* Country Picker */}
                                    <View>
                                        <Text className="text-sm font-NunitoMedium text-gray-700 mb-2">
                                            Country
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => setShowCountryPicker(true)}
                                            className="w-full px-4 py-4 bg-gray-100 rounded-xl border border-gray-200 flex-row items-center justify-between"
                                        >
                                            <Text className={`text-base font-NunitoMedium ${
                                                values.country ? 'text-gray-900' : 'text-gray-500'
                                            }`}>
                                                {values.country || 'Select country'}
                                            </Text>
                                            <Text className="text-gray-400 text-lg">▼</Text>
                                        </TouchableOpacity>
                                        {errors.country && touched.country && (
                                            <Text className="text-red-500 text-sm font-NunitoMedium mt-1">
                                                {String(errors.country)}
                                            </Text>
                                        )}
                                    </View>

                                    {/* State Picker */}
                                    <View>
                                        <Text className="text-sm font-NunitoMedium text-gray-700 mb-2">
                                            State
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => setShowStatePicker(true)}
                                            disabled={!values.country}
                                            className={`w-full px-4 py-4 bg-gray-100 rounded-xl border border-gray-200 flex-row items-center justify-between ${
                                                !values.country ? 'opacity-50' : ''
                                            }`}
                                        >
                                            <Text className={`text-base font-NunitoMedium ${
                                                values.state ? 'text-gray-900' : 'text-gray-500'
                                            }`}>
                                                {values.state || 'Select state'}
                                            </Text>
                                            <Text className="text-gray-400 text-lg">▼</Text>
                                        </TouchableOpacity>
                                        {errors.state && touched.state && (
                                            <Text className="text-red-500 text-sm font-NunitoMedium mt-1">
                                                {String(errors.state)}
                                            </Text>
                                        )}
                                    </View>

                                    {/* LGA Picker */}
    <View>
                                        <Text className="text-sm font-NunitoMedium text-gray-700 mb-2">
                                            LGA
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => setShowLGAPicker(true)}
                                            disabled={!values.state}
                                            className={`w-full px-4 py-4 bg-gray-100 rounded-xl border border-gray-200 flex-row items-center justify-between ${
                                                !values.state ? 'opacity-50' : ''
                                            }`}
                                        >
                                            <Text className={`text-base font-NunitoMedium ${
                                                values.lga ? 'text-gray-900' : 'text-gray-500'
                                            }`}>
                                                {values.lga || 'Select local government area'}
                                            </Text>
                                            <Text className="text-gray-400 text-lg">▼</Text>
                                        </TouchableOpacity>
                                        {errors.lga && touched.lga && (
                                            <Text className="text-red-500 text-sm font-NunitoMedium mt-1">
                                                {String(errors.lga)}
                                            </Text>
                                        )}
                                    </View>

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
                                        <TouchableOpacity
                                            onPress={() => formikHandleSubmit()}
                                            className="w-full bg-[#D30309] rounded-full py-5 px-2 flex flex-row justify-center items-center"
                                        >
                                            <Text className="text-[1.1rem] font-bold text-white">
                                                Proceed
                                            </Text>
                                        </TouchableOpacity>

                                        <AuthNavigateLink
                                            onPress={() => router.push(routes.signIn)}
                                            text="Already have an account?"
                                            textLink="Sign in"
                                            containerClassName="mt-4"
                                        />
                                    </View>

                                    {/* Country State Picker Modal */}
                                    <CountryStatePicker
                                        selectedCountry={selectedCountry}
                                        selectedState={values.state}
                                        onCountryChange={(country) => handleCountryChange(country, setFieldValue)}
                                        onStateChange={(state) => handleStateChange(state, setFieldValue)}
                                        showCountryPicker={showCountryPicker}
                                        showStatePicker={showStatePicker}
                                        onCountryPickerToggle={setShowCountryPicker}
                                        onStatePickerToggle={setShowStatePicker}
                                    />

                                    {/* LGA Picker Modal */}
                                    <LGAPicker
                                        selectedLGA={values.lga}
                                        onLGAChange={(lga) => handleLGAChange(lga, setFieldValue)}
                                        showLGAPicker={showLGAPicker}
                                        onLGAPickerToggle={setShowLGAPicker}
                                        state={values.state}
                                        country={selectedCountry?.cca2}
                                    />
                                </View>
                                )
                            }}
                        </Formik>
    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
  )
}

export default Step3
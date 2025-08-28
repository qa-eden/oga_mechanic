import React, { useState } from 'react'
import { View, Text, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import { useRouter } from 'expo-router'
import CustomButton from '@/components/CustomButton'
import FormikInput from '@/components/forms/FormikInput'
import FormikCheckbox from '@/components/forms/FormikCheckbox'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { ChevronDownIcon, CalendarIcon } from 'react-native-heroicons/outline'
import { icons } from '@/constants'
import UserAuthHeader from '@/components/UserAuthHeader'
import ProgressBar from '@/components/ProgressBar'
import CountryStatePicker from '@/components/CountryStatePicker'
import DatePicker from '@/components/DatePicker'
import { driverRoutes, routes } from '@/constants/routes'
import { Country } from 'react-native-country-picker-modal'
import AuthNavigateLink from '@/components/AuthNavigateLink'

const validationSchema = Yup.object().shape({
    driverName: Yup.string().required('Driver name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
    dateOfBirth: Yup.string().required('Date of birth is required'),
    gender: Yup.string().required('Gender is required'),
    address: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    termsAccepted: Yup.boolean().oneOf([true], 'You must accept terms and conditions'),
})

const Step1 = () => {
    const router = useRouter()
    const [selectedCountry, setSelectedCountry] = useState<Country | null>({
        cca2: 'NG',
        name: 'Nigeria',
        callingCode: ['234'],
        flag: '🇳🇬',
        currency: ['NGN'],
        region: 'Africa',
        subregion: 'Western Africa',
        latlng: [10, 8],
        borders: ['BEN', 'CMR', 'TCD', 'NER'],
        area: 923768,
        population: 206139589,
        timezones: ['UTC+01:00'],
        continents: ['Africa'],
        flags: { png: 'https://flagcdn.com/w320/ng.png', svg: 'https://flagcdn.com/ng.svg' },
        startOfWeek: 'monday',
        capitalInfo: { latlng: [9.08, 7.53] }
    } as Country)
    const [selectedState, setSelectedState] = useState('Lagos')
    const [selectedGender, setSelectedGender] = useState('')
    const [showCountryPicker, setShowCountryPicker] = useState(false)
    const [showStatePicker, setShowStatePicker] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [dateOfBirth, setDateOfBirth] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = (values: any) => {
        router.push(driverRoutes.step2)

        setIsSubmitting(true) // Start loading immediately

        try {
            // Try the router.push method first

            console.log('✅ Navigation successful')
        } catch (error) {
            console.error('❌ Navigation failed:', error)
            // Fallback: try direct navigation
            try {
                router.push('/(auth)/(register)/driver/step2')
                console.log('✅ Fallback navigation successful')
            } catch (fallbackError) {
                console.error('❌ Fallback navigation also failed:', fallbackError)
                setIsSubmitting(false) // Stop loading if navigation fails
            }
        }
    }

    const getCountryCode = (country: Country | null) => {
        return country?.callingCode?.[0] || '+234'
    }

    // Convert country code to flag emoji
    const getCountryFlag = (countryCode: string | undefined) => {
        if (!countryCode) return '🇳🇬'

        // Convert country code to flag emoji using regional indicator symbols
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0))

        return String.fromCodePoint(...codePoints)
    }

    const getPhoneExample = (country: Country | null) => {
        if (!country) return '9069350833'

        // Common phone number examples for different countries
        const phoneExamples: { [key: string]: string } = {
            'NG': '9069350833', // Nigeria
            'US': '5551234567', // USA
            'GB': '7911123456', // UK
            'CA': '4161234567', // Canada
            'IN': '9876543210', // India
            'GH': '244123456',  // Ghana
            'KE': '712123456',  // Kenya
            'ZA': '821234567',  // South Africa
            'AU': '412345678',  // Australia
            'DE': '15123456789', // Germany
            'FR': '612345678',  // France
        }

        return phoneExamples[country.cca2] || 'Enter phone number'
    }

    const handleGenderSelect = (gender: string) => {
        setSelectedGender(gender)
    }

    const currentCountryData = getCountryCode(selectedCountry)

    return (
        <RNSafeAreaView className="flex-1 bg-white" edges={["top"]}>
            <ExpoStatusBar style="dark" />

            <ScrollView className="flex-1 px-6">
                <UserAuthHeader />

                <View className="py-4">
                    <ProgressBar step={1} totalSteps={6} />
                </View>

                {/* Form */}
                <Formik
                    initialValues={{
                        driverName: '',
                        email: '',
                        phone: '',
                        dateOfBirth: '',
                        address: '',
                        city: selectedState,
                        termsAccepted: false,
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ handleSubmit, isValid, values, setFieldValue, setFieldTouched }) => {
                        // Check if all required fields are filled including local state
                        const isFormValid = values.driverName &&
                            values.email &&
                            values.phone &&
                            dateOfBirth &&
                            selectedGender &&
                            values.address &&
                            selectedState &&
                            values.termsAccepted

                        return (
                            <View className=" pt-2 pb-8">
                                {/* Driver Name Field */}
                                <FormikInput
                                    name="driverName"
                                    placeholder="Enter driver name"
                                    label="Driver Name"
                                    required
                                />

                                {/* Email Field */}
                                <FormikInput
                                    name="email"
                                    placeholder="Enter email address"
                                    label="Email Address"
                                    required
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                {/* Address Field */}
                                <FormikInput
                                    name="address"
                                    placeholder="Enter home address"
                                    label="Home Address"
                                    multiline
                                    required
                                    numberOfLines={3}
                                />

                                {/* Phone Field */}
                                <View>
                                    <Text className="text-md font-medium text-gray-700 mb-2">Phone number <Text className="text-red-500 text-lg">*</Text></Text>
                                    <View className="flex-row items-center border border-gray-400 rounded-xl bg-gray-50 mb-4 ">
                                        <TouchableOpacity
                                            onPress={() => setShowCountryPicker(true)}
                                            className="px-2 h-full rounded-l-xl border border-gray-200 flex-row items-center"
                                        >
                                            <Text className="text-2xl mr-2">{getCountryFlag(selectedCountry?.cca2)}</Text>
                                            <Text className="text-gray-900 font-medium mr-2">+{selectedCountry?.callingCode || '234'}</Text>
                                            <ChevronDownIcon size={16} color="gray" />
                                        </TouchableOpacity>
                                        <View className="flex-1 m-0 p-0">
                                            <TextInput
                                                className="flex-1 py-4 px-4 text-base text-gray-900 bg-transparent"
                                                placeholder={getPhoneExample(selectedCountry)}
                                                placeholderTextColor="#9CA3AF"
                                                keyboardType="phone-pad"
                                                value={values.phone}
                                                onChangeText={(text) => setFieldValue('phone', text)}
                                                onBlur={() => setFieldTouched('phone', true)}
                                            />
                                        </View>
                                    </View>
                                </View>

                                {/* Date of Birth Field */}
                                <View>
                                    <Text className="text-sm font-medium text-gray-700 mb-2">Date of Birth <Text className="text-red-500 text-lg">*</Text></Text>
                                    <TouchableOpacity
                                        className="bg-gray-50 border border-gray-400 rounded-xl px-4 py-4 flex-row items-center justify-between"
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <Text className="text-gray-900">{dateOfBirth || 'Select birth of date'}</Text>
                                        <CalendarIcon size={20} color="gray" />
                                    </TouchableOpacity>
                                </View>

                                {/* Gender Selection */}
                                <View className="my-6">
                                    <Text className="text-sm font-medium text-gray-700 mb-3">Select Gender <Text className="text-red-500 text-lg">*</Text></Text>
                                    <View className="flex-row space-x-2 gap-6">
                                        {['Male', 'Female', 'Other'].map((gender) => (
                                            <TouchableOpacity
                                                key={gender}
                                                onPress={() => handleGenderSelect(gender)}
                                                className={`flex-row items-center ${selectedGender === gender ? 'opacity-100' : 'opacity-50'}`}
                                            >
                                                <View className={`w-6 h-6 rounded-full border-2 mr-2 ${selectedGender === gender ? 'border-red-500 bg-primary-500' : 'border-gray-400'
                                                    }`}>
                                                    {selectedGender === gender && (
                                                        <View className="w-4 h-4 bg-white rounded-full m-0.5" />
                                                    )}
                                                </View>
                                                <Text className="text-gray-900 text-lg font-medium">{gender}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                {/* State/Province Field */}
                                <View>
                                    <Text className="text-sm font-medium text-gray-700 mb-2">State/Province <Text className="text-red-500 text-lg">*</Text></Text>
                                    <TouchableOpacity
                                        className="bg-gray-50 border border-gray-400 rounded-xl px-4 py-4 flex-row items-center justify-between"
                                        onPress={() => setShowStatePicker(true)}
                                    >
                                        <Text className={`text-gray-900 font-medium ${!selectedState ? 'text-gray-400' : ''}`}>
                                            {selectedState || 'Select state/province'}
                                        </Text>
                                        <ChevronDownIcon size={16} color="gray" />
                                    </TouchableOpacity>
                                </View>

                                {/* Terms and Conditions */}
                                <View className="mt-6 flex flex-row items-center justify-center px-6">
                                    <FormikCheckbox
                                        name="termsAccepted"
                                        label=""
                                    />
                                    <Text className="text-gray-600 text-sm mt-2">
                                        By registering you accept our <Text className="text-red-500 font-semibold">Terms and Conditions</Text>, and <Text className="text-red-500 font-semibold">Privacy Policy</Text> on this platform.
                                    </Text>
                                </View>

                                {/* Submit Button */}
                                <View className="my-8">
                                    <CustomButton
                                        title={isSubmitting ? "Processing..." : "Get OTP"}
                                        onPress={() => { handleSubmit(); router.push(driverRoutes.step2) }}
                                        disabled={!isFormValid || isSubmitting}
                                        className="py-5"
                                        loading={isSubmitting}
                                    />
                                </View>

                                <AuthNavigateLink
                                    onPress={() => router?.push(routes?.signIn)}
                                    text="Already have an account?"
                                    textLink="Sign In"
                                    containerClassName="mb-6"
                                />
                            </View>
                        )
                    }}
                </Formik>
            </ScrollView>

            {/* Country and State Picker */}
            <CountryStatePicker
                selectedCountry={selectedCountry}
                selectedState={selectedState}
                onCountryChange={setSelectedCountry}
                onStateChange={setSelectedState}
                showCountryPicker={showCountryPicker}
                showStatePicker={showStatePicker}
                onCountryPickerToggle={setShowCountryPicker}
                onStatePickerToggle={setShowStatePicker}
            />

            {/* Date Picker Modal */}
            <DatePicker
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                onDateSelect={(date) => {
                    setDateOfBirth(date);
                }}
                selectedDate={dateOfBirth}
                title="Select Date of Birth"
            />
        </RNSafeAreaView>
    )
}

export default Step1
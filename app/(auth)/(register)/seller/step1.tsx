import React from 'react'
import {
    View,
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native'
import { router } from 'expo-router'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { routes, sellerRoutes } from '@/constants/routes'
import FormikInput from '@/components/forms/FormikInput'
import UserAuthHeader from '@/components/UserAuthHeader'
import ProgressBar from '@/components/ProgressBar'
import HeaderAndDescTextCenter from '@/components/HeaderAndDescTextCenter'
import FormikButton from '@/components/forms/FormikButton'
import AuthNavigateLink from '@/components/AuthNavigateLink'

// Validation schema
const validationSchema = Yup.object().shape({
    firstName: Yup.string()
        .trim()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters'),
    lastName: Yup.string()
        .trim()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters'),
    email: Yup.string()
        .trim()
        .required('Email is required')
        .email('Please enter a valid email'),
    phoneNumber: Yup.string()
        .trim()
        .required('Phone number is required')
        .matches(/^[0-9+\-\s()]+$/, 'Please enter a valid phone number')
        .min(10, 'Phone number must be at least 10 digits')
})

const Step1 = () => {
    const initialValues = {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: ''
    }

    const handleSubmit = (values: typeof initialValues) => {
        // Navigate to next step with form data
        console.log('Form submitted with values:', values)
        router.push({
            pathname: sellerRoutes.step2,
            params: {
                email: values.email,
                firstName: values.firstName,
                lastName: values.lastName,
                phoneNumber: values.phoneNumber
            }
        })
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
                            <ProgressBar step={1} totalSteps={5} />
                        </View>

                    </View>

                    {/* Main Content */}
                    <View className="px-6 flex-1">


                        <HeaderAndDescTextCenter
                            header="Personal details"
                            text1="Kindly input your personal details to continue"
                            containerStyle="!px-0 !pb-2"
                        />

                        {/* Formik Form */}
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ handleSubmit: formikHandleSubmit, isValid, dirty }) => (
                                <View className="space-y-6">
                                    {/* First Name */}
                                    <FormikInput
                                        name="firstName"
                                        label="First Name"
                                        placeholder="Enter your first name"
                                        type="text"
                                    />

                                    {/* Last Name */}
                                    <FormikInput
                                        name="lastName"
                                        label="Last Name"
                                        placeholder="Enter your last name"
                                        type="text"
                                    />

                                    {/* Email */}
                                    <FormikInput
                                        name="email"
                                        label="Email address"
                                        placeholder="Enter your email address"
                                        type="email"
                                    />

                                    {/* Phone Number */}
                                    <FormikInput
                                        name="phoneNumber"
                                        label="Phone number"
                                        placeholder="Enter your phone number"
                                        type="phone"
                                    />

                                    {/* Bottom Actions */}
                                    <View className="pt-6">

                                        <FormikButton
                                            title="Proceed"
                                            type="submit"
                                            onPress={() => formikHandleSubmit()}
                                            disabled={!isValid || !dirty}
                                            loading={false}
                                        />

                                        <AuthNavigateLink
                                            onPress={() => router.push(routes.signIn)}
                                            text="Already have account an account?"
                                            textLink="Sign in"
                                            containerClassName="mt-4"
                                        />
                                    </View>
                                </View>
                            )}
                        </Formik>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

export default Step1
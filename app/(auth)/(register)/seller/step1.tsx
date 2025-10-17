import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
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
import { userAPI } from '@/lib/api/user'
import CustomAlert from '@/components/CustomAlert'

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
    // Initialize state with proper typing
    const [showAlert, setShowAlert] = useState<boolean>(false)
    const [alertConfig, setAlertConfig] = useState<{
        title: string;
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
    }>({
        title: '',
        message: '',
        type: 'error'
    })

    // Direct API call instead of hook to avoid React issues
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

    // Reset any stuck states on component mount
    useEffect(() => {
        
        // Reset states
        setShowAlert(false);
        setIsSubmitting(false);
        
        return () => {
            setShowAlert(false);
            setIsSubmitting(false);
        };
    }, []);

    const initialValues = {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: ''
    }

    const handleSubmit = async (values: typeof initialValues, { setSubmitting }: any) => {
        
        // Prevent multiple submissions
        if (isSubmitting) {
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const response = await userAPI.registerStep(2, {
                email: values.email.trim(),
                first_name: values.firstName.trim(),
                last_name: values.lastName.trim(),
                phone_number: values.phoneNumber.trim(),
                // role_id: 3 // Seller role ID
            });
            
            setSubmitting(false);
            setIsSubmitting(false);
            
            // Navigate to next step
            router.push({
                pathname: sellerRoutes.step2,
                params: {
                    email: values.email,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    phoneNumber: values.phoneNumber,
                    sessionId: response.sessionId || response.session_id
                }
            });
            
        } catch (error: any) {
            setSubmitting(false);
            setIsSubmitting(false);
            
            // Extract error message from API response
            let errorMessage = 'An error occurred. Please try again.';
            
            if (error?.response?.data?.errors) {
                const errors = error.response.data.errors;
                if (errors.email && errors.email.length > 0) {
                    errorMessage = errors.email[0];
                } else if (errors.first_name && errors.first_name.length > 0) {
                    errorMessage = errors.first_name[0];
                } else if (errors.last_name && errors.last_name.length > 0) {
                    errorMessage = errors.last_name[0];
                } else if (errors.phone_number && errors.phone_number.length > 0) {
                    errorMessage = errors.phone_number[0];
                } else if (errors.message) {
                    errorMessage = errors.message;
                }
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }
            
            // Show error alert
            setAlertConfig({
                title: 'Registration Error',
                message: errorMessage,
                type: 'error'
            });
            setShowAlert(true);
            
            // Auto-hide error after 3 seconds
            setTimeout(() => {
                setShowAlert(false);
            }, 3000);
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
                            {({ handleSubmit: formikHandleSubmit, isValid, dirty, isSubmitting }) => (
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
                                            title={isSubmitting ? "Processing..." : "Proceed"}
                                            type="submit"
                                            onPress={() => {
                                                formikHandleSubmit();
                                            }}
                                            disabled={!isValid || !dirty || isSubmitting}
                                            loading={isSubmitting}
                                            loadingText="Processing..."
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

export default Step1
import React, { useState } from 'react'
import { View, Text, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import { useRouter, useLocalSearchParams } from 'expo-router'
import CustomButton from '@/components/CustomButton'
import BackArrowBtn from '@/components/BackArrowBtn'
import { Formik } from 'formik'
import * as Yup from 'yup'
import UserAuthHeader from '@/components/UserAuthHeader'
import ProgressBar from '@/components/ProgressBar'
import AuthNavigateLink from '@/components/AuthNavigateLink'
import { driverRoutes, routes } from '@/constants/routes'
import FormikInput from '@/components/forms/FormikInput'
import SuccessModal from '@/components/SuccessModal'

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
})

const Step7 = () => {
  const router = useRouter()
  const params = useLocalSearchParams()
  const userType = params.type as string || 'driver'
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleSubmit = (values: any) => {
    try {
      console.log('Password Setup:', { password: values.password, confirmPassword: values.confirmPassword })
      setShowSuccessModal(true)
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error)
    }
  }

  const handleModalClose = () => {
    setShowSuccessModal(false)
    // Navigate to sign-in page with user type parameter
    if (router && routes?.signIn) {
      router.replace({
        pathname: routes.signIn,
        params: { userType }
      })
    }
  }

  // Dynamic success message based on user type
  const getSuccessMessage = () => {
    if (userType === 'rider') {
      return "Welcome to Oga Mechanic! Your rider account has been created successfully. You can now start booking transportation services."
    }
    return "Welcome to Oga Mechanic! Your driver account has been created successfully. You can now start providing transportation services."
  }

  return (
    <RNSafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ExpoStatusBar style="dark" />

      <ScrollView className="flex-1 px-4">
        {/* Header with Logo and Progress */}
        <View className="w-full">
          <UserAuthHeader />

          <View className="pt-4 pb-2">
            <ProgressBar step={6} totalSteps={6} />
          </View>
        </View>

        {/* Password Setup Form */}
        <View className="mt-4 px-2">
          <Text className="text-3xl font-bold text-gray-700 text-center mb-2">
            Password
          </Text>
          <Text className="text-lg text-gray-600 text-center mb-8">
            Kindly set up your password
          </Text>

          <Formik
            initialValues={{
              password: '',
              confirmPassword: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ handleSubmit, isValid, values }) => {
              // Check if all required fields are filled
              const isFormValid = React.useMemo(() => {
                try {
                  return !!(
                    values.password &&
                    values.confirmPassword &&
                    values.password === values.confirmPassword
                  )
                } catch (error) {
                  console.error('❌ Error in form validation:', error)
                  return false
                }
              }, [values])

              return (
                <View className="space-y-6">
                  {/* Password Field */}
                  <View>
                    <FormikInput
                      name="password"
                      label="Password"
                      placeholder="Enter your password"
                      type="password"
                      required
                      containerStyle="mb-4"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>

                  {/* Confirm Password Field */}
                  <View>
                    <FormikInput
                      name="confirmPassword"
                      label="Confirm password"
                      placeholder="Confirm your password"
                      type="password"
                      required
                      containerStyle="mb-4"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>


                  <CustomButton
                    title="Create account"
                    onPress={() => {
                      try {
                        handleSubmit()
                      } catch (error) {
                        console.error('❌ Error in button press:', error)
                      }
                    }}
                    disabled={!isFormValid}
                    className="py-5"
                  />

                  {/* Sign In Link */}
                  <View className="my-4">
                    <AuthNavigateLink
                      onPress={() => {
                        try {
                          if (router && routes?.signIn) {
                            router.push(routes.signIn)
                          }
                        } catch (error) {
                          console.error('❌ Error in navigation:', error)
                        }
                      }}
                      text="Already have an account?"
                      textLink="Sign In"
                      containerClassName="mb-6"
                    />
                  </View>
                </View>
              )
            }}
          </Formik>
        </View>
      </ScrollView>
      <SuccessModal 
        visible={showSuccessModal} 
        onClose={handleModalClose}
        header="Account created successfully"
        text={getSuccessMessage()}
        buttonText="Continue to Sign In"
      />
    </RNSafeAreaView>
  )
}

export default Step7

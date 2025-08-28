import React from 'react'
import { View, Text, SafeAreaView, StatusBar, ScrollView } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import { useRouter } from 'expo-router'
import CustomButton from '@/components/CustomButton'
import BackArrowBtn from '@/components/BackArrowBtn'
import FormikInput from '@/components/forms/FormikInput'
import FormikCheckbox from '@/components/forms/FormikCheckbox'
import { Formik } from 'formik'
import * as Yup from 'yup'

const validationSchema = Yup.object().shape({
  emergencyContact: Yup.string().required('Emergency contact is required'),
  emergencyPhone: Yup.string().required('Emergency phone is required'),
  referenceName: Yup.string().required('Reference name is required'),
  referencePhone: Yup.string().required('Reference phone is required'),
  referenceRelationship: Yup.string().required('Reference relationship is required'),
  backgroundCheckConsent: Yup.boolean().oneOf([true], 'You must consent to background check'),
  termsAccepted: Yup.boolean().oneOf([true], 'You must accept terms and conditions'),
})

const Step6 = () => {
  const router = useRouter()

  const handleSubmit = (values: any) => {
    console.log('Background & References:', values)
    router.push('/(auth)/(register)/driver/step7')
  }

  return (
    <RNSafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ExpoStatusBar style="dark" />
      
      <BackArrowBtn text="Go back" className="ml-4 mt-4" />

      <ScrollView className="flex-1 px-6">
        <View className="mt-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Background & References
          </Text>
          <Text className="text-lg text-gray-600 mb-8">
            Help us verify your background
          </Text>

          <Formik
            initialValues={{
              emergencyContact: '',
              emergencyPhone: '',
              referenceName: '',
              referencePhone: '',
              referenceRelationship: '',
              backgroundCheckConsent: false,
              termsAccepted: false,
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ handleSubmit, isValid }) => (
              <View className="space-y-6">
                <Text className="text-lg font-semibold text-gray-800 mb-4">
                  Emergency Contact
                </Text>

                <FormikInput
                  name="emergencyContact"
                  placeholder="Emergency Contact Name"
                  label="Emergency Contact Name"
                />

                <FormikInput
                  name="emergencyPhone"
                  placeholder="Emergency Contact Phone"
                  label="Emergency Contact Phone"
                  keyboardType="phone-pad"
                />

                <Text className="text-lg font-semibold text-gray-800 mb-4 mt-6">
                  Personal Reference
                </Text>

                <FormikInput
                  name="referenceName"
                  placeholder="Reference Name"
                  label="Reference Name"
                />

                <FormikInput
                  name="referencePhone"
                  placeholder="Reference Phone"
                  label="Reference Phone"
                  keyboardType="phone-pad"
                />

                <FormikInput
                  name="referenceRelationship"
                  placeholder="Relationship to you"
                  label="Relationship"
                />

                <View className="space-y-4 mt-6">
                  <FormikCheckbox
                    name="backgroundCheckConsent"
                    label="I consent to a background check and criminal record verification"
                  />

                  <FormikCheckbox
                    name="termsAccepted"
                    label="I accept the terms and conditions and privacy policy"
                  />
                </View>

                <View className="mt-8">
                  <CustomButton
                    title="Continue"
                    onPress={handleSubmit}
                    disabled={!isValid}
                    className="py-5"
                  />
                </View>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </RNSafeAreaView>
  )
}

export default Step6

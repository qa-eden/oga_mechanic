import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context'
import { StatusBar as ExpoStatusBar } from 'expo-status-bar'
import { useRouter } from 'expo-router'
import CustomButton from '@/components/CustomButton'
import FormikInput from '@/components/forms/FormikInput'
import { Formik } from 'formik'
import * as Yup from 'yup'
import UserAuthHeader from '@/components/UserAuthHeader'
import ProgressBar from '@/components/ProgressBar'
import AuthNavigateLink from '@/components/AuthNavigateLink'
import BankPicker from '@/components/BankPicker'
import { driverRoutes, routes } from '@/constants/routes'
import { ChevronDownIcon } from 'react-native-heroicons/outline'

const validationSchema = Yup.object().shape({
  bankName: Yup.string().required('Bank name is required'),
  accountNumber: Yup.string().required('Account number is required'),
})

const Step6 = () => {
  const router = useRouter()
  const [showBankPicker, setShowBankPicker] = useState(false)
  const [selectedBank, setSelectedBank] = useState('')
  const [formikRef, setFormikRef] = useState<any>(null)
  const [setFieldValueCallback, setSetFieldValueCallback] = useState<((field: string, value: any) => void) | null>(null)

  const handleSubmit = (values: any) => {
    try {
      console.log('Bank Details:', values)
      if (router && driverRoutes.step7) {
        router.push(driverRoutes.step7)
      }
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
    }
  }

  const handleBankSelect = (bank: string) => {
    console.log('🔍 handleBankSelect called with:', bank)
    setSelectedBank(bank)
    // Update Formik field value using the callback
    if (setFieldValueCallback) {
      console.log('✅ setFieldValueCallback exists, updating field')
      setFieldValueCallback('bankName', bank)
    } else {
      console.log('❌ setFieldValueCallback is null')
    }
    setShowBankPicker(false)
  }

  return (
    <RNSafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ExpoStatusBar style="dark" />

      <ScrollView className="flex-1 px-4">
        {/* Header with Logo and Progress */}
        <View className="w-full">
          <UserAuthHeader />

          <View className="pt-4 pb-2">
            <ProgressBar step={5} totalSteps={6} />
          </View>
        </View>

        {/* Bank Account Details Form */}
        <View className="mt-4">
          <Text className="text-xl font-medium text-gray-900 mb-2">
            Enter your bank account details
          </Text>

          <Formik
            initialValues={{
              bankName: '',
              accountNumber: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            ref={setFormikRef}
          >
            {({ handleSubmit, isValid, values, setFieldValue, setFieldTouched, errors, touched }) => {
              // Set the callback for bank selection
              React.useEffect(() => {
                setSetFieldValueCallback(() => setFieldValue)
              }, [setFieldValue])

              // Check if all required fields are filled
              const isFormValid = React.useMemo(() => {
                try {
                  return !!(
                    values.bankName &&
                    values.accountNumber
                  );
                } catch (error) {
                  console.error('❌ Error in form validation:', error);
                  return false;
                }
              }, [values]);

              // Update selectedBank when Formik values change
              React.useEffect(() => {
                console.log('🔍 Formik values changed:', values)
                if (values.bankName && values.bankName !== selectedBank) {
                  console.log('✅ Updating selectedBank from Formik:', values.bankName)
                  setSelectedBank(values.bankName)
                }
              }, [values.bankName, selectedBank])

              return (
                <View className="space-y-6">
                  {/* Bank Name Field */}
                  <View className="mb-4 mt-2">
                    <Text className="text-sm font-medium text-gray-700 mb-2">
                      Bank Name <Text className="text-red-500 text-lg">*</Text>
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowBankPicker(true)}
                      className="border border-gray-400 rounded-xl px-4 py-4 bg-white flex-row items-center justify-between"
                    >
                      <Text className={`text-base ${values.bankName ? 'text-gray-900' : 'text-gray-500'}`}>
                        {values.bankName || '-- Select Bank --'}
                      </Text>
                      <ChevronDownIcon size={20} color="#6B7280" />
                    </TouchableOpacity>
                    {errors.bankName && touched.bankName && (
                      <Text className="text-red-500 text-sm mt-1">{errors.bankName}</Text>
                    )}
                  </View>

                  {/* Account Number Field */}
                  <FormikInput
                    name="accountNumber"
                    placeholder="Enter account number"
                    label="Account Number"
                    required
                    keyboardType="numeric"
                  />

                  {/* Proceed Button */}
                  <View className="mt-8">
                    <CustomButton
                      title="Proceed"
                      onPress={() => { 
                        try {
                          handleSubmit(); 
                        } catch (error) {
                        }
                      }}
                      disabled={!isFormValid}
                      className="py-5"
                    />
                  </View>

                  {/* Sign In Link */}
                  <View className="my-4">
                    <AuthNavigateLink
                      onPress={() => {
                        try {
                          if (router && routes?.signIn) {
                            router.push(routes.signIn)
                          }
                        } catch (error) {
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

      {/* Reusable Bank Picker */}
      <BankPicker
        visible={showBankPicker}
        onClose={() => setShowBankPicker(false)}
        onSelectBank={handleBankSelect}
        selectedBank={selectedBank}
        title="Select Bank"
      />
    </RNSafeAreaView>
  )
}

export default Step6

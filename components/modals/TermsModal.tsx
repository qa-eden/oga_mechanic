import React from 'react'
import { View, Text, Modal, ScrollView, TouchableOpacity } from 'react-native'
import { XMarkIcon } from 'react-native-heroicons/outline'
import AndroidNavBarSpacer from '../AndroidNavBarSpacer'

interface TermsModalProps {
  visible: boolean
  onClose: () => void
}

const TermsModal = ({ visible, onClose }: TermsModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-20 bg-white rounded-t-3xl">
          {/* Header */}
          <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">Terms and Conditions</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <XMarkIcon size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView className="flex-1 p-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Welcome to the Oga Mechanic Driver platform.
            </Text>
            
            <Text className="text-base text-gray-700 mb-6 leading-6">
              These Terms and Conditions ("Agreement") govern your use of the Oga Mechanic Driver app and your relationship with Oga Mechanic. By registering and driving with Oga Mechanic, you agree to comply with all terms set forth below.
            </Text>

            {/* Section 1 */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                1. Driver Eligibility and Requirements
              </Text>
              <View className="ml-4 space-y-2">
                <Text className="text-base text-gray-700">• You must meet the minimum age and licensing requirements in your jurisdiction.</Text>
                <Text className="text-base text-gray-700">• You must maintain a valid driver's license, vehicle registration, and insurance as required by law.</Text>
                <Text className="text-base text-gray-700">• You agree to undergo background checks and provide accurate personal information.</Text>
              </View>
            </View>

            {/* Section 2 */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                2. Use of the Platform
              </Text>
              <View className="ml-4 space-y-2">
                <Text className="text-base text-gray-700">• You are an independent contractor, not an employee of Oga Mechanic.</Text>
                <Text className="text-base text-gray-700">• Oga Mechanic provides a platform to connect drivers with riders but does not guarantee any minimum earnings or rides.</Text>
                <Text className="text-base text-gray-700">• You agree to use the app honestly and comply with all applicable laws and Oga Mechanic policies.</Text>
              </View>
            </View>

            {/* Section 3 */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                3. Driver Responsibilities
              </Text>
              <View className="ml-4 space-y-2">
                <Text className="text-base text-gray-700">• Maintain your vehicle in safe and clean condition.</Text>
                <Text className="text-base text-gray-700">• Follow all traffic laws and Oga Mechanic's community guidelines.</Text>
                <Text className="text-base text-gray-700">• Provide professional and courteous service to all riders.</Text>
                <Text className="text-base text-gray-700">• Report any accidents, violations, or incidents promptly to Oga Mechanic.</Text>
              </View>
            </View>

            {/* Section 4 */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                4. Earnings and Payments
              </Text>
              <View className="ml-4 space-y-2">
                <Text className="text-base text-gray-700">• Your earnings will be calculated based on Oga Mechanic's fare structure, which may include base fare, distance, time, surge pricing, and promotions.</Text>
                <Text className="text-base text-gray-700">• Oga Mechanic will deduct a 5% service charge from your total earnings. This amount will be held in your savings wallet on the platform.</Text>
                <Text className="text-base text-gray-700">• The accumulated savings in your wallet can be withdrawn by you at the due time as specified by Oga Mechanic's withdrawal policy.</Text>
                <Text className="text-base text-gray-700">• Payments of your net earnings (after the 5% deduction) will be made to your designated wallet according to Oga Mechanic's payment schedule.</Text>
              </View>
            </View>
          </ScrollView>

          {/* Close Button */}
          <View className="p-6 border-t border-gray-200">
            <TouchableOpacity
              onPress={onClose}
              className="bg-primary-500 py-4 mb-6 px-6 rounded-xl"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-center text-lg">Close</Text>
            </TouchableOpacity>

            {/* Android Navigation Bar Spacer */}
            <AndroidNavBarSpacer />
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default TermsModal

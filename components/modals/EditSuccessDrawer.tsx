import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native'
import { XMarkIcon, CheckCircleIcon, CameraIcon, ArrowRightIcon } from 'react-native-heroicons/outline'
import CustomButton from '../CustomButton'

interface EditSuccessDrawerProps {
  visible: boolean
  onClose: () => void
  onContinueToImages: () => void
  onDone: () => void
  carName?: string
}

const { height: screenHeight } = Dimensions.get('window')

const EditSuccessDrawer: React.FC<EditSuccessDrawerProps> = ({
  visible,
  onClose,
  onContinueToImages,
  onDone,
  carName
}) => {
  const slideAnim = useRef(new Animated.Value(screenHeight)).current
  const backdropAnim = useRef(new Animated.Value(0)).current
  const checkmarkAnim = useRef(new Animated.Value(0)).current
  const contentAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(backdropAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(checkmarkAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(contentAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(checkmarkAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(contentAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start()
    }
  }, [visible])

  const handleContinue = () => {
    onContinueToImages()
    onClose()
  }

  const handleDone = () => {
    onDone()
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            className="absolute inset-0 bg-black/50"
            style={{ opacity: backdropAnim }}
          />
        </TouchableWithoutFeedback>

        {/* Drawer */}
        <Animated.View
          className="bg-white rounded-t-3xl h-[70%]"
          style={{
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Handle */}
          <View className="items-center py-3">
            <View className="w-12 h-1 bg-gray-300 rounded-full" />
          </View>

          {/* Content */}
          <View className="px-6 py-6 flex-1">
            {/* Success Icon */}
            <Animated.View
              className="items-center mb-6"
              style={{
                opacity: checkmarkAnim,
                transform: [{
                  scale: checkmarkAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  })
                }]
              }}
            >
              <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
                <CheckCircleIcon size={48} color="#10B981" />
              </View>
              <Text className="text-2xl font-NunitoBold text-gray-900 text-center">
                Success!
              </Text>
              <Text className="text-base text-gray-600 font-NunitoMedium text-center mt-2">
                Car Details Updated Successfully
              </Text>
            </Animated.View>

            {/* Car Name */}
            {carName && (
              <Animated.View
                className="bg-gray-50 rounded-2xl p-4 mb-6"
                style={{ opacity: contentAnim }}
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-blue-600 font-NunitoBold text-lg">🚗</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-gray-500 font-NunitoMedium">
                      Updated Car
                    </Text>
                    <Text className="text-lg font-NunitoSemiBold text-gray-900">
                      {carName}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Action Buttons */}
            <Animated.View
              className="space-y-3"
              style={{ opacity: contentAnim }}
            >

              <CustomButton
                title="Done"
                bgVariant="outline"
                textVariant="outline"
                className="py-4"
                onPress={handleDone}
              />


              <CustomButton
                title="Continue to Edit Images"
                className="mt-3"
                onPress={handleContinue}
                IconLeft={CameraIcon}
                IconRight={ArrowRightIcon}
              />

            </Animated.View>

            {/* Additional Info */}
            <Animated.View
              className="mt-6 p-4 bg-blue-50 rounded-2xl"
              style={{ opacity: contentAnim }}
            >
              <Text className="text-sm text-blue-800 font-NunitoMedium text-center leading-5">
                💡 <Text className="font-NunitoSemiBold">What's next?</Text>
              </Text>
              <Text className="text-xs text-blue-700 mt-2 text-center">
                You can continue to edit your car images or finish here. Your changes have been saved successfully.
              </Text>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

export default EditSuccessDrawer

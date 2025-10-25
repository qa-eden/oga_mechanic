import React, { useEffect, useRef } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    Image
} from 'react-native'
import { XMarkIcon, TrashIcon, ExclamationTriangleIcon } from 'react-native-heroicons/outline'
import CustomButton from '../CustomButton'
import AndroidNavBarSpacer from '../AndroidNavBarSpacer'

interface DeleteImageDrawalProps {
    visible: boolean
    onClose: () => void
    onConfirm: () => void
    imageUri?: string
    isLoading?: boolean
}

const { height: screenHeight } = Dimensions.get('window')

const DeleteImageDrawal: React.FC<DeleteImageDrawalProps> = ({
    visible,
    onClose,
    onConfirm,
    imageUri,
    isLoading = false
}) => {
    const slideAnim = useRef(new Animated.Value(screenHeight)).current
    const backdropAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        if (visible) {
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
            ]).start()
        }
    }, [visible])

    const handleConfirm = () => {
        onConfirm()
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

                    {/* Header */}
                    <View className="px-6 pb-4 border-b border-gray-100">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
                                    <TrashIcon size={20} color="#DC2626" />
                                </View>
                                <View>
                                    <Text className="text-lg font-NunitoBold text-gray-900">
                                        Delete Image
                                    </Text>
                                    <Text className="text-sm text-gray-500 font-NunitoMedium">
                                        This action cannot be undone
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={onClose}
                                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                            >
                                <XMarkIcon size={16} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Content */}
                    <View className="px-6 py-6 flex-1">
                        {/* Image Preview */}
                        {imageUri && (
                            <View className="items-center mb-6">
                                <View className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-gray-200">
                                    <Image
                                        source={{ uri: imageUri }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                </View>
                                <Text className="text-sm text-gray-600 font-NunitoMedium mt-2">
                                    Preview of image to be deleted
                                </Text>
                            </View>
                        )}

                        {/* Warning Message */}
                        <View className="bg-red-50 rounded-2xl p-4 mb-6">
                            <View className="flex-row items-start">
                                <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center mr-3 mt-0.5">
                                    <ExclamationTriangleIcon size={16} color="#DC2626" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-base font-NunitoSemiBold text-red-800 mb-1">
                                        Are you sure?
                                    </Text>
                                    <Text className="text-sm text-red-700 font-NunitoMedium leading-5">
                                        This image will be permanently deleted from your car listing and cannot be recovered. This action will be immediate.
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View className="space-y-3">
                            <CustomButton
                                IconLeft={TrashIcon}
                                title="Delete Image"
                                loading={isLoading}
                                className="mb-3"
                                onPress={handleConfirm}
                            />

                            <CustomButton
                                disabled={isLoading}
                                title="Cancel"
                                bgVariant="outline"
                                textVariant="outline"
                                className="py-4"
                                onPress={onClose}
                            />

                            {/* Android Navigation Bar Spacer */}
                            <AndroidNavBarSpacer />
                        </View>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    )
}

export default DeleteImageDrawal
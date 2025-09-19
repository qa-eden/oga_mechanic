import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CubeIcon, TruckIcon, TruckIcon as CarIcon } from 'react-native-heroicons/outline'
import { icons } from '@/constants'
import { router } from 'expo-router'
import { sellerRoutes } from '@/constants/routes'

const Product = () => {
  const options = [
    {
      id: 1,
      title: 'Upload Spare Parts',
      icon: <CubeIcon size={24} color="#000" />,
      onPress: () => {
        router.push('/(root)/(screens)/(seller)/(products)/(uploadProducts)/upload-sparePart')
      }
    },
    {
      id: 2,
      title: 'Upload Cars',
      icon: <CarIcon size={24} color="#000" />,
      onPress: () => {
        router.push(sellerRoutes.uploadProducts)
      }
    },
    {
      id: 3,
      title: 'Rent out Cars',
      icon: <TruckIcon size={24} color="#000" />,
      onPress: () => {
        // Handle rent out cars
        console.log('Rent out cars')
      }
    }
  ]

  return (
    <SafeAreaView className="flex-1 bg-gray-100" edges={["top"]}>
      <StatusBar style="dark" />
      
      <View className="flex-1 justify-center px-8">
        <View className="bg-gray-200 rounded-3xl p-6">
          {/* Header Icon */}
          <View className=" mb-4">
            <View className="w-16 h-16 bg-[#FCF3F2] rounded-full items-center justify-center mb-2">
              {/* {icons.productTab({ width: 32, height: 32 })} */}
              <icons.activeProductTab width={32} height={32} />
            </View>
          </View>

          {/* Title and Description */}
          <View className="items-center mb-8">
            <Text className="text-2xl font-NunitoBold text-gray-900 mb-2">
              Choose your Preferred Option
            </Text>
            <Text className="text-gray-600 font-NunitoMedium">
              Select either of the Three to Perform an Action
            </Text>
          </View>

          {/* Options */}
          <View className="space-y-4 gap flex-col ">
            {options.map((option) => (
              <TouchableOpacity
                key={option.id}
                onPress={option.onPress}
                className="bg-white rounded-2xl p-5 mb-4 flex-row items-center shadow-sm"
              >
                {/* <View className="mr-3">
                  {option.icon}
                </View> */}
                <Text className="text-lg font-NunitoMedium text-gray-900">
                  {option.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default Product
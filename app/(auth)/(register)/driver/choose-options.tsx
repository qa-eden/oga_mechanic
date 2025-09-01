import React from 'react'
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native'
import { useRouter } from 'expo-router'
import { UserIcon } from 'react-native-heroicons/solid'
import BackArrowBtn from '@/components/BackArrowBtn'
import { driverRoutes } from '@/constants/routes'

const ChooseOptions = () => {
  const router = useRouter()

  const handleDriverSelect = (type: "driver" | "rider") => {
    console.log("type", type)
    
    // Store the user type for later use
    // Navigate to the same registration flow for both driver and rider
    router.push({
      pathname: driverRoutes.welcomeDriver,
      params: { type }
    })
  }



  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <BackArrowBtn text="Go back" className="ml-4 mt-4" />

      {/* Main Content */}
      <View className="flex-1 flex h-[80vh] justify-center items-center px-4">
        {/* Central Card */}
        <View className="bg-[#EDEDED] w-full rounded-2xl px-6 py-[3rem]">
          {/* Icon */}
          <View className=" mb-4">
            <View className="w-[60px] h-[60px] bg-[#FCF3F2] text-primary-500 rounded-full items-center justify-center">
              <UserIcon size={35} color="#DC3F1D" />
            </View>
          </View>

          {/* Title */}
          <Text className="text-xl font-bold text-gray-900 mb-2">
            Choose your preferred option
          </Text>

          {/* Subtitle */}
          <Text className="text-base text-gray-500 mb-8 ">
            Select either driver or rider
          </Text>

          {/* Selection Buttons */}
          <View className="space-y-4">
            <TouchableOpacity
              onPress={() => handleDriverSelect("driver")}
              className="bg-white border border-gray-200 rounded-xl py-4 px-6 active:bg-gray-50 shadow-xs mb-4"
            >
              <Text className="text-lg font-semibold text-center text-gray-900">
                Driver
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDriverSelect("rider")}
              className="bg-white border border-gray-200 rounded-xl py-4 px-6 active:bg-gray-50 shadow-xs"
            >
              <Text className="text-lg font-semibold text-center text-gray-900">
                Rider
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default ChooseOptions
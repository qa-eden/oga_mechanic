"use client"

import { useState, useEffect } from "react"
import { View, Text, TouchableOpacity, Image, Dimensions, StatusBar } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, router } from "expo-router"
import { MicrophoneIcon, SpeakerWaveIcon, ChatBubbleLeftRightIcon } from "react-native-heroicons/outline"
import {
  PhoneXMarkIcon,
  MicrophoneIcon as MicrophoneIconSolid,
  SpeakerWaveIcon as SpeakerWaveIconSolid,
} from "react-native-heroicons/solid"

const { width, height } = Dimensions.get("window")

const VoiceCall = () => {
  const params = useLocalSearchParams()
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [callStatus, setCallStatus] = useState<"connecting" | "connected" | "ended">("connecting")

  const mechanicData = {
    name: (params.mechanicName as string) || "Fatai Sule",
    image: (params.mechanicImage as string) || "/placeholder.svg?height=200&width=200",
    phone: "+234 805 643 2765",
  }

  useEffect(() => {
    // Simulate call connection
    const connectTimer = setTimeout(() => {
      setCallStatus("connected")
    }, 3000)

    return () => clearTimeout(connectTimer)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (callStatus === "connected") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [callStatus])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleEndCall = () => {
    setCallStatus("ended")
    router.back()
  }

  const handleToggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn)
  }

  const handleOpenChat = () => {
    router.back()
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900" edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* Background Gradient Effect */}
      <View className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900" />

      {/* Main Content */}
      <View className="flex-1 justify-between px-8 py-12">
        {/* Top Section - Mechanic Info */}
        <View className="items-center mt-16">
          {/* Profile Image */}
          <View className="w-48 h-48 rounded-full overflow-hidden mb-8 border-4 border-white/20">
            <Image source={{ uri: mechanicData.image }} className="w-full h-full" resizeMode="cover" />
          </View>

          {/* Name */}
          <Text className="text-3xl font-NunitoBold text-white mb-2">{mechanicData.name}</Text>

          {/* Phone Number */}
          <Text className="text-lg font-NunitoMedium text-gray-300 mb-4">{mechanicData.phone}</Text>

          {/* Call Status */}
          <View className="bg-black/30 px-6 py-3 rounded-full">
            <Text className="text-white font-NunitoMedium text-base">
              {callStatus === "connecting" && "Connecting..."}
              {callStatus === "connected" && formatDuration(callDuration)}
              {callStatus === "ended" && "Call Ended"}
            </Text>
          </View>
        </View>

        {/* Bottom Section - Call Controls */}
        <View className="items-center">
          {/* Control Buttons Row */}
          <View className="flex-row justify-center items-center space-x-8 mb-8">
            {/* Mute Button */}
            <TouchableOpacity
              onPress={handleToggleMute}
              className={`w-16 h-16 rounded-full items-center justify-center ${isMuted ? "bg-red-500" : "bg-white/20"}`}
            >
              {isMuted ? (
                <MicrophoneIconSolid size={28} color="#FFFFFF" />
              ) : (
                <MicrophoneIcon size={28} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            {/* Speaker Button */}
            <TouchableOpacity
              onPress={handleToggleSpeaker}
              className={`w-16 h-16 rounded-full items-center justify-center ${
                isSpeakerOn ? "bg-blue-500" : "bg-white/20"
              }`}
            >
              {isSpeakerOn ? (
                <SpeakerWaveIconSolid size={28} color="#FFFFFF" />
              ) : (
                <SpeakerWaveIcon size={28} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            {/* Chat Button */}
            <TouchableOpacity
              onPress={handleOpenChat}
              className="w-16 h-16 rounded-full bg-white/20 items-center justify-center"
            >
              <ChatBubbleLeftRightIcon size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* End Call Button */}
          <TouchableOpacity
            onPress={handleEndCall}
            className="w-20 h-20 rounded-full bg-red-500 items-center justify-center shadow-lg"
          >
            <PhoneXMarkIcon size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default VoiceCall


import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import {
  MicrophoneIcon,
  VideoCameraIcon,
  ChatBubbleLeftRightIcon,
  ArrowsRightLeftIcon,
} from "react-native-heroicons/outline";
import {
  PhoneXMarkIcon,
  MicrophoneIcon as MicrophoneIconSolid,
  VideoCameraSlashIcon,
} from "react-native-heroicons/solid";

const { width, height } = Dimensions.get("window");

const VideoCall = () => {
  const params = useLocalSearchParams();
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callStatus, setCallStatus] = useState<
    "connecting" | "connected" | "ended"
  >("connecting");
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  const mechanicData = {
    name: (params.mechanicName as string) || "Fatai Sule",
    image:
      (params.mechanicImage as string) ||
      "/placeholder.svg?height=400&width=300",
    phone: "+234 805 643 2765",
  };

  useEffect(() => {
    // Simulate call connection
    const connectTimer = setTimeout(() => {
      setCallStatus("connected");
    }, 3000);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === "connected") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    setCallStatus("ended");
    router.back();
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    setIsVideoOn(!isVideoOn);
  };

  const handleSwitchCamera = () => {
    setIsFrontCamera(!isFrontCamera);
  };

  const handleOpenChat = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Main Video Area */}
      <View className="flex-1 relative">
        {/* Remote Video (Mechanic) */}
        <View className="flex-1 bg-gray-800">
          {callStatus === "connected" ? (
            <Image
              source={{ uri: mechanicData.image }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center bg-gray-800">
              <View className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white/20">
                <Image
                  source={{ uri: mechanicData.image }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <Text className="text-white text-xl font-NunitoBold mb-2">
                {mechanicData.name}
              </Text>
              <Text className="text-gray-300 font-NunitoMedium">
                {callStatus === "connecting" ? "Connecting..." : "Call Ended"}
              </Text>
            </View>
          )}
        </View>

        {/* Top Overlay - Call Info */}
        <View className="absolute top-0 left-0 right-0 bg-black/50 px-6 py-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-lg font-NunitoBold">
                {mechanicData.name}
              </Text>
              <Text className="text-gray-300 font-NunitoMedium">
                {callStatus === "connecting" && "Connecting..."}
                {callStatus === "connected" && formatDuration(callDuration)}
                {callStatus === "ended" && "Call Ended"}
              </Text>
            </View>
          </View>
        </View>

        {/* Local Video (Self) - Picture in Picture */}
        <View className="absolute top-20 right-4 w-24 h-32 bg-gray-700 rounded-lg overflow-hidden border-2 border-white/30">
          {isVideoOn ? (
            <Image
              source={{ uri: "/placeholder.svg?height=128&width=96" }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center bg-gray-600">
              <VideoCameraSlashIcon size={20} color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* Bottom Controls */}
        <View className="absolute bottom-0 left-0 right-0 bg-black/70 px-6 py-8">
          <View className="flex-row justify-center items-center space-x-6">
            {/* Mute Button */}
            <TouchableOpacity
              onPress={handleToggleMute}
              className={`w-14 h-14 rounded-full items-center justify-center ${
                isMuted ? "bg-red-500" : "bg-white/20"
              }`}
            >
              {isMuted ? (
                <MicrophoneIconSolid size={24} color="#FFFFFF" />
              ) : (
                <MicrophoneIcon size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            {/* Video Toggle Button */}
            <TouchableOpacity
              onPress={handleToggleVideo}
              className={`w-14 h-14 rounded-full items-center justify-center ${
                !isVideoOn ? "bg-red-500" : "bg-white/20"
              }`}
            >
              {!isVideoOn ? (
                <VideoCameraSlashIcon size={24} color="#FFFFFF" />
              ) : (
                <VideoCameraIcon size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            {/* Switch Camera Button */}
            <TouchableOpacity
              onPress={handleSwitchCamera}
              className="w-14 h-14 rounded-full bg-white/20 items-center justify-center"
            >
              <ArrowsRightLeftIcon size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Chat Button */}
            <TouchableOpacity
              onPress={handleOpenChat}
              className="w-14 h-14 rounded-full bg-white/20 items-center justify-center"
            >
              <ChatBubbleLeftRightIcon size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* End Call Button */}
            <TouchableOpacity
              onPress={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-500 items-center justify-center shadow-lg"
            >
              <PhoneXMarkIcon size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VideoCall;

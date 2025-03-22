import { View, Text, ImageBackground } from "react-native";
import React, { useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { images, onboarding, icons } from "@/constants";
import Swiper from "react-native-swiper";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";

const Welcome = () => {
  const swiperRef = useRef<Swiper>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlde = activeIndex === onboarding.length - 1;
  // console.log(onboarding);

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      <ImageBackground
        source={images?.background1}
        // source={isLastSlde ? images?.background2 : images?.background1}
        className="flex-1 justify-center items-center"
        resizeMode="cover"
      >
        <SafeAreaView className="flex-1">
          <View className="flex justify-left p-4">
            <icons.logo />
          </View>
          <Swiper
            ref={swiperRef}
            loop={false}
            dot={
              <View className="w-[8px] h-[8px] mx-1 bg-[#E2E8F0] rounded-full" />
            }
            activeDot={
              <View className="w-[10px] h-[10px] mx-1 bg-primary-500 rounded-full" />
            }
            onIndexChanged={(index) => setActiveIndex(index)}
          >
            {onboarding?.map((item, index) => (
              <View key={index} className="flex items-center justify-center">
                <View className="w-full h-[360px]">
                  <item.image
                    width={350}
                    height={400}
                    preserveAspectRatio="xMinYMin meet"
                  />
                  {/* <Image
                    source={item.image}
                    // className="w-full h-full"
                    resizeMode="cover"
                  /> */}
                  {/* transform="rotate(45 200 200)" */}
                </View>

                <View className="flex flex-row items-center justify-center w-full px-4">
                  <Text className="text-white text-3xl font-bold mx-10 text-center">
                    {String(item?.title)}
                  </Text>
                </View>

                <Text className="text-lg font-JakartaSemiBold text-center text-[#858585] mx-10 my-3">
                  {String(item?.description)}
                </Text>
              </View>
            ))}
          </Swiper>

          <View className="p-4">
            <CustomButton
              title="Sign up"
              className="py-4 mb-2 mt-4"
              onPress={() => router?.replace("/(auth)/(register)/sign_up")}
            />
            <CustomButton
              onPress={() => router?.replace("/(auth)/(login)/sign_in")}
              title="Sign in"
              bgVariant="outline"
              className="py-4 my-4"
            />
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

export default Welcome;

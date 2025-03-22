import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React from "react";
import { images, Roles } from "@/constants"; // Ensure images.splashBackgroundCar is an SVG component
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const { height } = Dimensions.get("window"); // Get full screen height

const SignUp = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={{ height, overflow: "hidden" }} className="w-full flex-1">
        <StatusBar style="light" />

        {/* 65% SVG Background */}
        <View
          style={{ height: height * 0.65, width: "100%" }}
          className="absolute top-0"
        >
          <images.splashBackgroundCar
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
          />
        </View>

        {/* 45% Foreground Content */}
        <View
          style={{
            height: height * 0.4, // 45% height
            shadowColor: "rgba(0, 0, 0, 0.3)", // Darker shadow for visibility
            shadowOffset: { width: 0, height: -6 }, // Move shadow up a bit more
            shadowOpacity: 0.3, // Increase opacity for better visibility
            shadowRadius: 12, // Increase blur effect
            elevation: 8, // Android shadow
          }}
          className="absolute bottom-0 bg-white rounded-r-[1.2rem] rounded-l-[1.2rem] w-full"
        >
          <View className="flex-1 flex-row justify-between  px-4 absolute top-[-8%]">
            <FlatList
              data={Roles}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={{
                justifyContent: "space-between",
                marginBottom: 16,
              }}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              nestedScrollEnabled={true}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    backgroundColor: item?.backgroundColor,
                    borderWidth: 1, // Correct way to set the border width
                    borderColor: item?.border,
                  }}
                  className={`w-[48%] h-[140px] p-4 rounded-lg items-center`}
                  onPress={() =>
                    router?.push(
                      item?.id === 1
                        ? "/(auth)/(register)/user/step1"
                        : "/(auth)/(register)/user/step2"
                    )
                  }
                >
                  <View
                    className={` w-full flex flex-row ${
                      item?.id === 1 || item?.id === 2
                        ? "justify-center"
                        : "justify-end"
                    }`}
                  >
                    <item.image />
                  </View>
                  <Text
                    className={`text-lg font-NunitoSemiBold w-full ${
                      item?.id === 3 || item?.id === 4
                        ? "text-start pt-2"
                        : "text-center"
                    }`}
                  >
                    {item.title}
                  </Text>
                  <Text className="text-gray-500 text-center">
                    {item.description}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          <View className="absolute bottom-[11%] px-4 flex flex-row justify-between w-full">
            <TouchableOpacity onPress={() => router?.push("/(auth)/welcome")}>
              <Text className="font-NunitoBold text-[#575C76]">GO BACK</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router?.push("/(auth)/(login)/sign_in")}
            >
              <Text className="font-NunitoBold text-primary-500">SIGN IN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignUp;

"use client";

import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
} from "react-native";
import { useEffect, useRef } from "react";
import { images, Roles } from "@/constants";
import { StatusBar } from "expo-status-bar";
import { routes } from "@/constants/routes";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height } = Dimensions.get("window");

const SignUp = () => {
  const router = useRouter();

  // Function to save selected role to local storage
  const saveSelectedRole = async (role: any) => {
    try {
      console.log('💾 Saving role to storage:', role);
      console.log('💾 Role ID:', role.id, 'Role Title:', role.title);
      
      await AsyncStorage.setItem('selectedRole', JSON.stringify(role));
      console.log('✅ Role saved to local storage:', role.title);
      
      // Verify what was saved
      const savedRole = await AsyncStorage.getItem('selectedRole');
      console.log('🔍 Verification - saved role:', savedRole);
      
    } catch (error) {
      console.error('❌ Error saving role to local storage:', error);
    }
  };

  // Handle role selection
  const handleRoleSelection = async (role: any) => {
    try {
      // Clear any previously saved role first
      await AsyncStorage.removeItem('selectedRole');
      
      // Save the new role to local storage
      await saveSelectedRole(role);
      
      // Small delay to ensure AsyncStorage write completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Then navigate to the role's route
      router?.push(role?.route as any);
    } catch (error) {
      console.error('❌ Error during role selection:', error);
      // Still navigate even if saving fails
      router?.push(role?.route as any);
    }
  };

  // Animation values
  const backgroundScale = useRef(new Animated.Value(1.1)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(30)).current;
  const cardTranslateY = useRef(new Animated.Value(height * 0.4)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const roleCardsOpacity = useRef(new Animated.Value(0)).current;
  const roleCardsScale = useRef(new Animated.Value(0.8)).current;
  const bottomButtonsOpacity = useRef(new Animated.Value(0)).current;
  const bottomButtonsTranslateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Animate background and card together
    Animated.parallel([
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundScale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(cardTranslateY, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    // Then animate header, role cards, and buttons
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(headerTranslateY, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(120, [
        Animated.parallel([
          Animated.spring(roleCardsScale, {
            toValue: 1,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }),
          Animated.timing(roleCardsOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bottomButtonsOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(bottomButtonsTranslateY, {
            toValue: 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    // Clear any stale role data when component mounts
    const clearStaleRole = async () => {
      try {
        await AsyncStorage.removeItem('selectedRole');
        console.log('🧹 Cleared stale role data on component mount');
      } catch (error) {
        console.error('❌ Error clearing stale role:', error);
      }
    };
    
    clearStaleRole();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={{ height, overflow: "hidden" }} className="w-full flex-1">
        <StatusBar style="light" />

        {/* 65% SVG Background with Animation */}
        <Animated.View
          style={{
            height: height * 0.65,
            width: "100%",
            transform: [{ scale: backgroundScale }],
            opacity: backgroundOpacity,
          }}
          className="absolute top-0"
        >
          {typeof images.splashBackgroundCar === "function" ? (
            <images.splashBackgroundCar
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
            />
          ) : (
            <Image
              source={images.splashBackgroundCar}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                top: 0,
                left: 0,
              }}
              resizeMode="cover"
            />
          )}
          {/* Gradient Overlay for better text readability */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.4)"]}
            className="absolute inset-0"
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </Animated.View>

        {/* Header Text */}
        <Animated.View
          className="absolute top-1/2 left-0 right-0 items-center px-6"
          style={{
            marginTop: -35,
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          }}
        >
          <Text className="text-4xl font-NunitoExtraBold text-white text-center mb-2">
            Create Account
          </Text>
          <Text className="text-lg font-NunitoMedium text-white/90 text-center leading-6">
            Choose the account type that suits you
          </Text>
        </Animated.View>

        {/* 45% Foreground Content with Animation */}
        <Animated.View
          style={{
            height: height * 0.4,
            shadowColor: "rgba(0, 0, 0, 0.3)",
            shadowOffset: { width: 0, height: -6 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
            transform: [{ translateY: cardTranslateY }],
            opacity: cardOpacity,
          }}
          className="absolute bottom-0 bg-white rounded-r-[1rem] rounded-l-[1rem] w-full"
        >
          {/* Role Cards */}
          <Animated.View
            className="flex-1 flex-row justify-between px-5 absolute top-[-8%]"
            style={{
              opacity: roleCardsOpacity,
              transform: [{ scale: roleCardsScale }],
            }}
          >
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
                    borderWidth: 2,
                    borderColor: item?.border,
                  }}
                  className="w-[48%] h-[137px] p-4 rounded-2xl items-center"
                  onPress={() => handleRoleSelection(item)}
                  activeOpacity={0.8}
                >
                  <View className="w-full flex flex-row justify-end">
                    {typeof item.image === "function" ? (
                      <item.image width={40} height={40} />
                    ) : (
                      <Image
                        source={typeof item.image === "string" ? { uri: item.image } : item.image}
                        style={{ width: 40, height: 40, resizeMode: "cover" }}
                      />
                    )}
                  </View>
                  <Text className="text-lg font-NunitoSemiBold w-full flex-col justify-end items-end pt-4">
                    {item.title}
                  </Text>
                  {/* <Text className="text-sm font-NunitoSemiBold w-full flex-col justify-end items-end pt-2">
                    {item.description}
                  </Text> */}
                </TouchableOpacity>
              )}
              initialNumToRender={8}
              maxToRenderPerBatch={8}
              windowSize={7}
              removeClippedSubviews={true}
            />
          </Animated.View>

          {/* Bottom Navigation with Animation */}
          <Animated.View
            className="absolute bottom-[11%] px-5 flex flex-row justify-between w-full"
            style={{
              opacity: bottomButtonsOpacity,
              transform: [{ translateY: bottomButtonsTranslateY }],
            }}
          >
            <TouchableOpacity
              onPress={() => router?.push(routes?.welcome)}
              activeOpacity={0.7}
            >
              <Text className="font-NunitoBold text-[#575C76]">GO BACK</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router?.push(routes?.signIn)}
              activeOpacity={0.8}
            >
              <Text className="font-NunitoBold text-primary-500">SIGN IN</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignUp;

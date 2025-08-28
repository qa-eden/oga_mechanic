import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import ToastManager from "toastify-react-native";

// Import your global CSS file
import "../global.css";
import { Dimensions, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { CartProvider } from "@/contexts/CartContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AnimatedSplash from "../components/AnimatedSplash"; // <-- Add this

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Create a client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
      },
    },
  });

  const [loaded, error] = useFonts({
    "Nunito-Bold": require("../assets/fonts/nunito/Nunito-Bold.ttf"),
    "Nunito-ExtraBold": require("../assets/fonts/nunito/Nunito-ExtraBold.ttf"),
    "Nunito-ExtraLight": require("../assets/fonts/nunito/Nunito-ExtraLight.ttf"),
    "Nunito-Light": require("../assets/fonts/nunito/Nunito-Light.ttf"),
    "Nunito-Medium": require("../assets/fonts/nunito/Nunito-Medium.ttf"),
    "Nunito-Regular": require("../assets/fonts/nunito/Nunito-Regular.ttf"),
    "Nunito-SemiBold": require("../assets/fonts/nunito/Nunito-SemiBold.ttf"),
  });

  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
    }
    
    if (loaded) {
      // Hide the splash screen after fonts are loaded
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [loaded, error]);

  // Show animated splash until both fonts are loaded and animation is done
  if (!loaded || !splashDone) {
    return (
      <AnimatedSplash onAnimationEnd={() => setSplashDone(true)} />
    );
  }

  const screenWidth = Dimensions.get("window").width;

  // Set toast width to a percentage of screen width
  const toastWidth = screenWidth * 0.9;

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <LocationProvider>
          <View className="flex-1">
            <StatusBar style="light" />
            <ToastManager
              position="top"
              width={toastWidth}
              duration={2000}
              animationIn="slideInRight"
              animationOut="slideOutLeft"
              showProgressBar={false}
            />
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(root)" options={{ headerShown: false }} />
            </Stack>
          </View>
        </LocationProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}
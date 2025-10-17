import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import Toast from 'react-native-toast-message';

// Import your global CSS file
import "../global.css";
import { Dimensions, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { CartProvider } from "@/contexts/CartContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AnimatedSplash from "../components/AnimatedSplash";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Component that handles the main app logic
function AppContent() {
  const auth = useAuthContext();

  // Show splash screen while auth is loading
  if (auth.isLoading) {
    return (
      <AnimatedSplash 
        onAnimationEnd={() => {
          // Animation done, but keep showing splash until auth is complete
        }} 
      />
    );
  }

  const screenWidth = Dimensions.get("window").width;

  return (
    <CartProvider>
      <LocationProvider>
        <View className="flex-1">
          <StatusBar style="light" />
          <Toast />
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(root)" options={{ headerShown: false }} />
          </Stack>
        </View>
      </LocationProvider>
    </CartProvider>
  );
}

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

  useEffect(() => {
    if (error) {
    }
    
    if (loaded) {
      // Hide the splash screen after fonts are loaded
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [loaded, error]);

  // Show animated splash until fonts are loaded
  if (!loaded) {
    return (
      <AnimatedSplash onAnimationEnd={() => {}} />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
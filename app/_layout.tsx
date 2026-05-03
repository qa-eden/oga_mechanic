import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import { useRouter } from "expo-router";

// Import your global CSS file
import "../global.css";
import { View, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { CartProvider } from "@/contexts/CartContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";
import { AuthEventProvider } from "@/providers/AuthEventProvider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AnimatedSplash from "../components/AnimatedSplash";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Component that handles the main app logic
function AppContent() {
  const auth = useAuthContext();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // ── Global Notification Listener ──────────────────────────────────────────
  useEffect(() => {
    // This listener is fired whenever a user taps on or interacts with a notification
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      // If the notification data contains a 'new_order' type, redirect to orders
      if (data?.type === 'new_order') {
        router.push("/(root)/(tabs)/(mechanic)/home" as any);
      }
    });

    return () => subscription.remove();
  }, []);
  // ──────────────────────────────────────────────────────────────────────────

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

  return (
    <CartProvider>
      <LocationProvider>
        <View className="flex-1">
          <StatusBar style="dark" />
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(root)" options={{ headerShown: false, gestureEnabled: false }} />
          </Stack>
          <Toast />

          {/* Global Android Navigation Bar Overlay */}
          {Platform.OS === "android" && insets.bottom > 0 && (
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 40,
                backgroundColor: "#333",
                zIndex: 1000,
              }}
            />
          )}
        </View>
      </LocationProvider>
    </CartProvider>
  );
}

// Create a client with optimized defaults to prevent excessive API calls
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds - data is fresh for 30 seconds
      gcTime: 10 * 60 * 1000, // 10 minutes - cache time
      retry: 2,
      refetchOnMount: true, // Refetch on mount if data is stale
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnReconnect: true, // Only refetch when connection is restored
      refetchInterval: false, // Disable automatic polling by default
    },
  },
});

export default function RootLayout() {


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
      // Only hide if it hasn't been hidden already
      SplashScreen.hideAsync().catch(() => {
        // Silently catch errors - splash screen may already be hidden
      });
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
      {/* <StatusBar style="auto" /> */}
      <AuthProvider>
        <AuthEventProvider>
          <AppContent />
        </AuthEventProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
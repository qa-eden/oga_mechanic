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
  ActivityIndicator,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { images, Roles } from "@/constants";
import { StatusBar } from "expo-status-bar";
import { routes } from "@/constants/routes";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoles } from "@/hooks/useRoles";
import { userAPI } from "@/lib/api/user";
import { useRegistrationStore } from "@/stores/registrationStore";
import LoadingOverlay from "@/components/LoadingOverlay";

const { height } = Dimensions.get("window");

const SignUp = () => {
  const router = useRouter();
  const { setStepByStepData, setStepByStepMode, setCurrentStep } = useRegistrationStore();
  const [isNavigating, setIsNavigating] = useState(false);

  // Reset navigation state on component mount to prevent stuck state
  useEffect(() => {
    setIsNavigating(false);
    
    // Additional cleanup on unmount
    return () => {
      setIsNavigating(false);
    };
  }, []);

  // Reset navigation state when component becomes visible again
  useEffect(() => {
    // Reset state periodically to prevent stuck state
    const interval = setInterval(() => {
      if (isNavigating) {
        console.log('🔄 Resetting stuck navigation state');
        setIsNavigating(false);
      }
    }, 5000); // Check every 5 seconds
    
    return () => {
      clearInterval(interval);
    };
  }, [isNavigating]);
  
  // Use TanStack Query hook for roles
  const { 
    data: apiRoles = [], 
    isLoading: isLoadingRoles, 
    error: rolesError,
    isError: isRolesError,
    refetch: refetchRoles
  } = useRoles();

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

  // Handle role selection with proper error handling and debounce
  const handleRoleSelection = async (role: any) => {
    // Prevent multiple rapid clicks
    if (isNavigating) {
      console.log('⏳ Navigation already in progress, ignoring click');
      return;
    }
    
    try {
      setIsNavigating(true);
      console.log('🎯 Selected role:', role);
      
      // Enable step-by-step mode
      setStepByStepMode(true);
      setCurrentStep(1);
      
      // Post role selection to step 1 endpoint
      console.log('📤 Posting role selection to step 1 endpoint...');
      const step1Response = await userAPI.registerStep(1, {
        role_id: role.id
      });
      
      console.log('✅ Step 1 response:', step1Response);
      
      // Store role data in step-by-step store
      setStepByStepData({
        role_id: role.id,
        sessionId: step1Response.sessionId || step1Response.session_id
      });
      
      // Clear any previously saved role first
      await AsyncStorage.removeItem('selectedRole');
      
      // Save the new role to local storage
      await saveSelectedRole(role);
      
      // Navigate immediately without delay
      router.replace(role?.route as any);
    } catch (error) {
      console.error('❌ Error during role selection:', error);
      // Reset navigation state immediately on error
      setIsNavigating(false);
      // Still navigate even if API call fails
      router.replace(role?.route as any);
    } finally {
      // Ensure navigation state is always reset
      setTimeout(() => {
        setIsNavigating(false);
      }, 1000);
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

  // Create a mapping between API role names and local role titles
  const roleMapping = {
    'primary_user': 'Primary User',
    'merchant': 'Seller', 
    'mechanic': 'Mechanic',
    'driver': 'Driver'
  };

  // Filter API roles to match existing local roles
  const filteredApiRoles = apiRoles.filter(apiRole => {
    // Match by mapped title or id with existing Roles
    return Roles.some(localRole => 
      localRole.id === apiRole.id || 
      roleMapping[apiRole.name as keyof typeof roleMapping] === localRole.title
    );
  });

  // Merge API data with local role data (keeping local styling, adding API data)
  const mergedRoles = Roles.map(localRole => {
    const apiRole = apiRoles.find(apiRole => 
      localRole.id === apiRole.id || 
      roleMapping[apiRole.name as keyof typeof roleMapping] === localRole.title
    );
    
    return {
      ...localRole, // Keep local styling and properties
      ...apiRole,   // Override with API data
      // Ensure we keep local styling properties
      backgroundColor: localRole.backgroundColor,
      border: localRole.border,
      image: localRole.image,
      route: localRole.route,
      // Keep local title for display
      title: localRole.title,
    };
  });

  // Log API roles data for debugging (not rendering)
  console.log('🎯 Current API Roles State:', {
    isLoadingRoles,
    isRolesError,
    apiRolesCount: apiRoles.length,
    filteredApiRolesCount: filteredApiRoles.length,
    mergedRolesCount: mergedRoles.length,
    roleMapping: roleMapping,
    apiRoles: apiRoles,
    filteredApiRoles: filteredApiRoles,
    mergedRoles: mergedRoles,
    error: rolesError
  });

  // Debug role matching
  console.log('🔍 Role Matching Debug:', {
    localRoles: Roles.map(r => ({ id: r.id, title: r.title })),
    apiRoles: apiRoles.map(r => ({ id: r.id, name: r.name })),
    mergedRoles: mergedRoles.map(r => ({ 
      id: r.id, 
      title: r.title, 
      name: r.name,
      hasApiData: !!apiRoles.find(ar => ar.id === r.id || roleMapping[ar.name as keyof typeof roleMapping] === r.title)
    }))
  });

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
              data={mergedRoles}
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
                  onPress={() => {
                    try {
                      handleRoleSelection(item);
                    } catch (error) {
                      console.error('Role selection error:', error);
                    }
                  }}
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
                  <Text className="text-sm text-gray-500 w-full flex-col justify-end items-end pt-2">
                    {item.description}
                  </Text>
                </TouchableOpacity>
              )}
              initialNumToRender={4}
              maxToRenderPerBatch={4}
              windowSize={3}
              removeClippedSubviews={true}
              getItemLayout={(data, index) => ({
                length: 137,
                offset: 137 * index,
                index,
              })}
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
              onPress={() => {
                if (isNavigating) return;
                try {
                  setIsNavigating(true);
                  router.replace(routes?.welcome as any);
                } catch (error) {
                  console.error('Navigation error:', error);
                  setIsNavigating(false);
                }
              }}
              activeOpacity={0.7}
              disabled={isNavigating}
            >
              <Text className={`font-NunitoBold ${isNavigating ? 'text-gray-400' : 'text-[#575C76]'}`}>
                GO BACK
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (isNavigating) return;
                try {
                  setIsNavigating(true);
                  router.replace(routes?.signIn as any);
                } catch (error) {
                  console.error('Navigation error:', error);
                  setIsNavigating(false);
                }
              }}
              activeOpacity={0.8}
              disabled={isNavigating}
            >
              <Text className={`font-NunitoBold ${isNavigating ? 'text-gray-400' : 'text-primary-500'}`}>
                SIGN IN
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
        
        {/* Loading Overlay */}
        <LoadingOverlay
          visible={isNavigating}
          title="Setting up your account..."
          subtitle="Please wait while we prepare everything for you"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignUp;

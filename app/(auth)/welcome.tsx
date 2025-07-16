import React, { useEffect, useRef, useState } from "react";
import { View, ImageBackground, FlatList, Dimensions, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images, onboarding, icons } from "@/constants";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { routes } from "@/constants/routes";

const { width: screenWidth } = Dimensions.get('window');

const Welcome = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Animation refs
  const logoAnim = useRef(new Animated.Value(0)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered animation
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(imageAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(textAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(buttonAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const renderOnboardingItem = ({ item }: { item: any }) => (
    <Animated.View
      style={{
        width: screenWidth,
        alignItems: "center",
        opacity: imageAnim,
        transform: [{ scale: imageAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
      }}
    >
      <View style={{ width: 300, height: 300, marginBottom: 24, justifyContent: "center", alignItems: "center" }}>
        <item.image width={300} height={300} />
      </View>
      <Animated.Text
        style={{
          color: "#fff",
          fontSize: 28,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 12,
          opacity: textAnim,
          transform: [{ translateY: textAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
        }}
      >
        {item.title}
      </Animated.Text>
      <Animated.Text
        style={{
          color: "#E2E8F0",
          fontSize: 18,
          textAlign: "center",
          opacity: textAnim,
        }}
      >
        {item.description}
      </Animated.Text>
    </Animated.View>
  );

  const renderDotIndicator = () => (
    <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24, marginBottom: 12 }}>
      {onboarding.map((_, index) => (
        <Animated.View
          key={index}
          style={{
            width: activeIndex === index ? 12 : 8,
            height: activeIndex === index ? 12 : 8,
            borderRadius: 6,
            backgroundColor: activeIndex === index ? "#fff" : "rgba(255,255,255,0.5)",
            marginHorizontal: 4,
            opacity: buttonAnim,
            transform: [
              { scale: activeIndex === index ? 1.2 : 1 }
            ]
          }}
        />
      ))}
    </View>
  );

  const handleMomentumScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setActiveIndex(index % onboarding.length);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />
      <ImageBackground
        source={images?.background1}
        style={{ flex: 1, justifyContent: "center" }}
        resizeMode="cover"
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Animated Logo */}
          <Animated.View
            style={{
              alignItems: "flex-start",
              padding: 24,
              opacity: logoAnim,
              transform: [{ translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
            }}
          >
            <icons.logo width={120} height={40} />
          </Animated.View>

          {/* Animated Onboarding Content */}
          <FlatList
            ref={flatListRef}
            data={onboarding}
            renderItem={renderOnboardingItem}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            contentContainerStyle={{ alignItems: "center" }}
            getItemLayout={(_, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
          />

          {renderDotIndicator()}

          {/* Animated Buttons */}
          <Animated.View
            style={{
              padding: 24,
              opacity: buttonAnim,
              transform: [{ translateY: buttonAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
            }}
          >
            <CustomButton
              title="Sign up"
              className="py-5 mb-3 mt-2 shadow-lg"
              onPress={() => router?.replace(routes?.signUp as any)}
            />
            <CustomButton
              onPress={() => router?.replace(routes?.signIn as any)}
              title="Sign in"
              bgVariant="outline"
              className="py-5 my-2 shadow-lg"
            />
          </Animated.View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

export default Welcome;

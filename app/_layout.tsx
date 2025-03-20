import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import ToastManager from "toastify-react-native";

// Import your global CSS file
import "../global.css";
import { Dimensions } from "react-native";

export default function RootLayout() {
  const [loaded] = useFonts({
    "Nunito-Bold": require("../assets/fonts/nunito/Nunito-Bold.ttf"),
    "Nunito-ExtraBold": require("../assets/fonts/nunito/Nunito-ExtraBold.ttf"),
    "Nunito-ExtraLight": require("../assets/fonts/nunito/Nunito-ExtraBold.ttf"),
    "Nunito-Light": require("../assets/fonts/nunito/Nunito-Light.ttf"),
    "Nunito-Medium": require("../assets/fonts/nunito/Nunito-Medium.ttf"),
    "Nunito-Regular": require("../assets/fonts/nunito/Nunito-Regular.ttf"),
    "Nunito-SemiBold": require("../assets/fonts/nunito/Nunito-SemiBold.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const screenWidth = Dimensions.get("window").width;

  // Set toast width to a percentage of screen width
  const toastWidth = screenWidth * 0.9;

  return (
    <>
      <ToastManager
        position="top"
        width={toastWidth}
        duration={5000}
        animationIn="slideInRight"
        animationOut="slideOutLeft"
        hideProgressBar={true} // Removes the progress bar
      />

      {/* Navigation Stack */}
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

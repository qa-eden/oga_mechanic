import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(user)" options={{ headerShown: false }} />
      <Stack.Screen name="(driver)" options={{ headerShown: false }} />
      <Stack.Screen name="(rider)" options={{ headerShown: false }} />
      <Stack.Screen name="(sellers)" options={{ headerShown: false }} />
      <Stack.Screen name="(mechanic)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
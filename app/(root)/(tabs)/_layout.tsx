import { useEffect } from "react";
import { Stack } from "expo-router";
import { useNotifications, usePrimaryUserProfile } from "@/hooks/useUserProfile";

const Layout = () => {
  // Fetch notifications when any tabs layout loads (works for all roles)
  const { refetch: refetchNotifications } = useNotifications();

  // Fetch primary profile to keep navbar and profile page in sync
  const { refetch: refetchProfile } = usePrimaryUserProfile();

  useEffect(() => {
    // Refetch notifications and profile when the tabs layout mounts
    refetchNotifications();
    refetchProfile();
  }, [refetchNotifications, refetchProfile]);

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
import { useEffect } from "react";
import { Slot } from "expo-router";
import { useUnreadNotificationCount, usePrimaryUserProfile } from "@/hooks/useUserProfile";

const Layout = () => {
  // Fetch notifications when any tabs layout loads (works for all roles)
  const { refetch: refetchNotifications } = useUnreadNotificationCount();

  // Fetch primary profile to keep navbar and profile page in sync
  const { refetch: refetchProfile } = usePrimaryUserProfile();

  useEffect(() => {
    // Refetch notifications and profile when the tabs layout mounts
    refetchNotifications();
    refetchProfile();
  }, [refetchNotifications, refetchProfile]);

  return <Slot />;
};

export default Layout;
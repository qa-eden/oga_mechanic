import { Redirect } from "expo-router";
import { routes } from "@/constants/routes";
import AnimatedSplash from "@/components/AnimatedSplash";
import { useAuthContext } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";

export default function Index() {
  const { isLoading, shouldNavigate, navigationTarget } = useAuthContext();
  const [animationComplete, setAnimationComplete] = useState(false);

  // Hide splash screen when both animation and auth check are complete
  useEffect(() => {
    if (animationComplete && !isLoading && shouldNavigate && navigationTarget) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        SplashScreen.hideAsync();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [animationComplete, isLoading, shouldNavigate, navigationTarget]);

  // If auth check is complete and we should navigate, redirect
  if (animationComplete && !isLoading && shouldNavigate && navigationTarget) {
    return <Redirect href={navigationTarget as any} />;
  }

  // If auth check is complete but no navigation target, go to welcome
  if (animationComplete && !isLoading && !shouldNavigate) {
    return <Redirect href={routes?.welcome as any} />;
  }

  // Show animated splash while auth check is in progress or animation is running
  return (
    <AnimatedSplash
      onAnimationEnd={() => {
        setAnimationComplete(true);
      }}
    />
  );
}

import { Redirect } from "expo-router";
import { routes } from "@/constants/routes";
import AnimatedSplash from "@/components/AnimatedSplash";

export default function Index() {
  // Simple redirect to welcome page - AuthProvider will handle the rest
  // return <Redirect href={routes?.welcome as any} />;
  return <AnimatedSplash onAnimationEnd={() => {}} />;
}

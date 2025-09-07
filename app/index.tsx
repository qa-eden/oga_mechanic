import { Redirect } from "expo-router";
import { routes } from "@/constants/routes";

export default function Index() {
  // Simple redirect to welcome page - AuthProvider will handle the rest
  return <Redirect href={routes?.welcome as any} />;
}

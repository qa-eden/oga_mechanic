import { Redirect } from "expo-router";
import { Alert, Text, View } from "react-native";

export default function Index() {
  return <Redirect href={'/(auth)/welcome'} />
}

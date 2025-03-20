import { Redirect } from "expo-router";
import { Alert, Text, View } from "react-native";
import ToastManager from "toastify-react-native";

export default function Index() {
  return (
    <>
      <ToastManager /> <Redirect href={"/(auth)/welcome"} />
    </>
  );
}

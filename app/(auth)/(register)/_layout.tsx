import { ScrollView } from "react-native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";

const RegisterLayout = () => {
  return (
    <ScrollView className="flex-1 bg-white">
      <StatusBar style="light" />
      <Slot />
    </ScrollView>
  );
};

export default RegisterLayout;

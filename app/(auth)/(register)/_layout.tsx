import { View } from "react-native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";

const RegisterLayout = () => {
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />
      <Slot />
    </View>
  );
};

export default RegisterLayout;

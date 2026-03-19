import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import { HeadphonesIcon } from "./icons/HeadphonesIcon";
import { router } from "expo-router";
import { routes } from "@/constants/routes";

interface SpecialistIconBtnProps {
  count?: number;
}

const SpecialistIconBtn = ({ count = 3 }: SpecialistIconBtnProps) => {
  return (
    <View>
      <TouchableOpacity 
        onPress={() => router.push(routes.chatSeller)} 
        className="w-[45px] h-[45px] bg-gray-100 flex justify-center items-center rounded-full relative"
      >
        <HeadphonesIcon size={24} color={"#000"} />
        {count > 0 && (
          <View
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              minWidth: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: "#FF8C00",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              paddingHorizontal: 4,
            }}
          >
            <Text style={{ 
              color: "#fff", 
              fontSize: 11, 
              fontWeight: "bold",
              fontFamily: "Nunito-Bold"
            }}>
              {count > 99 ? "99+" : count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default SpecialistIconBtn;

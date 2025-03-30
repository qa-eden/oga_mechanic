import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Services as ServicesData } from "@/constants";
import { router } from "expo-router";

const Services = () => {
  const renderServiceItem = ({ item }: { item: typeof ServicesData[0] }) => {
    const IconComponent = item.image;

    return (
      <TouchableOpacity
        style={{
          backgroundColor: item.bgColor,
          borderWidth: 1,
          borderColor: item.border,
          width: "49%",
          height: 145,
          borderRadius: 8,
          padding: 10,
          marginBottom: 10,
          alignItems: "flex-end",
        }}
      >
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "flex-end",
            height: 70,
            alignItems: "center",
          }}
        >
          <IconComponent color="#555" size={100} />
        </View>
        <Text
          style={{
            fontSize: 16,
            width: "100%",
            textAlign: "left",
            
          }}
          className="pt-[1.4rem] font-NunitoBold text-[#101828]"
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="bg-white flex-1 px-5 pt-2" edges={["top"]}>
      <View className="">
        <Text className="text-center text-[1.5rem] font-NunitoBold py-3 mb-2">
          Services
        </Text>
        <Text className="text-[1.1rem] font-NunitoBold ">
          Explore all of our auto services{" "}
        </Text>
        <Text className="text-[1.1rem] font-NunitoMedium text-text-100 py-2 mb-2">
          Buy cars, find parts, book mechanics or get a ride-all in one place!
        </Text>
      </View>

      <View className="flex flex-row justify-between items-center mt-5">
        <FlatList
          data={ServicesData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderServiceItem}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: "space-between",
          }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default Services;

import React from "react";
import { View, Text } from "react-native";

interface FeatureItem {
  name: string;
  enabled: boolean;
  color: string;
}

interface ProductFeaturesProps {
  airConditioning?: boolean;
  leatherSeats?: boolean;
  navigationSystem?: boolean;
  bluetooth?: boolean;
  parkingSensors?: boolean;
  cruiseControl?: boolean;
  keylessEntry?: boolean;
  sunroof?: boolean;
  alloyWheels?: boolean;
  airbags?: boolean;
  abs?: boolean;
  tractionControl?: boolean;
  laneAssist?: boolean;
  blindSpotMonitor?: boolean;
}

const ProductFeatures: React.FC<ProductFeaturesProps> = (props) => {
  const features: FeatureItem[] = [
    {
      name: "Air Conditioning",
      enabled: !!props.airConditioning,
      color: "bg-blue-50 text-blue-700",
    },
    {
      name: "Leather Seats",
      enabled: !!props.leatherSeats,
      color: "bg-amber-50 text-amber-700",
    },
    {
      name: "Navigation",
      enabled: !!props.navigationSystem,
      color: "bg-indigo-50 text-indigo-700",
    },
    {
      name: "Bluetooth",
      enabled: !!props.bluetooth,
      color: "bg-purple-50 text-purple-700",
    },
    {
      name: "Parking Sensors",
      enabled: !!props.parkingSensors,
      color: "bg-violet-50 text-violet-700",
    },
    {
      name: "Cruise Control",
      enabled: !!props.cruiseControl,
      color: "bg-pink-50 text-pink-700",
    },
    {
      name: "Keyless Entry",
      enabled: !!props.keylessEntry,
      color: "bg-rose-50 text-rose-700",
    },
    {
      name: "Sunroof",
      enabled: !!props.sunroof,
      color: "bg-sky-50 text-sky-700",
    },
    {
      name: "Alloy Wheels",
      enabled: !!props.alloyWheels,
      color: "bg-slate-50 text-slate-700",
    },
    {
      name: "Airbags",
      enabled: !!props.airbags,
      color: "bg-red-50 text-red-700",
    },
    { name: "ABS", enabled: !!props.abs, color: "bg-orange-50 text-orange-700" },
    {
      name: "Traction Control",
      enabled: !!props.tractionControl,
      color: "bg-green-50 text-green-700",
    },
    {
      name: "Lane Assist",
      enabled: !!props.laneAssist,
      color: "bg-teal-50 text-teal-700",
    },
    {
      name: "Blind Spot Monitor",
      enabled: !!props.blindSpotMonitor,
      color: "bg-cyan-50 text-cyan-700",
    },
  ];

  const enabledFeatures = features.filter((f) => f.enabled);

  if (enabledFeatures.length === 0) {
    return null;
  }

  return (
    <View
      className="bg-white rounded-2xl p-4 mx-4 mb-3 border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Text className="text-base font-NunitoBold text-gray-900 mb-3">
        Features & Amenities
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {enabledFeatures.map((feature) => {
          const [bgColor, textColor] = feature.color.split(" ");
          return (
            <View key={feature.name} className={`${bgColor} px-3 py-2 rounded-full`}>
              <Text className={`text-xs font-NunitoMedium ${textColor}`}>
                {feature.name}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default ProductFeatures;


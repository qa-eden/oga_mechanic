import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface SpecItem {
  label: string;
  value: string | number | boolean;
  type?: "text" | "color" | "badge";
}

interface ProductSpecificationsProps {
  productId: string;
  category?: string;
  condition?: string;
  transmission?: string;
  fuelType?: string;
  engineSize?: string;
  mileage?: number;
  mileageUnit?: string;
  exteriorColor?: string;
  interiorColor?: string;
  numberOfDoors?: number;
  numberOfSeats?: number;
  bodyType?: string;
  isRental?: boolean;
  warranty?: string;
  createdAt?: string;
}

const ProductSpecifications: React.FC<ProductSpecificationsProps> = (props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const specs: SpecItem[] = [
    { label: "Product ID", value: props.productId?.slice(-12) || "N/A" },
    { label: "Category", value: props.category || "N/A" },
    { label: "Condition", value: props.condition || "N/A" },
  ];

  // Optional specs (only shown when expanded)
  const additionalSpecs: SpecItem[] = [];

  if (props.transmission) {
    additionalSpecs.push({ label: "Transmission", value: props.transmission });
  }
  if (props.fuelType) {
    additionalSpecs.push({ label: "Fuel Type", value: props.fuelType });
  }
  if (props.engineSize) {
    additionalSpecs.push({ label: "Engine Size", value: props.engineSize });
  }
  if (props.mileage) {
    additionalSpecs.push({
      label: "Mileage",
      value: `${props.mileage.toLocaleString()} ${props.mileageUnit || "km"}`,
    });
  }
  if (props.exteriorColor) {
    additionalSpecs.push({
      label: "Exterior Color",
      value: props.exteriorColor,
      type: "color",
    });
  }
  if (props.interiorColor) {
    additionalSpecs.push({
      label: "Interior Color",
      value: props.interiorColor,
      type: "color",
    });
  }
  if (props.numberOfDoors) {
    additionalSpecs.push({
      label: "Doors",
      value: props.numberOfDoors.toString(),
    });
  }
  if (props.numberOfSeats) {
    additionalSpecs.push({
      label: "Seats",
      value: props.numberOfSeats.toString(),
    });
  }
  if (props.bodyType) {
    additionalSpecs.push({ label: "Body Type", value: props.bodyType });
  }
  if (props.warranty) {
    additionalSpecs.push({ label: "Warranty", value: props.warranty });
  }
  if (props.createdAt) {
    additionalSpecs.push({
      label: "Listed",
      value: new Date(props.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    });
  }

  // Rental option
  additionalSpecs.push({
    label: "Rental Option",
    value: props.isRental ? "Available" : "Not Available",
    type: "badge",
  });

  const displaySpecs = isExpanded ? [...specs, ...additionalSpecs] : specs;

  const renderSpecItem = (spec: SpecItem, index: number) => (
    <View
      key={index}
      className="flex-row justify-between items-center py-2.5 border-b border-gray-50"
    >
      <Text className="text-sm text-gray-500">{spec.label}</Text>
      {spec.type === "color" ? (
        <View className="flex-row items-center">
          <View
            className="w-4 h-4 rounded-full mr-2 border border-gray-200"
            style={{
              backgroundColor: String(spec.value).toLowerCase(),
            }}
          />
          <Text className="text-sm font-NunitoBold text-gray-900 capitalize">
            {String(spec.value)}
          </Text>
        </View>
      ) : spec.type === "badge" ? (
        <View
          className={`px-2 py-1 rounded-full ${
            spec.value === "Available" ? "bg-green-100" : "bg-gray-100"
          }`}
        >
          <Text
            className={`text-xs font-NunitoBold ${
              spec.value === "Available" ? "text-green-700" : "text-gray-600"
            }`}
          >
            {String(spec.value)}
          </Text>
        </View>
      ) : (
        <Text className="text-sm font-NunitoBold text-gray-900 capitalize">
          {String(spec.value)}
        </Text>
      )}
    </View>
  );

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
      <Text className="text-base font-NunitoBold text-gray-900 mb-2">
        Specifications
      </Text>
      {displaySpecs.map(renderSpecItem)}
      {additionalSpecs.length > 0 && (
        <TouchableOpacity
          onPress={() => setIsExpanded(!isExpanded)}
          className="pt-3 items-center"
        >
          <Text className="text-sm font-NunitoBold text-primary-500">
            {isExpanded
              ? "Show less"
              : `Show ${additionalSpecs.length} more specs`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ProductSpecifications;


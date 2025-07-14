import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { decodeVINWithImage, SAMPLE_VINS } from '@/utils/vinDecoder';

const VINTestComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleImage, setVehicleImage] = useState<string | null>(null);
  const [vehicleColor, setVehicleColor] = useState<string | null>(null);

  const testVIN = async (vin: string, description: string) => {
    setIsLoading(true);
    setVehicleImage(null);
    setVehicleColor(null);
    
    try {
      const result = await decodeVINWithImage(vin);
      
      if (result) {
        setVehicleImage(result.imageUrl || null);
        setVehicleColor(result.color || result.exteriorColor || null);
        
        Alert.alert(
          `✅ ${description}`,
          `Make: ${result.make}\nModel: ${result.model}\nYear: ${result.modelYear}\nType: ${result.vehicleType}\nColor: ${result.color || 'Not detected'}`,
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      Alert.alert(
        `❌ ${description}`,
        error.message,
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="p-4 bg-gray-100 rounded-lg">
      <Text className="text-lg font-NunitoBold mb-4">Enhanced VIN Decoder Test</Text>
      
      <TouchableOpacity
        className="mb-2 p-3 bg-blue-500 rounded-lg"
        onPress={() => testVIN(SAMPLE_VINS.TOYOTA_CAMRY, "Toyota Camry")}
        disabled={isLoading}
      >
        <Text className="text-white text-center font-NunitoMedium">
          Test Toyota Camry VIN
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mb-2 p-3 bg-green-500 rounded-lg"
        onPress={() => testVIN(SAMPLE_VINS.HONDA_CIVIC, "Honda Civic")}
        disabled={isLoading}
      >
        <Text className="text-white text-center font-NunitoMedium">
          Test Honda Civic VIN
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mb-2 p-3 bg-purple-500 rounded-lg"
        onPress={() => testVIN(SAMPLE_VINS.FORD_F150, "Ford F-150")}
        disabled={isLoading}
      >
        <Text className="text-white text-center font-NunitoMedium">
          Test Ford F-150 VIN
        </Text>
      </TouchableOpacity>

      {/* Vehicle Preview */}
      {(vehicleImage || vehicleColor) && (
        <View className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
          <Text className="text-sm font-NunitoBold text-gray-700 mb-3">
            🚗 Vehicle Preview
          </Text>
          
          <View className="flex-row items-center">
            {vehicleImage && (
              <View className="mr-4">
                <Image
                  source={{ uri: vehicleImage }}
                  className="w-24 h-20 rounded-lg"
                  resizeMode="cover"
                />
              </View>
            )}
            
            <View className="flex-1">
              {vehicleColor && (
                <View className="flex-row items-center mb-2">
                  <View 
                    className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                    style={{ backgroundColor: vehicleColor }}
                  />
                  <Text className="text-sm font-NunitoMedium text-gray-600">
                    Color: {vehicleColor}
                  </Text>
                </View>
              )}
              
              <Text className="text-xs text-gray-500 font-NunitoMedium">
                Vehicle details loaded successfully
              </Text>
            </View>
          </View>
        </View>
      )}

      {isLoading && (
        <Text className="text-center text-gray-600 font-NunitoMedium mt-4">
          Testing enhanced VIN decoder...
        </Text>
      )}
    </View>
  );
};

export default VINTestComponent; 
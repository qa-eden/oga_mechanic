import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { ShoppingBagIcon, WrenchScrewdriverIcon, UsersIcon } from "react-native-heroicons/solid";
import CustomButton from "../CustomButton";

const { height: screenHeight } = Dimensions.get("window");

interface SwitchUserModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSwitchUser: (userType: string) => void;
}

interface UserOption {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  iconName?: string;
  description: string;
}

const SwitchUserModal = ({
  isVisible,
  onClose,
  onSwitchUser,
}: SwitchUserModalProps) => {
  const [selectedUser, setSelectedUser] = useState<string>("");

  // Animation values
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Slide up from bottom
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide down to bottom
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      // Reset selected user when closing
      setTimeout(() => {
        setSelectedUser("");
      }, 200);
    }
  }, [isVisible]);

  const userOptions: UserOption[] = [
    {
      id: "driver",
      name: "Driver",
      icon: MaterialIcons,
      iconName: "local-taxi",
      description: "Drive and earn money",
    },
    {
      id: "rider",
      name: "Rider",
      icon: MaterialIcons,
      iconName: "pedal-bike",
      description: "Book rides and travel",
    },
    {
      id: "mechanic",
      name: "Mechanic",
      icon: WrenchScrewdriverIcon,
      iconName: "tools",
      description: "Provide repair services",
    },
    {
      id: "merchant",
      name: "Merchant",
      icon: ShoppingBagIcon,
      iconName: "storefront",
      description: "Sell products and services",
    },
  ];

  const handleSelectUser = (userType: string) => {
    setSelectedUser(userType);
  };

  const handleConfirm = () => {
    if (selectedUser) {
      onSwitchUser(selectedUser);
      // Small delay to show the animation before closing
      setTimeout(() => {
        onClose();
      }, 100);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)" }}
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="flex-1 justify-end">
          <Animated.View
            style={{
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            }}
            className="bg-white rounded-t-3xl overflow-hidden shadow-2xl"
          >
            {/* Header with drag indicator */}
            <View className="items-center pt-4 pb-2">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            {/* Icon and Title */}
            <View className="items-center px-6 pb-6">
              <View className="w-20 h-20 border-2 border-primary-500 text-primary-500 rounded-full items-center justify-center mb-4">
                <UsersIcon size={32} color="#EF4444" />
              </View>
              <Text className="text-2xl font-NunitoBold text-gray-900 text-center mb-2">
                Switch user
              </Text>
              <Text className="text-gray-600 text-center font-NunitoMedium">
                Seamlessly switch between accounts without logging out
              </Text>
            </View>

            {/* User Options */}
            <ScrollView className="px-6 pb-6">
              {userOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleSelectUser(option.id)}
                  className="flex-row items-center justify-between py-4 border-b border-gray-100 last:border-b-0"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 items-center justify-center">
                      {option.icon && option.iconName ? (
                        <option.icon name={option.iconName} size={24} color="#374151" />
                      ) : (
                        <option.icon size={24} color="#374151" />
                      )}
                    </View>
                    <View>
                      <Text className="text-base font-NunitoBold text-gray-900">
                        {option.name}
                      </Text>
                      <Text className="text-sm text-gray-500 font-NunitoMedium">
                        {option.description}
                      </Text>
                    </View>
                  </View>

                  {/* Radio Button */}
                  <View className="w-5 h-5 border-2 border-gray-300 rounded-full items-center justify-center">
                    {selectedUser === option.id && (
                      <View className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Action Buttons */}
            <View className="px-6 pb-8 border-t border-gray-100 pt-4">


              <CustomButton
                title={`Switch to ${selectedUser ? userOptions.find(u => u.id === selectedUser)?.name : "User"}`}
                onPress={handleConfirm}
                disabled={!selectedUser}

              />

              <CustomButton
                title={`Cancel`}
                onPress={onClose}
                className="bg-gray-300 mt-2"
                bgVariant="outline"
                textVariant="outline"
              />


            </View>
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default SwitchUserModal;

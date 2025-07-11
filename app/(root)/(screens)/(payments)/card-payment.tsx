"use client";

import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { icons } from "@/constants";
import CustomButton from "@/components/CustomButton";
import Checkbox from "@/components/Checkbox";
import BackArrowBtn from "@/components/BackArrowBtn";
import { routes } from "@/constants/routes";

const CardPayment = () => {
  const params = useLocalSearchParams();
  const totalAmount = Number(params.totalAmount) || 252000;

  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [saveCardInfo, setSaveCardInfo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, "");
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
    return formatted.substring(0, 19); // Limit to 16 digits + 3 spaces
  };

  const formatExpiryDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, "");
    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    const formatted = formatCardNumber(text);
    setCardDetails({ ...cardDetails, cardNumber: formatted });
  };

  const handleExpiryDateChange = (text: string) => {
    const formatted = formatExpiryDate(text);
    setCardDetails({ ...cardDetails, expiryDate: formatted });
  };

  const handleCvvChange = (text: string) => {
    // Only allow digits and limit to 4 characters
    const cleaned = text.replace(/\D/g, "").substring(0, 4);
    setCardDetails({ ...cardDetails, cvv: cleaned });
  };

  const handlePayNow = () => {
    setIsLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to order confirmation
      router.push(routes?.paymentOTP)
    }, 2000);
  };

  const isFormValid = () => {
    return (
      cardDetails.cardNumber.replace(/\s/g, "").length === 16 &&
      cardDetails.expiryDate.length === 5 &&
      cardDetails.cvv.length >= 3
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
        <BackArrowBtn />
        <Text className="text-xl font-NunitoBold text-gray-900">Payment</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-5 py-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Card Payment Section */}
        <View className="mb-8">
          <Text className="text-2xl font-NunitoBold text-gray-900 mb-2">
            Card payment
          </Text>
          <Text className="text-base text-gray-500">
            Make your payment using your bank card
          </Text>
        </View>

        {/* Card Number Field */}
        <View className="mb-6">
          <Text className="text-lg font-NunitoBold text-gray-900 mb-3">
            Smart card number
          </Text>
          <TextInput
            value={cardDetails.cardNumber}
            onChangeText={handleCardNumberChange}
            placeholder="0000 0000 0000 0000"
            placeholderTextColor="#C7C7CC"
            className="w-full p-4 bg-gray-100 rounded-xl text-lg font-NunitoMedium text-gray-900"
            keyboardType="numeric"
            maxLength={19}
          />
        </View>

        {/* Expiry Date and CVV Row */}
        <View className="flex-row mb-6">
          {/* Expiry Date */}
          <View className="flex-1 mr-3">
            <Text className="text-lg font-NunitoBold text-gray-900 mb-3">
              Smart card number
            </Text>
            <TextInput
              value={cardDetails.expiryDate}
              onChangeText={handleExpiryDateChange}
              placeholder="MM/YY"
              placeholderTextColor="#C7C7CC"
              className="w-full p-4 bg-gray-100 rounded-xl text-lg font-NunitoMedium text-gray-900"
              keyboardType="numeric"
              maxLength={5}
            />
          </View>

          {/* CVV */}
          <View className="flex-1 ml-3">
            <Text className="text-lg font-NunitoBold text-gray-900 mb-3">
              CVV
            </Text>
            <TextInput
              value={cardDetails.cvv}
              onChangeText={handleCvvChange}
              placeholder="123"
              placeholderTextColor="#C7C7CC"
              className="w-full p-4 bg-gray-100 rounded-xl text-lg font-NunitoMedium text-gray-900"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>

        {/* Save Card Information Checkbox */}
        <View className="mb-8">
          <Checkbox
            label="Save card information"
            isChecked={saveCardInfo}
            onPress={setSaveCardInfo}
            fillColor="#D30309"
            unfillColor="#FFFFFF"
            textColor="#374151"
            labelStyle="text-lg font-NunitoMedium"
            containerStyle="flex-row items-center"
          />
        </View>
      </ScrollView>

      {/* Bottom Pay Button */}
      <View className="px-5 pt-6 pb-[4rem] border-t border-gray-100">
        <CustomButton
          title={isLoading ? "Processing..." : "Pay now"}
          onPress={handlePayNow}
          className="py-4"
          bgVariant="primary"
          disabled={!isFormValid() || isLoading}
          loading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
};

export default CardPayment;

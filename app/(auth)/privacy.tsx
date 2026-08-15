import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const Section = ({ title, icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
  <View className="mb-8">
    <View className="flex-row items-center mb-3">
      <View className="bg-primary-50 p-2 rounded-full mr-3">
        <Ionicons name={icon} size={20} color="#D30309" />
      </View>
      <Text className="text-gray-900 text-[1.15rem] font-NunitoBold flex-1">{title}</Text>
    </View>
    <Text className="text-gray-600 text-[1rem] font-NunitoRegular leading-7">
      {children}
    </Text>
  </View>
);

export default function PrivacyPolicy() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-100 bg-white/90 z-10 shadow-sm shadow-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-gray-50 rounded-full active:bg-gray-100">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View className="ml-4 flex-1">
          <Text className="text-xl font-NunitoExtraBold text-gray-900">Privacy Policy</Text>
          <Text className="text-xs font-NunitoSemiBold text-gray-400 mt-0.5">Last updated: August 15, 2026</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-gray-500 text-[1rem] font-NunitoRegular leading-7 mb-8">
          At <Text className="font-NunitoBold text-primary-500">Oga Mechanic</Text>, your privacy is our highest priority. This policy outlines exactly how we collect, use, and protect your personal information when you use our services.
        </Text>

        <Section title="1. Information We Collect" icon="document-text-outline">
          We collect personal data that you provide directly to us, including your name, email address, phone number, vehicle details, and payment information. We also automatically collect diagnostic data, device information, and real-time location data when you use the app to request roadside assistance.
        </Section>

        <Section title="2. How We Use Your Data" icon="cog-outline">
          Your information is used strictly to provide and improve our services. This includes matching you with nearby mechanics, processing secure payments, sending service updates, and offering customer support. We may also use anonymized data for analytical purposes to improve app performance.
        </Section>

        <Section title="3. Location Services" icon="location-outline">
          Precise location tracking is essential for Oga Mechanic to function properly. We only track your location when the app is actively in use or running in the background during an active service request. You can revoke location permissions at any time through your device settings.
        </Section>

        <Section title="4. Data Sharing & Third Parties" icon="share-social-outline">
          We never sell your personal data to third parties. Your information (such as name, vehicle type, and location) is only shared with verified mechanics and parts sellers strictly to fulfill your requested services. We also share encrypted data with our trusted payment processors.
        </Section>

        <Section title="5. Biometric Authentication" icon="finger-print-outline">
          If you choose to enable Face ID or Touch ID for login, please note that your biometric data is stored securely on your device's secure enclave. Oga Mechanic does not have access to, nor do we store, your actual fingerprint or facial data on our servers.
        </Section>

        <Section title="6. Data Security" icon="lock-closed-outline">
          We implement rigorous, industry-standard encryption protocols (including SSL/TLS) to protect your personal and financial information. While we strive to use commercially acceptable means to protect your personal data, no method of transmission over the Internet is 100% secure.
        </Section>

        <View className="pb-12" />
      </ScrollView>
    </SafeAreaView>
  );
}

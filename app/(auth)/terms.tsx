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

export default function TermsAndConditions() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-gray-100 bg-white/90 z-10 shadow-sm shadow-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-gray-50 rounded-full active:bg-gray-100">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View className="ml-4 flex-1">
          <Text className="text-xl font-NunitoExtraBold text-gray-900">Terms & Conditions</Text>
          <Text className="text-xs font-NunitoSemiBold text-gray-400 mt-0.5">Last updated: August 15, 2026</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-gray-500 text-[1rem] font-NunitoRegular leading-7 mb-8">
          Welcome to <Text className="font-NunitoBold text-primary-500">Oga Mechanic</Text>. These Terms and Conditions govern your access to and use of our marketplace connecting vehicle owners with professional service providers. By accessing our platform, you agree to these terms in full.
        </Text>

        <Section title="1. Account Registration" icon="person-outline">
          To use our services, you must register for an account. You agree to provide accurate, current, and complete information during registration. You are strictly responsible for safeguarding your password and for all activities that occur under your account. Oga Mechanic reserves the right to suspend or terminate accounts that provide false information.
        </Section>

        <Section title="2. Service Provider Liability" icon="construct-outline">
          Oga Mechanic acts solely as an intermediary marketplace connecting users with mechanics and parts sellers. We do not directly provide automotive repair services. While we vet our professionals, we are not liable for the quality, safety, or legality of the services performed by third-party providers. All service contracts are strictly between the user and the provider.
        </Section>

        <Section title="3. Payments & Fees" icon="card-outline">
          All payments for services and parts must be processed securely through the Oga Mechanic platform. We reserve the right to charge service fees for facilitating transactions, which will be clearly displayed prior to checkout. Circumventing our payment system to pay providers directly is a violation of these terms.
        </Section>

        <Section title="4. Cancellations & Refunds" icon="refresh-outline">
          Users may cancel service requests subject to our cancellation policy. Cancellations made within 2 hours of a scheduled appointment may incur a penalty fee. Refunds for unsatisfactory services or defective parts must be initiated through our dispute resolution center within 48 hours of service completion.
        </Section>

        <Section title="5. User Conduct" icon="shield-checkmark-outline">
          You agree to interact with service providers respectfully and professionally. Any form of harassment, discrimination, or abusive behavior will result in immediate account termination. You must also ensure your vehicle is located in a safe, accessible environment before a mechanic arrives.
        </Section>

        <View className="pb-12" />
      </ScrollView>
    </SafeAreaView>
  );
}

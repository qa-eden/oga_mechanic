"use client";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { images } from "@/constants";
import BackArrowBtn from "@/components/BackArrowBtn";
import {
  CalendarIcon,
  TrashIcon,
  CogIcon,
  DocumentTextIcon,
  MapPinIcon,
  ClockIcon,
  FunnelIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "react-native-heroicons/outline";
import { CheckIcon } from "react-native-heroicons/solid";
import { LinearGradient } from "expo-linear-gradient";
import DeactivateCarModal from "@/components/modals/DeactivateCarModal";
import SuccessModal from "@/components/modals/SuccessModal";
import DeleteCarModal from "@/components/modals/DeleteCarModal";

interface CarDetails {
  id: number;
  name: string;
  year: number;
  plateNumber: string;
  vin: string;
  status: "Active" | "Inactive";
  image: any;
  color: string;
  mileage: number;
  fuelType: string;
  lastService: string;
  nextService: string;
  location: string;
  insurance: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
    status: "Active" | "Expired";
  };
  subscription: {
    plan: string;
    price: number;
    status: "Active" | "Inactive";
    nextRenewal: string;
    paymentMethod: string;
  };
  contact: {
    phone: string;
    email: string;
  };
}

const CarDetail = () => {
  const params = useLocalSearchParams();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successConfig, setSuccessConfig] = useState({
    title: "",
    message: "",
  });

  // Mock car data - in real app, this would be fetched based on car ID from params
  const [carData, setCarData] = useState<CarDetails>({
    id: 1,
    name: "Cadillac Escalade",
    year: 2022,
    plateNumber: "KJA-459BC",
    vin: "1GYKNGRS4NZ123456",
    status: "Active",
    image: images?.brabus,
    color: "#1F2937",
    mileage: 12500,
    fuelType: "Petrol",
    lastService: "2 months ago",
    nextService: "3 months from now",
    location: "Lagos, Nigeria",
    insurance: {
      provider: "Leadway Assurance",
      policyNumber: "LWA-2024-001234",
      expiryDate: "December 31, 2024",
      status: "Active",
    },
    subscription: {
      plan: "Premium",
      price: 20000,
      status: "Active",
      nextRenewal: "July 10, 2025",
      paymentMethod: "Mastercard **** 4242",
    },
    contact: {
      phone: "+234 801 234 5678",
      email: "support@ogamechanic.com",
    },
  });

  const handleDeactivate = () => {
    setShowDeactivateModal(true);
  };

  const handleConfirmDeactivate = () => {
    const newStatus = carData.status === "Active" ? "Inactive" : "Active";
    const actionText =
      carData.status === "Active" ? "deactivated" : "activated";

    setCarData((prev) => ({ ...prev, status: newStatus }));

    // Show success modal
    setSuccessConfig({
      title: "Success!",
      message: `${carData.name} has been ${actionText} successfully.`,
    });
    setShowSuccessModal(true);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    // Show success modal instead of Alert
    setSuccessConfig({
      title: "Car Deleted!",
      message: `${carData.name} has been permanently deleted from your account.`,
    });
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    if (successConfig.title === "Car Deleted!") {
      router.back();
    }
  };

  const handleManageSubscription = () => {
    console.log("Navigate to manage subscription");
    // Navigate to subscription management screen
  };

  const handleViewPaymentHistory = () => {
    console.log("Navigate to payment history");
    // Navigate to payment history screen
  };

  const { width: screenWidth } = Dimensions.get("window");

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={["#FFFFFF", "#F8FAFC"]}
        className="border-b border-gray-100"
      >
        <View className="flex-row items-center justify-between px-5 py-4">
          <BackArrowBtn />
          <View className="flex-1 items-center">
            <Text className="text-xl font-NunitoBold text-gray-900">
              Car Details
            </Text>
            <Text className="text-sm text-gray-500 font-NunitoMedium">
              Vehicle Information
            </Text>
          </View>
          <View className="w-6" />
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Enhanced Car Image */}
        <View className="px-5 pt-6">
          <View className="relative">
            <LinearGradient
              colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.3)"]}
              className="absolute inset-0 z-10 rounded-2xl"
            />
            <View
              className="w-full h-72 rounded-2xl items-center justify-center overflow-hidden"
              style={{ backgroundColor: carData.color + "20" }}
            >
              <carData.image width={screenWidth * 0.8} height={200} />
            </View>
            {/* Status Badge */}
            <View className="absolute top-4 right-4 z-20">
              <View
                className={`px-3 py-1 rounded-full ${
                  carData.status === "Active" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                <Text className="text-xs font-NunitoBold text-white">
                  {carData.status}
                </Text>
              </View>
            </View>
            {/* Car Color Indicator */}
            <View className="absolute bottom-4 left-4 z-20">
              <View
                className="w-8 h-8 rounded-full border-2 border-white shadow-lg"
                style={{ backgroundColor: carData.color }}
              />
            </View>
          </View>
        </View>

        {/* Enhanced Quick Actions */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-NunitoBold text-gray-900 mb-4">
            Quick Actions
          </Text>
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={handleDeactivate}
              className="flex-1 bg-primary-500 py-4 px-6 rounded-xl flex-row items-center justify-center shadow-lg"
              disabled={carData.status === "Inactive"}
              style={{
                opacity: carData.status === "Inactive" ? 0.5 : 1,
                shadowColor: "#D30309",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <CalendarIcon size={20} color="#FFFFFF" />
              <Text className="text-white font-NunitoBold text-base ml-2">
                {carData.status === "Active" ? "Deactivate" : "Deactivated"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              className="flex-1 bg-white border-2 border-red-500 py-4 px-6 rounded-xl flex-row items-center justify-center shadow-lg"
              style={{
                shadowColor: "#EF4444",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <TrashIcon size={20} color="#EF4444" />
              <Text className="text-red-500 font-NunitoBold text-base ml-2">
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Car Information Section */}
        <View className="mx-5 mb-6 bg-white rounded-2xl p-6 shadow-lg">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 bg-primary-100 rounded-xl mr-4 items-center justify-center">
              <DocumentTextIcon size={20} color="#D30309" />
            </View>
            <View>
              <Text className="text-xl font-NunitoBold text-gray-900">
                Vehicle Information
              </Text>
              <Text className="text-sm text-gray-500 font-NunitoMedium">
                Car details and specifications
              </Text>
            </View>
          </View>

          <View className="space-y-4">
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-blue-100 rounded-lg mr-3 items-center justify-center">
                  <Text className="text-blue-600 text-xs font-NunitoBold">
                    🚗
                  </Text>
                </View>
                <Text className="text-gray-700 font-NunitoMedium">
                  Car Name
                </Text>
              </View>
              <Text className="text-gray-900 font-NunitoBold">
                {carData.name}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-green-100 rounded-lg mr-3 items-center justify-center">
                  <Text className="text-green-600 text-xs font-NunitoBold">
                    📅
                  </Text>
                </View>
                <Text className="text-gray-700 font-NunitoMedium">
                  Model Year
                </Text>
              </View>
              <Text className="text-gray-900 font-NunitoBold">
                {carData.year}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-purple-100 rounded-lg mr-3 items-center justify-center">
                  <Text className="text-purple-600 text-xs font-NunitoBold">
                    🔢
                  </Text>
                </View>
                <Text className="text-gray-700 font-NunitoMedium">
                  Plate Number
                </Text>
              </View>
              <Text className="text-gray-900 font-NunitoBold">
                {carData.plateNumber}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-orange-100 rounded-lg mr-3 items-center justify-center">
                  <Text className="text-orange-600 text-xs font-NunitoBold">
                    🔍
                  </Text>
                </View>
                <Text className="text-gray-700 font-NunitoMedium">VIN</Text>
              </View>
              <Text className="text-gray-900 font-NunitoBold text-sm">
                {carData.vin}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-indigo-100 rounded-lg mr-3 items-center justify-center">
                  <Text className="text-indigo-600 text-xs font-NunitoBold">
                    📊
                  </Text>
                </View>
                <Text className="text-gray-700 font-NunitoMedium">Mileage</Text>
              </View>
              <Text className="text-gray-900 font-NunitoBold">
                {carData.mileage.toLocaleString()} km
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-yellow-100 rounded-lg mr-3 items-center justify-center">
                  <FunnelIcon size={16} color="#EAB308" />
                </View>
                <Text className="text-gray-700 font-NunitoMedium">
                  Fuel Type
                </Text>
              </View>
              <Text className="text-gray-900 font-NunitoBold">
                {carData.fuelType}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-red-100 rounded-lg mr-3 items-center justify-center">
                  <MapPinIcon size={16} color="#EF4444" />
                </View>
                <Text className="text-gray-700 font-NunitoMedium">
                  Location
                </Text>
              </View>
              <Text className="text-gray-900 font-NunitoBold">
                {carData.location}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-emerald-100 rounded-lg mr-3 items-center justify-center">
                  <ShieldCheckIcon size={16} color="#10B981" />
                </View>
                <Text className="text-gray-700 font-NunitoMedium">Status</Text>
              </View>
              <View
                className={`px-3 py-1 rounded-full ${
                  carData.status === "Active" ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <Text
                  className={`text-xs font-NunitoBold ${
                    carData.status === "Active"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {carData.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Service Information */}
        <View className="mx-5 mb-6 bg-white rounded-2xl p-6 shadow-lg">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 bg-blue-100 rounded-xl mr-4 items-center justify-center">
              <WrenchScrewdriverIcon size={20} color="#3B82F6" />
            </View>
            <View>
              <Text className="text-xl font-NunitoBold text-gray-900">
                Service Information
              </Text>
              <Text className="text-sm text-gray-500 font-NunitoMedium">
                Maintenance and service history
              </Text>
            </View>
          </View>

          <View className="space-y-4">
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-orange-100 rounded-lg mr-3 items-center justify-center">
                  <ClockIcon size={16} color="#F97316" />
                </View>
                <Text className="text-gray-700 font-NunitoMedium">
                  Last Service
                </Text>
              </View>
              <Text className="text-gray-900 font-NunitoBold">
                {carData.lastService}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-green-100 rounded-lg mr-3 items-center justify-center">
                  <CalendarIcon size={16} color="#10B981" />
                </View>
                <Text className="text-gray-700 font-NunitoMedium">
                  Next Service
                </Text>
              </View>
              <Text className="text-gray-900 font-NunitoBold">
                {carData.nextService}
              </Text>
            </View>
          </View>
        </View>

        {/* Insurance Information */}
        <View className="mx-5 mb-6 bg-white rounded-2xl p-6 shadow-lg">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 bg-emerald-100 rounded-xl mr-4 items-center justify-center">
              <ShieldCheckIcon size={20} color="#10B981" />
            </View>
            <View>
              <Text className="text-xl font-NunitoBold text-gray-900">
                Insurance Details
              </Text>
              <Text className="text-sm text-gray-500 font-NunitoMedium">
                Policy and coverage information
              </Text>
            </View>
          </View>

          <View className="space-y-4">
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-blue-100 rounded-lg mr-3 items-center justify-center">
                  <Text className="text-blue-600 text-xs font-NunitoBold">
                    🏢
                  </Text>
                </View>
                <Text className="text-gray-700 font-NunitoMedium">
                  Provider
                </Text>
              </View>
              <Text className="text-gray-900 font-NunitoBold">
                {carData.insurance.provider}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-purple-100 rounded-lg mr-3 items-center justify-center">
                  <Text className="text-purple-600 text-xs font-NunitoBold">
                    📋
                  </Text>
                </View>
                <Text className="text-gray-700 font-NunitoMedium">
                  Policy Number
                </Text>
              </View>
              <Text className="text-gray-900 font-NunitoBold text-sm">
                {carData.insurance.policyNumber}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-red-100 rounded-lg mr-3 items-center justify-center">
                  <CalendarIcon size={16} color="#EF4444" />
                </View>
                <Text className="text-gray-700 font-NunitoMedium">
                  Expiry Date
                </Text>
              </View>
              <Text className="text-gray-900 font-NunitoBold">
                {carData.insurance.expiryDate}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-emerald-100 rounded-lg mr-3 items-center justify-center">
                  <ShieldCheckIcon size={16} color="#10B981" />
                </View>
                <Text className="text-gray-700 font-NunitoMedium">Status</Text>
              </View>
              <View
                className={`px-3 py-1 rounded-full ${
                  carData.insurance.status === "Active"
                    ? "bg-green-100"
                    : "bg-red-100"
                }`}
              >
                <Text
                  className={`text-xs font-NunitoBold ${
                    carData.insurance.status === "Active"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {carData.insurance.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Enhanced Subscription Details */}
        <View className="mx-5 mb-6 bg-white rounded-2xl p-6 shadow-lg">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 bg-primary-100 rounded-xl mr-4 items-center justify-center">
              <CreditCardIcon size={20} color="#D30309" />
            </View>
            <View>
              <Text className="text-xl font-NunitoBold text-gray-900">
                Subscription Details
              </Text>
              <Text className="text-sm text-gray-500 font-NunitoMedium">
                Plan and payment information
              </Text>
            </View>
          </View>

          <View className="space-y-4">
            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-primary-100 rounded-lg mr-3 items-center justify-center">
                  <Text className="text-primary-600 text-xs font-NunitoBold">
                    💎
                  </Text>
                </View>
                <Text className="text-gray-700 font-NunitoMedium">Plan</Text>
              </View>
              <Text className="text-gray-900 font-NunitoBold">
                {carData.subscription.plan} – ₦
                {carData.subscription.price.toLocaleString()}/month
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-green-100 rounded-lg mr-3 items-center justify-center">
                  <ShieldCheckIcon size={16} color="#10B981" />
                </View>
                <Text className="text-gray-700 font-NunitoMedium">Status</Text>
              </View>
              <View className="flex-row items-center">
                <Text
                  className={`font-NunitoBold mr-2 ${
                    carData.subscription.status === "Active"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {carData.subscription.status}
                </Text>
                {carData.subscription.status === "Active" && (
                  <View className="w-5 h-5 bg-green-500 rounded-full items-center justify-center">
                    <CheckIcon size={12} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </View>

            <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-blue-100 rounded-lg mr-3 items-center justify-center">
                  <CalendarIcon size={16} color="#3B82F6" />
                </View>
                <Text className="text-gray-700 font-NunitoMedium">
                  Next Renewal
                </Text>
              </View>
              <Text className="text-gray-900 font-NunitoBold">
                {carData.subscription.nextRenewal}
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-purple-100 rounded-lg mr-3 items-center justify-center">
                  <CreditCardIcon size={16} color="#8B5CF6" />
                </View>
                <Text className="text-gray-700 font-NunitoMedium">
                  Payment Method
                </Text>
              </View>
              <Text className="text-gray-900 font-NunitoBold">
                {carData.subscription.paymentMethod}
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View className="mx-5 mb-6 bg-white rounded-2xl p-6 shadow-lg">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 bg-indigo-100 rounded-xl mr-4 items-center justify-center">
              <PhoneIcon size={20} color="#6366F1" />
            </View>
            <View>
              <Text className="text-xl font-NunitoBold text-gray-900">
                Contact Information
              </Text>
              <Text className="text-sm text-gray-500 font-NunitoMedium">
                Support and assistance
              </Text>
            </View>
          </View>

          <View className="space-y-4">
            <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-green-100 rounded-lg mr-3 items-center justify-center">
                  <PhoneIcon size={16} color="#10B981" />
                </View>
                <Text className="text-gray-700 font-NunitoMedium">Phone</Text>
              </View>
              <Text className="text-primary-600 font-NunitoBold">
                {carData.contact.phone}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-blue-100 rounded-lg mr-3 items-center justify-center">
                  <EnvelopeIcon size={16} color="#3B82F6" />
                </View>
                <Text className="text-gray-700 font-NunitoMedium">Email</Text>
              </View>
              <Text className="text-primary-600 font-NunitoBold">
                {carData.contact.email}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced Actions */}
        <View className="mx-5 mb-8">
          <Text className="text-lg font-NunitoBold text-gray-900 mb-4">
            Quick Actions
          </Text>

          <View className="space-y-3">
            <TouchableOpacity
              onPress={handleManageSubscription}
              className="flex-row items-center justify-between py-4 px-4 bg-primary-50 rounded-xl border border-primary-200"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-primary-100 rounded-lg mr-4 items-center justify-center">
                  <CogIcon size={20} color="#D30309" />
                </View>
                <View>
                  <Text className="text-gray-900 font-NunitoBold text-base">
                    Manage Subscription
                  </Text>
                  <Text className="text-gray-500 font-NunitoMedium text-sm">
                    Update plan or payment method
                  </Text>
                </View>
              </View>
              <View className="w-6 h-6 bg-primary-100 rounded-full items-center justify-center">
                <Text className="text-primary-600 text-xs font-NunitoBold">
                  →
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleViewPaymentHistory}
              className="flex-row items-center justify-between py-4 px-4 bg-gray-50 rounded-xl border border-gray-200"
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-gray-100 rounded-lg mr-4 items-center justify-center">
                  <DocumentTextIcon size={20} color="#6B7280" />
                </View>
                <View>
                  <Text className="text-gray-900 font-NunitoBold text-base">
                    Payment History
                  </Text>
                  <Text className="text-gray-500 font-NunitoMedium text-sm">
                    View all transactions
                  </Text>
                </View>
              </View>
              <View className="w-6 h-6 bg-gray-100 rounded-full items-center justify-center">
                <Text className="text-gray-600 text-xs font-NunitoBold">→</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacing */}
        <View className="h-20" />
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <DeleteCarModal
        isVisible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        carName={carData.name}
      />

      {/* Deactivate Confirmation Modal */}
      <DeactivateCarModal
        isVisible={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={handleConfirmDeactivate}
        carName={carData.name}
        isActive={carData.status === "Active"}
      />

      {/* Success Modal */}
      <SuccessModal
        isVisible={showSuccessModal}
        onClose={handleSuccessClose}
        title={successConfig.title}
        message={successConfig.message}
      />
    </SafeAreaView>
  );
};

export default CarDetail;

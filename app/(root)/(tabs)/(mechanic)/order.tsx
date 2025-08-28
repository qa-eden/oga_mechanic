"use client";

import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { mechanicRoutes } from "@/constants/routes";
import OrderCard, { Order } from "@/components/OrderCard";

const MechanicOrder = () => {
  const [activeTab, setActiveTab] = useState("current");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"accept" | "decline" | "complete">("accept");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");

  // Sample data - replace with actual data from your API
  const currentOrders: Order[] = [
    {
      id: "1",
      clientName: "Susan Sheidu",
      phoneNumber: "09087654322",
      carType: "Mercedez Benz",
      carIssue: "Bad engine response",
    },
    {
      id: "2",
      clientName: "Susan Sheidu",
      phoneNumber: "09087654322",
      carType: "Mercedez Benz",
      carIssue: "Bad engine response",
    },
    {
      id: "3",
      clientName: "Susan Sheidu",
      phoneNumber: "09087654322",
      carType: "Mercedez Benz",
      carIssue: "Bad engine response",
    },
    {
      id: "4",
      clientName: "Susan Sheidu",
      phoneNumber: "09087654322",
      carType: "Mercedez Benz",
      carIssue: "Bad engine response",
    },
    {
      id: "5",
      clientName: "Susan Sheidu",
      phoneNumber: "09087654322",
      carType: "Mercedez Benz",
      carIssue: "Bad engine response",
    },
  ];

  const ongoingOrders: Order[] = [
    {
      id: "6",
      clientName: "Susan Sheidu",
      phoneNumber: "09087654322",
      carType: "Mercedes Benz",
      carIssue: "Bad engine response",
      status: "ongoing",
    },
    {
      id: "7",
      clientName: "David Wilson",
      phoneNumber: "08076543210",
      carType: "BMW X5",
      carIssue: "Transmission repair",
      status: "ongoing",
    },
    {
      id: "8",
      clientName: "Sarah Connor",
      phoneNumber: "08065432109",
      carType: "Audi A4",
      carIssue: "Air conditioning not working",
      status: "ongoing",
    },
  ];

  const completedOrders: Order[] = [
    {
      id: "9",
      clientName: "Susan Sheidu",
      phoneNumber: "09087654322",
      carType: "Mercedes Benz",
      carIssue: "Bad engine response",
      status: "completed",
    },
    {
      id: "10",
      clientName: "Michael Brown",
      phoneNumber: "08054321098",
      carType: "Toyota Corolla",
      carIssue: "Brake system check",
      status: "completed",
    },
    {
      id: "11",
      clientName: "Susan Sheidu",
      phoneNumber: "09087654322",
      carType: "Mercedes Benz",
      carIssue: "Bad engine response",
      status: "declined",
    },
    {
      id: "12",
      clientName: "Robert Taylor",
      phoneNumber: "08043210987",
      carType: "Honda Accord",
      carIssue: "Engine tune-up",
      status: "completed",
    },
  ];

  const handleAccept = (orderId: string) => {
    setSelectedOrderId(orderId);
    setModalType("accept");
    setModalVisible(true);
  };

  const handleDecline = (orderId: string) => {
    setSelectedOrderId(orderId);
    setModalType("decline");
    setModalVisible(true);
  };

  const confirmAction = () => {
    if (modalType === "accept") {
      console.log("Confirmed accept for order:", selectedOrderId);
      router.push(mechanicRoutes.ConfirmOrder)
      // Handle accept logic here
    } else if (modalType === "decline") {
      console.log("Confirmed decline for order:", selectedOrderId);
      // Handle decline logic here
    } else if (modalType === "complete") {
      console.log("Confirmed complete for order:", selectedOrderId);
      // Handle mark as complete logic here
      // You might want to move the order from ongoing to completed
    }
    setModalVisible(false);
  };

  const cancelAction = () => {
    setModalVisible(false);
  };

  const handleMarkComplete = (orderId: string) => {
    setSelectedOrderId(orderId);
    setModalType("complete");
    setModalVisible(true);
  };

  const getCurrentOrders = () => {
    switch (activeTab) {
      case "current":
        return currentOrders;
      case "ongoing":
        return ongoingOrders;
      case "completed":
        return completedOrders;
      default:
        return currentOrders;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text className="text-xl font-NunitoBold text-center text-gray-800">
          Orders
        </Text>
      </View>

      {/* Tab Navigation */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row bg-gray-100 rounded-[.3rem] p-1 overflow-hidden">
          {[
            { key: "current", label: "Current orders" },
            { key: "ongoing", label: "Ongoing orders" },
            { key: "completed", label: "Completed orders" }
          ].map((tab, index) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 flex justify-center items-center rounded-[.3rem] ${index < 2 ? "mr-0" : ""
                } ${activeTab === tab.key
                  ? "bg-white shadow-sm px-1"
                  : "bg-transparent"
                }`}
            >
              <Text className={`font-NunitoBold text-center text-[.95rem] ${activeTab === tab.key ? "text-red-600" : "text-gray-500"
                }`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Orders List */}
      <ScrollView className="flex-1 pt-4 mx-4">
        {getCurrentOrders().length > 0 ? (
          getCurrentOrders().map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              type={activeTab.toLowerCase() as "current" | "ongoing" | "completed"}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onMarkComplete={handleMarkComplete}
            />
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 font-NunitoSemiBold text-base">
              No {activeTab} orders
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Confirmation Drawer */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={cancelAction}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl px-6 pt-4 pb-8">
            {/* Drawer Handle */}
            <View className="items-center mb-6">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            {/* Icon */}
            <View className="items-center mb-4">
              {modalType === "accept" ? (
                <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center">
                  <Text className="text-green-600 text-2xl font-bold">✓</Text>
                </View>
              ) : modalType === "decline" ? (
                <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center">
                  <Text className="text-red-600 text-2xl font-bold">✗</Text>
                </View>
              ) : (
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                  <Text className="text-blue-600 text-2xl font-bold">✓</Text>
                </View>
              )}
            </View>

            {/* Title */}
            <Text className="text-xl font-NunitoBold text-left text-gray-800 mb-3">
              {modalType === "accept" ? "Accept Order" : modalType === "decline" ? "Decline Order" : "Mark as Completed"}
            </Text>

            {/* Message */}
            <Text className="text-gray-600 text-left mb-8 font-NunitoRegular leading-6">
              {modalType === "complete"
                ? "Are you sure you want to mark this service order as completed? This action cannot be undone."
                : `Are you sure you want to ${modalType} this client's service order?`
              }
            </Text>

            {/* Buttons */}
            <View className="space-y-3">
              <TouchableOpacity
                onPress={confirmAction}
                className={`${
                  modalType === "complete"
                    ? "bg-green-600"
                    : modalType === "accept"
                    ? "bg-green-600"
                    : "bg-red-600"
                } rounded-xl py-4`}
              >
                <Text className="text-white font-NunitoBold text-center text-base">
                  {modalType === "complete"
                    ? "Mark as Completed"
                    : modalType === "accept"
                    ? "Accept Order"
                    : "Decline Order"
                  }
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={cancelAction}
                className="bg-gray-100 rounded-xl py-4 mt-3"
              >
                <Text className="text-gray-700 font-NunitoBold text-center text-base">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MechanicOrder;
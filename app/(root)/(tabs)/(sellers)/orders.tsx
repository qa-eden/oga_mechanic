import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { View, Text, ScrollView } from 'react-native'
import OrderItemCard from '@/components/cards/OrderItemCard'

const Orders = () => {
  // Sample orders data grouped by month
  const ordersData = {
    "JANUARY 2025": [
      {
        id: "1",
        productName: "Two piece hoodie",
        orderDate: "03-02-2025",
        price: 3224.00,
        status: "Paid",
      },
      {
        id: "2", 
        productName: "Two piece hoodie",
        orderDate: "03-02-2025",
        price: 3224.00,
        status: "Paid",
      },
      {
        id: "3",
        productName: "Two piece hoodie", 
        orderDate: "03-02-2025",
        price: 3224.00,
        status: "Paid",
      },
      {
        id: "4",
        productName: "Two piece hoodie",
        orderDate: "03-02-2025", 
        price: 3224.00,
        status: "Paid",
      },
      {
        id: "5",
        productName: "Two piece hoodie",
        orderDate: "03-02-2025",
        price: 3224.00,
        status: "Paid",
      },
      {
        id: "6",
        productName: "Two piece hoodie",
        orderDate: "03-02-2025",
        price: 3224.00,
        status: "Paid",
      },
      {
        id: "7",
        productName: "Two piece hoodie",
        orderDate: "03-02-2025",
        price: 3224.00,
        status: "Paid",
      },
      {
        id: "8",
        productName: "Two piece hoodie",
        orderDate: "03-02-2025",
        price: 3224.00,
        status: "Paid",
      },
      {
        id: "9",
        productName: "Two piece hoodie",
        orderDate: "03-02-2025",
        price: 3224.00,
        status: "Paid",
      },
    ]
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <Text className="text-xl font-NunitoBold text-center text-gray-800">
          Orders
        </Text>
      </View>

      {/* Orders List */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {Object.entries(ordersData).map(([month, orders]) => (
          <View key={month} className="py-4">
            {/* Month Header */}
            <Text className="text-sm font-NunitoBold text-gray-600 mb-4 uppercase tracking-wide">
              {month}
            </Text>
            
            {/* Orders for this month */}
            {orders.map((order) => (
              <OrderItemCard
                key={order.id}
                order={order}
                iconColor="#0A6DEE"
                iconBgColor="bg-blue-50"
                statusColor="text-green-700"
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

export default Orders
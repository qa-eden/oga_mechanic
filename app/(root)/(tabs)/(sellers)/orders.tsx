import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline'
import OrderItemCard from '@/components/cards/OrderItemCard'

const Orders = () => {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'delivered'>('ongoing')
  const [searchQuery, setSearchQuery] = useState('')

  // Sample orders data with different statuses
  const ongoingOrders = [
    {
      id: "1",
      productName: "Toyota Corolla Tire",
      orderDate: "03-02-2025",
      price: 45000.00,
      status: "Not delivered",
      quantity: 1,
      image: null,
      deliveryDate: "May 30, 2025",
      paymentStatus: "Paid",
    },
    {
      id: "2",
      productName: "Honda Civic Brake Pads",
      orderDate: "02-02-2025",
      price: 25000.00,
      status: "Ongoing",
      quantity: 2,
      image: null,
      deliveryDate: "June 1, 2025",
      paymentStatus: "Paid",
    },
  ]

  const deliveredOrders = [
    {
      id: "3",
      productName: "Ford Focus Air Filter",
      orderDate: "01-02-2025",
      price: 15000.00,
      status: "Delivered",
      quantity: 1,
      image: null,
      deliveryDate: "May 28, 2025",
      paymentStatus: "Paid",
    },
    {
      id: "4",
      productName: "BMW X5 Oil Filter",
      orderDate: "30-01-2025",
      price: 35000.00,
      status: "Delivered",
      quantity: 1,
      image: null,
      deliveryDate: "May 25, 2025",
      paymentStatus: "Paid",
    },
  ]

  // Filter orders based on search query
  const filteredOngoingOrders = ongoingOrders.filter(order =>
    order.productName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredDeliveredOrders = deliveredOrders.filter(order =>
    order.productName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-gray-100">
        <View className="flex-row items-center">

          <Text className="text-xl font-NunitoBold text-gray-800 flex-1 text-center">
            My orders
          </Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="bg-white px-4 py-3 border-b border-gray-100">
        <View className="flex-row bg-gray-100 rounded-lg p-1">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-md ${activeTab === 'ongoing' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setActiveTab('ongoing')}
          >
            <Text className={`text-center font-NunitoMedium ${activeTab === 'ongoing' ? 'text-red-600' : 'text-gray-500'}`}>
              Ongoing
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-md ${activeTab === 'delivered' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => setActiveTab('delivered')}
          >
            <Text className={`text-center font-NunitoMedium ${activeTab === 'delivered' ? 'text-red-600' : 'text-gray-500'}`}>
              Delivered
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View className="bg-white px-4 py-4 rounded-md border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <MagnifyingGlassIcon size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-900 font-NunitoMedium"
            placeholder="Search"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Orders List */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="py-4">
          {(activeTab === 'ongoing' ? filteredOngoingOrders : filteredDeliveredOrders).map((order) => (
            <OrderItemCard
              key={order.id}
              order={order}
            />
          ))}

          {/* Empty State */}
          {(activeTab === 'ongoing' ? filteredOngoingOrders : filteredDeliveredOrders).length === 0 && (
            <View className="py-8 items-center">
              <Text className="text-gray-500 font-NunitoMedium text-center">
                {searchQuery ? 'No orders found matching your search.' : `No ${activeTab} orders found.`}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Orders
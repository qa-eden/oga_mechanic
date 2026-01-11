import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { CalendarIcon, ClockIcon } from "react-native-heroicons/solid";
import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { router } from "expo-router";
import { routes } from "@/constants/routes";
import { useLocation } from "@/contexts/LocationContext";

interface BookRideViewProps {
  handleScheduleRide: () => void;
  handleLocationInputPress: (type: "from" | "to") => void;
}

const BookRideView: React.FC<BookRideViewProps> = ({
  handleScheduleRide,
  handleLocationInputPress,
}) => {
  const [activeService, setActiveService] = React.useState('rides');
  const { state: { fromLocation }, setToLocation } = useLocation();

  const recentPlaces = [
    {
      id: "1",
      name: "29a Berkley Street",
      address: "Lagos, Nigeria",
      latitude: 6.4500, // Mock
      longitude: 3.4000,
    },
    {
      id: "2",
      name: "Limeridge Hotels",
      address: "Ikoyi, Lagos",
      latitude: 6.4550, // Mock
      longitude: 3.4200,
    }
  ];

  const handleRecentPlacePress = (place: any) => {
      const toLocationData = {
          name: place.name,
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude
      };
      
      setToLocation(toLocationData);

      router.push({
          pathname: routes.chooseRide,
          params: {
              from: JSON.stringify(fromLocation),
              to: JSON.stringify(toLocationData),
              rideType: "Standard",
              isScheduled: "false"
          }
      });
  };

  return (
    <View className="px-5">
      <Text className="text-xl font-NunitoExtraBold text-gray-900 mb-5">
        Your journey begins here.
      </Text>

      {/* Services Grid */}
      <View className="flex-row justify-between mb-6">
        {[
          {
            id: 'rides',
            label: 'Rides',
            icon: <FontAwesome name="car" size={28} />,
            color: '#1F2937',
            bgColor: null
          },
          {
            id: 'delivery',
            label: 'Delivery',
            icon: <FontAwesome name="cube" size={28} />,
            color: '#4B5563',
            bgColor: null
          },
          {
            id: 'schedule',
            label: 'Schedule',
            icon: <CalendarIcon size={28} style={{ marginBottom: 8 }} />,
            color: '#4B5563',
            bgColor: null
          }
        ].map((service) => {
          const isActive = activeService === service.id;
          const iconColor = isActive ? '#D30309' : service.color; // Primary red when active

          return (
            <TouchableOpacity
              key={service.id}
              onPress={() => {
                setActiveService(service.id);
                if (service.id === 'schedule') {
                  handleScheduleRide();
                }
              }}
              className={`items-center p-4 rounded-2xl w-[32%] ${
                isActive ? 'bg-primary-100 shadow-sm' : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <View className={`w-12 h-8 mb-2 items-center justify-center ${service.bgColor && !isActive ? service.bgColor : ''} rounded-lg`}>
                {React.cloneElement(service.icon as React.ReactElement<{ color?: string }>, { color: iconColor })}
              </View>
              <Text className={`font-NunitoBold text-md ${isActive ? 'text-primary-700' : 'text-gray-900'}`}>{service.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Where to Input */}
      <TouchableOpacity
        onPress={() => handleLocationInputPress("to")}
        className="bg-gray-100 p-4 rounded-xl flex-row items-center mb-6"
      >
        <MagnifyingGlassIcon size={24} color="#1F2937" />
        <Text className="ml-3 text-lg font-NunitoBold text-gray-900">
          Where to?
        </Text>
        {/* <View className="flex-1 items-end">
          <View className="bg-white px-3 py-1 rounded-full shadow-sm">
            <Text className="font-NunitoBold text-xs text-gray-800">Later</Text>
          </View>
        </View> */}
      </TouchableOpacity>

      {/* Recent Places */}
      <View>
        {recentPlaces.map((place, index) => (
             <TouchableOpacity 
                key={place.id}
                onPress={() => handleRecentPlacePress(place)}
                className={`flex-row items-center py-3 ${index !== recentPlaces.length - 1 ? "border-b border-gray-50" : ""}`}
             >
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4">
                    <ClockIcon size={20} color="#6B7280" />
                </View>
                <View>
                    <Text className="font-NunitoBold text-base text-gray-900">
                    {place.name}
                    </Text>
                    <Text className="text-gray-500 text-xs font-NunitoMedium">
                    {place.address}
                    </Text>
                </View>
            </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default BookRideView;

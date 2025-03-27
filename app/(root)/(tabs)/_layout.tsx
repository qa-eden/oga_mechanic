import { Tabs } from "expo-router";
import { View, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { icons } from "@/constants";

const TabIcon = ({
  Icon,
  focused,
}: {
  Icon: React.FC<any>;
  focused: boolean;
}) => {
  // Create animated opacity value
  const opacityAnim = useRef(new Animated.Value(focused ? 1 : 0.7)).current;

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: focused ? 1 : 0.7, // Smooth transition between focused and unfocused
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        width: 100,
        borderTopWidth: 2, // Red top border for active tab
        borderTopColor: focused ? "red" : "transparent",
        paddingTop: 13,
        opacity: opacityAnim, // Smooth opacity transition
      }}
    >
      <Icon width={30} height={30} fill={focused ? "red" : "#7D7D7D"} />
    </Animated.View>
  );
};

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true, // Show labels under icons
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 5,
        },
        tabBarActiveTintColor: "#D30309", // Active tab text color
        tabBarInactiveTintColor: "#7D7D7D", // Inactive tab text color
        tabBarStyle: {
          backgroundColor: "white",
          height: 90,
          position: "absolute",
          bottom: 0,
          borderTopWidth: 1, // Adds a border on top
          borderTopColor: "#E0E0E0", // Light gray border color
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              Icon={focused ? icons.activeHome : icons.home}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cars"
        options={{
          title: "My Cars",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={icons.car} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="services"
        options={{
          title: "Services",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              Icon={focused ? icons.activeServices : icons.services}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
              Icon={focused ? icons.activeProfile : icons.profile}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

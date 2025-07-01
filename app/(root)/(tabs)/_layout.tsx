// import { Tabs } from "expo-router";
// import { View, Animated } from "react-native";
// import { useEffect, useRef } from "react";
// import { icons } from "@/constants";

// const TabIcon = ({
//   Icon,
//   focused,
// }: {
//   Icon: React.FC<any>;
//   focused: boolean;
// }) => {
//   // Create animated opacity value
//   const opacityAnim = useRef(new Animated.Value(focused ? 1 : 0.7)).current;

//   useEffect(() => {
//     Animated.timing(opacityAnim, {
//       toValue: focused ? 1 : 0.7,
//       duration: 200,
//       useNativeDriver: true,
//     }).start();
//   }, [focused]);

//   return (
//     <Animated.View
//       style={{
//         alignItems: "center",
//         justifyContent: "center",
//         paddingVertical: 12,
//         width: 100,
//         opacity: opacityAnim,
//       }}
//     >
//       <Icon width={30} height={30} fill={focused ? "red" : "#7D7D7D"} />
//     </Animated.View>
//   );
// };

// export default function Layout() {
//   return (
//     <Tabs
//       screenOptions={{
//         tabBarShowLabel: true,
//         tabBarLabelStyle: {
//           fontSize: 12,
//           fontWeight: "600",
//           marginTop: 5,
//         },
//         tabBarActiveTintColor: "#D30309",
//         tabBarInactiveTintColor: "#7D7D7D",
//         tabBarStyle: {
//           backgroundColor: "white",
//           height: 90,
//           position: "absolute",
//           bottom: 0,
//           shadowColor: "transparent",
//           elevation: 0,
//           borderTopWidth: 0,
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="home"
//         options={{
//           title: "Home",
//           headerShown: false,
//           tabBarIcon: ({ focused }) => (
//             <TabIcon Icon={focused ? icons.activeHome : icons.home} focused={focused} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="cars"
//         options={{
//           title: "My Cars",
//           headerShown: false,
//           tabBarIcon: ({ focused }) => (
//             <TabIcon Icon={focused ? icons.activeCar : icons.car} focused={focused} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="shop"
//         options={{
//           title: "",
//           headerShown: false,
//           tabBarIcon: ({ focused }) => (
//             <View style={{ alignItems: "center", justifyContent: "center" }}>
//               {/* Shop Tab Background */}
//               <View
//                 style={{
//                   position: "absolute",
//                   bottom: -20, // Extends below the tab bar
//                   width: 80,
//                   height: 50,
//                   backgroundColor: "white",
//                   borderRadius: 25, // Rounded effect at the bottom
//                   shadowColor: "#000",
//                   shadowOffset: { width: 0, height: 2 },
//                   shadowOpacity: 0.2,
//                   shadowRadius: 4,
//                   elevation: 5,
//                 }}
//               />
//               <icons.shopTab />
//             </View>
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="services"
//         options={{
//           title: "Services",
//           headerShown: false,
//           tabBarIcon: ({ focused }) => (
//             <TabIcon Icon={focused ? icons.activeServices : icons.services} focused={focused} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: "Profile",
//           headerShown: false,
//           tabBarIcon: ({ focused }) => (
//             <TabIcon Icon={focused ? icons.activeProfile : icons.profile} focused={focused} />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }

import React from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  Text,
  StyleSheet,
} from "react-native";
import { CurvedBottomBarExpo } from "react-native-curved-bottom-bar";
import { useRouter } from "expo-router";
import { icons } from "@/constants";
import { Dimensions } from "react-native";

// Import your actual tab screen components
import HomeScreen from "./home";
import CarsScreen from "./cars";
import ServicesScreen from "./services";
import ProfileScreen from "./profile";
import ShopScreen from "./shop"; // Shop screen component

export default function Layout() {
  const router = useRouter();
  const { width } = Dimensions.get("window");

  // Function to render tab icons with labels
  const renderTabBar = ({
    routeName,
    selectedTab,
  }: {
    routeName: string;
    selectedTab: string;
  }) => {
    // console.log(selectedTab);

    // Define the icon and label for each tab
    const tabInfo: Record<
      string,
      { icon: JSX.Element; activeIcon: JSX.Element; label: string }
    > = {
      home: {
        icon: <icons.home />,
        activeIcon: <icons.activeHome />,
        label: "Home",
      },
      cars: {
        icon: <icons.car />,
        activeIcon: <icons.activeCar />,
        label: "Cars",
      },
      services: {
        icon: <icons.services />,
        activeIcon: <icons.activeServices />,
        label: "Services",
      },
      profile: {
        icon: <icons.profile />,
        activeIcon: <icons.activeProfile />,
        label: "Profile",
      },
    };

    const isActive = routeName === selectedTab;

    return (
      <TouchableOpacity
        onPress={() => {
          const routeMap: Record<
            string,
            | "/(root)/(tabs)/home"
            | "/(root)/(tabs)/cars"
            | "/(root)/(tabs)/services"
            | "/(root)/(tabs)/profile"
          > = {
            home: "/(root)/(tabs)/home",
            cars: "/(root)/(tabs)/cars",
            services: "/(root)/(tabs)/services",
            profile: "/(root)/(tabs)/profile",
          };
          router.push(routeMap[routeName] || "/(root)/(tabs)/home");
        }}
        style={styles.tabBarItem}
      >
        {isActive ? tabInfo[routeName]?.activeIcon : tabInfo[routeName]?.icon}
        <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
          {tabInfo[routeName]?.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <CurvedBottomBarExpo.Navigator
    screenOptions={{
      headerShown: false,
    }}
      type="DOWN"
      style={styles.bottomBar}
      height={80}
      width={width}
      borderColor="transparent"
      borderWidth={0}
      id="curved-bottom-bar"
      circleWidth={100} // Increased for better floating effect
      // circleWidth={1} // Minimized curve effect
      bgColor="white"
      borderTopLeftRight={false}
      // borderTopLeftRight
      initialRouteName="home"
      tabBar={renderTabBar}
      renderCircle={() => (
        <Animated.View style={styles.shopTabContainer}>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push("/(root)/(tabs)/shop")}
          >
            <icons.shopTab />
          </TouchableOpacity>
        </Animated.View>
      )}
      circlePosition="CENTER"
      shadowStyle={{
        elevation: 10, // Stronger shadow to create more separation
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      }}
      screenListeners={{}}
      // screenOptions={{}}
      defaultScreenOptions={{}}
      backBehavior="initialRoute"
    >
      <CurvedBottomBarExpo.Screen
        name="home"
        position="LEFT"
        component={HomeScreen}
      />
      <CurvedBottomBarExpo.Screen
        name="cars"
        position="LEFT"
        component={CarsScreen}
      />
      <CurvedBottomBarExpo.Screen
        name="services"
        position="RIGHT"
        component={ServicesScreen}
      />
      <CurvedBottomBarExpo.Screen
        name="profile"
        position="RIGHT"
        component={ProfileScreen}
      />
      <CurvedBottomBarExpo.Screen
        name="shop"
        position="CENTER"
        component={ShopScreen}
      />
    </CurvedBottomBarExpo.Navigator>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    backgroundColor: "transparent",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
  },
  tabBarItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 12,
    color: "#888", // Default inactive color
    marginTop: 4,
  },
  activeTabLabel: {
    color: "#D30309", // Change this to your desired active color
    fontWeight: "bold",
  },
  shopTabContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    bottom: 35,
  },
  shopButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#D30309",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});

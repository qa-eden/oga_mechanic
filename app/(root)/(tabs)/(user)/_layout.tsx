import React from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import { CurvedBottomBarExpo } from "react-native-curved-bottom-bar";
import { useRouter } from "expo-router";
import { icons } from "@/constants";
import { Dimensions } from "react-native";
import { routes } from "@/constants/routes";
import AndroidNavBarSpacer from "@/components/AndroidNavBarSpacer";


// Import your actual tab screen components
import HomeScreen from "./home";
import ProfileScreen from "./profile";
import ShopScreen from "./shop"; // Shop screen component

export default function Layout() {
  const router = useRouter();
  const { width } = Dimensions.get("window");

  // Function to render tab icons with labels
  const renderTabBar = ({
    routeName,
    selectedTab,
    navigate,
  }: {
    routeName: string;
    selectedTab: string;
    navigate: (routeName: string) => void;
  }) => {
    // console.log(selectedTab);

    // Define the icon and label for each tab
    const tabInfo: Record<
      string,
      {
        icon: React.ReactElement;
        activeIcon: React.ReactElement;
        label: string;
      }
    > = {
      home: {
        icon: <icons.home width={28} height={28} />,
        activeIcon: <icons.activeHome width={32} height={32} />,
        label: "Home",
      },
      // cars: {
      //   icon: <icons.car />,
      //   activeIcon: <icons.activeCar />,
      //   label: "My Cars",
      // },

      profile: {
        icon: <icons.profile  width={28} height={28}/>,
        activeIcon: <icons.activeProfile width={32} height={32} />,
        label: "Profile",
      },
    };

    const isActive = routeName === selectedTab;

    return (
      <TouchableOpacity
        onPress={() => {
          navigate(routeName);
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
    <View style={{ flex: 1, position: "relative" }}>
      <CurvedBottomBarExpo.Navigator
        screenOptions={{
          headerShown: false,
        }}
        type="DOWN"
        style={[
          styles.bottomBar,
          // Platform.OS === "android" && { paddingBottom: 35 }, // match the red bar height
        ]}
        height={Platform.OS === "android" ? 75 : 80}
        width={width}
        borderColor="transparent"
        borderWidth={0}
        id="curved-bottom-bar"
        circleWidth={100} // Increased for better floating effect
        // circleWidth={1} // Minimized curve effect
        bgColor="white"
        borderTopLeftRight={false}
        // borderTopLeftRight
        initialRouteName={"home"}
        tabBar={renderTabBar}
        renderCircle={({ navigate }: { navigate: (routeName: string) => void }) => (
          <Animated.View
            style={[
              styles.shopTabContainer,
              Platform.OS === "android" && { paddingBottom: 24 },
            ]}
          >
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigate("shop")}
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
        {/* <CurvedBottomBarExpo.Screen
          name="cars"
          position="LEFT"
          component={CarsScreen}
        /> */}

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
      
      {/* Android Navigation Bar Spacer */}
      <AndroidNavBarSpacer />
    </View>
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
    paddingBottom: 14,
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
    bottom: Platform.OS === "ios" ? 30 : 20,
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

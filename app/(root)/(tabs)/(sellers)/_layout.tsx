import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
// import { useRouter } from "expo-router";
import { icons } from "@/constants";
// import { Dimensions } from "react-native";
// import { routes } from "@/constants/routes";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import your actual tab screen components
import SellerEarnings from "./earnings";
import SellerProduct from "./product";
import SellerProfile from "./profile";
import SellerHome from "./home";

export default function Layout() {
  // const router = useRouter();
  // const { width } = Dimensions.get("window");
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("home");

  // Function to render tab icons with labels
  const renderTabBar = () => {
    // Define the icon and label for each tab  order,
  // activeOrder,
    const tabInfo: Record<
      string,
      {
        icon: React.ReactElement;
        activeIcon: React.ReactElement;
        label: string;
        component: React.ComponentType;
      }
    > = {
      home: {
        icon: <icons.home />,
        activeIcon: <icons.activeHome />,
        label: "Home",
        component: SellerHome,
      },
      consultation: {
        icon: <icons.productTab />,
        activeIcon: <icons.activeProductTab />,
        label: "Products",
        component: SellerProduct,
      },
      earnings: {
        icon: <icons.earnings />,
        activeIcon: <icons.activeEarnings />,
        label: "Earnings",
        component: SellerEarnings,
      },
      profile: {
        icon: <icons.profile />,
        activeIcon: <icons.activeProfile />,
        label: "Profile",
        component: SellerProfile,
      },
    };

    return (
      <View
        style={[
          styles.bottomBar,
          Platform.OS === "android" && { paddingBottom: insets.bottom },
        ]}
      >
        {Object.keys(tabInfo).map((routeName) => {
          const isActive = routeName === activeTab;
          return (
            <TouchableOpacity
              key={routeName}
              onPress={() => setActiveTab(routeName)}
              style={styles.tabBarItem}
            >
              {isActive
                ? tabInfo[routeName]?.activeIcon
                : tabInfo[routeName]?.icon}
              <Text
                style={[styles.tabLabel, isActive && styles.activeTabLabel]}
              >
                {tabInfo[routeName]?.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Get the active component
  const getActiveComponent = () => {
    const tabInfo: Record<string, React.ComponentType> = {
      home: SellerHome,
      consultation: SellerProduct,
      earnings: SellerEarnings,
      profile: SellerProfile,
    };
    const ActiveComponent = tabInfo[activeTab] || SellerHome;
    return <ActiveComponent />;
  };

  return (
    <View style={{ flex: 1, position: "relative" }}>
      {/* Main Content */}
      <View style={{ flex: 1 }}>{getActiveComponent()}</View>

      {/* Custom Bottom Tab Bar */}
      {renderTabBar()}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    backgroundColor: "white",
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  tabBarItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    minHeight: 90,
  },
  tabLabel: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
    fontFamily: "Nunito-Regular",
  },
  activeTabLabel: {
    color: "#D30309",
    fontFamily: "Nunito-Bold",
  },
});
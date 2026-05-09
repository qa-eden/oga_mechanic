import React, { useState, useEffect } from "react";
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
import { useLocalSearchParams } from "expo-router";
import AndroidNavBarSpacer from "@/components/AndroidNavBarSpacer";
import { useActiveRoleProfile } from "@/hooks/useUserProfile";

// Import your actual tab screen components
import SellerProduct from "./product";
import SellerProfile from "./profile";
import SellerHome from "./home";

export default function Layout() {
  // const router = useRouter();
  // const { width } = Dimensions.get("window");
  const insets = useSafeAreaInsets();
  const { tab } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(tab as string || "home");
  const { activeRole } = useActiveRoleProfile();
  const isVehicleRental = activeRole === 'vehicle_rental';

  // Update active tab when query param changes
  useEffect(() => {
    if (tab && typeof tab === 'string') {
      setActiveTab(tab);
    }
  }, [tab]);

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
      products: {
        icon: <icons.productTab />,
        activeIcon: <icons.activeProductTab />,
        label: isVehicleRental ? "Fleet" : "Products",
        component: SellerProduct,
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
          // Platform.OS === "android" && { paddingBottom: insets.bottom },
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
      products: SellerProduct,
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

      {/* Android Navigation Bar Spacer */}
      <AndroidNavBarSpacer />
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
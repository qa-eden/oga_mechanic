import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { icons } from '@/constants';

const RiderTabsLayout = () => {
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    if (tabName === 'home') {
      router.push('/(root)/(tabs)/(rider)/home');
    } else if (tabName === 'order') {
      router.push('/(root)/(tabs)/(rider)/order');
    } else if (tabName === 'earnings') {
      router.push('/(root)/(tabs)/(rider)/earnings');
    } else if (tabName === 'profile') {
      router.push('/(root)/(tabs)/(rider)/profile');
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'home' && styles.activeTab]}
          onPress={() => handleTabPress('home')}
        >
          <View style={styles.tabContent}>
            {activeTab === 'home' ? (
              <icons.activeHome style={styles.tabIcon} />
            ) : (
              <icons.home style={styles.tabIcon} />
            )}
            <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>
              Home
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'order' && styles.activeTab]}
          onPress={() => handleTabPress('order')}
        >
          <View style={styles.tabContent}>
            {activeTab === 'order' ? (
              <icons.activeOrder style={styles.tabIcon} />
            ) : (
              <icons.order style={styles.tabIcon} />
            )}
            <Text style={[styles.tabText, activeTab === 'order' && styles.activeTabText]}>
              Bookings
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'earnings' && styles.activeTab]}
          onPress={() => handleTabPress('earnings')}
        >
          <View style={styles.tabContent}>
            {activeTab === 'earnings' ? (
              <icons.activeEarnings style={styles.tabIcon} />
            ) : (
              <icons.earnings style={styles.tabIcon} />
            )}
            <Text style={[styles.tabText, activeTab === 'earnings' && styles.activeTabText]}>
              Earnings
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => handleTabPress('profile')}
        >
          <View style={styles.tabContent}>
            {activeTab === 'profile' ? (
              <icons.activeProfile style={styles.tabIcon} />
            ) : (
              <icons.profile style={styles.tabIcon} />
            )}
            <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
              Profile
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="order"
        options={{
          headerShown: false,
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          headerShown: false,
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarButton: () => null,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: 20,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    // Active tab styling
  },
  tabContent: {
    alignItems: 'center',
  },
  tabIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#DC3F1D',
    fontWeight: '600',
  },
});

export default RiderTabsLayout;

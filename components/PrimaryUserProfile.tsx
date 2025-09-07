import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { usePrimaryUserProfile } from '@/hooks/useUserProfile';

interface PrimaryUserProfileProps {
  // Add any props you need
}

export const PrimaryUserProfile: React.FC<PrimaryUserProfileProps> = () => {
  const { 
    data: profileData, 
    isLoading, 
    error, 
    refetch 
  } = usePrimaryUserProfile();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#D30309" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Error loading profile: {error.message}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Primary User Profile</Text>
      
      {profileData && (
        <View style={styles.profileInfo}>
          <Text style={styles.label}>Profile Data:</Text>
          <Text style={styles.data}>
            {JSON.stringify(profileData, null, 2)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#D30309',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  profileInfo: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  data: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
});

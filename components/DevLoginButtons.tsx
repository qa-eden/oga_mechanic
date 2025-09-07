import React from 'react';
import { View, TouchableOpacity, Text, Alert } from 'react-native';
import { loginAsRole, clearAuthData } from '@/utils/authUtils';

const DevLoginButtons: React.FC = () => {
  const handleLogin = async (role: 'user' | 'driver' | 'mechanic' | 'rider') => {
    const result = await loginAsRole(role);
    if (result.success) {
      Alert.alert('Success', `Logged in as ${role}`);
    } else {
      Alert.alert('Error', 'Login failed');
    }
  };

  const handleLogout = async () => {
    await clearAuthData();
    Alert.alert('Success', 'Logged out');
  };

  return (
    <View className="p-4 bg-gray-100 rounded-lg m-4">
      <Text className="text-lg font-bold mb-4 text-center">Dev Login (Remove in Production)</Text>
      
      <View className="flex-row flex-wrap gap-2 mb-4">
        <TouchableOpacity
          onPress={() => handleLogin('user')}
          className="bg-blue-500 px-4 py-2 rounded-lg flex-1"
        >
          <Text className="text-white text-center font-medium">Login as User</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handleLogin('driver')}
          className="bg-green-500 px-4 py-2 rounded-lg flex-1"
        >
          <Text className="text-white text-center font-medium">Login as Driver</Text>
        </TouchableOpacity>
      </View>
      
      <View className="flex-row flex-wrap gap-2 mb-4">
        <TouchableOpacity
          onPress={() => handleLogin('mechanic')}
          className="bg-orange-500 px-4 py-2 rounded-lg flex-1"
        >
          <Text className="text-white text-center font-medium">Login as Mechanic</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handleLogin('rider')}
          className="bg-purple-500 px-4 py-2 rounded-lg flex-1"
        >
          <Text className="text-white text-center font-medium">Login as Rider</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-500 px-4 py-2 rounded-lg"
      >
        <Text className="text-white text-center font-medium">Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DevLoginButtons;

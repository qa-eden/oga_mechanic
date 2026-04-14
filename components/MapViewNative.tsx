import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

const CustomMapViewNative: React.FC<any> = ({ style, className }) => {
  return (
    <View style={[styles.container, style]} className={className}>
       <Text>Map View disabled.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6'
  },
});

export default CustomMapViewNative;

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const PROVIDER_DEFAULT = 'default';

export const Marker = (props: any) => {
  return null;
};

export const Callout = (props: any) => {
  return null;
};

const MapView = (props: any) => {
  return (
    <View style={[styles.container, props.style]}>
      <View style={styles.fallback}>
        <Text style={styles.text}>Map is not available on Web</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  text: {
    color: '#888',
    fontSize: 14,
  },
});

export default MapView;
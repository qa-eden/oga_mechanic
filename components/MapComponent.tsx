import React, { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View, Text } from 'react-native';

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapViewRef {
  animateToRegion: (region: MapRegion, duration?: number) => void;
}

export interface MapViewProps {
  children?: React.ReactNode;
  style?: any;
  initialRegion?: MapRegion;
  showsUserLocation?: boolean;
  onRegionChangeComplete?: (region: MapRegion) => void;
  [key: string]: any;
}

const MapView = forwardRef<MapViewRef, MapViewProps>((props, ref) => {
  const { children, style, ...rest } = props;

  useImperativeHandle(ref, () => ({
    animateToRegion: (region: MapRegion, duration: number = 1000) => {
      // Mocked for now since map is disconnected
    },
  }));

  return (
    <View style={[styles.map, style, styles.placeholderContainer]}>
      <Text style={styles.placeholderText}>Map View is temporarily disabled.</Text>
      {children}
    </View>
  );
});

export const Marker = ({ coordinate, children, rotation, ...props }: any) => (
  <View style={rotation ? { transform: [{ rotate: `${rotation}deg` }] } : undefined}>
    {children || <View style={styles.defaultMarker} />}
  </View>
);

export const Callout = ({ children }: any) => <View>{children}</View>;
export const PROVIDER_DEFAULT = 'none';

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  placeholderContainer: {
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#6b7280',
    fontFamily: 'Nunito-Medium',
  },
  defaultMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D30309',
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default MapView;

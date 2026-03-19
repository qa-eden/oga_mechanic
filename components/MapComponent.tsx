import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import Mapbox, { Camera, PointAnnotation, MarkerView, Callout as MapboxCallout } from '@rnmapbox/maps';
import { ENV_CONFIG } from '@/config/env';
import { StyleSheet, View } from 'react-native';

// Set access token globally
Mapbox.setAccessToken(ENV_CONFIG.MAPBOX_ACCESS_TOKEN);

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
  const cameraRef = useRef<Camera>(null);
  const { children, style, initialRegion, showsUserLocation, onRegionChangeComplete, ...rest } = props;

  useImperativeHandle(ref, () => ({
    animateToRegion: (region: MapRegion, duration: number = 1000) => {
      cameraRef.current?.setCamera({
        centerCoordinate: [region.longitude, region.latitude],
        zoomLevel: 14, // Approximate zoom from deltas
        animationDuration: duration,
      });
    },
  }));

  const handleRegionChange = (feature: any) => {
    if (onRegionChangeComplete) {
      const { geometry } = feature;
      onRegionChangeComplete({
        latitude: geometry.coordinates[1],
        longitude: geometry.coordinates[0],
        latitudeDelta: 0.015, // Mock deltas as Mapbox uses zoomLevel
        longitudeDelta: 0.0121,
      });
    }
  };

  return (
    <Mapbox.MapView
      style={[styles.map, style]}
      styleURL={Mapbox.StyleURL.Street}
      onRegionDidChange={handleRegionChange}
      {...rest}
    >
      <Camera
        ref={cameraRef}
        defaultSettings={{
          centerCoordinate: initialRegion ? [initialRegion.longitude, initialRegion.latitude] : [3.3792, 6.5244],
          zoomLevel: 12,
        }}
      />
      {showsUserLocation && <Mapbox.UserLocation />}
      {children}
    </Mapbox.MapView>
  );
});

export const Marker = ({ coordinate, children, rotation, ...props }: any) => (
  <MarkerView 
    coordinate={[coordinate.longitude, coordinate.latitude]} 
    {...props}
  >
    <View style={rotation ? { transform: [{ rotate: `${rotation}deg` }] } : undefined}>
      {children || <View style={styles.defaultMarker} />}
    </View>
  </MarkerView>
);

export const Callout = MapboxCallout;
export const PROVIDER_DEFAULT = 'mapbox';

const styles = StyleSheet.create({
  map: {
    flex: 1,
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

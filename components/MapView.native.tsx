import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';

interface Location {
  latitude: number;
  longitude: number;
}

interface MapMarker {
  id: string;
  coordinate: Location;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
  size?: number;
}

interface MapPolyline {
  id: string;
  coordinates: Location[];
  strokeColor?: string;
  strokeWidth?: number;
}

interface CustomMapViewProps {
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  markers?: MapMarker[];
  polylines?: MapPolyline[];
  showUserLocation?: boolean;
  style?: any;
  className?: string;
  [key: string]: any;
}

const CustomMapView: React.FC<CustomMapViewProps> = ({
  region,
  markers = [],
  polylines = [],
  style,
  className,
}) => {
  return (
    <View style={[styles.container, style]} className={className}>
      <View style={styles.webFallback}>
        <Text style={styles.webFallbackText}>Map Features Disabled</Text>
        <View style={styles.webFallbackInfo}>
          <Text style={styles.webFallbackInfoText}>
            Region: {region ? `${region.latitude.toFixed(4)}, ${region.longitude.toFixed(4)}` : 'Default'}
          </Text>
          <Text style={styles.webFallbackInfoText}>
            Markers: {markers.length}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  webFallbackText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 20,
  },
  webFallbackInfo: {
    alignItems: 'center',
  },
  webFallbackInfoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
  },
});

export default CustomMapView;

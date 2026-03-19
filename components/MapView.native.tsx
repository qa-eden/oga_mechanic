import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import Mapbox, { Camera, MarkerView, UserLocation, ShapeSource, LineLayer } from '@rnmapbox/maps';
import { ENV_CONFIG } from '@/config/env';

// Set access token
Mapbox.setAccessToken(ENV_CONFIG.MAPBOX_ACCESS_TOKEN);

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
  showUserLocation = false,
  style,
  className,
  ...props
}) => {
  const [CustomMapViewNative, setCustomMapViewNative] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      import('./MapViewNative').then((module) => {
        setCustomMapViewNative(() => module.default);
        setIsLoading(false);
      }).catch((err) => {
        console.error('Failed to load MapViewNative:', err);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, style]} className={className}>
        <View style={styles.webFallback}>
          <Text style={styles.webFallbackText}>Loading Map...</Text>
        </View>
      </View>
    );
  }

  // Web fallback
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]} className={className}>
        <View style={styles.webFallback}>
          <Text style={styles.webFallbackText}>Map View (Web limited)</Text>
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
  }

  // Use native map component for mobile platforms
  if (CustomMapViewNative) {
    return (
      <CustomMapViewNative
        region={region}
        markers={markers}
        polylines={polylines}
        showUserLocation={showUserLocation}
        style={style}
        className={className}
        {...props}
      />
    );
  }

  return (
    <View style={[styles.container, style]} className={className}>
      <View style={styles.webFallback}>
        <Text style={styles.webFallbackText}>Map not available</Text>
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

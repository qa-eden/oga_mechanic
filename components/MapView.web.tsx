import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

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
  strokePattern?: number[];
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
  showMyLocationButton?: boolean;
  showCompass?: boolean;
  showScale?: boolean;
  showTraffic?: boolean;
  showBuildings?: boolean;
  showIndoors?: boolean;
  style?: any;
  className?: string;
  [key: string]: any;
}

const CustomMapView: React.FC<CustomMapViewProps> = ({
  region,
  markers = [],
  polylines = [],
  showUserLocation = false,
  showMyLocationButton = false,
  showCompass = false,
  showScale = false,
  showTraffic = false,
  showBuildings = false,
  showIndoors = false,
  style,
  className,
  ...props
}) => {
  return (
    <View style={[styles.container, style]} className={className}>
      <View style={styles.webFallback}>
        <View style={styles.webFallbackText}>
          Map View (Web not supported)
        </View>
        <View style={styles.webFallbackInfo}>
          <Text style={styles.webFallbackInfoText}>
            Region: {region ? `${region.latitude.toFixed(4)}, ${region.longitude.toFixed(4)}` : 'Default'}
          </Text>
          <Text style={styles.webFallbackInfoText}>
            Markers: {markers.length}
          </Text>
          <Text style={styles.webFallbackInfoText}>
            Polylines: {polylines.length}
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

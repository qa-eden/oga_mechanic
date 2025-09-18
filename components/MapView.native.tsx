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
  strokePattern?: number[];
}

interface CustomMapViewProps extends Omit<MapViewProps, 'region'> {
  region?: Region;
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
  const [CustomMapViewNative, setCustomMapViewNative] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const defaultRegion = {
    latitude: 6.5244,
    longitude: 3.3792,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  useEffect(() => {
    if (Platform.OS !== 'web') {
      import('./MapViewNative').then((module) => {
        setCustomMapViewNative(() => module.default);
        setIsLoading(false);
      }).catch(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const renderMarker = (marker: MapMarker) => {
    if (marker.icon) {
      return (
        <Marker
          key={marker.id}
          coordinate={marker.coordinate}
          title={marker.title}
          description={marker.description}
        >
          {marker.icon}
        </Marker>
      );
    }

    return (
      <Marker
        key={marker.id}
        coordinate={marker.coordinate}
        title={marker.title}
        description={marker.description}
      >
        <View 
          style={[
            styles.defaultMarker,
            {
              width: marker.size || 24,
              height: marker.size || 24,
              backgroundColor: marker.color || '#3B82F6',
            }
          ]}
        />
      </Marker>
    );
  };

  const renderPolyline = (polyline: MapPolyline) => (
    <Polyline
      key={polyline.id}
      coordinates={polyline.coordinates}
      strokeColor={polyline.strokeColor || '#EF4444'}
      strokeWidth={polyline.strokeWidth || 3}
      strokePattern={polyline.strokePattern}
    />
  );

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

  // Web fallback for react-native-maps
  if (Platform.OS === 'web') {
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
  }

  // Use native map component for mobile platforms
  if (CustomMapViewNative) {
    return (
      <CustomMapViewNative
        region={region}
        markers={markers}
        polylines={polylines}
        showUserLocation={showUserLocation}
        showMyLocationButton={showMyLocationButton}
        showCompass={showCompass}
        showScale={showScale}
        showTraffic={showTraffic}
        showBuildings={showBuildings}
        showIndoors={showIndoors}
        style={style}
        className={className}
        {...props}
      />
    );
  }

  // Fallback if native component is not available
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
  map: {
    flex: 1,
  },
  defaultMarker: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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

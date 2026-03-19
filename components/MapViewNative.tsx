import React, { useRef } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import Mapbox, { Camera, MarkerView, ShapeSource, LineLayer, UserLocation } from '@rnmapbox/maps';
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
  showMyLocationButton?: boolean;
  style?: any;
  className?: string;
  [key: string]: any;
}

const CustomMapViewNative: React.FC<CustomMapViewProps> = ({
  region,
  markers = [],
  polylines = [],
  showUserLocation = false,
  style,
  className,
  ...props
}) => {
  const cameraRef = useRef<Camera>(null);

  const defaultCenter: [number, number] = [3.3792, 6.5244]; // Lagos, Nigeria

  const renderMarker = (marker: MapMarker) => (
    <MarkerView
      key={marker.id}
      id={marker.id}
      coordinate={[marker.coordinate.longitude, marker.coordinate.latitude]}
    >
      <View>
        {marker.icon ? (
          marker.icon
        ) : (
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
        )}
      </View>
    </MarkerView>
  );

  const renderPolyline = (polyline: MapPolyline) => {
    const feature: any = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: polyline.coordinates.map(c => [c.longitude, c.latitude]),
      },
    };

    return (
      <ShapeSource key={polyline.id} id={polyline.id} shape={feature}>
        <LineLayer
          id={`${polyline.id}-layer`}
          style={{
            lineColor: polyline.strokeColor || '#EF4444',
            lineWidth: polyline.strokeWidth || 3,
            lineJoin: 'round',
            lineCap: 'round',
          }}
        />
      </ShapeSource>
    );
  };

  return (
    <View style={[styles.container, style]} className={className}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        {...props}
      >
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: region ? [region.longitude, region.latitude] : defaultCenter,
            zoomLevel: 12,
          }}
          centerCoordinate={region ? [region.longitude, region.latitude] : undefined}
          animationDuration={1000}
        />
        {showUserLocation && <UserLocation />}
        {markers.map(renderMarker)}
        {polylines.map(renderPolyline)}
      </Mapbox.MapView>
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
});

export default CustomMapViewNative;

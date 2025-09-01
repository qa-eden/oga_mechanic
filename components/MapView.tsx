import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { 
  Marker, 
  Polyline, 
  PROVIDER_GOOGLE,
  Region,
  MapViewProps 
} from 'react-native-maps';

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
  const defaultRegion: Region = {
    latitude: 6.5244,
    longitude: 3.3792,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

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

  return (
    <View style={[styles.container, style]} className={className}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region || defaultRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={showMyLocationButton}
        showsCompass={showCompass}
        showsScale={showScale}
        showsTraffic={showTraffic}
        showsBuildings={showBuildings}
        showsIndoors={showIndoors}
        {...props}
      >
        {markers.map(renderMarker)}
        {polylines.map(renderPolyline)}
      </MapView>
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

export default CustomMapView;

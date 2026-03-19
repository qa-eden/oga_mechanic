import { ENV_CONFIG } from '@/config/env';

export interface LocationCoordinate {
  latitude: number;
  longitude: number;
}

/**
 * Fetches a route between two coordinates from Mapbox Directions API.
 * @param start Start coordinate {latitude, longitude}
 * @param end End coordinate {latitude, longitude}
 * @returns GeoJSON LineString for the route
 */
export const getMapboxRoute = async (start: LocationCoordinate, end: LocationCoordinate) => {
  const accessToken = ENV_CONFIG.MAPBOX_ACCESS_TOKEN;
  if (!accessToken) {
    console.error('Mapbox access token is missing');
    return null;
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?geometries=geojson&access_token=${accessToken}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.error('Error fetching route from Mapbox:', data.message || data.code);
      return null;
    }

    return data.routes[0].geometry;
  } catch (error) {
    console.error('Network error fetching Mapbox route:', error);
    return null;
  }
};

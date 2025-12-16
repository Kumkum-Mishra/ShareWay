import type { Location } from '../types';

export interface RouteLegPoint {
  lat: number;
  lng: number;
}

export interface RouteResult {
  points: RouteLegPoint[];
  distanceKm: number;
  durationMin: number;
}

// Route via OSRM demo server. For production, host your own or use a provider key.
export async function getRoute(
  origin: Location,
  destination: Location
): Promise<RouteResult | null> {
  const base = 'https://router.project-osrm.org/route/v1/driving';
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = `${base}/${coords}?overview=full&geometries=geojson`; 

  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const route = data?.routes?.[0];
  if (!route) return null;

  const geometry = route.geometry; // GeoJSON LineString
  const coordsList: [number, number][] = geometry?.coordinates ?? [];
  const points: RouteLegPoint[] = coordsList.map(([lng, lat]) => ({ lat, lng }));

  return {
    points,
    distanceKm: (route.distance ?? 0) / 1000,
    durationMin: (route.duration ?? 0) / 60
  };
}



import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

type LatLng = { lat: number; lng: number };

interface MapViewProps {
  origin?: LatLng;
  destination?: LatLng;
  routePoints?: LatLng[];
  height?: string;
}

// Fix default marker icons with Vite bundling
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function MapView({ origin, destination, routePoints, height = '320px' }: MapViewProps) {
  const center: LatLng = origin || destination || { lat: 40.73, lng: -74.0 };

  return (
    <div className="w-full rounded-xl overflow-hidden border border-gray-200" style={{ height }}>
      <MapContainer center={[center.lat, center.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <FitToBounds origin={origin} destination={destination} routePoints={routePoints} />

        {origin && (
          <Marker position={[origin.lat, origin.lng]}>
            <Popup>Origin</Popup>
          </Marker>
        )}
        {destination && (
          <Marker position={[destination.lat, destination.lng]}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        {routePoints && routePoints.length > 1 && (
          <Polyline positions={routePoints.map(p => [p.lat, p.lng])} pathOptions={{ color: 'green', weight: 5 }} />
        )}
      </MapContainer>
    </div>
  );
}

function FitToBounds({ origin, destination, routePoints }: { origin?: LatLng; destination?: LatLng; routePoints?: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    const points: LatLng[] = [];
    if (routePoints && routePoints.length > 0) points.push(...routePoints);
    if (origin) points.push(origin);
    if (destination) points.push(destination);
    if (points.length === 0) return;

    const bounds = L.latLngBounds(points.map(p => L.latLng(p.lat, p.lng)));
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [origin?.lat, origin?.lng, destination?.lat, destination?.lng, routePoints?.length]);
  return null;
}



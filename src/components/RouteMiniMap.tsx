import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';

type LatLng = { lat: number; lng: number };

interface RouteMiniMapProps {
  origin: LatLng;
  destination: LatLng;
  height?: string;
}

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function RouteMiniMap({ origin, destination, height = '140px' }: RouteMiniMapProps) {
  const [bounds, setBounds] = useState<L.LatLngBounds | null>(null);

  useEffect(() => {
    const b = L.latLngBounds([L.latLng(origin.lat, origin.lng), L.latLng(destination.lat, destination.lng)]);
    setBounds(b);
  }, [origin.lat, origin.lng, destination.lat, destination.lng]);

  const positions: [number, number][] = [
    [origin.lat, origin.lng],
    [destination.lat, destination.lng]
  ];

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
      <MapContainer
        bounds={bounds ?? undefined}
        center={[origin.lat, origin.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        dragging={false}
        doubleClickZoom={false}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[origin.lat, origin.lng]} />
        <Marker position={[destination.lat, destination.lng]} />
        <Polyline positions={positions} pathOptions={{ color: 'green', weight: 4 }} />
      </MapContainer>
    </div>
  );
}



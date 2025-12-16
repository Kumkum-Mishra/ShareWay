import React, { useEffect, useState } from 'react';
import { X, MapPin, Calendar, Clock, Users, DollarSign } from 'lucide-react';
import MapView from './MapView';
import { geocodeAddress, suggestAddressesDebounced, SuggestionItem } from '../services/geocoding';
import { getRoute } from '../services/routing';
import { addRide } from '../services/mockData';
import { RideDB } from '../services/database';
import { useAuth } from '../contexts/AuthContext';

interface CreateRideProps {
  onClose: () => void;
  onCreated?: (rideId: string) => void;
}

export default function CreateRide({ onClose, onCreated }: CreateRideProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    departureTime: '',
    seats: '',
    price: ''
  });

  const [originCoord, setOriginCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [destCoord, setDestCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [routePoints, setRoutePoints] = useState<Array<{ lat: number; lng: number }> | null>(null);
  const [routeMeta, setRouteMeta] = useState<{ distanceKm: number; durationMin: number } | null>(null);
  const [originSuggestions, setOriginSuggestions] = useState<SuggestionItem[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<SuggestionItem[]>([]);
  const [showOriginSug, setShowOriginSug] = useState(false);
  const [showDestSug, setShowDestSug] = useState(false);

  useEffect(() => {
    // Fast suggestions for origin with caching
    if (formData.origin.trim()) {
      suggestAddressesDebounced(formData.origin.trim(), setOriginSuggestions, 150);
    } else {
      setOriginSuggestions([]);
    }
  }, [formData.origin]);

  useEffect(() => {
    // Fast suggestions for destination with caching
    if (formData.destination.trim()) {
      suggestAddressesDebounced(formData.destination.trim(), setDestSuggestions, 150);
    } else {
      setDestSuggestions([]);
    }
  }, [formData.destination]);

  useEffect(() => {
    const updateRoute = async () => {
      if (!formData.origin || !formData.destination) {
        setRoutePoints(null);
        return;
      }

      // Prefer already selected coordinates from suggestions
      let o = originCoord;
      let d = destCoord;

      if (!o) {
        const g = await geocodeAddress(formData.origin);
        if (g) o = { lat: g.lat, lng: g.lng };
      }
      if (!d) {
        const g = await geocodeAddress(formData.destination);
        if (g) d = { lat: g.lat, lng: g.lng };
      }

      if (!o || !d) {
        setRoutePoints(null);
        return;
      }

      // Do not override user-picked precise coordinates with a re-geocode
      if (!originCoord && o) setOriginCoord(o);
      if (!destCoord && d) setDestCoord(d);

      const route = await getRoute(
        { address: formData.origin, lat: o.lat, lng: o.lng },
        { address: formData.destination, lat: d.lat, lng: d.lng }
      );
      setRoutePoints(route?.points ?? null);
      if (route) setRouteMeta({ distanceKm: route.distanceKm, durationMin: route.durationMin });
    };

    const timeout = setTimeout(updateRoute, 300);
    return () => clearTimeout(timeout);
  }, [formData.origin, formData.destination, originCoord?.lat, originCoord?.lng, destCoord?.lat, destCoord?.lng]);

  const pickOrigin = (s: SuggestionItem) => {
    setFormData(prev => ({ ...prev, origin: s.displayName }));
    setOriginCoord({ lat: s.lat, lng: s.lng });
    setShowOriginSug(false);
  };

  const pickDest = (s: SuggestionItem) => {
    setFormData(prev => ({ ...prev, destination: s.displayName }));
    setDestCoord({ lat: s.lat, lng: s.lng });
    setShowDestSug(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Ensure we have coordinates
    let o = originCoord;
    let d = destCoord;
    if (!o) {
      const g = await geocodeAddress(formData.origin);
      if (g) o = { lat: g.lat, lng: g.lng };
    }
    if (!d) {
      const g = await geocodeAddress(formData.destination);
      if (g) d = { lat: g.lat, lng: g.lng };
    }
    if (!o || !d) {
      alert('Please enter valid origin and destination');
      return;
    }

    const now = new Date();
    const datePart = formData.departureDate || now.toISOString().split('T')[0];
    const timePart = formData.departureTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const departureISO = new Date(`${datePart}T${timePart}:00`).toISOString();
    const seats = Number.isFinite(parseInt(formData.seats, 10)) ? Math.max(1, parseInt(formData.seats, 10)) : 1;
    const priceNum = parseFloat(formData.price);
    const price = Number.isFinite(priceNum) ? Math.max(0, priceNum) : 0;
    const distanceKm = routeMeta?.distanceKm ?? 10;
    const durationMin = routeMeta?.durationMin ?? 20;

    // Try database first, fallback to mock
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isUsingDatabase = supabaseUrl && !supabaseUrl.includes('placeholder');

    let createdRide = null;

    if (isUsingDatabase) {
      console.log('💾 Creating ride in database...');
      createdRide = await RideDB.create({
        driver_id: user.id,
        origin: formData.origin,
        destination: formData.destination,
        origin_lat: o.lat,
        origin_lng: o.lng,
        dest_lat: d.lat,
        dest_lng: d.lng,
        departure_time: departureISO,
        available_seats: seats,
        price_per_seat: price,
        route_data: routePoints,
        estimated_duration: durationMin,
        estimated_distance: distanceKm,
        estimated_co2_saved: distanceKm * seats * 0.21,
        status: 'pending'
      });
      
      if (createdRide) {
        console.log('✅ Ride created in database:', createdRide.id);
      } else {
        console.warn('⚠️ Database creation failed, using mock data');
      }
    }
    
    if (!createdRide) {
      // Fallback to mock data
      console.log('📝 Creating ride in mock data...');
      createdRide = addRide({
        driverId: user.id,
        origin: formData.origin,
        destination: formData.destination,
        originCoord: o,
        destCoord: d,
        departureISO,
        availableSeats: seats,
        pricePerSeat: price,
        distanceKm,
        durationMin
      });
    }

    alert('Ride created successfully!');
    if (onCreated && createdRide) onCreated(createdRide.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Offer a Ride</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Starting Location
            </label>
            <div className="relative">
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              onFocus={() => setShowOriginSug(true)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Enter your starting point"
            />
            {showOriginSug && originSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-sm max-h-56 overflow-auto">
                {originSuggestions.map((s, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => pickOrigin(s)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
                  >
                    {s.displayName}
                  </button>
                ))}
              </div>
            )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Destination
            </label>
            <div className="relative">
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              onFocus={() => setShowDestSug(true)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Where are you going?"
            />
            {showDestSug && destSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-sm max-h-56 overflow-auto">
                {destSuggestions.map((s, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => pickDest(s)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-700"
                  >
                    {s.displayName}
                  </button>
                ))}
              </div>
            )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={formData.departureDate}
                onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Time
              </label>
              <input
                type="time"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Available Seats
              </label>
              <input
                type="number"
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Seats"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Price per Seat (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="150"
                  min="0"
                  step="10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Suggested: ₹100-₹500 per seat</p>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h4 className="font-semibold text-emerald-900 mb-2">Environmental Impact</h4>
            <p className="text-sm text-emerald-800">
              By offering this ride, you'll help reduce traffic congestion and lower CO₂ emissions.
              Each shared ride contributes to building more sustainable cities.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Route Preview</h4>
            <MapView
              origin={originCoord ?? undefined}
              destination={destCoord ?? undefined}
              routePoints={routePoints ?? undefined}
              height="260px"
            />
            <div className="text-xs text-gray-500 mt-2">Green line shows the planned route.</div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Create Ride
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

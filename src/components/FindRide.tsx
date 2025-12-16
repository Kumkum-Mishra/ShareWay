import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Users, Leaf, DollarSign, TrendingUp, Gift, Star, Ticket } from 'lucide-react';
import { mockRides, mockProfiles, addParticipation } from '../services/mockData';
import { matchRides, calculateDistance } from '../services/rideMatching';
import { RideDB } from '../services/database';
import { Location, Ride, Coupon } from '../types';
import MapView from './MapView';
import RouteMiniMap from './RouteMiniMap';
import BookingConfirmation from './BookingConfirmation';
import { geocodeAddress, suggestAddressesDebounced, SuggestionItem } from '../services/geocoding';
import { getRoute } from '../services/routing';
import { useAuth } from '../contexts/AuthContext';
import { calculateRideRewards, RewardsService } from '../services/rewardsService';

export default function FindRide() {
  const { user } = useAuth();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ ride: Ride; score: number; reason: string }>>([]);
  const [searched, setSearched] = useState(false);
  const [routePoints, setRoutePoints] = useState<Array<{ lat: number; lng: number }> | null>(null);
  const [originCoord, setOriginCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [destCoord, setDestCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [originSuggestions, setOriginSuggestions] = useState<SuggestionItem[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<SuggestionItem[]>([]);
  const [showOriginSug, setShowOriginSug] = useState(false);
  const [showDestSug, setShowDestSug] = useState(false);
  const [showRewardNotification, setShowRewardNotification] = useState(false);
  const [rewardInfo, setRewardInfo] = useState<{ points: number; cashback: number; coupon: boolean; bonus: number } | null>(null);
  const [showBookingPage, setShowBookingPage] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [driverProfilesCache, setDriverProfilesCache] = useState<Map<string, any>>(new Map());

  const handleSearch = async () => {
    setIsRouting(true);

    // Use already selected coordinates if available, otherwise geocode
    let o = originCoord;
    let d = destCoord;

    if (!o && origin) {
      const g = await geocodeAddress(origin);
      if (g) o = { lat: g.lat, lng: g.lng };
    }
    if (!d && destination) {
      const g = await geocodeAddress(destination);
      if (g) d = { lat: g.lat, lng: g.lng };
    }

    // Fallback to defaults if geocoding fails
    const userOrigin: Location = {
      address: origin,
      lat: o?.lat ?? 40.7300,
      lng: o?.lng ?? -74.0700
    };

    const userDest: Location = {
      address: destination,
      lat: d?.lat ?? 40.7550,
      lng: d?.lng ?? -73.9900
    };

    setOriginCoord({ lat: userOrigin.lat, lng: userOrigin.lng });
    setDestCoord({ lat: userDest.lat, lng: userDest.lng });

    // Fetch route polyline using the exact coordinates
    try {
      const route = await getRoute(userOrigin, userDest);
      setRoutePoints(route?.points ?? null);
    } catch {
      setRoutePoints(null);
    } finally {
      setIsRouting(false);
    }

    // Fetch rides from database or mock data
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isUsingDatabase = supabaseUrl && !supabaseUrl.includes('placeholder');
    
    let availableRides: Ride[] = [];
    
    if (isUsingDatabase) {
      console.log('💾 Fetching rides from database...');
      availableRides = await RideDB.getAvailable();
      console.log(`✅ Found ${availableRides.length} rides in database`);
    }
    
    if (availableRides.length === 0) {
      console.log('📝 Using mock rides');
      availableRides = mockRides.filter(r => r.status === 'pending' && r.available_seats > 0);
    }

    // Ride matching - show all available rides regardless of location match
    const departure = departureTime ? new Date(departureTime) : new Date();
    const matches = matchRides(userOrigin, userDest, departure, availableRides);

    // If no matches or very few, show all available rides
    const results = matches.length > 0 
      ? matches.map((match: any) => {
          const ride = availableRides.find(r => r.id === match.rideId);
          if (!ride) return null; // Safety check
          return { ride, score: match.score, reason: match.reason };
        }).filter(Boolean) // Remove any null entries
      : availableRides.map(ride => ({ ride, score: 50, reason: 'Available ride nearby' }));

    setSearchResults(results);
    setSearched(true);
    console.log(`✅ Found ${results.length} rides to show`);
  };

  const pickOrigin = (s: SuggestionItem) => {
    setOrigin(s.displayName);
    setOriginCoord({ lat: s.lat, lng: s.lng });
    setShowOriginSug(false);
  };

  const pickDest = (s: SuggestionItem) => {
    setDestination(s.displayName);
    setDestCoord({ lat: s.lat, lng: s.lng });
    setShowDestSug(false);
  };

  const getDriver = (driverId: string) => {
    // First check cache
    if (driverProfilesCache.has(driverId)) {
      return driverProfilesCache.get(driverId);
    }
    
    // Then check mock profiles
    const mockDriver = mockProfiles.find(p => p.id === driverId);
    if (mockDriver) {
      // Cache it
      setDriverProfilesCache(prev => new Map(prev).set(driverId, mockDriver));
      return mockDriver;
    }
    
    // If not found, create a placeholder driver profile
    const placeholderDriver = {
      id: driverId,
      full_name: 'Driver',
      email: 'driver@shareway.com',
      role: 'driver' as const,
      rating: 4.5,
      vehicle_model: 'Vehicle',
      vehicle_plate: 'N/A',
      phone: 'N/A',
      created_at: new Date().toISOString()
    };
    
    setDriverProfilesCache(prev => new Map(prev).set(driverId, placeholderDriver));
    return placeholderDriver;
  };

  const openBookingPage = (ride: Ride) => {
    if (!user) {
      alert('Please sign in first.');
      return;
    }
    setSelectedRide(ride);
    setShowBookingPage(true);
  };

  const confirmBooking = async (selectedCoupon: Coupon | null) => {
    if (!user || !selectedRide) return;

    let o = originCoord;
    let d = destCoord;
    if (!o) {
      const g = await geocodeAddress(origin);
      if (g) o = { lat: g.lat, lng: g.lng };
    }
    if (!d) {
      const g = await geocodeAddress(destination);
      if (g) d = { lat: g.lat, lng: g.lng };
    }
    if (!o || !d) {
      alert('Please provide valid pickup and dropoff.');
      return;
    }
    
    // Mark coupon as used if applied
    if (selectedCoupon) {
      RewardsService.useCoupon(selectedCoupon.id);
    }

    // Calculate rewards before booking
    const rewards = calculateRideRewards(selectedRide.price_per_seat, user.total_rides_taken);

    const participation = addParticipation({
      rideId: selectedRide.id,
      passengerId: user.id,
      pickup: { label: origin, lat: o.lat, lng: o.lng },
      dropoff: { label: destination, lat: d.lat, lng: d.lng }
    });

    if (!participation) {
      alert('Unable to join. No seats available.');
      return;
    }

    // Close booking page
    setShowBookingPage(false);
    setSelectedRide(null);

    // Show reward notification
    setRewardInfo({
      points: rewards.points,
      cashback: rewards.cashback,
      coupon: rewards.generateCoupon,
      bonus: rewards.bonusPoints
    });
    setShowRewardNotification(true);
    
    // Hide notification after 8 seconds
    setTimeout(() => {
      setShowRewardNotification(false);
    }, 8000);

    // Trigger small refresh of results to reflect seat count
    setSearchResults(prev => prev.map(r => r));
  };

  const cancelBooking = () => {
    setShowBookingPage(false);
    setSelectedRide(null);
  };

  // Show booking confirmation page if a ride is selected
  if (showBookingPage && selectedRide) {
    return (
      <BookingConfirmation
        ride={selectedRide}
        origin={origin}
        destination={destination}
        onConfirm={confirmBooking}
        onCancel={cancelBooking}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Reward Notification */}
      {showRewardNotification && rewardInfo && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-2xl p-6 text-white animate-slide-down">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Gift className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">Ride Booked Successfully!</h3>
                <p className="text-green-50">You've earned amazing rewards</p>
              </div>
            </div>
            <button
              onClick={() => setShowRewardNotification(false)}
              className="text-white/80 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Star className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Points Earned</span>
              </div>
              <div className="text-3xl font-bold">+{rewardInfo.points}</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center mb-2">
                <DollarSign className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">Cashback</span>
              </div>
              <div className="text-3xl font-bold">${rewardInfo.cashback.toFixed(2)}</div>
            </div>
            
            {rewardInfo.bonus > 0 && (
              <div className="bg-yellow-400/20 backdrop-blur-sm rounded-lg p-4 border-2 border-yellow-300">
                <div className="flex items-center mb-2">
                  <Star className="h-5 w-5 mr-2 text-yellow-200" />
                  <span className="text-sm font-medium">Bonus!</span>
                </div>
                <div className="text-3xl font-bold">+{rewardInfo.bonus}</div>
              </div>
            )}
            
            {rewardInfo.coupon && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Ticket className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">Lucky!</span>
                </div>
                <div className="text-lg font-bold">Free Coupon</div>
              </div>
            )}
          </div>
          
          <p className="text-sm text-green-50 mt-4 text-center">
            Check the Rewards tab to view and redeem your points!
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Find a Ride</h2>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              From
            </label>
            <div className="relative">
            <input
              type="text"
              value={origin}
              onChange={(e) => {
                const val = e.target.value;
                setOrigin(val);
                if (val.trim()) {
                  setShowOriginSug(true);
                  suggestAddressesDebounced(val, setOriginSuggestions, 150);
                } else {
                  setShowOriginSug(false);
                  setOriginSuggestions([]);
                }
              }}
              onFocus={() => setShowOriginSug(true)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Enter pickup location"
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
              To
            </label>
            <div className="relative">
            <input
              type="text"
              value={destination}
              onChange={(e) => {
                const val = e.target.value;
                setDestination(val);
                if (val.trim()) {
                  setShowDestSug(true);
                  suggestAddressesDebounced(val, setDestSuggestions, 150);
                } else {
                  setShowDestSug(false);
                  setDestSuggestions([]);
                }
              }}
              onFocus={() => setShowDestSug(true)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Enter destination"
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
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Departure Date & Time
            </label>
            <input
              type="datetime-local"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={!origin || !destination}
          className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Search Rides
        </button>
      </div>

      {routePoints && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Route Preview</h3>
          <MapView origin={originCoord ?? undefined} destination={destCoord ?? undefined} routePoints={routePoints} height="300px" />
          <div className="text-sm text-gray-600 mt-2">{isRouting ? 'Calculating route...' : 'Showing optimal route (green)'}</div>
        </div>
      )}

      {searched && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              {searchResults.length} {searchResults.length === 1 ? 'Match' : 'Matches'} Found
            </h3>
            {searchResults.length > 0 && (
              <div className="text-sm text-gray-600">
                Sorted by best match
              </div>
            )}
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No rides found</h4>
              <p className="text-gray-600">
                Try adjusting your search criteria or create a ride request
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map(({ ride, score, reason }) => {
                const driver = getDriver(ride.driver_id);
                if (!driver) return null;

                return (
                  <div
                    key={ride.id}
                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-emerald-600">
                            {driver.full_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{driver.full_name}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <span>{driver.rating.toFixed(1)}</span>
                            <span className="text-yellow-500">★</span>
                            <span className="ml-2">
                              {driver.vehicle_model}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                          score >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : score >= 60
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          <TrendingUp className="w-3 h-3" />
                          {score.toFixed(0)}% Match
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{reason}</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-start gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                          <div>
                            <div className="text-sm text-gray-600">From</div>
                            <div className="font-medium text-gray-900">{ride.origin}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                          <div>
                            <div className="text-sm text-gray-600">To</div>
                            <div className="font-medium text-gray-900">{ride.destination}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {new Date(ride.departure_time).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {ride.available_seats} {ride.available_seats === 1 ? 'seat' : 'seats'} available
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Leaf className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            Save {ride.estimated_co2_saved.toFixed(1)}kg CO₂
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            ₹{ride.price_per_seat.toFixed(2)} per seat
                          </span>
                        </div>
                        <RouteMiniMap
                          origin={{ lat: ride.origin_lat, lng: ride.origin_lng }}
                          destination={{ lat: ride.dest_lat, lng: ride.dest_lng }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => openBookingPage(ride)}
                      disabled={ride.available_seats <= 0}
                      className="w-full bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      {ride.available_seats > 0 ? 'Request to Join' : 'Full'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

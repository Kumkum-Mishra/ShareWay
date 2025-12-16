import React, { useState } from 'react';
import { MapPin, Clock, Users, Leaf, DollarSign, Calendar, AlertTriangle, Shield, XCircle, UserCheck, Phone, CheckCircle, Play, Star } from 'lucide-react';
import { getUserRides, getUserParticipations, mockRides, mockProfiles, mockParticipants, cancelParticipation, cancelRide, getRideParticipants, completeRide, startJourney } from '../services/mockData';
import { completeRideWithImpact } from '../services/impactService';
import SOSButton from './SOSButton';
import ShareTrip from './ShareTrip';

interface RideListProps {
  userId: string;
}

export default function RideList({ userId }: RideListProps) {
  const [activeSOSRide, setActiveSOSRide] = useState<string | null>(null);
  const [expandedRide, setExpandedRide] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState<{ participationId: string; ride: any; driverId: string } | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  
  const offeredRides = getUserRides(userId);
  const participations = getUserParticipations(userId);

  const joinedRides = participations.map(p => {
    const ride = mockRides.find(r => r.id === p.ride_id);
    const driver = ride ? mockProfiles.find(prof => prof.id === ride.driver_id) : null;
    return { participation: p, ride, driver };
  }).filter(item => item.ride && item.driver);

  const handleCancelParticipation = (participantId: string, rideName: string) => {
    if (confirm(`Are you sure you want to cancel this ride to ${rideName}?`)) {
      const success = cancelParticipation(participantId);
      if (success) {
        alert('Ride cancelled successfully. Your seat has been released.');
        setRefreshKey(prev => prev + 1); // Force re-render
      } else {
        alert('Failed to cancel ride. Please try again.');
      }
    }
  };

  const handleCancelRide = (rideId: string, rideName: string) => {
    if (confirm(`Are you sure you want to cancel this ride to ${rideName}?\n\nAll passengers will be notified.`)) {
      const success = cancelRide(rideId);
      if (success) {
        alert('Ride cancelled successfully. All passengers have been notified.');
        setRefreshKey(prev => prev + 1); // Force re-render
      } else {
        alert('Failed to cancel ride. Please try again.');
      }
    }
  };

  const handleStartJourney = (rideId: string, rideName: string) => {
    const ride = mockRides.find(r => r.id === rideId);
    const participants = getRideParticipants(rideId).filter(p => p.participant.status === 'confirmed');
    
    if (confirm(`Start journey to ${rideName}?\n\n${participants.length} passenger(s) will be notified.`)) {
      const success = startJourney(rideId);
      if (success) {
        alert(
          `🚗 Journey Started Successfully!\n\n` +
          `✅ Ride is now ACTIVE\n` +
          `📱 ${participants.length} passenger(s) notified:\n` +
          `   - Ride status changed to "In Progress"\n` +
          `   - Pickup status updated\n` +
          `   - SOS features activated\n\n` +
          `You can now complete the ride when you arrive.`
        );
        setRefreshKey(prev => prev + 1);
      } else {
        alert('Failed to start journey. Please try again.');
      }
    }
  };

  const handleCompleteRide = async (rideId: string, rideName: string) => {
    const ride = mockRides.find(r => r.id === rideId);
    if (!ride) {
      alert('Ride not found!');
      return;
    }
    
    const participants = getRideParticipants(rideId).filter(p => 
      p.participant.status === 'confirmed' || p.participant.status === 'picked_up'
    );
    
    console.log(`🚗 Driver completing ride ${rideId} with ${participants.length} passengers...`);
    console.log(`📏 Ride distance: ${ride.estimated_distance} km`);
    console.log(`💡 Expected CO2: ${(ride.estimated_distance * participants.length * 0.21).toFixed(2)} kg`);
    
    // Use the impact service to handle completion
    const result = await completeRideWithImpact(rideId, userId, true);
    
    if (result.success) {
      console.log(`✅ Ride completed successfully!`);
      console.log(`📊 CO2 Saved: ${result.co2Saved.toFixed(2)} kg`);
      console.log(`📏 Distance: ${result.distance.toFixed(1)} km`);
      console.log(`✅ Updating Impact Dashboard...`);
      
      alert(
        `🎉 Ride Completed!\n\n` +
        `🌱 Environmental Impact:\n` +
        `   ${result.co2Saved.toFixed(2)} kg CO2 Saved\n` +
        `   ${participants.length} car(s) removed\n` +
        `   ${result.distance.toFixed(1)} km shared\n\n` +
        `✅ Impact updated for you and all ${participants.length} passengers!\n` +
        `📊 Check "My Impact" tab now!`
      );
      
      // Force multiple refreshes to ensure data propagates
      setRefreshKey(prev => prev + 1);
      setTimeout(() => setRefreshKey(prev => prev + 1), 50);
      setTimeout(() => setRefreshKey(prev => prev + 1), 200);
    } else {
      console.error(`❌ Failed to complete ride ${rideId}`);
      alert('Failed to complete ride. Please try again.');
    }
  };

  const handleMarkMyRideComplete = async (participationId: string, ride: any) => {
    // Find the participation in mockParticipants
    const participation = mockParticipants.find(p => p.id === participationId);
    if (!participation) {
      alert('Participation not found!');
      return;
    }

    // Show rating modal instead of completing directly
    setShowRatingModal({
      participationId,
      ride,
      driverId: ride.driver_id
    });
  };

  const submitRating = async () => {
    if (!showRatingModal || selectedRating === 0) {
      alert('Please select a rating (1-5 stars)');
      return;
    }

    const { participationId, ride, driverId } = showRatingModal;
    const participation = mockParticipants.find(p => p.id === participationId);
    if (!participation) return;

    // Calculate personal CO2 impact
    const distance = ride?.estimated_distance || 0;
    const personalCO2 = (distance * 0.21).toFixed(2);
    const treesEquivalent = (parseFloat(personalCO2) / 21).toFixed(1);
    const fuelSaved = (parseFloat(personalCO2) / 2.3).toFixed(1);
    
    console.log(`🚀 Completing ride for passenger ${userId} with ${selectedRating} stars for driver`);
    
    // Update driver rating (average of current rating and new rating)
    const driver = mockProfiles.find(p => p.id === driverId);
    if (driver) {
      const newRating = (driver.rating + selectedRating) / 2;
      driver.rating = parseFloat(newRating.toFixed(2));
      console.log(`⭐ Driver rating updated: ${driver.rating} (was ${(driver.rating * 2 - selectedRating).toFixed(2)}, got ${selectedRating} stars)`);
    }
    
    // Save rating to participation
    participation.rating_given = selectedRating;
    
    // Use new impact service for database/mock integration
    const result = await completeRideWithImpact(ride.id, userId, false);
    if (result.success) {
      console.log(`✅ Impact saved! CO2: ${result.co2Saved.toFixed(2)} kg, Distance: ${result.distance} km`);
    }
    
    // Update participation visually
    participation.status = 'completed';
    participation.completed_at = new Date().toISOString();
    participation.co2_saved = parseFloat(personalCO2);
    
    // Close rating modal
    setShowRatingModal(null);
    setSelectedRating(0);
    
    // Show impact (use result values)
    alert(
      `🎉 Ride Marked as Complete!\n\n` +
      `⭐ Rating Given: ${selectedRating} stars\n` +
      `Driver's new rating: ${driver?.rating.toFixed(1)}\n\n` +
      `🌱 YOUR Environmental Impact:\n` +
      `   ${personalCO2} kg CO2 Saved\n` +
      `   ${distance.toFixed(1)} km travelled sustainably\n` +
      `   Equivalent to ${treesEquivalent} tree(s) for 1 year\n` +
      `   Saved ${fuelSaved} liters of fuel\n\n` +
      `✅ Your total impact updated\n` +
      `✅ Global metrics updated\n` +
      `✅ Driver rating updated\n` +
      `💚 Go to Impact Dashboard to see updated stats!`
    );
    
    // Force component re-render instead of page reload
    setRefreshKey(prev => prev + 1);
  };

  // Passenger Rating Modal (Only for passengers)
  if (showRatingModal) {
    const driver = mockProfiles.find(p => p.id === showRatingModal.driverId);
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-t-2xl text-white">
            <h3 className="text-2xl font-bold mb-2">Rate Your Driver</h3>
            <p className="text-emerald-100">How was your experience with {driver?.full_name}?</p>
          </div>
          
          <div className="p-6">
            {/* Driver Info */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {driver?.full_name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">{driver?.full_name}</div>
                <div className="text-sm text-gray-600">
                  Current rating: {driver?.rating.toFixed(1)} ⭐
                </div>
                <div className="text-xs text-gray-500">{driver?.vehicle_model}</div>
              </div>
            </div>

            {/* Star Rating */}
            <div className="mb-6">
              <p className="text-center text-gray-700 font-semibold mb-4">Rate this driver:</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    className={`text-5xl transition-all transform hover:scale-110 ${
                      star <= selectedRating
                        ? 'text-yellow-400 drop-shadow-lg'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {selectedRating > 0 && (
                <p className="text-center mt-3 text-emerald-600 font-semibold">
                  {selectedRating === 5 ? 'Excellent!' : selectedRating === 4 ? 'Great!' : selectedRating === 3 ? 'Good' : selectedRating === 2 ? 'Fair' : 'Needs Improvement'}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRatingModal(null);
                  setSelectedRating(0);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitRating}
                disabled={selectedRating === 0}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                Submit & Complete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {offeredRides.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rides You're Offering</h3>
          <div className="space-y-4">
            {offeredRides.map((ride) => {
              const ridePassengers = getRideParticipants(ride.id);
              const bookedCount = ridePassengers.filter(p => p.participant.status !== 'cancelled').length;
              const isExpanded = expandedRide === ride.id;

              return (
              <div
                key={ride.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ride.status === 'pending'
                            ? 'bg-blue-100 text-blue-800'
                            : ride.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ride.status === 'completed'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {ride.available_seats} {ride.available_seats === 1 ? 'seat' : 'seats'} available
                      </span>
                      {bookedCount > 0 && (
                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-medium">
                          {bookedCount} booked
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600">
                      ₹{ride.price_per_seat.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">per seat</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-start gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-600">From</div>
                        <div className="font-medium text-gray-900">{ride.origin}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-600">To</div>
                        <div className="font-medium text-gray-900">{ride.destination}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {new Date(ride.departure_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {new Date(ride.departure_time).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Leaf className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {ride.estimated_co2_saved.toFixed(1)}kg CO₂ savings
                      </span>
                    </div>
                  </div>
                </div>

                {/* Passengers List for Drivers */}
                {bookedCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setExpandedRide(isExpanded ? null : ride.id)}
                      className="w-full flex items-center justify-between p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-emerald-600" />
                        <span className="font-semibold text-emerald-900">
                          {bookedCount} Passenger{bookedCount !== 1 ? 's' : ''} Booked
                        </span>
                      </div>
                      <span className="text-emerald-600 font-bold text-xl">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="mt-3 space-y-3">
                        {ridePassengers
                          .filter(p => p.participant.status !== 'cancelled')
                          .map(({ participant, passenger }) => (
                            <div
                              key={participant.id}
                              className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 hover:border-emerald-300 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                                    {passenger?.full_name.charAt(0) || 'P'}
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-900">
                                      {passenger?.full_name || 'Passenger'}
                                    </div>
                                    <div className="text-sm text-gray-600 flex items-center gap-1">
                                      <span>{passenger?.rating.toFixed(1) || 'N/A'}</span>
                                      <span className="text-yellow-500">★</span>
                                      <span className="mx-1">•</span>
                                      <span>{passenger?.total_rides_taken || 0} rides</span>
                                    </div>
                                  </div>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    participant.status === 'confirmed'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : participant.status === 'requested'
                                      ? 'bg-blue-100 text-blue-800'
                                      : participant.status === 'picked_up'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {participant.status.charAt(0).toUpperCase() + participant.status.slice(1)}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="bg-white rounded-lg p-3">
                                  <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-emerald-600" />
                                    Pickup
                                  </div>
                                  <div className="font-medium text-gray-900 text-sm">
                                    {participant.pickup_location}
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-3">
                                  <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-red-600" />
                                    Dropoff
                                  </div>
                                  <div className="font-medium text-gray-900 text-sm">
                                    {participant.dropoff_location}
                                  </div>
                                </div>
                              </div>

                              {passenger?.phone && (
                                <a
                                  href={`tel:${passenger.phone}`}
                                  className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors text-sm"
                                >
                                  <Phone className="h-4 w-4" />
                                  Call Passenger
                                </a>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons for Driver */}
                {ride.status !== 'cancelled' && ride.status !== 'completed' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    {/* Start Journey Button - Only show if not started and has passengers */}
                    {!ride.journey_started && bookedCount > 0 && (
                      <button
                        onClick={() => handleStartJourney(ride.id, ride.destination)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-bold transition-all shadow-md"
                      >
                        <Play className="h-5 w-5" />
                        Start Journey
                      </button>
                    )}
                    
                    {/* Complete Ride Button - Only show when journey started */}
                    {ride.journey_started && bookedCount > 0 && (
                      <button
                        onClick={() => handleCompleteRide(ride.id, ride.destination)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-lg font-bold transition-all shadow-md"
                      >
                        <CheckCircle className="h-5 w-5" />
                        Complete Ride & Update Impact
                      </button>
                    )}
                    
                    {/* Cancel Button - Only show if journey not started */}
                    {!ride.journey_started && (
                      <button
                        onClick={() => handleCancelRide(ride.id, ride.destination)}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel Ride
                      </button>
                    )}
                    {bookedCount > 0 && (
                      <p className="text-xs text-gray-600 text-center">
                        {bookedCount} passenger{bookedCount !== 1 ? 's' : ''} booked
                      </p>
                    )}
                  </div>
                )}
                
                {/* Completed Ride Info */}
                {ride.status === 'completed' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <span className="font-bold text-emerald-900">Ride Completed!</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-white rounded-lg p-2">
                          <div className="text-xs text-gray-600 mb-1">CO2 Saved</div>
                          <div className="text-lg font-bold text-emerald-600">
                            {ride.estimated_co2_saved.toFixed(1)}kg
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <div className="text-xs text-gray-600 mb-1">Distance</div>
                          <div className="text-lg font-bold text-blue-600">
                            {ride.estimated_distance.toFixed(1)}km
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <div className="text-xs text-gray-600 mb-1">Passengers</div>
                          <div className="text-lg font-bold text-purple-600">
                            {getRideParticipants(ride.id).filter(p => p.participant.status === 'completed').length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </div>
      )}

      {joinedRides.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rides You're Taking</h3>
          <div className="space-y-4">
            {joinedRides.map(({ participation, ride, driver }) => (
              <div
                key={participation.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-emerald-600">
                        {driver!.full_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{driver!.full_name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <span>{driver!.rating.toFixed(1)}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      participation.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : participation.status === 'requested'
                        ? 'bg-blue-100 text-blue-800'
                        : participation.status === 'completed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {participation.status.charAt(0).toUpperCase() + participation.status.slice(1)}
                  </span>
                </div>

                {/* Driver Cancellation Notice */}
                {participation.status === 'cancelled' && participation.cancelled_by === 'driver' && (
                  <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-red-900 text-lg mb-1">Ride Cancelled by Driver</h4>
                        <p className="text-sm text-red-700">
                          {participation.cancellation_reason || 'The driver cancelled this ride'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Refund Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          participation.refund_status === 'completed' 
                            ? 'bg-green-100 text-green-700'
                            : participation.refund_status === 'processed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {participation.refund_status === 'pending' && '⏳ Processing Refund'}
                          {participation.refund_status === 'processed' && '✓ Refund Processed'}
                          {participation.refund_status === 'completed' && '✓ Refund Completed'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {participation.refund_status === 'pending' && 'Your payment will be refunded within 24-48 hours'}
                        {participation.refund_status === 'processed' && 'Refund has been initiated to your account'}
                        {participation.refund_status === 'completed' && 'Full refund has been credited to your account'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                        <span>Full refund will be credited to your wallet</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                        <span>Your reward points have been retained</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                        <span>No cancellation fee charged</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-red-200">
                      <button
                        onClick={() => window.location.href = '#find-ride'}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <MapPin className="h-5 w-5" />
                        Find Another Ride
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-start gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-600">Pickup</div>
                        <div className="font-medium text-gray-900">{participation.pickup_location}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-red-600 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-600">Dropoff</div>
                        <div className="font-medium text-gray-900">{participation.dropoff_location}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {new Date(ride!.departure_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {new Date(ride!.departure_time).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Leaf className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {participation.co2_saved.toFixed(1)}kg CO₂ saved
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  {/* Safety Features for Active Rides */}
                  {(participation.status === 'confirmed' || participation.status === 'picked_up' || participation.status === 'requested') && (
                    <div className="space-y-3">
                      {/* Share Trip */}
                      <ShareTrip
                        ride={ride!}
                        pickupLocation={participation.pickup_location}
                        dropoffLocation={participation.dropoff_location}
                        driverName={driver!.full_name}
                      />

                      {/* SOS Button - Only for confirmed/active rides */}
                      {(participation.status === 'confirmed' || participation.status === 'picked_up') && (
                        <div>
                          <button
                            onClick={() => setActiveSOSRide(activeSOSRide === participation.id ? null : participation.id)}
                            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-md"
                          >
                            <AlertTriangle className="h-5 w-5" />
                            Emergency SOS
                          </button>
                          {activeSOSRide === participation.id && (
                            <div className="mt-3">
                              <SOSButton
                                ride={ride!}
                                pickupLocation={participation.pickup_location}
                                dropoffLocation={participation.dropoff_location}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Completed Ride Impact - Passenger View */}
                  {participation.status === 'completed' && (
                    <div className="mb-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl p-5">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Leaf className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-emerald-900 text-lg mb-1">Ride Completed!</h4>
                          <p className="text-sm text-emerald-700">
                            Thank you for choosing sustainable transportation
                          </p>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-4 mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Your Environmental Impact</h5>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-600 mb-1">
                              {participation.co2_saved.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-600">kg CO₂</div>
                            <div className="text-xs text-gray-500">Saved</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 mb-1">1</div>
                            <div className="text-xs text-gray-600">Car</div>
                            <div className="text-xs text-gray-500">Off Road</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600 mb-1">
                              {ride?.estimated_distance.toFixed(0)}
                            </div>
                            <div className="text-xs text-gray-600">km</div>
                            <div className="text-xs text-gray-500">Shared</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                          <span>Equivalent to planting <strong>{(participation.co2_saved / 21).toFixed(1)} trees</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                          <span>Saved <strong>{(participation.co2_saved / 2.3).toFixed(1)} liters</strong> of fuel</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>
                          <span>Contributing to <strong>SDG 11</strong> - Sustainable Cities</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Passenger Action Buttons */}
                  {participation.status === 'confirmed' && (
                    <div className="space-y-3">
                      {/* Mark Complete Button */}
                      <button
                        onClick={() => handleMarkMyRideComplete(participation.id, ride)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 rounded-lg font-bold transition-all shadow-md"
                      >
                        <CheckCircle className="h-5 w-5" />
                        ✓ Mark Ride as Completed
                      </button>
                      
                      {/* Cancel Button */}
                      <button
                        onClick={() => handleCancelParticipation(participation.id, ride!.destination)}
                        className="w-full flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg font-semibold transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel My Booking
                      </button>
                    </div>
                  )}
                  
                  {/* Cancel button for requested rides */}
                  {participation.status === 'requested' && (
                    <button
                      onClick={() => handleCancelParticipation(participation.id, ride!.destination)}
                      className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-2.5 rounded-lg font-semibold transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {offeredRides.length === 0 && joinedRides.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No rides yet</h4>
          <p className="text-gray-600 mb-6">
            Start by offering a ride or finding one to join
          </p>
        </div>
      )}
    </div>
  );
}

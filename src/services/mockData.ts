import { Profile, Ride, RideParticipant, ImpactMetric, Reward, Location, RewardTransaction, Coupon } from '../types';
import { calculateCO2Savings, calculateFuelSavings } from './rideMatching';
import { calculateRideRewards, generateRewardCoupon, RewardsService } from './rewardsService';

// ============================================================================
// HELPER FUNCTIONS FOR DATA ADAPTER
// ============================================================================

export function createProfile(data: Omit<Profile, 'id' | 'created_at'>): Profile {
  const newProfile: Profile = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    created_at: new Date().toISOString()
  };
  mockProfiles.push(newProfile);
  return newProfile;
}

export function getProfileById(id: string): Profile | null {
  return mockProfiles.find(p => p.id === id) || null;
}

export function getProfileByEmail(email: string): Profile | null {
  return mockProfiles.find(p => p.email === email) || null;
}

export function updateProfile(id: string, updates: Partial<Profile>): Profile | null {
  const profile = mockProfiles.find(p => p.id === id);
  if (profile) {
    Object.assign(profile, updates);
    return profile;
  }
  return null;
}

export function getRideById(id: string): Ride | null {
  return mockRides.find(r => r.id === id) || null;
}

export function getAvailableRides(): Ride[] {
  return mockRides.filter(r => r.status === 'pending' || r.status === 'active');
}

export function getRidesByDriver(driverId: string): Ride[] {
  return mockRides.filter(r => r.driver_id === driverId);
}

export function getParticipantsByRide(rideId: string): RideParticipant[] {
  return mockParticipants.filter(p => p.ride_id === rideId);
}

export function getParticipantsByPassenger(passengerId: string): RideParticipant[] {
  return mockParticipants.filter(p => p.passenger_id === passengerId);
}

export function cancelBooking(participantId: string, cancelledBy: 'passenger' | 'driver', reason?: string): boolean {
  const participant = mockParticipants.find(p => p.id === participantId);
  if (participant) {
    participant.status = 'cancelled';
    participant.cancelled_by = cancelledBy;
    participant.cancellation_reason = reason;
    participant.refund_status = 'pending';
    
    // Return seat if confirmed
    if (participant.status === 'confirmed') {
      const ride = mockRides.find(r => r.id === participant.ride_id);
      if (ride) ride.available_seats += 1;
    }
    
    return true;
  }
  return false;
}

export function getImpactMetrics(): ImpactMetric[] {
  return mockImpactMetrics;
}

// ============================================================================
// MOCK DATA
// ============================================================================

export const mockProfiles: Profile[] = [
  {
    id: 'user-1',
    email: 'sarah.johnson@example.com',
    full_name: 'Sarah Johnson',
    role: 'driver',
    phone: '+1234567890',
    vehicle_type: 'Sedan',
    vehicle_capacity: 4,
    vehicle_model: 'Toyota Camry 2022',
    preferences: { music: true, pets: false, smoking: false },
    total_rides_offered: 45,
    total_rides_taken: 12,
    rating: 4.8,
    total_co2_saved: 345.5,
    reward_points: 2850,
    wallet_balance: 1250.00,
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'user-2',
    email: 'michael.chen@example.com',
    full_name: 'Michael Chen',
    role: 'driver',
    phone: '+1234567891',
    vehicle_type: 'SUV',
    vehicle_capacity: 6,
    vehicle_model: 'Honda CR-V 2023',
    preferences: { music: true, pets: true, smoking: false },
    total_rides_offered: 67,
    total_rides_taken: 8,
    rating: 4.9,
    total_co2_saved: 512.3,
    reward_points: 4120,
    wallet_balance: 2280.00,
    created_at: '2023-11-20T14:30:00Z'
  },
  {
    id: 'user-3',
    email: 'emma.wilson@example.com',
    full_name: 'Emma Wilson',
    role: 'passenger',
    phone: '+1234567892',
    vehicle_type: 'Hatchback',
    vehicle_capacity: 4,
    vehicle_model: 'VW Golf 2021',
    preferences: { music: false, pets: true, smoking: false },
    total_rides_offered: 23,
    total_rides_taken: 34,
    rating: 4.7,
    total_co2_saved: 189.2,
    reward_points: 1650,
    wallet_balance: 3384.00,
    emergency_contacts: [
      {
        id: 'ec-3',
        name: 'David Wilson',
        phone: '+1234567777',
        relationship: 'Sibling',
        isPrimary: true
      }
    ],
    created_at: '2024-03-05T09:15:00Z'
  },
  {
    id: 'user-4',
    email: 'passenger@example.com',
    full_name: 'Alex Passenger',
    role: 'passenger',
    phone: '+1234567893',
    vehicle_capacity: 0,
    preferences: { music: true, pets: true, smoking: false },
    total_rides_offered: 0,
    total_rides_taken: 18,
    rating: 4.9,
    total_co2_saved: 89.4,
    reward_points: 950,
    wallet_balance: 1008.00,
    emergency_contacts: [
      {
        id: 'ec-1',
        name: 'Jane Passenger',
        phone: '+1234567899',
        relationship: 'Spouse',
        isPrimary: true
      },
      {
        id: 'ec-2',
        name: 'Robert Passenger',
        phone: '+1234567888',
        relationship: 'Parent',
        isPrimary: false
      }
    ],
    created_at: '2024-02-10T12:00:00Z'
  },
  {
    id: 'user-5',
    email: 'driver@example.com',
    full_name: 'Jordan Driver',
    role: 'driver',
    phone: '+1234567894',
    vehicle_type: 'Sedan',
    vehicle_capacity: 4,
    vehicle_model: 'Tesla Model 3 2023',
    preferences: { music: true, pets: false, smoking: false },
    total_rides_offered: 38,
    total_rides_taken: 5,
    rating: 4.95,
    total_co2_saved: 412.8,
    reward_points: 3200,
    wallet_balance: 1512.00,
    created_at: '2024-01-20T08:30:00Z'
  }
];

export const mockRides: Ride[] = [
  {
    id: 'ride-1',
    driver_id: 'user-1',
    origin: 'Downtown Plaza, Main Street',
    destination: 'Tech Park Innovation Center',
    origin_lat: 40.7128,
    origin_lng: -74.0060,
    dest_lat: 40.7589,
    dest_lng: -73.9851,
    departure_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    available_seats: 3,
    status: 'pending',
    route_data: {
      waypoints: [],
      distance: 12.5,
      duration: 28
    },
    estimated_duration: 28,
    estimated_distance: 12.5,
    estimated_co2_saved: 4.2,
    price_per_seat: 150.0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'ride-2',
    driver_id: 'user-2',
    origin: 'University Campus',
    destination: 'Business District Center',
    origin_lat: 40.7282,
    origin_lng: -74.0776,
    dest_lat: 40.7484,
    dest_lng: -73.9857,
    departure_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    available_seats: 5,
    status: 'pending',
    route_data: {
      waypoints: [],
      distance: 18.3,
      duration: 35
    },
    estimated_duration: 35,
    estimated_distance: 18.3,
    estimated_co2_saved: 6.1,
    price_per_seat: 210.0,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'ride-3',
    driver_id: 'user-3',
    origin: 'Shopping Mall Complex',
    destination: 'Airport Terminal 1',
    origin_lat: 40.7580,
    origin_lng: -73.9855,
    dest_lat: 40.6413,
    dest_lng: -73.7781,
    departure_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    available_seats: 2,
    status: 'pending',
    route_data: {
      waypoints: [],
      distance: 25.8,
      duration: 45
    },
    estimated_duration: 45,
    estimated_distance: 25.8,
    estimated_co2_saved: 8.6,
    price_per_seat: 360.0,
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
  }
];

export const mockParticipants: RideParticipant[] = [
  {
    id: 'participant-1',
    ride_id: 'ride-2',
    passenger_id: 'user-3',
    pickup_location: 'University Library',
    pickup_lat: 40.7290,
    pickup_lng: -74.0760,
    dropoff_location: 'Business District - 5th Avenue',
    dropoff_lat: 40.7489,
    dropoff_lng: -73.9840,
    status: 'confirmed',
    co2_saved: 3.5,
    joined_at: new Date(Date.now() - 1000 * 60 * 20).toISOString()
  }
];

// Generate initial impact metrics for last 7 days with realistic data
const generateInitialMetrics = (): ImpactMetric[] => {
  const metrics: ImpactMetric[] = [];
  for (let i = 7; i >= 1; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    metrics.push({
      id: `metric-${8-i}`,
      date: dateStr,
      total_rides: 120 + Math.floor(Math.random() * 60),
      total_participants: 320 + Math.floor(Math.random() * 180),
      total_co2_saved: 950 + Math.random() * 450,
      total_distance_shared: 3200 + Math.random() * 1500,
      average_occupancy: 2.5 + Math.random() * 0.5,
      fuel_saved_liters: 380 + Math.random() * 180,
      cost_saved: 1500 + Math.random() * 700,
      created_at: date.toISOString()
    });
  }
  
  // Add today with initial data
  const today = new Date().toISOString().split('T')[0];
  metrics.push({
    id: 'metric-today',
    date: today,
    total_rides: 0,
    total_participants: 0,
    total_co2_saved: 0,
    total_distance_shared: 0,
    average_occupancy: 0,
    fuel_saved_liters: 0,
    cost_saved: 0,
    created_at: new Date().toISOString()
  });
  
  return metrics;
};

export const mockImpactMetrics: ImpactMetric[] = generateInitialMetrics();

export const mockRewards: Reward[] = [
  {
    id: 'reward-1',
    user_id: 'user-1',
    points: 50,
    reason: 'Completed ride as driver',
    type: 'ride_completed',
    metadata: { ride_id: 'ride-1', passengers: 3 },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: 'reward-2',
    user_id: 'user-1',
    points: 100,
    reason: 'Reached 50 rides milestone',
    type: 'milestone',
    metadata: { milestone: '50_rides' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: 'reward-3',
    user_id: 'user-2',
    points: 75,
    reason: 'Completed ride with full capacity',
    type: 'bonus',
    metadata: { ride_id: 'ride-2', occupancy: 100 },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  }
];

let currentUser: Profile | null = null;

export const setCurrentUser = (user: Profile | null) => {
  currentUser = user;
  // Store in sessionStorage (cleared on browser close)
  if (user) {
    sessionStorage.setItem('shareway_user', JSON.stringify(user));
  } else {
    sessionStorage.removeItem('shareway_user');
  }
};

export const getCurrentUser = (): Profile | null => {
  // Try to get from sessionStorage first
  const stored = sessionStorage.getItem('shareway_user');
  if (stored) {
    try {
      const user = JSON.parse(stored);
      currentUser = user;
      return user;
    } catch {
      sessionStorage.removeItem('shareway_user');
    }
  }
  return currentUser;
};

export const getUserRides = (userId: string): Ride[] => {
  return mockRides.filter(ride => ride.driver_id === userId);
};

export const getUserParticipations = (userId: string): RideParticipant[] => {
  return mockParticipants.filter(p => p.passenger_id === userId);
};

export const getUserRewards = (userId: string): Reward[] => {
  return mockRewards.filter(r => r.user_id === userId);
};

export interface NewRideInput {
  driverId: string;
  origin: string;
  destination: string;
  originCoord: { lat: number; lng: number };
  destCoord: { lat: number; lng: number };
  departureISO: string; // ISO string
  availableSeats: number;
  pricePerSeat: number;
  distanceKm: number;
  durationMin: number;
}

export const addRide = (input: NewRideInput): Ride => {
  const id = `ride-${Math.random().toString(36).slice(2, 8)}`;
  const estimated_co2_saved = calculateCO2Savings(input.distanceKm, Math.min(input.availableSeats, 3));
  const ride: Ride = {
    id,
    driver_id: input.driverId,
    origin: input.origin,
    destination: input.destination,
    origin_lat: input.originCoord.lat,
    origin_lng: input.originCoord.lng,
    dest_lat: input.destCoord.lat,
    dest_lng: input.destCoord.lng,
    departure_time: input.departureISO,
    available_seats: input.availableSeats,
    status: 'pending',
    route_data: {
      waypoints: [],
      distance: input.distanceKm,
      duration: input.durationMin
    },
    estimated_duration: input.durationMin,
    estimated_distance: input.distanceKm,
    estimated_co2_saved,
    price_per_seat: input.pricePerSeat,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  mockRides.push(ride);
  return ride;
};

export interface NewParticipationInput {
  rideId: string;
  passengerId: string;
  pickup: { label: string; lat: number; lng: number };
  dropoff: { label: string; lat: number; lng: number };
}

export const addParticipation = (input: NewParticipationInput): RideParticipant | null => {
  const ride = mockRides.find(r => r.id === input.rideId);
  if (!ride || ride.available_seats <= 0) return null;

  const id = `participant-${Math.random().toString(36).slice(2, 8)}`;
  const co2_saved = calculateCO2Savings(ride.estimated_distance, 1);

  const participant: RideParticipant = {
    id,
    ride_id: input.rideId,
    passenger_id: input.passengerId,
    pickup_location: input.pickup.label,
    pickup_lat: input.pickup.lat,
    pickup_lng: input.pickup.lng,
    dropoff_location: input.dropoff.label,
    dropoff_lat: input.dropoff.lat,
    dropoff_lng: input.dropoff.lng,
    status: 'requested',
    co2_saved,
    joined_at: new Date().toISOString()
  };

  mockParticipants.push(participant);
  ride.available_seats = Math.max(0, ride.available_seats - 1);
  ride.updated_at = new Date().toISOString();

  // Award rewards to passenger for booking
  const passenger = mockProfiles.find(p => p.id === input.passengerId);
  if (passenger) {
    const ridePrice = ride.price_per_seat;
    const rewards = calculateRideRewards(ridePrice, passenger.total_rides_taken);
    
    // Update passenger points and wallet balance
    passenger.reward_points += rewards.totalPoints;
    passenger.wallet_balance += rewards.cashback;
    passenger.total_rides_taken += 1;
    
    // Create reward transaction for points
    const pointsTransaction: RewardTransaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: input.passengerId,
      type: 'earn',
      points: rewards.points,
      cashback: rewards.cashback,
      description: `Ride booked: ${ride.origin} to ${ride.destination}`,
      ride_id: input.rideId,
      created_at: new Date().toISOString(),
    };
    RewardsService.addRewardTransaction(pointsTransaction);
    
    // Add bonus points transaction if milestone reached
    if (rewards.bonusPoints > 0) {
      const bonusTransaction: RewardTransaction = {
        id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: input.passengerId,
        type: 'earn',
        points: rewards.bonusPoints,
        description: `Milestone Bonus: ${passenger.total_rides_taken} rides completed!`,
        created_at: new Date().toISOString(),
      };
      RewardsService.addRewardTransaction(bonusTransaction);
    }
    
    // Generate coupon if lucky
    if (rewards.generateCoupon) {
      const coupon = generateRewardCoupon(input.passengerId);
      RewardsService.addCoupon(coupon);
    }
  }

  return participant;
};

// Cancel participation (passenger cancels booking)
export const cancelParticipation = (participantId: string): boolean => {
  const participant = mockParticipants.find(p => p.id === participantId);
  if (!participant) return false;

  const ride = mockRides.find(r => r.id === participant.ride_id);
  if (!ride) return false;

  // Update participant status
  participant.status = 'cancelled';
  participant.cancelled_by = 'passenger';
  participant.cancellation_reason = 'Cancelled by passenger';

  // Return seat to available pool
  ride.available_seats += 1;
  ride.updated_at = new Date().toISOString();

  // Optionally refund points/cashback (in real app)
  // For now, we'll keep the rewards as cancellation may have fees

  return true;
};

// Cancel ride (driver cancels entire ride)
export const cancelRide = (rideId: string): boolean => {
  const ride = mockRides.find(r => r.id === rideId);
  if (!ride) return false;

  ride.status = 'cancelled';
  ride.updated_at = new Date().toISOString();

  // Decrease driver's rating by 0.25 for cancelling
  const driver = mockProfiles.find(p => p.id === ride.driver_id);
  if (driver) {
    driver.rating = Math.max(1.0, driver.rating - 0.25);
    console.log(`Driver ${driver.full_name} rating decreased to ${driver.rating} for cancelling ride`);
  }

  // Cancel all participants and notify them
  const participants = mockParticipants.filter(p => p.ride_id === rideId);
  participants.forEach(p => {
    p.status = 'cancelled';
    p.cancellation_reason = 'Driver cancelled the ride';
    p.refund_status = 'pending';
    p.cancelled_by = 'driver';
  });

  console.log(`Ride ${rideId} cancelled by driver. ${participants.length} passengers affected.`);
  return true;
};

// Get participants for a specific ride
export const getRideParticipants = (rideId: string): Array<{ participant: RideParticipant; passenger: Profile | null }> => {
  const participants = mockParticipants.filter(p => p.ride_id === rideId);
  return participants.map(p => {
    const passenger = mockProfiles.find(prof => prof.id === p.passenger_id);
    return { participant: p, passenger: passenger || null };
  });
};

// Start journey (driver starts the ride)
export const startJourney = (rideId: string): boolean => {
  const ride = mockRides.find(r => r.id === rideId);
  if (!ride) return false;

  ride.journey_started = true;
  ride.journey_start_time = new Date().toISOString();
  ride.status = 'active';
  ride.updated_at = new Date().toISOString();

  // Update all confirmed participants to picked_up
  const updatedPassengers = mockParticipants
    .filter(p => p.ride_id === rideId && p.status === 'confirmed');
  
  updatedPassengers.forEach(p => {
    p.status = 'picked_up';
  });

  console.log(`🚗 Journey started for ride ${rideId} with ${updatedPassengers.length} passengers`);
  
  // Show notification about passengers being notified
  if (updatedPassengers.length > 0) {
    console.log(`📢 ${updatedPassengers.length} passenger(s) notified that journey has started`);
  }
  
  return true;
};

// Complete a ride and update CO2 savings
export const completeRide = (rideId: string): boolean => {
  const ride = mockRides.find(r => r.id === rideId);
  if (!ride || ride.status === 'completed') return false;

  // Mark ride as completed
  ride.status = 'completed';
  ride.updated_at = new Date().toISOString();

  // Get all confirmed or picked up participants
  const participants = mockParticipants.filter(
    p => p.ride_id === rideId && (p.status === 'confirmed' || p.status === 'picked_up')
  );

  console.log(`🚀 Completing ride ${rideId} with ${participants.length} passengers`);

  // Calculate actual CO2 saved based on actual participants
  const actualPassengers = participants.length;
  const actualCO2Saved = calculateCO2Savings(ride.estimated_distance, actualPassengers);
  
  console.log(`💡 Calculated CO2: ${actualCO2Saved.toFixed(2)} kg (${ride.estimated_distance.toFixed(1)} km × ${actualPassengers} passengers × 0.21)`);

  // Update driver's total CO2 saved
  const driver = mockProfiles.find(p => p.id === ride.driver_id);
  if (driver) {
    driver.total_co2_saved += actualCO2Saved;
    driver.total_rides_offered += 1;
    console.log(`✅ Driver ${driver.full_name} completed ride. CO2 saved: ${actualCO2Saved.toFixed(2)} kg. Total: ${driver.total_co2_saved.toFixed(2)} kg`);
  }

  // Update each passenger's CO2 savings and mark as completed
  participants.forEach(p => {
    p.status = 'completed';
    p.completed_at = new Date().toISOString();
    
    const passenger = mockProfiles.find(prof => prof.id === p.passenger_id);
    if (passenger) {
      passenger.total_co2_saved += p.co2_saved;
      console.log(`✅ Passenger ${passenger.full_name} completed ride. CO2 saved: ${p.co2_saved.toFixed(2)} kg. Total: ${passenger.total_co2_saved.toFixed(2)} kg`);
    }
  });

  // Update global impact metrics (use local date)
  const todayDate = new Date();
  const year = todayDate.getFullYear();
  const month = String(todayDate.getMonth() + 1).padStart(2, '0');
  const day = String(todayDate.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;
  
  console.log(`📊 completeRide: Looking for date ${today}`);
  let todayMetric = mockImpactMetrics.find(m => m.date === today);
  
  if (!todayMetric) {
    console.log(`📊 completeRide: Creating new metric for ${today}`);
    todayMetric = {
      id: `metric-${Date.now()}`,
      date: today,
      total_rides: 1,
      total_participants: actualPassengers,
      total_co2_saved: actualCO2Saved,
      total_distance_shared: ride.estimated_distance,
      fuel_saved_liters: calculateFuelSavings(ride.estimated_distance, actualPassengers),
      cost_saved: ride.price_per_seat * actualPassengers,
      average_occupancy: actualPassengers,
      created_at: new Date().toISOString()
    };
    mockImpactMetrics.push(todayMetric);
  } else {
    console.log(`📊 completeRide: Updating existing metric for ${today}`);
    todayMetric.total_rides += 1;
    todayMetric.total_participants += actualPassengers;
    todayMetric.total_co2_saved += actualCO2Saved;
    todayMetric.total_distance_shared += ride.estimated_distance;
    todayMetric.fuel_saved_liters += calculateFuelSavings(ride.estimated_distance, actualPassengers);
    todayMetric.cost_saved += ride.price_per_seat * actualPassengers;
    todayMetric.average_occupancy = todayMetric.total_participants / todayMetric.total_rides;
  }

  console.log(`📊 Impact updated: ${actualCO2Saved.toFixed(2)} kg CO2 saved. Total today: ${todayMetric.total_co2_saved.toFixed(2)} kg`);
  console.log('📊 Today metric:', todayMetric);
  
  return true;
};

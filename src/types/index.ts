export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'passenger' | 'driver';
  phone?: string;
  vehicle_type?: string;
  vehicle_capacity: number;
  vehicle_model?: string;
  vehicle_plate?: string;
  preferences: Record<string, any>;
  total_rides_offered: number;
  total_rides_taken: number;
  rating: number;
  total_co2_saved: number;
  reward_points: number;
  wallet_balance: number;
  emergency_contacts?: EmergencyContact[];
  created_at: string;
  gender?: 'male' | 'female' | 'other';
  aadhaar_verified?: boolean;
  aadhaar_match_score?: number;
  aadhaar_name?: string;
}

export interface Ride {
  id: string;
  driver_id: string;
  driver?: Profile;
  origin: string;
  destination: string;
  origin_lat: number;
  origin_lng: number;
  dest_lat: number;
  dest_lng: number;
  departure_time: string;
  available_seats: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  route_data: any;
  estimated_duration: number;
  estimated_distance: number;
  estimated_co2_saved: number;
  price_per_seat: number;
  created_at: string;
  updated_at: string;
  participants?: RideParticipant[];
  journey_started?: boolean;
  journey_start_time?: string;
}

export interface RideParticipant {
  id: string;
  ride_id: string;
  passenger_id: string;
  passenger?: Profile;
  pickup_location: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_location: string;
  dropoff_lat: number;
  dropoff_lng: number;
  status: 'requested' | 'confirmed' | 'picked_up' | 'completed' | 'cancelled';
  rating_given?: number;
  review?: string;
  co2_saved: number;
  joined_at: string;
  completed_at?: string;
  cancellation_reason?: string;
  refund_status?: 'pending' | 'processed' | 'completed';
  cancelled_by?: 'passenger' | 'driver';
}

export interface ImpactMetric {
  id: string;
  date: string;
  total_rides: number;
  total_participants: number;
  total_co2_saved: number;
  total_distance_shared: number;
  average_occupancy: number;
  fuel_saved_liters: number;
  cost_saved: number;
  created_at: string;
}

export interface Reward {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  type: 'ride_completed' | 'milestone' | 'bonus' | 'redemption';
  metadata: Record<string, any>;
  created_at: string;
}

export interface Coupon {
  id: string;
  user_id: string;
  code: string;
  discount_type: 'percentage' | 'fixed' | 'free_ride';
  discount_value: number;
  min_ride_value?: number;
  expires_at: string;
  is_used: boolean;
  used_at?: string;
  created_at: string;
}

export interface RewardTransaction {
  id: string;
  user_id: string;
  type: 'earn' | 'redeem';
  points: number;
  cashback?: number;
  description: string;
  ride_id?: string;
  created_at: string;
}

export interface RedemptionOption {
  id: string;
  title: string;
  description: string;
  type: 'free_ride' | 'discount_coupon' | 'cashback';
  points_required: number;
  value: number;
  icon: string;
}

export interface Location {
  address: string;
  lat: number;
  lng: number;
}

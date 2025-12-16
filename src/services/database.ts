/**
 * ShareWay Database Service
 * Handles all Supabase database operations
 */

import { supabase } from '../lib/supabase';
import type { Profile, Ride, RideParticipant, ImpactMetric, Reward, Coupon, RewardTransaction, EmergencyContact } from '../types';

// ============================================================================
// PROFILES (Users)
// ============================================================================

export const ProfileDB = {
  /**
   * Create a new user profile
   */
  async create(data: Omit<Profile, 'id' | 'created_at'>): Promise<Profile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert([{
          email: data.email,
          full_name: data.full_name,
          role: data.role,
          phone: data.phone,
          vehicle_type: data.vehicle_type || null,
          vehicle_model: data.vehicle_model || null,
          vehicle_capacity: data.vehicle_capacity || (data.role === 'driver' ? 4 : 0),
          preferences: data.preferences || {},
          aadhaar_verified: false,
          aadhaar_match_score: null,
          total_rides_offered: 0,
          total_rides_taken: 0,
          rating: 5.0,
          total_co2_saved: 0,
          reward_points: 1000,
          wallet_balance: 0
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error creating profile:', error);
        console.error('Error details:', error.message, error.details, error.hint);
        return null;
      }

      console.log('✅ Profile created in database:', profile);
      return profile as Profile;
    } catch (err) {
      console.error('❌ Exception creating profile:', err);
      return null;
    }
  },

  /**
   * Get profile by ID
   */
  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as Profile;
  },

  /**
   * Get profile by email
   */
  async getByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching profile by email:', error);
      return null;
    }

    return data as Profile;
  },

  /**
   * Update profile
   */
  async update(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    return data as Profile;
  },

  /**
   * Update CO2 saved for user
   */
  async addCO2Saved(userId: string, co2Amount: number): Promise<boolean> {
    const { error } = await supabase.rpc('increment_co2', {
      user_id: userId,
      amount: co2Amount
    });

    if (error) {
      // Fallback if function doesn't exist
      const profile = await this.getById(userId);
      if (!profile) return false;

      const newTotal = profile.total_co2_saved + co2Amount;
      const updated = await this.update(userId, { total_co2_saved: newTotal });
      return !!updated;
    }

    return true;
  },

  /**
   * Update reward points
   */
  async updateRewardPoints(userId: string, points: number): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({ reward_points: points })
      .eq('id', userId);

    return !error;
  },

  /**
   * Update wallet balance
   */
  async updateWalletBalance(userId: string, balance: number): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({ wallet_balance: balance })
      .eq('id', userId);

    return !error;
  },

  /**
   * Get all drivers (for admin purposes)
   */
  async getAllDrivers(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'driver')
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching drivers:', error);
      return [];
    }

    return data as Profile[];
  }
};

// ============================================================================
// EMERGENCY CONTACTS
// ============================================================================

export const EmergencyContactDB = {
  /**
   * Add emergency contact
   */
  async create(userId: string, contact: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact | null> {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert([{
        user_id: userId,
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship,
        is_primary: contact.isPrimary
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating emergency contact:', error);
      return null;
    }

    return data as EmergencyContact;
  },

  /**
   * Get all emergency contacts for user
   */
  async getByUserId(userId: string): Promise<EmergencyContact[]> {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });

    if (error) {
      console.error('Error fetching emergency contacts:', error);
      return [];
    }

    return data as EmergencyContact[];
  },

  /**
   * Delete emergency contact
   */
  async delete(contactId: string): Promise<boolean> {
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', contactId);

    return !error;
  }
};

// ============================================================================
// RIDES
// ============================================================================

export const RideDB = {
  /**
   * Create a new ride
   */
  async create(ride: Omit<Ride, 'id' | 'created_at' | 'updated_at'>): Promise<Ride | null> {
    const { data, error } = await supabase
      .from('rides')
      .insert([{
        driver_id: ride.driver_id,
        origin: ride.origin,
        destination: ride.destination,
        origin_lat: ride.origin_lat,
        origin_lng: ride.origin_lng,
        dest_lat: ride.dest_lat,
        dest_lng: ride.dest_lng,
        departure_time: ride.departure_time,
        available_seats: ride.available_seats,
        total_seats: ride.available_seats,
        price_per_seat: ride.price_per_seat,
        route_data: ride.route_data,
        estimated_duration: ride.estimated_duration,
        estimated_distance: ride.estimated_distance,
        estimated_co2_saved: ride.estimated_co2_saved,
        status: ride.status || 'pending'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating ride:', error);
      return null;
    }

    return data as Ride;
  },

  /**
   * Get ride by ID
   */
  async getById(rideId: string): Promise<Ride | null> {
    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        driver:profiles!rides_driver_id_fkey(*),
        participants:ride_participants(*)
      `)
      .eq('id', rideId)
      .single();

    if (error) {
      console.error('Error fetching ride:', error);
      return null;
    }

    return data as Ride;
  },

  /**
   * Get all rides with optional filters
   */
  async getAll(filters?: { status?: string; driverId?: string }): Promise<Ride[]> {
    let query = supabase
      .from('rides')
      .select(`
        *,
        driver:profiles!rides_driver_id_fkey(*),
        participants:ride_participants(*)
      `)
      .order('departure_time', { ascending: true });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.driverId) {
      query = query.eq('driver_id', filters.driverId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching rides:', error);
      return [];
    }

    return data as Ride[];
  },

  /**
   * Get available rides (for ride matching)
   */
  async getAvailable(): Promise<Ride[]> {
    const { data, error } = await supabase
      .from('rides')
      .select(`
        *,
        driver:profiles!rides_driver_id_fkey(*)
      `)
      .in('status', ['pending', 'active'])
      .gt('available_seats', 0)
      .gte('departure_time', new Date().toISOString())
      .order('departure_time', { ascending: true });

    if (error) {
      console.error('Error fetching available rides:', error);
      return [];
    }

    return data as Ride[];
  },

  /**
   * Update ride status
   */
  async updateStatus(rideId: string, status: Ride['status']): Promise<boolean> {
    const updates: any = { status };
    
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    } else if (status === 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('rides')
      .update(updates)
      .eq('id', rideId);

    return !error;
  },

  /**
   * Complete ride and update CO2
   */
  async complete(rideId: string, actualCO2: number): Promise<boolean> {
    const { error } = await supabase
      .from('rides')
      .update({
        status: 'completed',
        actual_co2_saved: actualCO2,
        completed_at: new Date().toISOString()
      })
      .eq('id', rideId);

    return !error;
  },

  /**
   * Cancel ride
   */
  async cancel(rideId: string, reason: string): Promise<boolean> {
    const { error } = await supabase
      .from('rides')
      .update({
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString()
      })
      .eq('id', rideId);

    return !error;
  },

  /**
   * Get rides by driver
   */
  async getByDriver(driverId: string): Promise<Ride[]> {
    return this.getAll({ driverId });
  }
};

// ============================================================================
// RIDE PARTICIPANTS (Bookings)
// ============================================================================

export const RideParticipantDB = {
  /**
   * Create a booking
   */
  async create(participant: Omit<RideParticipant, 'id' | 'joined_at'>): Promise<RideParticipant | null> {
    const { data, error } = await supabase
      .from('ride_participants')
      .insert([{
        ride_id: participant.ride_id,
        passenger_id: participant.passenger_id,
        pickup_location: participant.pickup_location,
        pickup_lat: participant.pickup_lat,
        pickup_lng: participant.pickup_lng,
        dropoff_location: participant.dropoff_location,
        dropoff_lat: participant.dropoff_lat,
        dropoff_lng: participant.dropoff_lng,
        status: participant.status || 'requested',
        amount_paid: participant.amount_paid || 0,
        co2_saved: participant.co2_saved || 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating booking:', error);
      return null;
    }

    return data as RideParticipant;
  },

  /**
   * Get bookings for a ride
   */
  async getByRide(rideId: string): Promise<RideParticipant[]> {
    const { data, error } = await supabase
      .from('ride_participants')
      .select(`
        *,
        passenger:profiles!ride_participants_passenger_id_fkey(*)
      `)
      .eq('ride_id', rideId)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Error fetching ride participants:', error);
      return [];
    }

    return data as RideParticipant[];
  },

  /**
   * Get bookings by passenger
   */
  async getByPassenger(passengerId: string): Promise<RideParticipant[]> {
    const { data, error } = await supabase
      .from('ride_participants')
      .select(`
        *,
        ride:rides(
          *,
          driver:profiles!rides_driver_id_fkey(*)
        )
      `)
      .eq('passenger_id', passengerId)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error fetching passenger bookings:', error);
      return [];
    }

    return data as RideParticipant[];
  },

  /**
   * Update booking status
   */
  async updateStatus(participantId: string, status: RideParticipant['status']): Promise<boolean> {
    const updates: any = { status };
    
    if (status === 'confirmed') {
      updates.confirmed_at = new Date().toISOString();
    } else if (status === 'picked_up') {
      updates.picked_up_at = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    } else if (status === 'cancelled') {
      updates.cancelled_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('ride_participants')
      .update(updates)
      .eq('id', participantId);

    return !error;
  },

  /**
   * Cancel booking
   */
  async cancel(participantId: string, cancelledBy: 'passenger' | 'driver', reason?: string): Promise<boolean> {
    const { error } = await supabase
      .from('ride_participants')
      .update({
        status: 'cancelled',
        cancelled_by: cancelledBy,
        cancellation_reason: reason,
        refund_status: 'pending',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', participantId);

    return !error;
  },

  /**
   * Add rating
   */
  async addRating(participantId: string, rating: number, review?: string): Promise<boolean> {
    const { error } = await supabase
      .from('ride_participants')
      .update({
        rating_given: rating,
        review: review
      })
      .eq('id', participantId);

    return !error;
  }
};

// ============================================================================
// IMPACT METRICS
// ============================================================================

export const ImpactMetricDB = {
  /**
   * Get all impact metrics
   */
  async getAll(): Promise<ImpactMetric[]> {
    const { data, error } = await supabase
      .from('impact_metrics')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching impact metrics:', error);
      return [];
    }

    return data as ImpactMetric[];
  },

  /**
   * Get metrics for date range
   */
  async getByDateRange(startDate: string, endDate: string): Promise<ImpactMetric[]> {
    const { data, error } = await supabase
      .from('impact_metrics')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching impact metrics:', error);
      return [];
    }

    return data as ImpactMetric[];
  },

  /**
   * Calculate daily impact
   */
  async calculateDaily(date: string): Promise<boolean> {
    const { error } = await supabase.rpc('calculate_daily_impact', {
      target_date: date
    });

    if (error) {
      console.error('Error calculating daily impact:', error);
      return false;
    }

    return true;
  }
};

// ============================================================================
// REWARDS
// ============================================================================

export const RewardDB = {
  /**
   * Create reward entry
   */
  async create(reward: Omit<Reward, 'id' | 'created_at'>): Promise<Reward | null> {
    const { data, error } = await supabase
      .from('rewards')
      .insert([reward])
      .select()
      .single();

    if (error) {
      console.error('Error creating reward:', error);
      return null;
    }

    return data as Reward;
  },

  /**
   * Get rewards by user
   */
  async getByUser(userId: string): Promise<Reward[]> {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rewards:', error);
      return [];
    }

    return data as Reward[];
  }
};

// ============================================================================
// COUPONS
// ============================================================================

export const CouponDB = {
  /**
   * Create coupon
   */
  async create(coupon: Omit<Coupon, 'id' | 'created_at'>): Promise<Coupon | null> {
    const { data, error } = await supabase
      .from('coupons')
      .insert([coupon])
      .select()
      .single();

    if (error) {
      console.error('Error creating coupon:', error);
      return null;
    }

    return data as Coupon;
  },

  /**
   * Get coupons by user
   */
  async getByUser(userId: string, onlyAvailable = false): Promise<Coupon[]> {
    let query = supabase
      .from('coupons')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (onlyAvailable) {
      query = query.eq('is_used', false).gte('expires_at', new Date().toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching coupons:', error);
      return [];
    }

    return data as Coupon[];
  },

  /**
   * Get coupon by code
   */
  async getByCode(code: string): Promise<Coupon | null> {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching coupon:', error);
      return null;
    }

    return data as Coupon;
  },

  /**
   * Mark coupon as used
   */
  async markAsUsed(couponId: string, rideId: string): Promise<boolean> {
    const { error } = await supabase
      .from('coupons')
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
        used_in_ride_id: rideId
      })
      .eq('id', couponId);

    return !error;
  }
};

// ============================================================================
// REWARD TRANSACTIONS
// ============================================================================

export const RewardTransactionDB = {
  /**
   * Create transaction
   */
  async create(transaction: Omit<RewardTransaction, 'id' | 'created_at'>): Promise<RewardTransaction | null> {
    const { data, error } = await supabase
      .from('reward_transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) {
      console.error('Error creating reward transaction:', error);
      return null;
    }

    return data as RewardTransaction;
  },

  /**
   * Get transactions by user
   */
  async getByUser(userId: string): Promise<RewardTransaction[]> {
    const { data, error } = await supabase
      .from('reward_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reward transactions:', error);
      return [];
    }

    return data as RewardTransaction[];
  }
};

// ============================================================================
// HELPER UTILITIES
// ============================================================================

export const DatabaseUtils = {
  /**
   * Check database connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    const { data, error } = await supabase.rpc('get_user_stats', {
      user_uuid: userId
    });

    if (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }

    return data;
  }
};


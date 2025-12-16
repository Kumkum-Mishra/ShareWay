/**
 * Data Adapter - Automatically uses Database or Mock Data
 * 
 * How it works:
 * - If Supabase credentials are configured → Uses real database
 * - If no credentials → Uses mock data (for testing)
 * - No code changes needed, just add .env file when ready!
 */

import { supabase } from '../lib/supabase';
import { ProfileDB, RideDB, RideParticipantDB, EmergencyContactDB, ImpactMetricDB, RewardDB, CouponDB, RewardTransactionDB } from './database';
import * as MockData from './mockData';
import type { Profile, Ride, RideParticipant, EmergencyContact, ImpactMetric, Reward, Coupon, RewardTransaction } from '../types';

// Check if Supabase is configured
let isSupabaseConfigured = false;
let configChecked = false;

async function checkSupabaseConfig(): Promise<boolean> {
  if (configChecked) return isSupabaseConfigured;
  
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl.includes('your-project') || 
        supabaseKey.includes('your-anon-key')) {
      console.log('📝 Using MOCK DATA (Supabase not configured)');
      console.log('💡 To use real database: Follow QUICK_START.md');
      isSupabaseConfigured = false;
    } else {
      // Test connection
      const { error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        console.warn('⚠️ Supabase configured but connection failed, using mock data');
        console.error(error);
        isSupabaseConfigured = false;
      } else {
        console.log('✅ Using REAL DATABASE (Supabase connected)');
        isSupabaseConfigured = true;
      }
    }
  } catch (error) {
    console.log('📝 Using MOCK DATA (Supabase error)');
    isSupabaseConfigured = false;
  }
  
  configChecked = true;
  return isSupabaseConfigured;
}

// Initialize check
checkSupabaseConfig();

// ============================================================================
// PROFILE OPERATIONS
// ============================================================================

export const Profiles = {
  async create(data: Omit<Profile, 'id' | 'created_at'>): Promise<Profile | null> {
    if (await checkSupabaseConfig()) {
      return await ProfileDB.create(data);
    } else {
      return MockData.createProfile(data);
    }
  },

  async getById(id: string): Promise<Profile | null> {
    if (await checkSupabaseConfig()) {
      return await ProfileDB.getById(id);
    } else {
      return MockData.getProfileById(id);
    }
  },

  async getByEmail(email: string): Promise<Profile | null> {
    if (await checkSupabaseConfig()) {
      return await ProfileDB.getByEmail(email);
    } else {
      return MockData.getProfileByEmail(email);
    }
  },

  async update(id: string, updates: Partial<Profile>): Promise<Profile | null> {
    if (await checkSupabaseConfig()) {
      return await ProfileDB.update(id, updates);
    } else {
      return MockData.updateProfile(id, updates);
    }
  },

  async updateRewardPoints(userId: string, points: number): Promise<boolean> {
    if (await checkSupabaseConfig()) {
      return await ProfileDB.updateRewardPoints(userId, points);
    } else {
      const profile = MockData.getProfileById(userId);
      if (profile) {
        profile.reward_points = points;
        return true;
      }
      return false;
    }
  }
};

// ============================================================================
// RIDE OPERATIONS
// ============================================================================

export const Rides = {
  async create(ride: Omit<Ride, 'id' | 'created_at' | 'updated_at'>): Promise<Ride | null> {
    if (await checkSupabaseConfig()) {
      return await RideDB.create(ride);
    } else {
      return MockData.addRide(ride as any);
    }
  },

  async getById(rideId: string): Promise<Ride | null> {
    if (await checkSupabaseConfig()) {
      return await RideDB.getById(rideId);
    } else {
      return MockData.getRideById(rideId);
    }
  },

  async getAvailable(): Promise<Ride[]> {
    if (await checkSupabaseConfig()) {
      return await RideDB.getAvailable();
    } else {
      return MockData.getAvailableRides();
    }
  },

  async getByDriver(driverId: string): Promise<Ride[]> {
    if (await checkSupabaseConfig()) {
      return await RideDB.getByDriver(driverId);
    } else {
      return MockData.getRidesByDriver(driverId);
    }
  },

  async complete(rideId: string, actualCO2: number): Promise<boolean> {
    if (await checkSupabaseConfig()) {
      return await RideDB.complete(rideId, actualCO2);
    } else {
      return MockData.completeRide(rideId);
    }
  },

  async cancel(rideId: string, reason: string): Promise<boolean> {
    if (await checkSupabaseConfig()) {
      return await RideDB.cancel(rideId, reason);
    } else {
      return MockData.cancelRide(rideId, reason);
    }
  }
};

// ============================================================================
// BOOKING OPERATIONS
// ============================================================================

export const Bookings = {
  async create(participant: Omit<RideParticipant, 'id' | 'joined_at'>): Promise<RideParticipant | null> {
    if (await checkSupabaseConfig()) {
      return await RideParticipantDB.create(participant);
    } else {
      return MockData.addParticipation(participant as any);
    }
  },

  async getByRide(rideId: string): Promise<RideParticipant[]> {
    if (await checkSupabaseConfig()) {
      return await RideParticipantDB.getByRide(rideId);
    } else {
      return MockData.getParticipantsByRide(rideId);
    }
  },

  async getByPassenger(passengerId: string): Promise<RideParticipant[]> {
    if (await checkSupabaseConfig()) {
      return await RideParticipantDB.getByPassenger(passengerId);
    } else {
      return MockData.getParticipantsByPassenger(passengerId);
    }
  },

  async cancel(participantId: string, cancelledBy: 'passenger' | 'driver', reason?: string): Promise<boolean> {
    if (await checkSupabaseConfig()) {
      return await RideParticipantDB.cancel(participantId, cancelledBy, reason);
    } else {
      return MockData.cancelBooking(participantId, cancelledBy, reason);
    }
  }
};

// ============================================================================
// IMPACT METRICS
// ============================================================================

export const ImpactMetrics = {
  async getAll(): Promise<ImpactMetric[]> {
    if (await checkSupabaseConfig()) {
      return await ImpactMetricDB.getAll();
    } else {
      return MockData.getImpactMetrics();
    }
  }
};

// ============================================================================
// HELPER TO CHECK DATABASE STATUS
// ============================================================================

export async function isDatabaseConnected(): Promise<boolean> {
  return await checkSupabaseConfig();
}

export function getDatabaseStatus(): string {
  return isSupabaseConfigured 
    ? '✅ Real Database (Supabase)' 
    : '📝 Mock Data (Testing Mode)';
}


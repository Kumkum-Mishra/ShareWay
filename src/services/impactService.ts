/**
 * Impact Service - Handles CO2 calculations and metric updates
 * Works with both database and mock data
 */

import { supabase } from '../lib/supabase';
import { mockImpactMetrics, mockProfiles, mockRides, mockParticipants } from './mockData';

/**
 * Update impact metrics when ride is completed
 */
export async function updateImpactMetrics(
  rideId: string,
  passengerId: string,
  distance: number,
  isDriver: boolean = false
): Promise<boolean> {
  try {
    // Calculate CO2 for this passenger
    const co2Saved = distance * 0.21; // kg
    const fuelSaved = co2Saved / 2.3; // liters
    
    // Get today's date (local)
    const todayDate = new Date();
    const year = todayDate.getFullYear();
    const month = String(todayDate.getMonth() + 1).padStart(2, '0');
    const day = String(todayDate.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

    console.log(`📊 Updating impact for ${today}: ${co2Saved.toFixed(2)} kg CO2`);

    // Check if using database
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isUsingDatabase = supabaseUrl && !supabaseUrl.includes('placeholder');

    if (isUsingDatabase) {
      // UPDATE DATABASE
      console.log('💾 Saving to Supabase database...');
      
      // Update user's total CO2
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          total_co2_saved: supabase.rpc('increment', {
            current_value: 0,
            increment_by: co2Saved
          }),
          [isDriver ? 'total_rides_offered' : 'total_rides_taken']: supabase.rpc('increment', {
            current_value: 0,
            increment_by: 1
          })
        })
        .eq('id', passengerId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
      }

      // Update today's impact metrics
      const { data: existingMetric } = await supabase
        .from('impact_metrics')
        .select('*')
        .eq('date', today)
        .single();

      if (existingMetric) {
        // Update existing metric
        const { error: metricError } = await supabase
          .from('impact_metrics')
          .update({
            total_participants: existingMetric.total_participants + 1,
            total_co2_saved: existingMetric.total_co2_saved + co2Saved,
            total_distance_shared: existingMetric.total_distance_shared + distance,
            fuel_saved_liters: existingMetric.fuel_saved_liters + fuelSaved,
            cost_saved: existingMetric.cost_saved + (distance * 0.5)
          })
          .eq('date', today);

        if (metricError) {
          console.error('Error updating metric:', metricError);
        }
      } else {
        // Create new metric for today
        const { error: metricError } = await supabase
          .from('impact_metrics')
          .insert([{
            date: today,
            total_rides: 1,
            total_participants: 1,
            total_co2_saved: co2Saved,
            total_distance_shared: distance,
            average_occupancy: 1,
            fuel_saved_liters: fuelSaved,
            cost_saved: distance * 0.5
          }]);

        if (metricError) {
          console.error('Error creating metric:', metricError);
        }
      }

      console.log('✅ Database updated successfully!');
    } else {
      // UPDATE MOCK DATA
      console.log('📝 Saving to mock data...');
      
      // Update user's total CO2
      const userProfile = mockProfiles.find(p => p.id === passengerId);
      if (userProfile) {
        userProfile.total_co2_saved += co2Saved;
        if (isDriver) {
          userProfile.total_rides_offered += 1;
        } else {
          userProfile.total_rides_taken += 1;
        }
      }

      // Update today's metrics
      let todayMetric = mockImpactMetrics.find(m => m.date === today);
      
      if (!todayMetric) {
        todayMetric = {
          id: `metric-${Date.now()}`,
          date: today,
          total_rides: 1,
          total_participants: 1,
          total_co2_saved: co2Saved,
          total_distance_shared: distance,
          average_occupancy: 1,
          fuel_saved_liters: fuelSaved,
          cost_saved: distance * 0.5,
          created_at: new Date().toISOString()
        };
        mockImpactMetrics.push(todayMetric);
      } else {
        todayMetric.total_participants += 1;
        todayMetric.total_co2_saved += co2Saved;
        todayMetric.total_distance_shared += distance;
        todayMetric.fuel_saved_liters += fuelSaved;
        todayMetric.cost_saved += distance * 0.5;
      }

      console.log('✅ Mock data updated successfully!');
    }

    return true;
  } catch (error) {
    console.error('Error updating impact metrics:', error);
    return false;
  }
}

/**
 * Complete a ride and update all metrics
 */
export async function completeRideWithImpact(
  rideId: string,
  userId: string,
  isDriver: boolean
): Promise<{ success: boolean; co2Saved: number; distance: number }> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isUsingDatabase = supabaseUrl && !supabaseUrl.includes('placeholder');

    if (isUsingDatabase) {
      // Get ride details from database
      const { data: ride, error: rideError } = await supabase
        .from('rides')
        .select('*')
        .eq('id', rideId)
        .single();

      if (rideError || !ride) {
        console.error('Error fetching ride:', rideError);
        return { success: false, co2Saved: 0, distance: 0 };
      }

      const distance = ride.estimated_distance || 0;
      const co2Saved = distance * 0.21;

      // Update participation status
      if (!isDriver) {
        const { error: participantError } = await supabase
          .from('ride_participants')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            co2_saved: co2Saved
          })
          .eq('ride_id', rideId)
          .eq('passenger_id', userId);

        if (participantError) {
          console.error('Error updating participant:', participantError);
        }
      } else {
        // Driver completing ride
        const { error: rideUpdateError } = await supabase
          .from('rides')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            actual_co2_saved: co2Saved
          })
          .eq('id', rideId);

        if (rideUpdateError) {
          console.error('Error updating ride:', rideUpdateError);
        }
      }

      // Update impact metrics
      await updateImpactMetrics(rideId, userId, distance, isDriver);

      return { success: true, co2Saved, distance };
    } else {
      // MOCK DATA MODE
      const ride = mockRides.find(r => r.id === rideId);
      if (!ride) {
        console.error(`❌ Ride ${rideId} not found in mock data`);
        return { success: false, co2Saved: 0, distance: 0 };
      }

      const distance = ride.estimated_distance || 0;
      
      if (isDriver) {
        // Driver completing - call completeRide directly (already imported)
        console.log(`🚗 Driver completing ride ${rideId}...`);
        const { completeRide } = require('../services/mockData');
        const success = completeRide(rideId);
        
        if (!success) {
          console.error(`❌ Failed to complete ride ${rideId}`);
          return { success: false, co2Saved: 0, distance: 0 };
        }
        
        // Get updated metrics from the ride after completion
        const { mockParticipants: updatedParticipants } = require('../services/mockData');
        const participants = updatedParticipants.filter(p => p.ride_id === rideId && p.status === 'completed');
        const totalCO2 = distance * participants.length * 0.21;
        
        console.log(`✅ Driver completed ride. Total CO2: ${totalCO2.toFixed(2)} kg`);
        return { success: true, co2Saved: totalCO2, distance };
      } else {
        // Passenger completing
        const participation = mockParticipants.find(p => p.ride_id === rideId && p.passenger_id === userId);
        if (!participation) {
          console.error(`❌ Participation not found for user ${userId} in ride ${rideId}`);
          return { success: false, co2Saved: 0, distance: 0 };
        }

        const co2Saved = distance * 0.21;
        participation.status = 'completed';
        participation.completed_at = new Date().toISOString();
        participation.co2_saved = co2Saved;

        // Update passenger profile
        const passenger = mockProfiles.find(p => p.id === userId);
        if (passenger) {
          passenger.total_co2_saved += co2Saved;
          console.log(`✅ Passenger CO2 updated: +${co2Saved.toFixed(2)} kg. Total: ${passenger.total_co2_saved.toFixed(2)} kg`);
        }

        // Update impact metrics
        await updateImpactMetrics(rideId, userId, distance, isDriver);

        return { success: true, co2Saved, distance };
      }
    }
  } catch (error) {
    console.error('Error completing ride:', error);
    return { success: false, co2Saved: 0, distance: 0 };
  }
}

/**
 * Fetch impact metrics (from database or mock data)
 */
export async function fetchImpactMetrics() {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isUsingDatabase = supabaseUrl && !supabaseUrl.includes('placeholder');

    if (isUsingDatabase) {
      console.log('📊 Fetching metrics from database...');
      const { data, error } = await supabase
        .from('impact_metrics')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching metrics:', error);
        return mockImpactMetrics;
      }

      console.log(`✅ Loaded ${data.length} metrics from database`);
      return data;
    } else {
      console.log('📝 Using mock impact metrics');
      return mockImpactMetrics;
    }
  } catch (error) {
    console.error('Error fetching impact metrics:', error);
    return mockImpactMetrics;
  }
}

/**
 * Get user's personal impact stats
 */
export async function getUserImpact(userId: string) {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isUsingDatabase = supabaseUrl && !supabaseUrl.includes('placeholder');

    if (isUsingDatabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('total_co2_saved, total_rides_taken, total_rides_offered')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user impact:', error);
        return null;
      }

      return data;
    } else {
      const profile = mockProfiles.find(p => p.id === userId);
      return profile ? {
        total_co2_saved: profile.total_co2_saved,
        total_rides_taken: profile.total_rides_taken,
        total_rides_offered: profile.total_rides_offered
      } : null;
    }
  } catch (error) {
    console.error('Error getting user impact:', error);
    return null;
  }
}


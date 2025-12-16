/**
 * LocalStorage utility for persisting mock data
 */

import { Profile, Ride, RideParticipant, ImpactMetric } from '../types';

const STORAGE_KEYS = {
  PROFILES: 'shareway_profiles',
  RIDES: 'shareway_rides',
  PARTICIPANTS: 'shareway_participants',
  METRICS: 'shareway_metrics'
};

export function saveToLocalStorage(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`💾 Saved ${key} to localStorage`);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      console.log(`✅ Loaded ${key} from localStorage`);
      return JSON.parse(item);
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return defaultValue;
}

export function saveMockData(
  profiles: Profile[],
  rides: Ride[],
  participants: RideParticipant[],
  metrics: ImpactMetric[]
) {
  saveToLocalStorage(STORAGE_KEYS.PROFILES, profiles);
  saveToLocalStorage(STORAGE_KEYS.RIDES, rides);
  saveToLocalStorage(STORAGE_KEYS.PARTICIPANTS, participants);
  saveToLocalStorage(STORAGE_KEYS.METRICS, metrics);
}

export function loadMockData() {
  return {
    profiles: loadFromLocalStorage<Profile[]>(STORAGE_KEYS.PROFILES, []),
    rides: loadFromLocalStorage<Ride[]>(STORAGE_KEYS.RIDES, []),
    participants: loadFromLocalStorage<RideParticipant[]>(STORAGE_KEYS.PARTICIPANTS, []),
    metrics: loadFromLocalStorage<ImpactMetric[]>(STORAGE_KEYS.METRICS, [])
  };
}

export function clearMockData() {
  localStorage.removeItem(STORAGE_KEYS.PROFILES);
  localStorage.removeItem(STORAGE_KEYS.RIDES);
  localStorage.removeItem(STORAGE_KEYS.PARTICIPANTS);
  localStorage.removeItem(STORAGE_KEYS.METRICS);
  console.log('🗑️ Cleared all mock data from localStorage');
}


/**
 * Real-Time Route Optimization Service
 * Tracks live locations and optimizes routes dynamically
 */

import { getRoute } from './routing';

export interface LiveLocation {
  lat: number;
  lng: number;
  timestamp: number;
  speed?: number; // km/h
  heading?: number; // degrees
}

export interface RouteUpdate {
  route: any;
  duration: number;
  distance: number;
  eta: string;
  trafficDelay?: number;
}

// Store live locations for active rides
const liveLocations = new Map<string, LiveLocation>();
const locationSubscribers = new Map<string, ((location: LiveLocation) => void)[]>();

/**
 * Start tracking user's live location
 */
export function startLocationTracking(userId: string, onUpdate: (location: LiveLocation) => void): () => void {
  console.log(`📍 Started real-time tracking for user ${userId}`);
  
  // Add subscriber
  if (!locationSubscribers.has(userId)) {
    locationSubscribers.set(userId, []);
  }
  locationSubscribers.get(userId)!.push(onUpdate);

  // Get geolocation with high accuracy
  if (!navigator.geolocation) {
    console.error('Geolocation not supported');
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const location: LiveLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        timestamp: Date.now(),
        speed: position.coords.speed ? position.coords.speed * 3.6 : undefined, // m/s to km/h
        heading: position.coords.heading || undefined
      };

      // Update stored location
      liveLocations.set(userId, location);

      // Notify all subscribers
      const subscribers = locationSubscribers.get(userId) || [];
      subscribers.forEach(callback => callback(location));

      console.log(`📍 Location update for ${userId}:`, location.lat.toFixed(6), location.lng.toFixed(6));
    },
    (error) => {
      console.error('Location tracking error:', error);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 1000, // Max 1 second old
      timeout: 5000
    }
  );

  // Return cleanup function
  return () => {
    navigator.geolocation.clearWatch(watchId);
    console.log(`📍 Stopped tracking for user ${userId}`);
  };
}

/**
 * Get user's current live location
 */
export function getLiveLocation(userId: string): LiveLocation | null {
  return liveLocations.get(userId) || null;
}

/**
 * Calculate optimized route with traffic consideration
 */
export async function optimizeRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  waypoints: { lat: number; lng: number }[] = []
): Promise<RouteUpdate | null> {
  try {
    // Get route with all waypoints
    const allPoints = [origin, ...waypoints, destination];
    const coords = allPoints.map(p => `${p.lng},${p.lat}`).join(';');
    
    // Use OSRM with traffic annotations
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?` +
      `overview=full&annotations=true&steps=true&geometries=geojson`
    );

    if (!response.ok) throw new Error('Route optimization failed');

    const data = await response.json();
    
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    const route = data.routes[0];
    const duration = route.duration; // seconds
    const distance = route.distance / 1000; // meters to km

    // Calculate ETA
    const eta = new Date(Date.now() + duration * 1000);
    
    return {
      route: route.geometry,
      duration: Math.round(duration / 60), // minutes
      distance: Math.round(distance * 10) / 10, // km
      eta: eta.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      trafficDelay: 0 // Can be enhanced with real traffic API
    };
  } catch (error) {
    console.error('Route optimization error:', error);
    return null;
  }
}

/**
 * Recalculate route based on current location
 */
export async function recalculateRoute(
  currentLocation: LiveLocation,
  destination: { lat: number; lng: number },
  remainingWaypoints: { lat: number; lng: number }[] = []
): Promise<RouteUpdate | null> {
  console.log('🔄 Recalculating route from current position...');
  
  return await optimizeRoute(
    { lat: currentLocation.lat, lng: currentLocation.lng },
    destination,
    remainingWaypoints
  );
}

/**
 * Real-time route monitoring
 * Automatically recalculates route when user deviates
 */
export function startRouteMonitoring(
  userId: string,
  destination: { lat: number; lng: number },
  onRouteUpdate: (update: RouteUpdate) => void,
  deviationThreshold: number = 100 // meters
): () => void {
  console.log('🗺️ Started real-time route monitoring');
  
  let lastRoute: RouteUpdate | null = null;
  let lastCheckLocation: LiveLocation | null = null;

  const stopTracking = startLocationTracking(userId, async (location) => {
    // Check if user has deviated from route
    if (lastCheckLocation) {
      const distance = calculateDistance(
        lastCheckLocation.lat,
        lastCheckLocation.lng,
        location.lat,
        location.lng
      );

      // If moved more than threshold, recalculate
      if (distance > deviationThreshold) {
        const newRoute = await recalculateRoute(location, destination);
        
        if (newRoute) {
          lastRoute = newRoute;
          onRouteUpdate(newRoute);
          console.log('🔄 Route updated! New ETA:', newRoute.eta);
        }
        
        lastCheckLocation = location;
      }
    } else {
      // First location - calculate initial route
      const initialRoute = await recalculateRoute(location, destination);
      if (initialRoute) {
        lastRoute = initialRoute;
        onRouteUpdate(initialRoute);
      }
      lastCheckLocation = location;
    }
  });

  return stopTracking;
}

/**
 * Calculate distance between two points (Haversine formula)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Share live location with passengers
 */
export function shareLiveLocation(
  driverId: string,
  rideId: string
): () => void {
  return startLocationTracking(driverId, (location) => {
    // Broadcast to all passengers in this ride
    const event = new CustomEvent('driver-location-update', {
      detail: {
        rideId,
        driverId,
        location
      }
    });
    window.dispatchEvent(event);
  });
}

/**
 * Subscribe to driver's live location (for passengers)
 */
export function subscribeToDriverLocation(
  rideId: string,
  onUpdate: (location: LiveLocation) => void
): () => void {
  const handler = (event: any) => {
    if (event.detail.rideId === rideId) {
      onUpdate(event.detail.location);
    }
  };

  window.addEventListener('driver-location-update', handler);

  return () => {
    window.removeEventListener('driver-location-update', handler);
  };
}

/**
 * Get estimated time to pickup/destination
 */
export async function getEstimatedArrival(
  currentLocation: LiveLocation,
  destination: { lat: number; lng: number }
): Promise<{ eta: string; duration: number; distance: number } | null> {
  const route = await optimizeRoute(
    { lat: currentLocation.lat, lng: currentLocation.lng },
    destination
  );

  if (!route) return null;

  return {
    eta: route.eta,
    duration: route.duration,
    distance: route.distance
  };
}

/**
 * Find optimal pickup points for multiple passengers
 */
export async function optimizePickupSequence(
  driverLocation: { lat: number; lng: number },
  passengerLocations: Array<{ id: string; lat: number; lng: number; destination: { lat: number; lng: number } }>,
  finalDestination: { lat: number; lng: number }
): Promise<{ sequence: string[]; totalDistance: number; totalDuration: number } | null> {
  // Simple greedy algorithm - pick nearest passenger first
  // In production, use more sophisticated algorithms (TSP, genetic algorithms)
  
  const unvisited = [...passengerLocations];
  const sequence: string[] = [];
  let currentLoc = driverLocation;
  let totalDistance = 0;
  let totalDuration = 0;

  while (unvisited.length > 0) {
    // Find nearest passenger
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateDistance(
        currentLoc.lat,
        currentLoc.lng,
        unvisited[i].lat,
        unvisited[i].lng
      );
      
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    // Add to sequence
    const nearest = unvisited[nearestIndex];
    sequence.push(nearest.id);
    
    // Calculate route to this passenger
    const route = await optimizeRoute(currentLoc, { lat: nearest.lat, lng: nearest.lng });
    if (route) {
      totalDistance += route.distance;
      totalDuration += route.duration;
    }

    currentLoc = { lat: nearest.lat, lng: nearest.lng };
    unvisited.splice(nearestIndex, 1);
  }

  return { sequence, totalDistance, totalDuration };
}


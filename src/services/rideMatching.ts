import { Ride, Location } from '../types';

export interface MatchScore {
  rideId: string;
  score: number;
  routeSimilarity: number;
  timingScore: number;
  detourCost: number;
  distanceScore: number;
  reason: string;
}

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function calculateRouteSimilarity(
  userOrigin: Location,
  userDest: Location,
  rideOrigin: Location,
  rideDest: Location
): number {
  const originDist = calculateDistance(
    userOrigin.lat,
    userOrigin.lng,
    rideOrigin.lat,
    rideOrigin.lng
  );

  const destDist = calculateDistance(
    userDest.lat,
    userDest.lng,
    rideDest.lat,
    rideDest.lng
  );

  const directDist = calculateDistance(
    userOrigin.lat,
    userOrigin.lng,
    userDest.lat,
    userDest.lng
  );

  const maxAcceptableDetour = directDist * 0.3;
  const totalDetour = originDist + destDist;

  if (totalDetour > maxAcceptableDetour) {
    return 0;
  }

  return Math.max(0, 100 - (totalDetour / maxAcceptableDetour) * 100);
}

function calculateTimingScore(
  userDepartureTime: Date,
  rideDepartureTime: Date
): number {
  const timeDiffMinutes = Math.abs(
    (userDepartureTime.getTime() - rideDepartureTime.getTime()) / (1000 * 60)
  );

  // Expand acceptable time window to 6 hours for broader matching
  const maxAcceptableDelay = 360;

  if (timeDiffMinutes > maxAcceptableDelay) {
    return 0;
  }

  return Math.max(0, 100 - (timeDiffMinutes / maxAcceptableDelay) * 100);
}

function calculateDetourCost(
  userOrigin: Location,
  userDest: Location,
  rideOrigin: Location,
  rideDest: Location
): number {
  const directDistance = calculateDistance(
    rideOrigin.lat,
    rideOrigin.lng,
    rideDest.lat,
    rideDest.lng
  );

  const withPickup = calculateDistance(
    rideOrigin.lat,
    rideOrigin.lng,
    userOrigin.lat,
    userOrigin.lng
  );

  const pickupToDest = calculateDistance(
    userOrigin.lat,
    userOrigin.lng,
    rideDest.lat,
    rideDest.lng
  );

  const detourDistance = (withPickup + pickupToDest) - directDistance;

  return Math.max(0, detourDistance);
}

function calculateDistanceScore(
  userOrigin: Location,
  rideOrigin: Location
): number {
  const dist = calculateDistance(
    userOrigin.lat,
    userOrigin.lng,
    rideOrigin.lat,
    rideOrigin.lng
  );

  const maxAcceptableDistance = 5;

  if (dist > maxAcceptableDistance) {
    return 0;
  }

  return Math.max(0, 100 - (dist / maxAcceptableDistance) * 100);
}

export function matchRides(
  userOrigin: Location,
  userDest: Location,
  departureTime: Date,
  availableRides: Ride[]
): MatchScore[] {
  const matches: MatchScore[] = [];

  for (const ride of availableRides) {
    if (ride.available_seats <= 0 || ride.status !== 'pending') {
      continue;
    }

    const rideOrigin: Location = {
      address: ride.origin,
      lat: ride.origin_lat,
      lng: ride.origin_lng
    };

    const rideDest: Location = {
      address: ride.destination,
      lat: ride.dest_lat,
      lng: ride.dest_lng
    };

    const routeSimilarity = calculateRouteSimilarity(
      userOrigin,
      userDest,
      rideOrigin,
      rideDest
    );

    // Very low threshold to show most rides
    if (routeSimilarity < 1) {
      continue;
    }

    const timingScore = calculateTimingScore(
      departureTime,
      new Date(ride.departure_time)
    );

    const detourCost = calculateDetourCost(
      userOrigin,
      userDest,
      rideOrigin,
      rideDest
    );

    const distanceScore = calculateDistanceScore(userOrigin, rideOrigin);

    const overallScore =
      routeSimilarity * 0.4 +
      timingScore * 0.3 +
      distanceScore * 0.2 +
      Math.max(0, 100 - detourCost * 10) * 0.1;

    let reason = '';
    if (overallScore >= 80) {
      reason = 'Excellent match - Similar route and timing';
    } else if (overallScore >= 60) {
      reason = 'Good match - Route alignment is strong';
    } else if (overallScore >= 40) {
      reason = 'Fair match - Some detour required';
    } else {
      reason = 'Possible match - Consider alternatives';
    }

    matches.push({
      rideId: ride.id,
      score: overallScore,
      routeSimilarity,
      timingScore,
      detourCost,
      distanceScore,
      reason
    });
  }

  return matches.sort((a, b) => b.score - a.score);
}

export function calculateCO2Savings(distanceKm: number, passengers: number): number {
  const CO2_PER_KM_PER_CAR = 0.21;
  const savedCars = passengers;
  return distanceKm * CO2_PER_KM_PER_CAR * savedCars;
}

export function calculateFuelSavings(distanceKm: number, passengers: number): number {
  const FUEL_CONSUMPTION_PER_100KM = 8;
  const savedCars = passengers;
  return (distanceKm / 100) * FUEL_CONSUMPTION_PER_100KM * savedCars;
}

export function optimizeRoute(
  origin: Location,
  destination: Location,
  waypoints: Location[]
): Location[] {
  if (waypoints.length === 0) {
    return [origin, destination];
  }

  const unvisited = [...waypoints];
  const route: Location[] = [origin];
  let current = origin;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateDistance(
        current.lat,
        current.lng,
        unvisited[i].lat,
        unvisited[i].lng
      );

      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    const nearest = unvisited.splice(nearestIndex, 1)[0];
    route.push(nearest);
    current = nearest;
  }

  route.push(destination);
  return route;
}

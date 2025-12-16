/**
 * Real-Time Live Tracking Component
 * Shows driver's live location and dynamic ETA updates
 */

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, TrendingUp, Zap, RefreshCw } from 'lucide-react';
import { startLocationTracking, subscribeToDriverLocation, getEstimatedArrival, startRouteMonitoring, LiveLocation, RouteUpdate } from '../services/realTimeTracking';
import { getRoute } from '../services/routing';
import MapView from './MapView';

interface LiveTrackingProps {
  rideId: string;
  driverId: string;
  isDriver: boolean;
  destination: { lat: number; lng: number; address: string };
  origin: { lat: number; lng: number; address: string };
}

export default function LiveTracking({ rideId, driverId, isDriver, destination, origin }: LiveTrackingProps) {
  const [driverLocation, setDriverLocation] = useState<LiveLocation | null>(null);
  const [currentRoute, setCurrentRoute] = useState<RouteUpdate | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [eta, setEta] = useState<string>('Calculating...');
  const [distance, setDistance] = useState<number>(0);
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);

  // Start simulation automatically on mount
  useEffect(() => {
    console.log('🚗 Starting simulated live tracking...');
    setSimulationActive(true);
    
    // Set initial location to origin
    setDriverLocation({
      lat: origin.lat,
      lng: origin.lng,
      timestamp: Date.now(),
      speed: 60,
      heading: 0
    });

    // Calculate initial route
    getRoute(origin, destination).then(route => {
      if (route) {
        setDistance(route.distance);
        const arrivalTime = new Date(Date.now() + route.duration * 60 * 1000);
        setEta(arrivalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      }
    });
  }, []);

  // Simulate car movement along the route
  useEffect(() => {
    if (!simulationActive) return;

    const totalSteps = 30; // Number of steps to complete journey
    const interval = setInterval(() => {
      setSimulationStep(prev => {
        const nextStep = prev + 1;
        
        if (nextStep >= totalSteps) {
          clearInterval(interval);
          setSimulationActive(false);
          console.log('✅ Simulation completed!');
          return prev;
        }

        // Calculate new position (interpolate between origin and destination)
        const progress = nextStep / totalSteps;
        const newLat = origin.lat + (destination.lat - origin.lat) * progress;
        const newLng = origin.lng + (destination.lng - origin.lng) * progress;

        // Update driver location with simulated position
        setDriverLocation({
          lat: newLat,
          lng: newLng,
          timestamp: Date.now(),
          speed: 55 + Math.random() * 15, // Random speed 55-70 km/h
          heading: Math.atan2(destination.lng - newLng, destination.lat - newLat) * (180 / Math.PI)
        });

        // Recalculate route and ETA every few steps
        if (nextStep % 5 === 0) {
          getRoute({ lat: newLat, lng: newLng }, destination).then(route => {
            if (route) {
              setDistance(route.distance);
              const arrivalTime = new Date(Date.now() + route.duration * 60 * 1000);
              setEta(arrivalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
              console.log(`🔄 Route updated: ${route.distance.toFixed(1)}km, ETA: ${arrivalTime.toLocaleTimeString()}`);
            }
          });
        }

        return nextStep;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [simulationActive, origin, destination]);

  // Auto-update ETA every 30 seconds
  useEffect(() => {
    if (driverLocation) {
      const interval = setInterval(() => {
        getEstimatedArrival(driverLocation, destination).then(result => {
          if (result) {
            setEta(result.eta);
            setDistance(result.distance);
          }
        });
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [driverLocation, destination]);

  const handleManualRefresh = async () => {
    if (driverLocation) {
      const result = await getEstimatedArrival(driverLocation, destination);
      if (result) {
        setEta(result.eta);
        setDistance(result.distance);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Navigation className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Live Tracking</h3>
              <p className="text-emerald-100 text-sm">Real-time route optimization</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">{simulationActive ? 'LIVE' : 'Active'}</span>
          </div>
        </div>
      </div>

      {/* Live Stats */}
      <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="grid grid-cols-3 gap-4">
          {/* ETA */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-gray-600 font-semibold">ETA</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">{eta}</div>
            <div className="text-xs text-gray-500 mt-1">Estimated arrival</div>
          </div>

          {/* Distance */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-600 font-semibold">Distance</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{distance.toFixed(1)} km</div>
            <div className="text-xs text-gray-500 mt-1">To destination</div>
          </div>

          {/* Speed */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-orange-600" />
              <span className="text-xs text-gray-600 font-semibold">Speed</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {driverLocation?.speed ? Math.round(driverLocation.speed) : '0'} km/h
            </div>
            <div className="text-xs text-gray-500 mt-1">Current speed</div>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleManualRefresh}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-emerald-700 py-2 rounded-lg font-semibold transition-colors border border-emerald-200"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh ETA
        </button>
      </div>

      {/* Live Map */}
      {driverLocation && currentRoute && (
        <div className="p-6">
          <div className="bg-gray-100 rounded-xl overflow-hidden" style={{ height: '400px' }}>
            <MapView
              origin={{ lat: driverLocation.lat, lng: driverLocation.lng, address: 'Current Location' }}
              destination={{ ...destination, address: destination.address }}
              routePoints={currentRoute.route}
              showRoute={true}
            />
          </div>
          
          {/* Route Info */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
              <div className="text-xs text-gray-600 mb-1">Updated Route</div>
              <div className="text-sm font-bold text-emerald-700">
                {currentRoute.duration} minutes
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="text-xs text-gray-600 mb-1">Optimized Distance</div>
              <div className="text-sm font-bold text-blue-700">
                {currentRoute.distance} km
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Messages */}
      <div className="px-6 pb-6">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg p-4 text-white">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              {isDriver ? (
                <>
                  <p className="font-bold mb-1">Live Route Optimization Active</p>
                  <p className="text-emerald-100">
                    Your route automatically updates based on your location. 
                    If you deviate, we'll recalculate the best path!
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold mb-1">Tracking Driver's Location</p>
                  <p className="text-emerald-100">
                    You can see the driver's real-time location and updated ETA. 
                    The route optimizes automatically!
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


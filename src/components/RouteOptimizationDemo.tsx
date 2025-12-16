/**
 * Route Optimization Demo Component
 * Shows real-time route optimization in action
 */

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Zap, RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';
import MapView from './MapView';
import { getRoute } from '../services/routing';

export default function RouteOptimizationDemo() {
  const [currentLocation, setCurrentLocation] = useState({ lat: 28.6139, lng: 77.2090 }); // Delhi
  const [destination] = useState({ lat: 19.0760, lng: 72.8777 }); // Mumbai
  const [routeData, setRouteData] = useState<any>(null);
  const [eta, setEta] = useState('Calculating...');
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);

  // Calculate initial route
  useEffect(() => {
    calculateRoute();
  }, []);

  const calculateRoute = async () => {
    setIsOptimizing(true);
    console.log('🗺️ Calculating optimized route...');
    
    const route = await getRoute(
      { lat: currentLocation.lat, lng: currentLocation.lng },
      { lat: destination.lat, lng: destination.lng }
    );

    if (route) {
      setRouteData(route.coordinates);
      setDistance(route.distance);
      setDuration(route.duration);
      
      const arrivalTime = new Date(Date.now() + route.duration * 60 * 1000);
      setEta(arrivalTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      
      console.log(`✅ Route calculated: ${route.distance}km, ${route.duration}min`);
    }
    
    setIsOptimizing(false);
  };

  // Simulate movement
  const startSimulation = () => {
    setSimulationActive(true);
    let step = 0;
    const totalSteps = 20;
    
    const interval = setInterval(() => {
      step++;
      
      if (step >= totalSteps) {
        clearInterval(interval);
        setSimulationActive(false);
        return;
      }

      // Move towards destination
      setCurrentLocation(prev => ({
        lat: prev.lat + (destination.lat - prev.lat) * 0.05,
        lng: prev.lng + (destination.lng - prev.lng) * 0.05
      }));

      // Recalculate route every 5 steps
      if (step % 5 === 0) {
        calculateRoute();
      }
    }, 2000); // Update every 2 seconds
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Navigation className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Real-Time Route Optimization</h2>
              <p className="text-emerald-100">Live GPS tracking with dynamic rerouting</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">LIVE</span>
          </div>
        </div>
      </div>

      {/* Live Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-emerald-200">
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-semibold text-gray-600">ETA</span>
          </div>
          <div className="text-3xl font-bold text-emerald-600">{eta}</div>
          <div className="text-xs text-gray-500 mt-1">Estimated arrival</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-600">Distance</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">{distance.toFixed(1)} km</div>
          <div className="text-xs text-gray-500 mt-1">To destination</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-gray-600">Duration</span>
          </div>
          <div className="text-3xl font-bold text-purple-600">{duration} min</div>
          <div className="text-xs text-gray-500 mt-1">Travel time</div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-semibold text-gray-600">Status</span>
          </div>
          <div className="text-lg font-bold text-orange-600">
            {isOptimizing ? 'Optimizing...' : 'Optimized'}
          </div>
          <div className="text-xs text-gray-500 mt-1">Route status</div>
        </div>
      </div>

      {/* Map View */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Live Route Map</h3>
              <p className="text-sm text-gray-600">Delhi → Mumbai (Demo Route)</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={calculateRoute}
                disabled={isOptimizing}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
                Recalculate Route
              </button>
              <button
                onClick={startSimulation}
                disabled={simulationActive}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Simulate Movement
              </button>
            </div>
          </div>
        </div>

        <div style={{ height: '500px' }} className="relative">
          <MapView
            origin={{ lat: currentLocation.lat, lng: currentLocation.lng, address: 'Current Location' }}
            destination={{ lat: destination.lat, lng: destination.lng, address: 'Mumbai' }}
            routePoints={routeData}
            showRoute={true}
          />
          
          {/* Current Position Indicator */}
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 border-2 border-emerald-500">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-gray-900">Current Position</span>
            </div>
            <div className="text-xs text-gray-600">
              {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-600" />
            Real-Time Features
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-gray-900">GPS Tracking</p>
                <p className="text-sm text-gray-600">Updates every 1 second with high accuracy</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-gray-900">Auto-Rerouting</p>
                <p className="text-sm text-gray-600">Recalculates if you deviate by 100+ meters</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-gray-900">Dynamic ETA</p>
                <p className="text-sm text-gray-600">Updates based on current speed and location</p>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-gray-900">Traffic-Aware</p>
                <p className="text-sm text-gray-600">Uses OSRM routing with traffic data</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            How It Works
          </h3>
          <div className="space-y-4 text-sm text-gray-700">
            <div className="bg-white rounded-lg p-3">
              <p className="font-semibold text-gray-900 mb-1">1. Start Ride</p>
              <p>GPS tracking begins automatically when ride starts</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="font-semibold text-gray-900 mb-1">2. Live Updates</p>
              <p>Location updates every second, ETA every 30 seconds</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="font-semibold text-gray-900 mb-1">3. Deviation Detection</p>
              <p>If you go off route, new path calculated instantly</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <p className="font-semibold text-gray-900 mb-1">4. Passenger Tracking</p>
              <p>Passengers see driver's live location and updated ETA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-yellow-900 mb-2">How to Access Live Tracking</h4>
            <div className="space-y-2 text-sm text-yellow-800">
              <p><strong>For Passengers:</strong> Book a ride and wait for driver confirmation. The "Live Track" tab will appear with a green pulsing dot.</p>
              <p><strong>For Drivers:</strong> Create a ride. When passengers join, the "Live Track" tab appears.</p>
              <p><strong>Demo Mode:</strong> Use the buttons above to simulate route optimization in real-time!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


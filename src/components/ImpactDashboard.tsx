import React, { useState, useEffect } from 'react';
import { TrendingUp, Leaf, Users, Fuel, DollarSign, Car, BarChart3, RefreshCw, User } from 'lucide-react';
import { mockImpactMetrics } from '../services/mockData';
import { useAuth } from '../contexts/AuthContext';
import { fetchImpactMetrics, getUserImpact } from '../services/impactService';

export default function ImpactDashboard() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [metrics, setMetrics] = useState(mockImpactMetrics);
  const [userImpact, setUserImpact] = useState<any>(null);
  const latestMetric = metrics[metrics.length - 1];

  // Load metrics from database or mock data
  useEffect(() => {
    const loadMetrics = async () => {
      console.log('📊 Loading impact metrics...');
      const data = await fetchImpactMetrics();
      console.log('📊 Fetched metrics:', data.length, 'records');
      setMetrics(data);
      
      if (user) {
        const impact = await getUserImpact(user.id);
        console.log('✅ User impact loaded:', impact);
        console.log(`   Total CO2: ${impact?.total_co2_saved || 0} kg`);
        console.log(`   Total Rides: ${impact?.total_rides || 0}`);
        setUserImpact(impact);
      }
    };
    
    loadMetrics();
  }, [refreshKey, user]);

  // Auto-refresh every 5 seconds to show updates immediately
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing impact data...');
      setRefreshKey(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalMetrics = metrics.reduce(
    (acc, m) => ({
      rides: acc.rides + m.total_rides,
      participants: acc.participants + m.total_participants,
      co2: acc.co2 + m.total_co2_saved,
      distance: acc.distance + m.total_distance_shared,
      fuel: acc.fuel + m.fuel_saved_liters,
      cost: acc.cost + m.cost_saved
    }),
    { rides: 0, participants: 0, co2: 0, distance: 0, fuel: 0, cost: 0 }
  );

  const avgOccupancy = metrics.reduce((acc, m) => acc + m.average_occupancy, 0) / metrics.length;

  const maxCO2 = Math.max(...metrics.map(m => m.total_co2_saved));

  // Get last 7 days of metrics for weekly comparison (dynamic - always shows current week)
  const getLast7Days = () => {
    const today = new Date();
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Use local date string instead of UTC
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const dayMetric = metrics.find(m => m.date === dateStr);
      
      // Format date display
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      last7Days.push({
        date: dateStr,
        dayName,
        monthDay,
        fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        co2: dayMetric?.total_co2_saved || 0,
        rides: dayMetric?.total_rides || 0,
        participants: dayMetric?.total_participants || 0,
        isToday: i === 0
      });
    }
    
    return last7Days;
  };

  const weeklyData = getLast7Days();
  const maxWeeklyCO2 = Math.max(...weeklyData.map(d => d.co2), 1);
  const thisWeekTotal = weeklyData.reduce((sum, d) => sum + d.co2, 0);
  
  // Get previous week for comparison
  const getPreviousWeek = () => {
    const today = new Date();
    const previousWeekData = [];
    
    for (let i = 13; i >= 7; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayMetric = metrics.find(m => m.date === dateStr);
      previousWeekData.push(dayMetric?.total_co2_saved || 0);
    }
    
    return previousWeekData.reduce((sum, val) => sum + val, 0);
  };

  const lastWeekTotal = getPreviousWeek();
  const weeklyChange = lastWeekTotal > 0 
    ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Environmental Impact Dashboard</h2>
          <p className="text-gray-600">
            Track how carpooling reduces emissions and contributes to SDG 11: Sustainable Cities and Communities
          </p>
        </div>
        <button
          onClick={() => {
            setRefreshKey(prev => prev + 1);
          }}
          className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl font-semibold flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
      
      {/* Personal Impact Card */}
      {user && (
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Your Personal Impact</h3>
                <p className="text-white/80 text-sm">As a {user.role}</p>
              </div>
            </div>
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Refresh your stats"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-3xl font-bold mb-1">
                {userImpact ? userImpact.total_co2_saved.toFixed(1) : user.total_co2_saved.toFixed(1)}kg
              </div>
              <div className="text-white/80 text-sm">CO₂ Saved</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">
                {userImpact 
                  ? (user.role === 'driver' ? userImpact.total_rides_offered : userImpact.total_rides_taken)
                  : (user.role === 'driver' ? user.total_rides_offered : user.total_rides_taken)
                }
              </div>
              <div className="text-white/80 text-sm">Rides</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">
                {userImpact 
                  ? (userImpact.total_co2_saved / 21).toFixed(0)
                  : (user.total_co2_saved / 21).toFixed(0)
                }
              </div>
              <div className="text-white/80 text-sm">Trees Equiv.</div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly CO2 Bar Graph */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Weekly CO₂ Impact</h3>
            <p className="text-sm text-gray-600">
              {weeklyData[0]?.monthDay} - {weeklyData[6]?.monthDay} ({new Date().getFullYear()})
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">
              {thisWeekTotal.toFixed(1)} kg
            </div>
            <div className={`text-xs font-semibold flex items-center gap-1 ${
              parseFloat(weeklyChange as string) >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-3 h-3" />
              {parseFloat(weeklyChange as string) >= 0 ? '+' : ''}{weeklyChange}% vs last week
            </div>
          </div>
        </div>

        {/* Bar Graph */}
        <div className="space-y-3">
          {weeklyData.map((day, index) => (
            <div key={day.date} className="group">
              <div className="flex items-center gap-3">
                <div className="w-20 text-xs font-semibold">
                  <div className={day.isToday ? 'text-emerald-600' : 'text-gray-600'}>
                    {day.dayName}
                  </div>
                  <div className="text-[10px] text-gray-400">{day.monthDay}</div>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3 ${
                        day.isToday 
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg' 
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      }`}
                      style={{ width: `${Math.max((day.co2 / maxWeeklyCO2) * 100, day.co2 > 0 ? 5 : 0)}%` }}
                    >
                      {day.co2 > 0 && (
                        <span className="text-white text-xs font-bold">
                          {day.co2.toFixed(1)}kg
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <div className="text-xs text-gray-500">{day.rides} rides</div>
                  </div>
                </div>
              </div>
              {day.isToday && (
                <div className="ml-24 mt-1 text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-pulse">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                  Today's impact - Updates in real-time!
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Weekly Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Total CO₂</div>
            <div className="text-2xl font-bold text-emerald-600">{thisWeekTotal.toFixed(1)}kg</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Total Rides</div>
            <div className="text-2xl font-bold text-blue-600">
              {weeklyData.reduce((sum, d) => sum + d.rides, 0)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Avg/Day</div>
            <div className="text-2xl font-bold text-purple-600">
              {(thisWeekTotal / 7).toFixed(1)}kg
            </div>
          </div>
        </div>
      </div>

      {/* CO2 Calculation Formula */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          How We Calculate CO₂ Savings
        </h3>
        
        <div className="bg-white rounded-xl p-5 mb-4">
          <div className="text-center mb-4">
            <div className="inline-block bg-blue-100 px-4 py-2 rounded-lg mb-2">
              <code className="text-sm font-bold text-blue-900">
                CO₂ Saved = Distance × Passengers × 0.21
              </code>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
              <div className="font-bold text-emerald-700 mb-1">Distance</div>
              <div className="text-xs text-gray-600">Ride length in km</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="font-bold text-blue-700 mb-1">Passengers</div>
              <div className="text-xs text-gray-600">Cars saved</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="font-bold text-purple-700 mb-1">0.21 kg/km</div>
              <div className="text-xs text-gray-600">Avg car emission</div>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs text-gray-700">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></div>
            <p><strong>0.21 kg/km:</strong> Average CO₂ emission per kilometer for gasoline cars (based on 8L/100km fuel consumption)</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></div>
            <p><strong>Each passenger</strong> represents one car removed from the road</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5"></div>
            <p><strong>Real-time calculation:</strong> Updated when driver marks ride as complete</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 text-white/80" />
          </div>
          <div className="text-3xl font-bold mb-1">
            {totalMetrics.co2.toFixed(0)}kg
          </div>
          <div className="text-emerald-100 text-sm">Total CO₂ Saved</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 text-white/80" />
          </div>
          <div className="text-3xl font-bold mb-1">
            {totalMetrics.participants.toLocaleString()}
          </div>
          <div className="text-blue-100 text-sm">Total Carpoolers</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5 text-white/80" />
          </div>
          <div className="text-3xl font-bold mb-1">
            {totalMetrics.rides.toLocaleString()}
          </div>
          <div className="text-orange-100 text-sm">Rides Completed</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Fuel className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {totalMetrics.fuel.toFixed(0)}L
          </div>
          <div className="text-gray-600 text-sm">Fuel Saved</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            ₹{(totalMetrics.cost * 83).toFixed(0)}
          </div>
          <div className="text-gray-600 text-sm">Cost Saved</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-teal-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {avgOccupancy.toFixed(2)}
          </div>
          <div className="text-gray-600 text-sm">Avg Occupancy</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">CO₂ Savings Over Time</h3>
            <p className="text-xs text-gray-500 mt-1">
              {weeklyData[0]?.monthDay} - {weeklyData[6]?.monthDay} ({new Date().getFullYear()}) • Real-time
            </p>
          </div>
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="text-emerald-600 hover:text-emerald-700 p-2 rounded-lg hover:bg-emerald-50 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {weeklyData.map((day, index) => {
            const percentage = maxWeeklyCO2 > 0 ? (day.co2 / maxWeeklyCO2) * 100 : 0;

            return (
              <div key={day.date}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${day.isToday ? 'text-emerald-600' : 'text-gray-600'}`}>
                      {day.dayName}, {day.monthDay}
                    </span>
                    {day.isToday && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                        TODAY
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900">
                    {day.co2.toFixed(1)}kg CO₂
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      day.isToday
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                    }`}
                    style={{ width: `${Math.max(percentage, day.co2 > 0 ? 3 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Weekly Comparison
            </h3>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Live
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">This Week CO₂</span>
                <span className="text-sm font-semibold text-gray-900">
                  {thisWeekTotal.toFixed(1)}kg
                </span>
              </div>
              <div className={`text-xs font-semibold ${
                parseFloat(weeklyChange as string) >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {parseFloat(weeklyChange as string) >= 0 ? '+' : ''}{weeklyChange}% from last week
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">This Week Rides</span>
                <span className="text-sm font-semibold text-gray-900">
                  {weeklyData.reduce((sum, d) => sum + d.rides, 0)}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {weeklyData[0]?.monthDay} - {weeklyData[6]?.monthDay}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">This Week Passengers</span>
                <span className="text-sm font-semibold text-gray-900">
                  {weeklyData.reduce((sum, d) => sum + d.participants, 0)}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Average: {(weeklyData.reduce((sum, d) => sum + d.participants, 0) / 7).toFixed(1)}/day
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">SDG 11 Impact</h3>
          </div>

          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
            Our carpooling platform directly contributes to SDG 11: Sustainable Cities and Communities by:
          </p>

          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">•</span>
              <span>Reducing traffic congestion in urban areas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">•</span>
              <span>Lowering greenhouse gas emissions from transportation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">•</span>
              <span>Promoting sustainable transport systems</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 mt-1">•</span>
              <span>Building community connections through shared mobility</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

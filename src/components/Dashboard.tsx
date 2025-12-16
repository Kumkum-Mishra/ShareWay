import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Car, MapPin, Calendar, Users, Leaf, Trophy, TrendingUp, LogOut, Plus, Search, Gift } from 'lucide-react';
import ImpactDashboard from './ImpactDashboard';
import RideList from './RideList';
import CreateRide from './CreateRide';
import FindRide from './FindRide';
import { RewardsCenter } from './RewardsCenter';

type Tab = 'find' | 'rides' | 'impact' | 'rewards' | 'profile';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('find');
  const [showCreateRide, setShowCreateRide] = useState(false);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ShareWay</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveTab('rewards')}
                className="hidden md:flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-900">
                  {user.reward_points} points
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('rides');
                  setShowCreateRide(true);
                }}
                className="hidden sm:inline-flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Offer Ride
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome back, {user.full_name}!</h1>
              <p className="text-emerald-100 mb-4">
                You've saved {user.total_co2_saved.toFixed(1)}kg of CO₂ through carpooling
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-emerald-100 text-sm mb-1">Rating</div>
                  <div className="text-2xl font-bold">{user.rating.toFixed(1)}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-emerald-100 text-sm mb-1">Rides Offered</div>
                  <div className="text-2xl font-bold">{user.total_rides_offered}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-emerald-100 text-sm mb-1">Rides Taken</div>
                  <div className="text-2xl font-bold">{user.total_rides_taken}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-emerald-100 text-sm mb-1">Points</div>
                  <div className="text-2xl font-bold">{user.reward_points}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('find')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'find'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Search className="w-4 h-4" />
            Find Rides
          </button>

          <button
            onClick={() => setActiveTab('rides')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'rides'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Car className="w-4 h-4" />
            My Rides
          </button>

          <button
            onClick={() => setActiveTab('impact')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'impact'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Impact
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'rewards'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Gift className="w-4 h-4" />
            Rewards
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Profile
          </button>
        </div>

        <div>
          {activeTab === 'find' && <FindRide />}
          {activeTab === 'rides' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">My Rides</h2>
                <button
                  onClick={() => setShowCreateRide(true)}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Offer Ride
                </button>
              </div>
              <RideList userId={user.id} />
            </div>
          )}
          {activeTab === 'impact' && <ImpactDashboard />}
          {activeTab === 'rewards' && <RewardsCenter />}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Full Name</label>
                  <div className="text-lg font-medium text-gray-900">{user.full_name}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <div className="text-lg font-medium text-gray-900">{user.email}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Phone</label>
                  <div className="text-lg font-medium text-gray-900">{user.phone || 'Not set'}</div>
                </div>
                {user.vehicle_type && (
                  <>
                    <div>
                      <label className="text-sm text-gray-600">Vehicle</label>
                      <div className="text-lg font-medium text-gray-900">
                        {user.vehicle_model} ({user.vehicle_type})
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Capacity</label>
                      <div className="text-lg font-medium text-gray-900">
                        {user.vehicle_capacity} passengers
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreateRide && (
        <CreateRide
          onClose={() => setShowCreateRide(false)}
          onCreated={() => {
            setActiveTab('rides');
          }}
        />
      )}
    </div>
  );
}

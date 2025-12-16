import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Car, Trophy, LogOut, Plus, User, TrendingUp, Briefcase, Gift, Navigation } from 'lucide-react';
import ImpactDashboard from './ImpactDashboard';
import RideList from './RideList';
import CreateRide from './CreateRide';
import { RewardsCenter } from './RewardsCenter';
import { getUserRides } from '../services/mockData';

type Tab = 'my-rides' | 'impact' | 'rewards' | 'profile';

export default function DriverDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('my-rides');
  const [showCreateRide, setShowCreateRide] = useState(false);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <nav className="bg-white border-b-2 border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Car className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ShareWay</span>
                <div className="text-xs text-gray-500 font-medium">Driver Portal</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCreateRide(true)}
                className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                <Plus className="w-5 h-5" />
                Offer Ride
              </button>

              <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 rounded-xl border border-blue-200">
                <Trophy className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-xs text-blue-700 font-medium">Reward Points</div>
                  <div className="text-lg font-bold text-blue-900">{user.reward_points}</div>
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-all font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold">Welcome, {user.full_name}! 🚗</h1>
              </div>
              <p className="text-blue-100 text-lg mb-6">
                You've helped save {user.total_co2_saved.toFixed(1)}kg of CO₂ and offered {user.total_rides_offered} rides
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                  <div className="text-blue-100 text-sm mb-1 font-medium">Rating</div>
                  <div className="text-3xl font-bold flex items-center gap-1">
                    {user.rating.toFixed(1)}
                    <span className="text-yellow-300 text-2xl">★</span>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                  <div className="text-blue-100 text-sm mb-1 font-medium">Rides Offered</div>
                  <div className="text-3xl font-bold">{user.total_rides_offered}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                  <div className="text-blue-100 text-sm mb-1 font-medium">CO₂ Saved</div>
                  <div className="text-3xl font-bold">{user.total_co2_saved.toFixed(0)}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                  <div className="text-blue-100 text-sm mb-1 font-medium">Points</div>
                  <div className="text-3xl font-bold">{user.reward_points}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('my-rides')}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold whitespace-nowrap transition-all ${
              activeTab === 'my-rides'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <Car className="w-5 h-5" />
            My Rides
          </button>

          <button
            onClick={() => setActiveTab('impact')}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold whitespace-nowrap transition-all ${
              activeTab === 'impact'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            My Impact
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold whitespace-nowrap transition-all ${
              activeTab === 'rewards'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <Gift className="w-5 h-5" />
            Rewards
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold whitespace-nowrap transition-all ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <User className="w-5 h-5" />
            Profile
          </button>

        </div>

        {/* Content */}
        <div>
          {activeTab === 'my-rides' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">My Offered Rides</h2>
                <button
                  onClick={() => setShowCreateRide(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Offer New Ride
                </button>
              </div>
              <RideList userId={user.id} />
            </div>
          )}
          {activeTab === 'impact' && <ImpactDashboard />}
          {activeTab === 'rewards' && <RewardsCenter />}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Driver Profile</h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {user.full_name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{user.full_name}</div>
                    <div className="text-blue-600 font-semibold flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Driver Account
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm text-gray-600 font-medium">Email</label>
                    <div className="text-lg font-semibold text-gray-900 mt-1">{user.email}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm text-gray-600 font-medium">Phone</label>
                    <div className="text-lg font-semibold text-gray-900 mt-1">{user.phone || 'Not set'}</div>
                  </div>
                  {user.vehicle_type && (
                    <>
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <label className="text-sm text-blue-700 font-medium">Vehicle</label>
                        <div className="text-lg font-semibold text-gray-900 mt-1">
                          {user.vehicle_model}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{user.vehicle_type}</div>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <label className="text-sm text-blue-700 font-medium">Capacity</label>
                        <div className="text-lg font-semibold text-gray-900 mt-1">
                          {user.vehicle_capacity} passengers
                        </div>
                      </div>
                    </>
                  )}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm text-gray-600 font-medium">Member Since</label>
                    <div className="text-lg font-semibold text-gray-900 mt-1">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm text-gray-600 font-medium">Rating</label>
                    <div className="text-lg font-semibold text-gray-900 mt-1 flex items-center gap-1">
                      {user.rating.toFixed(1)}
                      <span className="text-yellow-500">★</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {showCreateRide && (
        <CreateRide
          onClose={() => setShowCreateRide(false)}
          onCreated={() => {
            setActiveTab('my-rides');
          }}
        />
      )}
    </div>
  );
}


import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Car, Leaf, Users, User, Briefcase, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onBack?: () => void;
}

export default function Login({ onBack }: LoginProps = {}) {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'passenger' | 'driver' | null>(null);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedRole) {
      setError('Please select your role (Passenger or Driver)');
      return;
    }

    try {
      await login(email, selectedRole);
    } catch (err) {
      setError('User not found or role mismatch. Try demo accounts below.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      {onBack && (
        <button
          onClick={onBack}
          className="fixed top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-lg shadow-md z-10"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Home</span>
        </button>
      )}
      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-left space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Car className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-gray-900">ShareWay</h1>
              <p className="text-emerald-600 font-semibold">Smart Carpooling Platform</p>
            </div>
          </div>

          <div>
            <h2 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
              Sustainable Mobility<br />for Everyone
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Join thousands of commuters reducing traffic congestion and emissions through AI-powered ride matching and route optimization.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                <Leaf className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">8,450kg</div>
              <div className="text-sm text-gray-600">CO₂ Saved</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">1,219</div>
              <div className="text-sm text-gray-600">Rides Shared</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                <Car className="w-7 h-7 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">2.68</div>
              <div className="text-sm text-gray-600">Avg Occupancy</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-sm font-semibold mb-1">Contributing to SDG 11</p>
            <p className="text-lg font-bold">Sustainable Cities and Communities</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h3>
          <p className="text-gray-600 mb-8">Sign in to continue your eco-friendly journey</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                I am a:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole('passenger')}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                    selectedRole === 'passenger'
                      ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                      : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    selectedRole === 'passenger' ? 'bg-emerald-500' : 'bg-gray-100'
                  }`}>
                    <User className={`w-8 h-8 ${selectedRole === 'passenger' ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="text-center">
                    <div className={`font-bold ${selectedRole === 'passenger' ? 'text-emerald-700' : 'text-gray-900'}`}>
                      Passenger
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Find & book rides</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('driver')}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                    selectedRole === 'driver'
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    selectedRole === 'driver' ? 'bg-blue-500' : 'bg-gray-100'
                  }`}>
                    <Briefcase className={`w-8 h-8 ${selectedRole === 'driver' ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="text-center">
                    <div className={`font-bold ${selectedRole === 'driver' ? 'text-blue-700' : 'text-gray-900'}`}>
                      Driver
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Offer rides & earn</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-lg"
                placeholder="Enter your email"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Continue
            </button>
          </form>

          {onBack && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={onBack}
                  className="text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  Sign Up
                </button>
              </p>
            </div>
          )}

          <div className="mt-8 pt-8 border-t-2 border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-4">Demo accounts:</p>
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs font-semibold text-blue-700 mb-1">Driver Accounts</div>
                <button
                  onClick={() => { setEmail('driver@example.com'); setSelectedRole('driver'); }}
                  className="w-full text-left px-3 py-2 bg-white hover:bg-blue-100 rounded-lg text-sm text-gray-700 transition-colors font-medium"
                >
                  driver@example.com
                </button>
                <button
                  onClick={() => { setEmail('sarah.johnson@example.com'); setSelectedRole('driver'); }}
                  className="w-full text-left px-3 py-2 bg-white hover:bg-blue-100 rounded-lg text-sm text-gray-700 transition-colors font-medium mt-2"
                >
                  sarah.johnson@example.com
                </button>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3">
                <div className="text-xs font-semibold text-emerald-700 mb-1">Passenger Accounts</div>
                <button
                  onClick={() => { setEmail('passenger@example.com'); setSelectedRole('passenger'); }}
                  className="w-full text-left px-3 py-2 bg-white hover:bg-emerald-100 rounded-lg text-sm text-gray-700 transition-colors font-medium"
                >
                  passenger@example.com
                </button>
                <button
                  onClick={() => { setEmail('emma.wilson@example.com'); setSelectedRole('passenger'); }}
                  className="w-full text-left px-3 py-2 bg-white hover:bg-emerald-100 rounded-lg text-sm text-gray-700 transition-colors font-medium mt-2"
                >
                  emma.wilson@example.com
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

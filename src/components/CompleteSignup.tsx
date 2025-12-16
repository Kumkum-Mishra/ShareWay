import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Car, Camera, Upload, ArrowLeft, Check, Shield, Lock, UserPlus, Briefcase } from 'lucide-react';
import { isValidPhone, isValidEmail, sanitizeInput } from '../utils/security';

interface CompleteSignupProps {
  role: 'passenger' | 'driver';
  onBack: () => void;
  onComplete: (userData: SignupData) => void;
  onContinueToTutorial: () => void;
}

export interface SignupData {
  email: string;
  fullName: string;
  phone: string;
  gender?: 'male' | 'female' | 'other';
  profilePhoto?: string;
  vehicleType?: string;
  vehicleModel?: string;
  vehicleCapacity?: number;
  preferences: {
    music: boolean;
    pets: boolean;
    smoking: boolean;
  };
}

export default function CompleteSignup({ role, onBack, onComplete, onContinueToTutorial }: CompleteSignupProps) {
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    fullName: '',
    phone: '',
    gender: undefined,
    profilePhoto: undefined,
    vehicleType: '',
    vehicleModel: '',
    vehicleCapacity: 4,
    preferences: {
      music: true,
      pets: false,
      smoking: false
    }
  });

  const [useGoogleAuth, setUseGoogleAuth] = useState(false);
  const [showBonusCard, setShowBonusCard] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Photo must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePhoto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGoogleSignup = () => {
    // Simulate Google OAuth
    const googleEmail = `user${Date.now()}@gmail.com`;
    setFormData({ ...formData, email: googleEmail });
    setUseGoogleAuth(true);
    alert('Google authentication would happen here.\nFor demo, email set to: ' + googleEmail);
  };

  const validateForm = (): boolean => {
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      alert('Please enter your full name (at least 2 characters)');
      return false;
    }

    if (!useGoogleAuth) {
      if (!isValidEmail(formData.email)) {
        alert('Please enter a valid email address');
        return false;
      }
    }

    if (!isValidPhone(formData.phone)) {
      alert('Please enter a valid phone number with country code (e.g., +1234567890)');
      return false;
    }

    if (role === 'driver') {
      if (!formData.vehicleType) {
        alert('Please select your vehicle type');
        return false;
      }
      if (!formData.vehicleModel || formData.vehicleModel.trim().length < 2) {
        alert('Please enter your vehicle model');
        return false;
      }
      if (!formData.vehicleCapacity || formData.vehicleCapacity < 1) {
        alert('Please select vehicle capacity');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Sanitize all inputs
    const sanitizedData = {
      ...formData,
      email: sanitizeInput(formData.email).toLowerCase(),
      fullName: sanitizeInput(formData.fullName),
      phone: sanitizeInput(formData.phone),
      vehicleModel: formData.vehicleModel ? sanitizeInput(formData.vehicleModel) : undefined,
      vehicleType: formData.vehicleType || undefined
    };

    // Show scratch card after successful form submission
    onComplete(sanitizedData);
    setShowBonusCard(true);
    setShowConfetti(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 py-8 px-4 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#10b981', '#0891b2', '#6366f1', '#f59e0b', '#ef4444', '#ec4899'][Math.floor(Math.random() * 6)],
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Welcome Bonus Card */}
      {showBonusCard && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slideUp">
          <div className="bg-white rounded-2xl shadow-2xl w-80 h-80 overflow-hidden border-4 border-yellow-300">
            <div className="h-full bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 p-6 flex flex-col items-center justify-center relative">
              {/* Decorative elements */}
              <div className="absolute top-3 right-3 text-yellow-200 text-2xl opacity-50 animate-pulse">✨</div>
              <div className="absolute bottom-3 left-3 text-yellow-200 text-xl opacity-40">🎁</div>
              <div className="absolute top-1/2 left-4 text-yellow-200 text-lg opacity-30">⭐</div>
              
              {/* Content */}
              <div className="text-center text-white relative z-10">
                <div className="text-5xl mb-4 animate-bounce">
                  🎉
                </div>
                
                <h3 className="text-2xl font-bold mb-2">
                  Welcome Bonus!
                </h3>
                
                <div className="my-4">
                  <div className="text-6xl font-black mb-2 drop-shadow-2xl animate-pulse-scale">
                    1000
                  </div>
                  <div className="text-xl font-bold">
                    POINTS
                  </div>
                </div>

                <div className="mt-4 text-sm opacity-90">
                  Added to your wallet
                </div>

                <button
                  onClick={() => {
                    setShowBonusCard(false);
                    setShowConfetti(false);
                    onContinueToTutorial();
                  }}
                  type="button"
                  className="mt-4 bg-white text-orange-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Continue to Dashboard Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back</span>
        </button>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className={`p-8 text-white ${
            role === 'passenger' 
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600'
          }`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                {role === 'passenger' ? (
                  <UserPlus className="w-9 h-9" />
                ) : (
                  <Briefcase className="w-9 h-9" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">Create Your Account</h1>
                <p className="text-white/90">
                  {role === 'passenger' ? 'Passenger Registration' : 'Driver Registration'}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
            {/* Section 1: Authentication */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-emerald-600" />
                Account Information
              </h3>

              <div className="space-y-4">
                {/* Google Sign In Option */}
                {!useGoogleAuth && (
                  <div>
                    <button
                      type="button"
                      onClick={handleGoogleSignup}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-semibold text-gray-700 shadow-md hover:shadow-lg mb-4"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">Or use email</span>
                      </div>
                    </div>
                  </div>
                )}

                {useGoogleAuth && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <span className="text-green-800 font-semibold">Google account connected!</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">{formData.email}</p>
                  </div>
                )}

                {!useGoogleAuth && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Personal Information */}
            <div className="pt-6 border-t-2 border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-6 w-6 text-emerald-600" />
                Personal Details
              </h3>

              <div className="space-y-6">
                {/* Profile Photo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Camera className="h-4 w-4 inline mr-1" />
                    Profile Photo (Optional)
                  </label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl overflow-hidden">
                      {formData.profilePhoto ? (
                        <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="h-10 w-10" />
                      )}
                    </div>
                    <label className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer transition-colors shadow-md">
                      <Upload className="h-5 w-5" />
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Recommended: Clear photo of your face. Max 5MB.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="John Doe"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="h-4 w-4 inline mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1234567890"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Include country code</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User className="h-4 w-4 inline mr-1" />
                      Gender *
                    </label>
                    <select
                      value={formData.gender || ''}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {formData.gender === 'female' && 'Enhanced security verification required for female users'}
                      {formData.gender && formData.gender !== 'female' && 'Your information is secure'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Vehicle Information (Driver Only) */}
            {role === 'driver' && (
              <div className="pt-6 border-t-2 border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Car className="h-6 w-6 text-blue-600" />
                  Vehicle Information
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vehicle Type *
                    </label>
                    <select
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select type</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Van">Van</option>
                      <option value="Minivan">Minivan</option>
                      <option value="Truck">Pickup Truck</option>
                      <option value="Coupe">Coupe</option>
                      <option value="Electric">Electric Vehicle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Passenger Capacity *
                    </label>
                    <select
                      value={formData.vehicleCapacity}
                      onChange={(e) => setFormData({ ...formData, vehicleCapacity: parseInt(e.target.value) })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>
                          {num} passenger{num !== 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vehicle Model & Year *
                    </label>
                    <input
                      type="text"
                      value={formData.vehicleModel}
                      onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                      placeholder="Toyota Camry 2022"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section 4: Ride Preferences */}
            <div className="pt-6 border-t-2 border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ride Preferences</h3>
              <p className="text-sm text-gray-600 mb-4">
                Help us match you with compatible {role === 'passenger' ? 'drivers' : 'passengers'}
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <label className="flex items-center justify-between p-5 bg-gray-50 rounded-xl cursor-pointer hover:bg-emerald-50 border-2 border-transparent hover:border-emerald-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🎵</div>
                    <div>
                      <div className="font-semibold text-gray-900">Music</div>
                      <div className="text-xs text-gray-600">Enjoy music</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.preferences.music}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, music: e.target.checked }
                    })}
                    className="w-6 h-6 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-5 bg-gray-50 rounded-xl cursor-pointer hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🐕</div>
                    <div>
                      <div className="font-semibold text-gray-900">Pets</div>
                      <div className="text-xs text-gray-600">Pet-friendly</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.preferences.pets}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, pets: e.target.checked }
                    })}
                    className="w-6 h-6 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-5 bg-gray-50 rounded-xl cursor-pointer hover:bg-orange-50 border-2 border-transparent hover:border-orange-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🚭</div>
                    <div>
                      <div className="font-semibold text-gray-900">Smoking</div>
                      <div className="text-xs text-gray-600">Allow smoking</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.preferences.smoking}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, smoking: e.target.checked }
                    })}
                    className="w-6 h-6 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
              </div>
            </div>

            {/* Welcome Bonus */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Check className="h-7 w-7 text-yellow-900" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Welcome Bonus</h4>
                  <p className="text-sm text-gray-700">
                    Complete your first ride and receive <strong>100 bonus points</strong>, 
                    <strong> 5% cashback</strong>, and a <strong>special welcome coupon</strong>!
                  </p>
                </div>
              </div>
            </div>

            {/* Security & Privacy */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Your data is secure.</strong> We use enterprise-grade encryption and never share 
                  your personal information without permission. Read our{' '}
                  <a href="#" className="underline hover:text-blue-900">Privacy Policy</a>.
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full flex items-center justify-center gap-3 px-8 py-5 text-white rounded-xl font-bold text-lg transition-all shadow-xl transform hover:scale-105 ${
                role === 'passenger'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              }`}
            >
              <Check className="h-6 w-6" />
              Create My Account & Start Riding
            </button>

            <p className="text-center text-sm text-gray-500">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-emerald-600 hover:text-emerald-700 underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-emerald-600 hover:text-emerald-700 underline">Privacy Policy</a>
            </p>
          </form>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes slideUp {
          from { 
            transform: translate(-50%, 50px);
            opacity: 0;
          }
          to { 
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        @keyframes confettiFall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        .animate-pulse-scale {
          animation: pulse-scale 1s ease-in-out infinite;
        }
        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
          overflow: hidden;
        }
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          animation: confettiFall linear forwards;
          opacity: 0.9;
        }
        .confetti:nth-child(odd) {
          width: 8px;
          height: 16px;
        }
        .confetti:nth-child(3n) {
          width: 12px;
          height: 8px;
        }
      `}</style>
    </div>
  );
}


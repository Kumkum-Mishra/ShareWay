import React, { useState } from 'react';
import { User, Phone, Car, Camera, ArrowRight, ArrowLeft, Check, Upload } from 'lucide-react';
import { isValidPhone, sanitizeInput } from '../utils/security';

interface OnboardingProps {
  email: string;
  role: 'passenger' | 'driver';
  onComplete: (userData: OnboardingData) => void;
}

export interface OnboardingData {
  fullName: string;
  phone: string;
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

export default function Onboarding({ email, role, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    fullName: '',
    phone: '',
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

  const totalSteps = role === 'driver' ? 4 : 3;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, upload to cloud storage
      // For now, create a data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePhoto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!formData.fullName || formData.fullName.trim().length < 2) {
        alert('Please enter your full name (at least 2 characters)');
        return false;
      }
      if (!isValidPhone(formData.phone)) {
        alert('Please enter a valid phone number (e.g., +1234567890)');
        return false;
      }
    }

    if (step === 2 && role === 'driver') {
      if (!formData.vehicleType) {
        alert('Please select your vehicle type');
        return false;
      }
      if (!formData.vehicleModel || formData.vehicleModel.trim().length < 2) {
        alert('Please enter your vehicle model');
        return false;
      }
      if (!formData.vehicleCapacity || formData.vehicleCapacity < 1) {
        alert('Please enter vehicle capacity');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    
    if (step === totalSteps) {
      // Sanitize all inputs before submitting
      const sanitizedData = {
        ...formData,
        fullName: sanitizeInput(formData.fullName),
        phone: sanitizeInput(formData.phone),
        vehicleModel: formData.vehicleModel ? sanitizeInput(formData.vehicleModel) : undefined,
        vehicleType: formData.vehicleType || undefined
      };
      onComplete(sanitizedData);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Car className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Welcome to ShareWay!</h1>
                <p className="text-emerald-100">Let's set up your profile</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex gap-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    i + 1 <= step ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-emerald-100 mt-3">
              Step {step} of {totalSteps}
            </p>
          </div>

          {/* Form Content */}
          <div className="p-8 md:p-10">
            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <User className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
                  <p className="text-gray-600">Tell us about yourself</p>
                </div>

                {/* Profile Photo */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl overflow-hidden">
                      {formData.profilePhoto ? (
                        <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="h-12 w-12" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors shadow-lg">
                      <Upload className="h-5 w-5 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1234567890"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +1 for US)</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Email:</strong> {email}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">This will be your login email</p>
                </div>
              </div>
            )}

            {/* Step 2: Vehicle Info (Driver Only) or Preferences (Passenger) */}
            {step === 2 && role === 'driver' && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Car className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Information</h2>
                  <p className="text-gray-600">Tell us about your vehicle</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vehicle Type *
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Select type</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Electric">Electric Vehicle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Vehicle Model *
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleModel}
                    onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                    placeholder="Toyota Camry 2022"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Passenger Capacity *
                  </label>
                  <select
                    value={formData.vehicleCapacity}
                    onChange={(e) => setFormData({ ...formData, vehicleCapacity: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num} passenger{num !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 2 or 3: Preferences */}
            {((step === 2 && role === 'passenger') || (step === 3 && role === 'driver')) && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Sparkles className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Preferences</h2>
                  <p className="text-gray-600">Help us match you with compatible riders</p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🎵</div>
                      <div>
                        <div className="font-semibold text-gray-900">Music</div>
                        <div className="text-sm text-gray-600">I like listening to music during rides</div>
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

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🐕</div>
                      <div>
                        <div className="font-semibold text-gray-900">Pets</div>
                        <div className="text-sm text-gray-600">I'm comfortable with pets in the car</div>
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

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🚭</div>
                      <div>
                        <div className="font-semibold text-gray-900">Smoking</div>
                        <div className="text-sm text-gray-600">I allow smoking in the vehicle</div>
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
            )}

            {/* Step 3 or 4: Review */}
            {((step === 3 && role === 'passenger') || (step === 4 && role === 'driver')) && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Check className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost Done!</h2>
                  <p className="text-gray-600">Review your information</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-lg">
                      {formData.profilePhoto ? (
                        <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        formData.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">{formData.fullName}</div>
                      <div className="text-sm text-gray-600">{email}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Role</div>
                      <div className="font-semibold text-gray-900 capitalize">{role}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Phone</div>
                      <div className="font-semibold text-gray-900">{formData.phone}</div>
                    </div>
                  </div>

                  {role === 'driver' && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600 mb-2">Vehicle</div>
                      <div className="font-semibold text-gray-900">
                        {formData.vehicleModel} ({formData.vehicleType})
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Capacity: {formData.vehicleCapacity} passengers
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Preferences</div>
                    <div className="flex flex-wrap gap-2">
                      {formData.preferences.music && (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                          🎵 Music
                        </span>
                      )}
                      {formData.preferences.pets && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          🐕 Pets OK
                        </span>
                      )}
                      {formData.preferences.smoking && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                          🚬 Smoking
                        </span>
                      )}
                      {!formData.preferences.music && !formData.preferences.pets && !formData.preferences.smoking && (
                        <span className="text-sm text-gray-500">No preferences selected</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Gift className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-900">
                      <strong>Welcome Bonus:</strong> You'll receive 100 points and a welcome coupon after completing your first ride!
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
              >
                {step === totalSteps ? (
                  <>
                    <Check className="h-5 w-5" />
                    Complete Setup
                  </>
                ) : (
                  <>
                    Next Step
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>

            {/* Help Text */}
            <p className="text-center text-sm text-gray-500 mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


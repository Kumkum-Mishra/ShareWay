import React, { useState } from 'react';
import { Car, Mail, ArrowLeft, UserPlus, Briefcase, ArrowRight, Shield, Check, Users } from 'lucide-react';

interface SignUpProps {
  onBack: () => void;
  onGoogleSignUp: (role: 'passenger' | 'driver') => void;
  onEmailSignUp: (email: string, role: 'passenger' | 'driver') => void;
}

export default function SignUp({ onBack, onGoogleSignUp, onEmailSignUp }: SignUpProps) {
  const [step, setStep] = useState<'role' | 'method'>('role');
  const [selectedRole, setSelectedRole] = useState<'passenger' | 'driver' | null>(null);
  const [email, setEmail] = useState('');

  const handleRoleSelect = (role: 'passenger' | 'driver') => {
    setSelectedRole(role);
    setStep('method');
  };

  const handleGoogleSignUp = () => {
    if (selectedRole) {
      onGoogleSignUp(selectedRole);
    }
  };

  const handleEmailSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole && email) {
      onEmailSignUp(email, selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Home</span>
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Car className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join ShareWay</h1>
            <p className="text-gray-600">
              {step === 'role' ? 'Choose how you want to join' : `Sign up as ${selectedRole === 'passenger' ? 'a Passenger' : 'a Driver'}`}
            </p>
          </div>

          {step === 'role' ? (
            /* Role Selection */
            <div className="space-y-4">
              <button
                onClick={() => handleRoleSelect('passenger')}
                className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <UserPlus className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">I'm a Passenger</h3>
                    <p className="text-sm text-gray-600">Looking for affordable rides</p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('driver')}
                className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Briefcase className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">I'm a Driver</h3>
                    <p className="text-sm text-gray-600">Offering rides to share costs</p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </button>
            </div>
          ) : (
            /* Sign Up Method */
            <div className="space-y-4">
              {/* Google Sign Up */}
              <button
                onClick={handleGoogleSignUp}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-semibold text-gray-700 shadow-md hover:shadow-lg"
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
                  <span className="px-4 bg-white text-gray-500">Or sign up with email</span>
                </div>
              </div>

              {/* Email Sign Up */}
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
                >
                  <Mail className="h-5 w-5" />
                  Continue with Email
                </button>
              </form>

              <button
                onClick={() => setStep('role')}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-900 py-2 transition-colors"
              >
                Change role selection
              </button>

              <div className="pt-6 border-t border-gray-200">
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <button onClick={onBack} className="text-emerald-600 hover:text-emerald-700 font-semibold">
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>Verified</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-emerald-600" />
                <span>50K+ Users</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


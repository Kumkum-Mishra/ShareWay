import { Car, UserPlus, Briefcase, ArrowLeft, ArrowRight, Shield, Gift } from 'lucide-react';

interface RoleSelectionProps {
  onBack: () => void;
  onSelectRole: (role: 'passenger' | 'driver') => void;
}

export default function RoleSelection({ onBack, onSelectRole }: RoleSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Home</span>
        </button>

        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Car className="w-11 h-11 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Join ShareWay</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose how you'd like to use ShareWay and we'll set up your personalized experience
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Passenger Card */}
            <button
              onClick={() => onSelectRole('passenger')}
              className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 rounded-3xl p-10 border-4 border-emerald-200 hover:border-emerald-400 transition-all transform hover:scale-105 hover:shadow-2xl text-left"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-8 w-8 text-emerald-600" />
              </div>

              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                <UserPlus className="w-11 h-11 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">I'm a Passenger</h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Looking for affordable, eco-friendly rides to save money and reduce your carbon footprint
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-sm text-gray-700">Search & book rides instantly</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-sm text-gray-700">Earn points & cashback on every ride</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-sm text-gray-700">SOS safety features & trip sharing</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-700">Perfect for commuters</span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Gift className="h-5 w-5" />
                    <span className="text-sm font-semibold text-gray-700">100 pts bonus</span>
                  </div>
                </div>
              </div>
            </button>

            {/* Driver Card */}
            <button
              onClick={() => onSelectRole('driver')}
              className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-3xl p-10 border-4 border-blue-200 hover:border-blue-400 transition-all transform hover:scale-105 hover:shadow-2xl text-left"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-8 w-8 text-blue-600" />
              </div>

              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                <Briefcase className="w-11 h-11 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">I'm a Driver</h2>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                Offering rides to share fuel costs, meet new people, and contribute to cleaner cities
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-sm text-gray-700">Create rides & manage bookings</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-sm text-gray-700">View passenger details & ratings</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-sm text-gray-700">Earn money while reducing emissions</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-700">Perfect for daily commuters</span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Gift className="h-5 w-5" />
                    <span className="text-sm font-semibold text-gray-700">100 pts bonus</span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                <span>Secure & Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-emerald-600" />
                <span>50K+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-emerald-600" />
                <span>Instant Rewards</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


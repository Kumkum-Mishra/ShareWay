import React from 'react';
import { Car, Shield, Gift, TrendingUp, Users, MapPin, Sparkles, ArrowRight, Check } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  console.log('LandingPage component rendered');
  
  const handleGetStarted = () => {
    console.log('LandingPage: Get Started button clicked');
    onGetStarted();
  };

  const handleLogin = () => {
    console.log('LandingPage: Login button clicked');
    onLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Debug indicator */}
      <div className="fixed bottom-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold z-50">
        v1.0 Latest
      </div>
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Car className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                ShareWay
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleLogin}
                type="button"
                className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-semibold transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleGetStarted}
                type="button"
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-200"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Carpooling Platform
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Share Your Way
              <span className="block bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Forward
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Connect with compatible riders, save money on every journey, and make a real environmental impact. 
              ShareWay makes carpooling smart, safe, and rewarding.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={handleGetStarted}
                type="button"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-xl shadow-emerald-200 transform hover:scale-105"
              >
                Start Sharing Rides
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogin}
                type="button"
                className="px-8 py-4 bg-white text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-lg border-2 border-gray-200"
              >
                Sign In
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">50K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">1M+</div>
                <div className="text-sm text-gray-600">Rides Shared</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">500T</div>
                <div className="text-sm text-gray-600">CO₂ Saved (kg)</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
              <img src="/map.png" alt="ShareWay Route Map - Delhi NCR Region" className="rounded-2xl w-full shadow-md" />
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Smart Green Route</div>
                    <div className="text-sm text-gray-600">AI-optimized path through Delhi NCR</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Perfect Match Found!</div>
                    <div className="text-sm text-gray-600">95% compatibility • Multiple riders</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -top-6 -left-6 w-64 h-64 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full opacity-20 blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose ShareWay?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of carpooling with features designed for safety, savings, and sustainability
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Matching</h3>
              <p className="text-gray-600">
                AI-powered algorithm finds your perfect ride match based on route, timing, and preferences.
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 border border-red-100 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Safety First</h3>
              <p className="text-gray-600">
                SOS alerts, emergency contacts, and trip sharing keep you protected on every journey.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-100 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-yellow-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Gift className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Earn Rewards</h3>
              <p className="text-gray-600">
                Get 100 points, 5% cashback, and coupons on every ride. Exchange for free rides and perks.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-100 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Track Impact</h3>
              <p className="text-gray-600">
                Monitor your CO₂ savings in real-time and see your contribution to sustainable cities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How ShareWay Works</h2>
            <p className="text-xl text-gray-600">Simple, fast, and rewarding</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-xl">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sign Up & Choose Role</h3>
              <p className="text-gray-600">
                Create your account and select whether you're a passenger looking for rides or a driver offering them.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-xl">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Find or Offer Rides</h3>
              <p className="text-gray-600">
                Search for compatible rides or create your own. Our AI matches you with the best options.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-xl">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ride, Save & Earn</h3>
              <p className="text-gray-600">
                Share the journey, save money, earn rewards, and contribute to a greener planet!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Join Thousands of Happy Riders
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                ShareWay brings communities together through intelligent ride sharing, making every journey better for your wallet and the planet.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Users, text: 'Connect with verified, compatible riders in your community' },
                  { icon: Shield, text: 'Travel safely with SOS alerts and emergency contact features' },
                  { icon: Gift, text: 'Earn points, cashback, and coupons on every single ride' },
                  { icon: TrendingUp, text: 'Track your environmental impact with real-time CO₂ metrics' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <p className="text-gray-700 pt-1.5">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-12 text-white shadow-2xl">
              <h3 className="text-3xl font-bold mb-6">Start Your Journey Today</h3>
              <p className="text-emerald-50 mb-8 text-lg">
                Join ShareWay and be part of the sustainable transportation revolution. Every ride counts!
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Check className="h-6 w-6 text-emerald-300" />
                  <span className="text-white">Free to join, no hidden fees</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-6 w-6 text-emerald-300" />
                  <span className="text-white">Instant rewards on your first ride</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-6 w-6 text-emerald-300" />
                  <span className="text-white">24/7 safety support</span>
                </div>
              </div>

              <button
                onClick={handleGetStarted}
                type="button"
                className="w-full bg-white text-emerald-600 py-4 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-lg transform hover:scale-105"
              >
                Create Your Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">50K+</div>
              <div className="text-emerald-100">Happy Users</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">1M+</div>
              <div className="text-emerald-100">Rides Completed</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">500T</div>
              <div className="text-emerald-100">CO₂ Saved (kg)</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">4.9★</div>
              <div className="text-emerald-100">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join ShareWay today and start your journey towards smarter, greener, and safer commutes.
          </p>
          <button
            onClick={handleGetStarted}
            type="button"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-2xl shadow-emerald-300 transform hover:scale-105"
          >
            Get Started Free
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">ShareWay</span>
              </div>
              <p className="text-gray-400 mb-4">
                Share your way forward with smart, safe, and sustainable carpooling.
              </p>
              <p className="text-sm text-gray-500">
                © 2025 ShareWay. All rights reserved.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">How it works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Car, Search, Award, Shield, Map, Users, DollarSign, Calendar } from 'lucide-react';

interface DashboardTutorialProps {
  role: 'passenger' | 'driver';
  onComplete: () => void;
}

export default function DashboardTutorial({ role, onComplete }: DashboardTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const passengerSteps = [
    {
      icon: <Search className="w-16 h-16 text-emerald-600" />,
      title: 'Find Rides',
      description: 'Search for available rides by entering your pickup and drop-off locations',
      features: ['Real-time availability', 'Route preview', 'Driver ratings']
    },
    {
      icon: <Calendar className="w-16 h-16 text-blue-600" />,
      title: 'Book & Track',
      description: 'Book your ride instantly and track your journey in real-time',
      features: ['Live location tracking', 'ETA updates', 'Driver contact']
    },
    {
      icon: <Award className="w-16 h-16 text-orange-600" />,
      title: 'Earn Rewards',
      description: 'Collect points on every ride and redeem for cashback & coupons',
      features: ['Points per ride', 'Cashback options', 'Special discounts']
    },
    {
      icon: <Shield className="w-16 h-16 text-red-600" />,
      title: 'Stay Safe',
      description: 'Use SOS features, share trip details, and add emergency contacts',
      features: ['SOS button', 'Trip sharing', 'Emergency contacts']
    }
  ];

  const driverSteps = [
    {
      icon: <Car className="w-16 h-16 text-blue-600" />,
      title: 'Create Rides',
      description: 'Offer rides by setting your route, time, and available seats',
      features: ['Set your route', 'Choose passengers', 'Flexible scheduling']
    },
    {
      icon: <Users className="w-16 h-16 text-emerald-600" />,
      title: 'Manage Passengers',
      description: 'View bookings, accept requests, and communicate with passengers',
      features: ['Booking requests', 'Passenger profiles', 'Chat support']
    },
    {
      icon: <DollarSign className="w-16 h-16 text-green-600" />,
      title: 'Earn Money',
      description: 'Set your price, collect payments, and earn rewards on every ride',
      features: ['Flexible pricing', 'Instant payments', 'Bonus rewards']
    },
    {
      icon: <Map className="w-16 h-16 text-purple-600" />,
      title: 'Track Impact',
      description: 'Monitor your rides, CO₂ savings, and contribution to sustainability',
      features: ['Ride statistics', 'CO₂ tracking', 'Impact metrics']
    }
  ];

  const steps = role === 'passenger' ? passengerSteps : driverSteps;
  const totalSteps = steps.length;
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-emerald-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200 rounded-full opacity-10 blur-3xl"></div>
      </div>
      <div className="max-w-4xl w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full mb-4 ${
            role === 'passenger' 
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            <Car className="w-6 h-6" />
            <span className="font-bold text-lg">
              {role === 'passenger' ? 'Passenger' : 'Driver'} Dashboard Guide
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to ShareWay!</h1>
          <p className="text-gray-600 text-lg">Let's take a quick tour of your dashboard</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/50">
          {/* Progress Bar */}
          <div className={`px-8 py-4 ${
            role === 'passenger' 
              ? 'bg-gradient-to-r from-emerald-50 to-teal-50' 
              : 'bg-gradient-to-r from-blue-50 to-indigo-50'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-600">
                Step {currentStep + 1} of {totalSteps}
              </span>
              <button
                onClick={handleSkip}
                className="text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip Tutorial
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  role === 'passenger' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                }`}
                style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-12">
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-lg ${
                role === 'passenger' 
                  ? 'bg-gradient-to-br from-emerald-100 to-teal-100' 
                  : 'bg-gradient-to-br from-blue-100 to-indigo-100'
              }`}>
                {currentStepData.icon}
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {currentStepData.title}
              </h2>

              {/* Description */}
              <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                {currentStepData.description}
              </p>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mb-8">
                {currentStepData.features.map((feature, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-2xl border-2 shadow-md hover:shadow-lg transition-shadow ${
                      role === 'passenger'
                        ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
                        : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Check className={`w-5 h-5 ${
                        role === 'passenger' ? 'text-emerald-600' : 'text-blue-600'
                      }`} />
                      <span className="font-semibold text-gray-800 text-sm">
                        {feature}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className={`px-8 py-6 flex items-center justify-between ${
            role === 'passenger'
              ? 'bg-gradient-to-r from-emerald-50 to-teal-50'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50'
          }`}>
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Previous
            </button>

            {/* Step Indicators */}
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentStep
                      ? role === 'passenger'
                        ? 'bg-emerald-600 w-8'
                        : 'bg-blue-600 w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
                role === 'passenger'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              }`}
            >
              {currentStep === totalSteps - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Help Text */}
        <div className="text-center mt-6">
          <div className={`inline-block px-6 py-3 rounded-full shadow-lg ${
            role === 'passenger'
              ? 'bg-white/80 backdrop-blur-sm border border-emerald-200'
              : 'bg-white/80 backdrop-blur-sm border border-blue-200'
          }`}>
            <p className="text-gray-700 text-sm font-medium">
              💡 You can always access help from the dashboard menu
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}


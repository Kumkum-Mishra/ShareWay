import React, { useState } from 'react';
import { MapPin, X, Check, Ticket, Gift, CreditCard, ArrowLeft, QrCode } from 'lucide-react';
import { Ride, Coupon } from '../types';
import { RewardsService } from '../services/rewardsService';
import { useAuth } from '../contexts/AuthContext';
import QRPayment from './QRPayment';

interface BookingConfirmationProps {
  ride: Ride;
  origin: string;
  destination: string;
  onConfirm: (selectedCoupon: Coupon | null) => void;
  onCancel: () => void;
}

export default function BookingConfirmation({
  ride,
  origin,
  destination,
  onConfirm,
  onCancel
}: BookingConfirmationProps) {
  const { user } = useAuth();
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [showQRPayment, setShowQRPayment] = useState(false);

  if (!user) return null;

  const calculateFinalPrice = () => {
    let price = ride.price_per_seat;
    
    if (selectedCoupon) {
      const discount = RewardsService.calculateCouponDiscount(selectedCoupon, price);
      price -= discount;
    }
    
    return Math.max(0, price);
  };

  const applyCouponCode = () => {
    if (!couponCode.trim()) return;
    
    const userCoupons = RewardsService.getUserCoupons(user.id);
    const coupon = userCoupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    
    if (coupon) {
      setSelectedCoupon(coupon);
      setCouponCode('');
    } else {
      alert('Invalid coupon code or coupon has expired.');
    }
  };

  const handleConfirm = () => {
    const finalPrice = calculateFinalPrice();
    
    // If free ride, confirm immediately
    if (finalPrice === 0) {
      onConfirm(selectedCoupon);
    } else {
      // Show QR payment for paid rides
      setShowQRPayment(true);
    }
  };

  // Show QR Payment screen if payment required
  if (showQRPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Coupon Applied Info */}
          {selectedCoupon && (
            <div className="mb-6 bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Ticket className="h-6 w-6 text-emerald-600" />
                  <div>
                    <div className="font-bold text-emerald-900">Coupon Applied!</div>
                    <div className="text-sm text-emerald-700">{selectedCoupon.code}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCoupon(null);
                    setShowQRPayment(false);
                  }}
                  className="text-emerald-600 hover:text-emerald-800 text-sm font-semibold"
                >
                  Change Coupon
                </button>
              </div>
            </div>
          )}
          
          <QRPayment
            amount={calculateFinalPrice()}
            description={`Ride from ${origin} to ${destination}`}
            merchantName={`ShareWay - ${ride.driver_id}`}
            onSuccess={(transactionId) => {
              console.log('Payment successful:', transactionId);
              onConfirm(selectedCoupon);
            }}
            onCancel={() => setShowQRPayment(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Search</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Confirm Your Booking</h1>
          <p className="text-gray-600 mt-2">Review ride details and apply coupons before confirming</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Ride Details & Coupons */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ride Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-6 w-6 mr-2 text-emerald-600" />
                Ride Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-emerald-600 rounded-full mt-1.5" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">From</div>
                    <div className="font-semibold text-gray-900">{ride.origin}</div>
                  </div>
                </div>
                <div className="border-l-2 border-dashed border-gray-300 ml-1.5 h-6" />
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mt-1.5" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">To</div>
                    <div className="font-semibold text-gray-900">{ride.destination}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Your Pickup</div>
                    <div className="font-medium text-gray-900">{origin}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Your Dropoff</div>
                    <div className="font-medium text-gray-900">{destination}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price per seat:</span>
                  <span className="text-2xl font-bold text-gray-900">₹{ride.price_per_seat.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Apply Coupon Code */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-dashed border-emerald-300">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Ticket className="h-6 w-6 mr-2 text-emerald-600" />
                Have a Coupon Code?
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-lg"
                />
                <button
                  onClick={applyCouponCode}
                  disabled={!couponCode.trim()}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Available Coupons */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Gift className="h-6 w-6 mr-2 text-emerald-600" />
                Your Available Coupons
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {RewardsService.getUserCoupons(user.id).map((coupon) => {
                  const discount = RewardsService.calculateCouponDiscount(coupon, ride.price_per_seat);
                  const isSelected = selectedCoupon?.id === coupon.id;
                  const isFreeRide = coupon.discount_type === 'free_ride';
                  
                  return (
                    <button
                      key={coupon.id}
                      onClick={() => setSelectedCoupon(isSelected ? null : coupon)}
                      className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 shadow-md scale-105'
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Ticket className="h-5 w-5 text-emerald-600 mr-2" />
                            <span className="font-mono font-bold text-lg">{coupon.code}</span>
                            {isFreeRide && (
                              <span className="ml-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                                FREE RIDE
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {coupon.discount_type === 'free_ride' ? `Free ride up to ₹${coupon.discount_value}` :
                             coupon.discount_type === 'percentage' ? `${coupon.discount_value}% off` :
                             `₹${coupon.discount_value} off`}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-emerald-700 font-bold">
                              {discount >= ride.price_per_seat ? 'FREE!' : `Save ₹${discount.toFixed(2)}`}
                            </span>
                            <span className="text-xs text-gray-500">
                              Expires: {new Date(coupon.expires_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="h-6 w-6 text-emerald-600 ml-3 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
                {RewardsService.getUserCoupons(user.id).length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Ticket className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No coupons available</p>
                    <p className="text-sm mt-1">Complete rides to earn coupons!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Payment Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Price Summary */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-lg p-6 border-2 border-emerald-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Ride Price:</span>
                    <span className="font-semibold text-gray-900">₹{ride.price_per_seat.toFixed(2)}</span>
                  </div>
                  {selectedCoupon && (
                    <div className="flex justify-between text-sm text-emerald-700 bg-white/50 p-2 rounded-lg">
                      <span className="font-medium">Coupon ({selectedCoupon.code}):</span>
                      <span className="font-bold">
                        -₹{RewardsService.calculateCouponDiscount(selectedCoupon, ride.price_per_seat).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="border-t-2 border-emerald-300 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-lg">Total to Pay:</span>
                      <span className="text-3xl font-bold text-emerald-600">
                        {calculateFinalPrice() === 0 ? 'FREE!' : `₹${calculateFinalPrice().toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              {calculateFinalPrice() > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                    Payment Method
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Pay ₹{calculateFinalPrice().toFixed(2)} to the driver when you board the ride.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    Cash payment on pickup
                  </div>
                </div>
              )}

              {/* Rewards Preview */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-yellow-200">
                <div className="flex items-center mb-3">
                  <Gift className="h-6 w-6 text-yellow-600 mr-2" />
                  <span className="font-bold text-gray-900">You'll Earn Rewards!</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/70 rounded-lg p-3">
                    <div className="text-xs text-gray-600">Points</div>
                    <div className="text-xl font-bold text-gray-900">+100</div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3">
                    <div className="text-xs text-gray-600">Cashback</div>
                    <div className="text-xl font-bold text-green-600">
                      +₹{(ride.price_per_seat * 0.05).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 ${
                  calculateFinalPrice() === 0
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
                }`}
              >
                {calculateFinalPrice() === 0 ? (
                  <>
                    🎉 Confirm Free Ride!
                  </>
                ) : (
                  <>
                    <QrCode className="h-6 w-6" />
                    Pay ₹{calculateFinalPrice().toFixed(2)} via QR
                  </>
                )}
              </button>

              <button
                onClick={onCancel}
                className="w-full py-3 rounded-xl font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


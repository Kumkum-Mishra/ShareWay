import { useState } from 'react';
import { Award, Gift, Ticket, DollarSign, TrendingUp, Star, Calendar, Sparkles, QrCode, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { RewardsService, REDEMPTION_OPTIONS } from '../services/rewardsService';
import { RedemptionOption, Coupon, RewardTransaction } from '../types';
import QRPayment from './QRPayment';

export function RewardsCenter() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'redeem' | 'coupons' | 'history'>('overview');
  const [showRedeemSuccess, setShowRedeemSuccess] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState('');
  const [newCoupon, setNewCoupon] = useState<Coupon | null>(null);
  const [showWalletTopup, setShowWalletTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState(500);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Award className="mx-auto h-16 w-16 text-green-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view rewards</h2>
          <p className="text-gray-600">Please sign in to access your rewards and benefits</p>
        </div>
      </div>
    );
  }

  const userTransactions = RewardsService.getUserTransactions(user.id);
  const userCoupons = RewardsService.getUserCoupons(user.id);
  const totalEarned = userTransactions
    .filter(t => t.type === 'earn')
    .reduce((sum, t) => sum + t.points, 0);
  const totalRedeemed = Math.abs(
    userTransactions
      .filter(t => t.type === 'redeem')
      .reduce((sum, t) => sum + t.points, 0)
  );
  const totalCashback = userTransactions
    .reduce((sum, t) => sum + (t.cashback || 0), 0);

  const handleRedeem = (option: RedemptionOption) => {
    const result = RewardsService.redeemPoints(user.id, option, user.reward_points, user);
    
    if (result.success) {
      user.reward_points -= option.points_required;
      setRedeemMessage(result.message);
      setNewCoupon(result.coupon || null);
      setShowRedeemSuccess(true);
      
      setTimeout(() => {
        setShowRedeemSuccess(false);
        setNewCoupon(null);
      }, 5000);
    } else {
      setRedeemMessage(result.message);
      setShowRedeemSuccess(true);
      setTimeout(() => setShowRedeemSuccess(false), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNextMilestone = () => {
    const milestones = [5, 10, 25, 50, 100];
    const currentRides = user.total_rides_taken;
    const next = milestones.find(m => m > currentRides);
    return next || 200;
  };

  // Show Wallet Top-up QR Payment
  if (showWalletTopup) {
    return (
      <QRPayment
        amount={topupAmount}
        description="Wallet Top-up"
        merchantName="ShareWay Wallet"
        onSuccess={(transactionId) => {
          console.log('Wallet top-up successful:', transactionId);
          // Update user wallet balance (in production, this would be API call)
          user.wallet_balance += topupAmount;
          setShowWalletTopup(false);
          alert(`Successfully added ₹${topupAmount} to your wallet!`);
        }}
        onCancel={() => setShowWalletTopup(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Rewards Center</h1>
              <p className="text-gray-600">Earn points, get cashback, and redeem amazing rewards</p>
            </div>
            <Sparkles className="h-12 w-12 text-yellow-500" />
          </div>

          {/* Points Balance Card */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <Star className="h-5 w-5 mr-2" />
                  <span className="text-green-100 text-sm font-medium">Available Points</span>
                </div>
                <div className="text-5xl font-bold">{user.reward_points}</div>
                <div className="text-green-100 text-sm mt-1">Ready to redeem</div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    <span className="text-green-100 text-sm font-medium">Wallet Balance</span>
                  </div>
                  <button
                    onClick={() => setShowWalletTopup(true)}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Wallet className="h-3 w-3" />
                    Add Money
                  </button>
                </div>
                <div className="text-4xl font-bold">₹{user.wallet_balance.toFixed(2)}</div>
                <div className="text-green-100 text-sm mt-1">Use on rides</div>
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  <span className="text-green-100 text-sm font-medium">Total Earned</span>
                </div>
                <div className="text-3xl font-bold">{totalEarned}</div>
                <div className="text-green-100 text-sm mt-1">Lifetime points</div>
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <DollarSign className="h-5 w-5 mr-2" />
                  <span className="text-green-100 text-sm font-medium">Total Cashback</span>
                </div>
                <div className="text-3xl font-bold">₹{totalCashback.toFixed(2)}</div>
                <div className="text-green-100 text-sm mt-1">All time</div>
              </div>
            </div>

            {/* Progress to next milestone */}
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-green-100">Next Milestone: {getNextMilestone()} rides</span>
                <span className="text-sm text-green-100">{user.total_rides_taken} / {getNextMilestone()}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((user.total_rides_taken / getNextMilestone()) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showRedeemSuccess && (
          <div className={`mb-6 p-4 rounded-lg ${newCoupon ? 'bg-green-100 border border-green-400 text-green-800' : 'bg-red-100 border border-red-400 text-red-800'}`}>
            <div className="flex items-center">
              {newCoupon ? <Gift className="h-5 w-5 mr-2" /> : <Award className="h-5 w-5 mr-2" />}
              <div>
                <p className="font-semibold">{redeemMessage}</p>
                {newCoupon && (
                  <p className="text-sm mt-1">
                    Coupon Code: <span className="font-mono font-bold">{newCoupon.code}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-6 bg-white rounded-lg p-1 shadow-md">
          {(['overview', 'redeem', 'coupons', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                selectedTab === tab
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Award className="h-6 w-6 text-green-600 mr-2" />
                  Your Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Total Rides</span>
                    <span className="font-bold text-gray-900">{user.total_rides_taken}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Active Coupons</span>
                    <span className="font-bold text-green-600">{userCoupons.length}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-gray-600">Points Redeemed</span>
                    <span className="font-bold text-gray-900">{totalRedeemed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">CO2 Saved</span>
                    <span className="font-bold text-green-600">{user.total_co2_saved.toFixed(1)} kg</span>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
                  Recent Activity
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {userTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(transaction.created_at)}</p>
                      </div>
                      <div className={`font-bold text-sm ${transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'earn' ? '+' : ''}{transaction.points}
                      </div>
                    </div>
                  ))}
                  {userTransactions.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No transactions yet. Book a ride to start earning!</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Redeem Tab */}
          {selectedTab === 'redeem' && (
            <div>
              <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-8 shadow-lg mb-6 text-white">
                <h3 className="text-3xl font-bold mb-3">Exchange Your Reward Points</h3>
                <p className="text-green-50 text-lg mb-4">
                  Convert your points into valuable coupons and cashback rewards!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <DollarSign className="h-8 w-8 mb-2" />
                    <div className="font-semibold text-lg">Cashback</div>
                    <div className="text-sm text-green-100">Add funds to your wallet</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <Ticket className="h-8 w-8 mb-2" />
                    <div className="font-semibold text-lg">Discount Coupons</div>
                    <div className="text-sm text-green-100">Save on future rides</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <Award className="h-8 w-8 mb-2" />
                    <div className="font-semibold text-lg">Free Rides</div>
                    <div className="text-sm text-green-100">Ride completely free</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {REDEMPTION_OPTIONS.map((option) => {
                  const canAfford = user.reward_points >= option.points_required;
                  const Icon = option.icon === 'car' ? Award : option.icon === 'ticket' ? Ticket : DollarSign;
                  
                  return (
                    <div
                      key={option.id}
                      className={`bg-white rounded-xl p-6 shadow-lg border-2 transition-all relative overflow-hidden ${
                        canAfford
                          ? 'border-green-200 hover:border-green-400 hover:shadow-2xl hover:scale-105'
                          : 'border-gray-200 opacity-60'
                      }`}
                    >
                      {option.type === 'cashback' && (
                        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                          INSTANT
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg ${
                          option.type === 'free_ride' ? 'bg-green-100' :
                          option.type === 'discount_coupon' ? 'bg-blue-100' :
                          'bg-yellow-100'
                        }`}>
                          <Icon className={`h-8 w-8 ${
                            option.type === 'free_ride' ? 'text-green-600' :
                            option.type === 'discount_coupon' ? 'text-blue-600' :
                            'text-yellow-600'
                          }`} />
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{option.points_required}</div>
                          <div className="text-xs text-gray-500">points</div>
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-lg text-gray-900 mb-2">{option.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                      
                      {option.type === 'cashback' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center text-sm text-yellow-800">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span className="font-semibold">Adds ₹{option.value} to your wallet balance</span>
                          </div>
                        </div>
                      )}
                      
                      <button
                        onClick={() => canAfford && handleRedeem(option)}
                        disabled={!canAfford}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                          canAfford
                            ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 active:scale-95 shadow-md'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? (
                          option.type === 'cashback' ? 'Exchange for Cash' : 'Redeem Now'
                        ) : (
                          `Need ${option.points_required - user.reward_points} more`
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Coupons Tab */}
          {selectedTab === 'coupons' && (
            <div>
              <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                  <Ticket className="h-7 w-7 text-green-600 mr-2" />
                  Your Coupons
                </h3>
                <p className="text-gray-600">Use these coupons on your next ride for instant discounts</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCoupons.map((coupon) => (
                  <div key={coupon.id} className="bg-gradient-to-br from-green-500 to-blue-600 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <Ticket className="h-8 w-8" />
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                          {coupon.discount_type === 'free_ride' ? 'FREE RIDE' :
                           coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` :
                           `₹${coupon.discount_value} OFF`}
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-sm opacity-90 mb-1">Coupon Code</div>
                        <div className="font-mono text-2xl font-bold tracking-wider">{coupon.code}</div>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Expires: {new Date(coupon.expires_at).toLocaleDateString()}</span>
                      </div>
                      
                      {coupon.min_ride_value && (
                        <div className="mt-2 text-xs opacity-75">
                          Min. ride value: ₹{coupon.min_ride_value}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {userCoupons.length === 0 && (
                  <div className="col-span-full bg-white rounded-xl p-12 text-center shadow-lg">
                    <Ticket className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Coupons</h3>
                    <p className="text-gray-600 mb-6">Book more rides to earn coupons or redeem your points!</p>
                    <button
                      onClick={() => setSelectedTab('redeem')}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
                    >
                      Redeem Points
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History Tab */}
          {selectedTab === 'history' && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="h-7 w-7 text-blue-600 mr-2" />
                Transaction History
              </h3>
              
              <div className="space-y-3">
                {userTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`p-2 rounded-lg ${transaction.type === 'earn' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {transaction.type === 'earn' ? (
                          <TrendingUp className={`h-5 w-5 ${transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'}`} />
                        ) : (
                          <Gift className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-500">{formatDate(transaction.created_at)}</p>
                          {transaction.cashback && transaction.cashback > 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              ₹{transaction.cashback.toFixed(2)} cashback
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`text-xl font-bold ${transaction.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'earn' ? '+' : ''}{transaction.points}
                    </div>
                  </div>
                ))}
                
                {userTransactions.length === 0 && (
                  <div className="text-center py-12">
                    <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No History Yet</h3>
                    <p className="text-gray-600">Start booking rides to earn rewards and see your transaction history!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


import { Profile, Coupon, RewardTransaction, RedemptionOption } from '../types';

// Reward calculation constants
const REWARDS_CONFIG = {
  POINTS_PER_RIDE: 100,
  CASHBACK_PERCENTAGE: 0.05, // 5% cashback
  BONUS_MILESTONE_RIDES: [5, 10, 25, 50, 100],
  BONUS_POINTS: [250, 500, 1000, 2500, 5000],
  COUPON_GENERATION_CHANCE: 0.3, // 30% chance to get a coupon
};

// Available redemption options
export const REDEMPTION_OPTIONS: RedemptionOption[] = [
  // Discount Coupons - Low to High Points
  {
    id: 'discount-10',
    title: '10% Discount Coupon',
    description: 'Get 10% off on your next ride',
    type: 'discount_coupon',
    points_required: 200,
    value: 10,
    icon: 'ticket',
  },
  {
    id: 'discount-25',
    title: '25% Discount Coupon',
    description: 'Get 25% off on your next ride',
    type: 'discount_coupon',
    points_required: 500,
    value: 25,
    icon: 'ticket',
  },
  {
    id: 'discount-50',
    title: '50% Discount Coupon',
    description: 'Get 50% off on your next ride',
    type: 'discount_coupon',
    points_required: 1000,
    value: 50,
    icon: 'ticket',
  },
  {
    id: 'discount-80',
    title: '80% Discount Coupon',
    description: 'Get 80% off on your next ride',
    type: 'discount_coupon',
    points_required: 2000,
    value: 80,
    icon: 'ticket',
  },
  // Cashback Options
  {
    id: 'cashback-50',
    title: '₹50 Cashback',
    description: 'Get ₹50 added to your wallet',
    type: 'cashback',
    points_required: 400,
    value: 50,
    icon: 'dollar-sign',
  },
  {
    id: 'cashback-100',
    title: '₹100 Cashback',
    description: 'Get ₹100 added to your wallet',
    type: 'cashback',
    points_required: 750,
    value: 100,
    icon: 'dollar-sign',
  },
  {
    id: 'cashback-250',
    title: '₹250 Cashback',
    description: 'Get ₹250 added to your wallet',
    type: 'cashback',
    points_required: 1500,
    value: 250,
    icon: 'dollar-sign',
  },
  {
    id: 'cashback-500',
    title: '₹500 Cashback',
    description: 'Get ₹500 added to your wallet',
    type: 'cashback',
    points_required: 3000,
    value: 500,
    icon: 'dollar-sign',
  },
  // Free Ride - High Points Only
  {
    id: 'free-ride-small',
    title: 'Free Ride Up to ₹100',
    description: 'Redeem for a free ride worth up to ₹100',
    type: 'free_ride',
    points_required: 5000,
    value: 100,
    icon: 'car',
  },
  {
    id: 'free-ride-medium',
    title: 'Free Ride Up to ₹200',
    description: 'Redeem for a free ride worth up to ₹200',
    type: 'free_ride',
    points_required: 8000,
    value: 200,
    icon: 'car',
  },
  {
    id: 'free-ride-large',
    title: 'Free Ride Up to ₹500',
    description: 'Redeem for a free ride worth up to ₹500',
    type: 'free_ride',
    points_required: 15000,
    value: 500,
    icon: 'car',
  },
];

// Generate a unique coupon code
function generateCouponCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'WAY';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Calculate rewards for completing a ride
export function calculateRideRewards(ridePrice: number, totalRides: number) {
  const points = REWARDS_CONFIG.POINTS_PER_RIDE;
  const cashback = Math.round(ridePrice * REWARDS_CONFIG.CASHBACK_PERCENTAGE * 100) / 100;
  
  // Check for milestone bonus
  let bonusPoints = 0;
  const milestoneIndex = REWARDS_CONFIG.BONUS_MILESTONE_RIDES.indexOf(totalRides + 1);
  if (milestoneIndex !== -1) {
    bonusPoints = REWARDS_CONFIG.BONUS_POINTS[milestoneIndex];
  }
  
  // Random chance to generate a coupon
  const generateCoupon = Math.random() < REWARDS_CONFIG.COUPON_GENERATION_CHANCE;
  
  return {
    points,
    cashback,
    bonusPoints,
    generateCoupon,
    totalPoints: points + bonusPoints,
  };
}

// Generate a coupon for the user
export function generateRewardCoupon(userId: string): Coupon {
  const discountTypes: Array<{ type: 'percentage' | 'fixed'; value: number }> = [
    { type: 'percentage', value: 10 },
    { type: 'percentage', value: 15 },
    { type: 'percentage', value: 20 },
    { type: 'fixed', value: 5 },
  ];
  
  const selected = discountTypes[Math.floor(Math.random() * discountTypes.length)];
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days validity
  
  return {
    id: `coupon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    user_id: userId,
    code: generateCouponCode(),
    discount_type: selected.type,
    discount_value: selected.value,
    expires_at: expiresAt.toISOString(),
    is_used: false,
    created_at: new Date().toISOString(),
  };
}

// Mock storage for rewards (in a real app, this would be in Supabase)
export class RewardsService {
  private static transactions: RewardTransaction[] = [];
  private static coupons: Coupon[] = [];
  
  static addRewardTransaction(transaction: RewardTransaction) {
    this.transactions.push(transaction);
  }
  
  static getUserTransactions(userId: string): RewardTransaction[] {
    return this.transactions
      .filter(t => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  
  static addCoupon(coupon: Coupon) {
    this.coupons.push(coupon);
  }
  
  static getUserCoupons(userId: string): Coupon[] {
    return this.coupons
      .filter(c => c.user_id === userId && !c.is_used)
      .filter(c => new Date(c.expires_at) > new Date())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  
  static useCoupon(couponId: string): boolean {
    const coupon = this.coupons.find(c => c.id === couponId);
    if (coupon && !coupon.is_used) {
      coupon.is_used = true;
      coupon.used_at = new Date().toISOString();
      return true;
    }
    return false;
  }
  
  static redeemPoints(
    userId: string,
    option: RedemptionOption,
    currentPoints: number,
    userProfile?: any
  ): { success: boolean; message: string; coupon?: Coupon } {
    if (currentPoints < option.points_required) {
      return {
        success: false,
        message: `Insufficient points. You need ${option.points_required} points.`,
      };
    }
    
    // Create transaction
    const transaction: RewardTransaction = {
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      type: 'redeem',
      points: -option.points_required,
      description: `Redeemed: ${option.title}`,
      created_at: new Date().toISOString(),
    };
    
    if (option.type === 'cashback') {
      transaction.cashback = option.value;
      // Add cashback to user's wallet balance if profile is provided
      if (userProfile && 'wallet_balance' in userProfile) {
        userProfile.wallet_balance += option.value;
      }
    }
    
    this.addRewardTransaction(transaction);
    
    // Generate coupon if applicable
    if (option.type === 'free_ride' || option.type === 'discount_coupon') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 60); // 60 days validity
      
      const coupon: Coupon = {
        id: `coupon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        code: generateCouponCode(),
        discount_type: option.type === 'free_ride' ? 'free_ride' : 'percentage',
        discount_value: option.value,
        min_ride_value: option.type === 'free_ride' ? undefined : 5,
        expires_at: expiresAt.toISOString(),
        is_used: false,
        created_at: new Date().toISOString(),
      };
      
      this.addCoupon(coupon);
      
      return {
        success: true,
        message: `Successfully redeemed ${option.title}!`,
        coupon,
      };
    }
    
    return {
      success: true,
      message: `Successfully redeemed ${option.title}! ₹${option.value} has been added to your wallet.`,
    };
  }
  
  static calculateCouponDiscount(coupon: Coupon, ridePrice: number): number {
    if (coupon.discount_type === 'free_ride') {
      return Math.min(ridePrice, coupon.discount_value);
    } else if (coupon.discount_type === 'percentage') {
      return (ridePrice * coupon.discount_value) / 100;
    } else {
      return Math.min(ridePrice, coupon.discount_value);
    }
  }
}


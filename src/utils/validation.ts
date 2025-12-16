/**
 * Form Validation Utilities
 * Provides validation for user inputs across the application
 */

import {
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  isValidCoordinate,
  isValidPrice,
  isValidSeatCount,
  isValidFutureDate,
  hasSuspiciousPattern
} from './security';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Validate ride creation input
export const validateRideCreation = (data: {
  origin: string;
  destination: string;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  departureTime: string;
  seats: number;
  price: number;
}): ValidationResult => {
  const errors: string[] = [];

  // Origin validation
  if (!data.origin || data.origin.trim().length < 3) {
    errors.push('Origin must be at least 3 characters');
  }
  if (data.origin && data.origin.length > 200) {
    errors.push('Origin address is too long');
  }
  if (data.origin && hasSuspiciousPattern(data.origin)) {
    errors.push('Origin contains invalid characters');
  }

  // Destination validation
  if (!data.destination || data.destination.trim().length < 3) {
    errors.push('Destination must be at least 3 characters');
  }
  if (data.destination && data.destination.length > 200) {
    errors.push('Destination address is too long');
  }
  if (data.destination && hasSuspiciousPattern(data.destination)) {
    errors.push('Destination contains invalid characters');
  }

  // Coordinates validation
  if (!isValidCoordinate(data.originLat, data.originLng)) {
    errors.push('Invalid origin coordinates');
  }
  if (!isValidCoordinate(data.destLat, data.destLng)) {
    errors.push('Invalid destination coordinates');
  }

  // Departure time validation
  if (!isValidFutureDate(data.departureTime)) {
    errors.push('Departure time must be in the future');
  }

  // Seats validation
  if (!isValidSeatCount(data.seats)) {
    errors.push('Number of seats must be between 1 and 20');
  }

  // Price validation
  if (!isValidPrice(data.price)) {
    errors.push('Price must be between 0 and 10000');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate ride search input
export const validateRideSearch = (data: {
  origin: string;
  destination: string;
  departureTime?: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!data.origin || data.origin.trim().length < 2) {
    errors.push('Please enter a pickup location');
  }
  if (data.origin && hasSuspiciousPattern(data.origin)) {
    errors.push('Pickup location contains invalid characters');
  }

  if (!data.destination || data.destination.trim().length < 2) {
    errors.push('Please enter a destination');
  }
  if (data.destination && hasSuspiciousPattern(data.destination)) {
    errors.push('Destination contains invalid characters');
  }

  if (data.departureTime && !isValidFutureDate(data.departureTime)) {
    errors.push('Departure time must be in the future');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate profile update
export const validateProfileUpdate = (data: {
  fullName?: string;
  email?: string;
  phone?: string;
  vehicleModel?: string;
  vehicleCapacity?: number;
}): ValidationResult => {
  const errors: string[] = [];

  if (data.fullName !== undefined) {
    if (data.fullName.length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    if (data.fullName.length > 100) {
      errors.push('Name is too long');
    }
    if (hasSuspiciousPattern(data.fullName)) {
      errors.push('Name contains invalid characters');
    }
  }

  if (data.email !== undefined && !isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (data.phone !== undefined && !isValidPhone(data.phone)) {
    errors.push('Invalid phone number format');
  }

  if (data.vehicleModel !== undefined) {
    if (data.vehicleModel.length > 100) {
      errors.push('Vehicle model is too long');
    }
    if (hasSuspiciousPattern(data.vehicleModel)) {
      errors.push('Vehicle model contains invalid characters');
    }
  }

  if (data.vehicleCapacity !== undefined && !isValidSeatCount(data.vehicleCapacity)) {
    errors.push('Vehicle capacity must be between 1 and 20');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate coupon code
export const validateCouponCode = (code: string): ValidationResult => {
  const errors: string[] = [];

  if (!code || code.trim().length === 0) {
    errors.push('Please enter a coupon code');
  }

  if (code && (code.length < 3 || code.length > 20)) {
    errors.push('Invalid coupon code format');
  }

  if (code && hasSuspiciousPattern(code)) {
    errors.push('Coupon code contains invalid characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validate review/rating
export const validateReview = (data: {
  rating: number;
  review?: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
    errors.push('Rating must be between 1 and 5');
  }

  if (data.review !== undefined) {
    if (data.review.length > 500) {
      errors.push('Review is too long (max 500 characters)');
    }
    if (hasSuspiciousPattern(data.review)) {
      errors.push('Review contains invalid characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitize all form inputs
export const sanitizeFormData = <T extends Record<string, any>>(data: T): T => {
  const sanitized = { ...data };

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]) as any;
    }
  }

  return sanitized;
};


/**
 * Security Utilities
 * Provides input sanitization, validation, and security helpers
 */

// Input Sanitization
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove potentially dangerous characters and scripts
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .slice(0, 500); // Limit length to prevent DoS
};

// Email Validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Phone Number Validation
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s()-]{10,20}$/;
  return phoneRegex.test(phone);
};

// Coordinate Validation
export const isValidCoordinate = (lat: number, lng: number): boolean => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
};

// Price Validation
export const isValidPrice = (price: number): boolean => {
  return (
    typeof price === 'number' &&
    price >= 0 &&
    price <= 10000 && // Max reasonable price
    !isNaN(price) &&
    Number.isFinite(price)
  );
};

// Seat Count Validation
export const isValidSeatCount = (seats: number): boolean => {
  return (
    typeof seats === 'number' &&
    Number.isInteger(seats) &&
    seats >= 1 &&
    seats <= 20 && // Max reasonable seats
    !isNaN(seats)
  );
};

// Date Validation (future dates only for ride booking)
export const isValidFutureDate = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    return date > now && date < new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // Within 1 year
  } catch {
    return false;
  }
};

// SQL Injection Prevention (for future database queries)
export const sanitizeSQLInput = (input: string): string => {
  if (!input) return '';
  
  // Remove SQL keywords and dangerous characters
  return input
    .replace(/['";\\]/g, '') // Remove quotes and backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comments
    .replace(/\*\//g, '')
    .trim()
    .slice(0, 500);
};

// XSS Prevention - Escape HTML
export const escapeHTML = (str: string): string => {
  if (!str) return '';
  
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return str.replace(/[&<>"'/]/g, (char) => map[char]);
};

// Rate Limiting Helper (track attempts)
interface RateLimitEntry {
  count: number;
  timestamp: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export const checkRateLimit = (
  identifier: string,
  maxAttempts: number = 10,
  windowMs: number = 60000 // 1 minute
): boolean => {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  if (!entry || now - entry.timestamp > windowMs) {
    rateLimitStore.set(identifier, { count: 1, timestamp: now });
    return true;
  }
  
  if (entry.count >= maxAttempts) {
    return false;
  }
  
  entry.count++;
  return true;
};

// Clean up old rate limit entries
export const cleanupRateLimitStore = () => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.timestamp > 60000) {
      rateLimitStore.delete(key);
    }
  }
};

// Validate Object Structure (prevent prototype pollution)
export const isValidObject = (obj: any): boolean => {
  if (!obj || typeof obj !== 'object') return false;
  
  // Check for prototype pollution attempts
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  const keys = Object.keys(obj);
  
  return !keys.some(key => dangerousKeys.includes(key.toLowerCase()));
};

// Generate secure random ID
export const generateSecureId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  
  return `${prefix}${timestamp}${randomPart}${randomPart2}`;
};

// Validate coupon code format
export const isValidCouponCode = (code: string): boolean => {
  // Format: WAY followed by 8 alphanumeric characters
  const couponRegex = /^WAY[A-Z0-9]{8}$/;
  return couponRegex.test(code);
};

// Content Security Policy Helper
export const getCSPDirectives = (): string => {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // Note: In production, use nonces instead of unsafe-inline
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https://*.openstreetmap.org https://unpkg.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co https://nominatim.openstreetmap.org https://router.project-osrm.org",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
};

// Validate file upload (for future profile pictures)
export const isValidFileType = (filename: string, allowedTypes: string[]): boolean => {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
};

export const isValidFileSize = (size: number, maxSizeMB: number = 5): boolean => {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return size > 0 && size <= maxBytes;
};

// Prevent timing attacks for string comparison
export const secureCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};

// Validate and sanitize location data
export const sanitizeLocation = (location: any): { lat: number; lng: number; address: string } | null => {
  if (!location || typeof location !== 'object') return null;
  
  const lat = parseFloat(location.lat);
  const lng = parseFloat(location.lng);
  const address = sanitizeInput(location.address || '');
  
  if (!isValidCoordinate(lat, lng) || !address) return null;
  
  return { lat, lng, address };
};

// Check for suspicious patterns in input
export const hasSuspiciousPattern = (input: string): boolean => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /eval\(/i,
    /expression\(/i,
    /vbscript:/i,
    /data:text\/html/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
};

// Audit logging helper
export interface AuditLog {
  timestamp: string;
  action: string;
  userId?: string;
  details: any;
  ipAddress?: string;
}

const auditLogs: AuditLog[] = [];

export const logSecurityEvent = (
  action: string,
  userId?: string,
  details?: any
): void => {
  auditLogs.push({
    timestamp: new Date().toISOString(),
    action,
    userId,
    details,
  });
  
  // In production, send to secure logging service
  if (process.env.NODE_ENV === 'production') {
    console.warn(`SECURITY EVENT: ${action}`, { userId, details });
  }
};

export const getAuditLogs = (): AuditLog[] => {
  return [...auditLogs];
};

// Session timeout helper
export const isSessionExpired = (lastActivity: number, timeoutMs: number = 30 * 60 * 1000): boolean => {
  return Date.now() - lastActivity > timeoutMs;
};

// Cleanup expired sessions
setInterval(cleanupRateLimitStore, 60000); // Cleanup every minute


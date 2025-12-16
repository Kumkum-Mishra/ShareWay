import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Profile } from '../types';
import { mockProfiles, setCurrentUser, getCurrentUser } from '../services/mockData';
import { isValidEmail, sanitizeInput, checkRateLimit, logSecurityEvent, isSessionExpired } from '../utils/security';
import { ProfileDB } from '../services/database';

interface AuthContextType {
  user: Profile | null;
  login: (email: string, role: 'passenger' | 'driver') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  lastActivity: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const MAX_LOGIN_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 60000; // 1 minute

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Session validation
  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      setLastActivity(Date.now());
    }
  }, []);

  // Auto logout on session expiry
  useEffect(() => {
    const interval = setInterval(() => {
      if (user && isSessionExpired(lastActivity, SESSION_TIMEOUT)) {
        logSecurityEvent('session_expired', user.id);
        logout();
        alert('Your session has expired. Please login again.');
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, lastActivity]);

  // Update activity timestamp
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Track user activity
  useEffect(() => {
    if (user) {
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      events.forEach(event => {
        window.addEventListener(event, updateActivity);
      });

      return () => {
        events.forEach(event => {
          window.removeEventListener(event, updateActivity);
        });
      };
    }
  }, [user, updateActivity]);

  const login = async (email: string, role: 'passenger' | 'driver') => {
    // Input validation
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    
    if (!isValidEmail(sanitizedEmail)) {
      logSecurityEvent('invalid_login_attempt', undefined, { email: sanitizedEmail });
      throw new Error('Invalid email format');
    }

    // Rate limiting
    if (!checkRateLimit(`login:${sanitizedEmail}`, MAX_LOGIN_ATTEMPTS, RATE_LIMIT_WINDOW)) {
      logSecurityEvent('rate_limit_exceeded', undefined, { email: sanitizedEmail });
      throw new Error('Too many login attempts. Please try again later.');
    }

    // Check if using database
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const isUsingDatabase = supabaseUrl && !supabaseUrl.includes('placeholder');

    let foundUser: Profile | null = null;

    // Try database first, then fall back to mock data
    if (isUsingDatabase) {
      console.log('💾 Trying to login with database...');
      try {
        foundUser = await ProfileDB.getByEmail(sanitizedEmail);
        console.log('Database lookup result:', foundUser);
        
        // Verify role matches
        if (foundUser && foundUser.role !== role) {
          logSecurityEvent('login_failed', undefined, { email: sanitizedEmail, role, reason: 'role_mismatch' });
          throw new Error(`This email is registered as ${foundUser.role}, not ${role}`);
        }
      } catch (err) {
        console.warn('⚠️ Database login failed, trying mock data:', err);
        foundUser = null;
      }
    }
    
    // Fallback to mock data if database didn't find user
    if (!foundUser) {
      console.log('📝 Trying mock data login...');
      foundUser = mockProfiles.find(p => p.email === sanitizedEmail && p.role === role) || null;
      if (foundUser) {
        console.log('✅ Found user in mock data');
      }
    }
    
    if (foundUser) {
      console.log('✅ Login successful:', foundUser.email, 'Role:', foundUser.role);
      setUser(foundUser);
      setCurrentUser(foundUser);
      setLastActivity(Date.now());
      logSecurityEvent('login_success', foundUser.id);
    } else {
      console.error('❌ User not found in database OR mock data');
      console.log('Searched for:', sanitizedEmail, 'with role:', role);
      console.log('Mock profiles count:', mockProfiles.length);
      logSecurityEvent('login_failed', undefined, { email: sanitizedEmail, role });
      throw new Error('User not found. Please check your email and role.');
    }
  };

  const logout = () => {
    if (user) {
      logSecurityEvent('logout', user.id);
    }
    setUser(null);
    setCurrentUser(null);
    setLastActivity(Date.now());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        lastActivity
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

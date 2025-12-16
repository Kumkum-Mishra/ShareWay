import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import RoleSelection from './components/RoleSelection';
import CompleteSignup, { SignupData } from './components/CompleteSignup';
import AadhaarVerification from './components/AadhaarVerification';
import Login from './components/Login';
import PassengerDashboard from './components/PassengerDashboard';
import DriverDashboard from './components/DriverDashboard';
import DashboardTutorial from './components/DashboardTutorial';
import { mockProfiles } from './services/mockData';
import { generateSecureId } from './utils/security';
import { ProfileDB } from './services/database';

type AppScreen = 'landing' | 'roleSelection' | 'signup' | 'aadhaar' | 'tutorial' | 'login' | 'dashboard';

function AppContent() {
  const { user, isAuthenticated, login } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('landing');
  const [selectedRole, setSelectedRole] = useState<'passenger' | 'driver'>('passenger');
  const [newUserEmail, setNewUserEmail] = useState<string>('');
  const [pendingSignupData, setPendingSignupData] = useState<SignupData | null>(null);

  // Show landing page if not authenticated
  if (!isAuthenticated || !user) {
    if (currentScreen === 'landing') {
      return (
        <LandingPage
          onGetStarted={() => {
            console.log('Get Started clicked - navigating to role selection');
            setCurrentScreen('roleSelection');
          }}
          onLogin={() => {
            console.log('Login clicked - navigating to login');
            setCurrentScreen('login');
          }}
        />
      );
    }

    if (currentScreen === 'roleSelection') {
      console.log('Rendering RoleSelection page');
      return (
        <RoleSelection
          onBack={() => {
            console.log('Back to landing from role selection');
            setCurrentScreen('landing');
          }}
          onSelectRole={(role) => {
            console.log('Role selected:', role);
            setSelectedRole(role);
            setCurrentScreen('signup');
          }}
        />
      );
    }

    if (currentScreen === 'signup') {
      console.log('Rendering CompleteSignup page for role:', selectedRole);
      return (
        <CompleteSignup
          role={selectedRole}
          onBack={() => {
            console.log('Back to role selection from signup');
            setCurrentScreen('roleSelection');
          }}
          onComplete={(userData: SignupData) => {
            console.log('Sign up complete, starting Aadhaar verification:', userData);
            
            // Store signup data
            setPendingSignupData(userData);
            setNewUserEmail(userData.email);
            
            // Show Aadhaar verification
            setCurrentScreen('aadhaar');
          }}
          onContinueToTutorial={() => {
            // After scratch card, show tutorial
            console.log('Navigating to tutorial after scratch card');
            setCurrentScreen('tutorial');
          }}
        />
      );
    }

    if (currentScreen === 'aadhaar') {
      return (
        <AadhaarVerification
          role={selectedRole}
          gender={pendingSignupData?.gender}
          fullName={pendingSignupData?.fullName}
          onVerified={async (data) => {
            console.log('Aadhaar verified, creating user account');
            
            if (!pendingSignupData) return;
            
            // Check if using database
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const isUsingDatabase = supabaseUrl && !supabaseUrl.includes('placeholder');

            if (isUsingDatabase) {
              console.log('💾 Attempting to create user in Supabase database...');
              
              try {
                const newUser = await ProfileDB.create({
                  email: pendingSignupData.email,
                  full_name: pendingSignupData.fullName,
                  role: selectedRole,
                  phone: pendingSignupData.phone,
                  vehicle_type: pendingSignupData.vehicleType,
                  vehicle_model: pendingSignupData.vehicleModel,
                  vehicle_capacity: pendingSignupData.vehicleCapacity || 4,
                  preferences: pendingSignupData.preferences || {},
                  total_rides_offered: 0,
                  total_rides_taken: 0,
                  rating: 5.0,
                  total_co2_saved: 0,
                  reward_points: 1000,
                  wallet_balance: 0,
                  aadhaar_verified: data.verified,
                  aadhaar_match_score: data.matchScore
                });

                if (newUser) {
                  console.log('✅ User created in database with ID:', newUser.id);
                  setNewUserEmail(newUser.email);
                } else {
                  console.warn('⚠️ Database creation failed, falling back to mock data');
                  // Fallback to mock data
                  const mockUser = {
                    id: generateSecureId('user-'),
                    email: pendingSignupData.email,
                    full_name: pendingSignupData.fullName,
                    role: selectedRole,
                    phone: pendingSignupData.phone,
                    vehicle_type: pendingSignupData.vehicleType,
                    vehicle_capacity: pendingSignupData.vehicleCapacity || 0,
                    vehicle_model: pendingSignupData.vehicleModel,
                    preferences: pendingSignupData.preferences,
                    total_rides_offered: 0,
                    total_rides_taken: 0,
                    rating: 5.0,
                    total_co2_saved: 0,
                    reward_points: 1000,
                    wallet_balance: 0,
                    emergency_contacts: [],
                    created_at: new Date().toISOString(),
                    aadhaar_verified: data.verified,
                    aadhaar_match_score: data.matchScore
                  };
                  mockProfiles.push(mockUser);
                  setNewUserEmail(mockUser.email);
                }
              } catch (err) {
                console.error('❌ Exception during signup:', err);
                alert('Error creating account. Using offline mode.');
                // Fallback to mock data
                const mockUser = {
                  id: generateSecureId('user-'),
                  email: pendingSignupData.email,
                  full_name: pendingSignupData.fullName,
                  role: selectedRole,
                  phone: pendingSignupData.phone,
                  vehicle_type: pendingSignupData.vehicleType,
                  vehicle_capacity: pendingSignupData.vehicleCapacity || 0,
                  vehicle_model: pendingSignupData.vehicleModel,
                  preferences: pendingSignupData.preferences,
                  total_rides_offered: 0,
                  total_rides_taken: 0,
                  rating: 5.0,
                  total_co2_saved: 0,
                  reward_points: 1000,
                  wallet_balance: 0,
                  emergency_contacts: [],
                  created_at: new Date().toISOString(),
                  aadhaar_verified: data.verified,
                  aadhaar_match_score: data.matchScore
                };
                mockProfiles.push(mockUser);
                setNewUserEmail(mockUser.email);
              }
            } else {
              console.log('📝 Creating user in mock data...');
              
              const newUser = {
                id: generateSecureId('user-'),
                email: pendingSignupData.email,
                full_name: pendingSignupData.fullName,
                role: selectedRole,
                phone: pendingSignupData.phone,
                vehicle_type: pendingSignupData.vehicleType,
                vehicle_capacity: pendingSignupData.vehicleCapacity || 0,
                vehicle_model: pendingSignupData.vehicleModel,
                preferences: pendingSignupData.preferences,
                total_rides_offered: 0,
                total_rides_taken: 0,
                rating: 5.0,
                total_co2_saved: 0,
                reward_points: 1000,
                wallet_balance: 0,
                emergency_contacts: [],
                created_at: new Date().toISOString(),
                aadhaar_verified: data.verified,
                aadhaar_match_score: data.matchScore
              };

              mockProfiles.push(newUser);
            }
            
            // Show tutorial
            setCurrentScreen('tutorial');
          }}
          onSkip={async () => {
            console.log('Aadhaar skipped, creating user account');
            
            if (!pendingSignupData) return;
            
            // Check if using database
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const isUsingDatabase = supabaseUrl && !supabaseUrl.includes('placeholder');

            if (isUsingDatabase) {
              console.log('💾 Attempting to create user in Supabase database (Aadhaar skipped)...');
              
              try {
                const newUser = await ProfileDB.create({
                  email: pendingSignupData.email,
                  full_name: pendingSignupData.fullName,
                  role: selectedRole,
                  phone: pendingSignupData.phone,
                  vehicle_type: pendingSignupData.vehicleType,
                  vehicle_model: pendingSignupData.vehicleModel,
                  vehicle_capacity: pendingSignupData.vehicleCapacity || 4,
                  preferences: pendingSignupData.preferences || {},
                  total_rides_offered: 0,
                  total_rides_taken: 0,
                  rating: 5.0,
                  total_co2_saved: 0,
                  reward_points: 1000,
                  wallet_balance: 0,
                  aadhaar_verified: false,
                  aadhaar_match_score: 0
                });

                if (newUser) {
                  console.log('✅ User created in database with ID:', newUser.id);
                  setNewUserEmail(newUser.email);
                } else {
                  console.warn('⚠️ Database creation failed, falling back to mock data');
                  // Fallback to mock data
                  const mockUser = {
                    id: generateSecureId('user-'),
                    email: pendingSignupData.email,
                    full_name: pendingSignupData.fullName,
                    role: selectedRole,
                    phone: pendingSignupData.phone,
                    vehicle_type: pendingSignupData.vehicleType,
                    vehicle_capacity: pendingSignupData.vehicleCapacity || 0,
                    vehicle_model: pendingSignupData.vehicleModel,
                    preferences: pendingSignupData.preferences,
                    total_rides_offered: 0,
                    total_rides_taken: 0,
                    rating: 5.0,
                    total_co2_saved: 0,
                    reward_points: 1000,
                    wallet_balance: 0,
                    emergency_contacts: [],
                    created_at: new Date().toISOString(),
                    aadhaar_verified: false,
                    aadhaar_match_score: 0
                  };
                  mockProfiles.push(mockUser);
                  setNewUserEmail(mockUser.email);
                }
              } catch (err) {
                console.error('❌ Exception during signup:', err);
                alert('Error creating account. Using offline mode.');
                // Fallback to mock data
                const mockUser = {
                  id: generateSecureId('user-'),
                  email: pendingSignupData.email,
                  full_name: pendingSignupData.fullName,
                  role: selectedRole,
                  phone: pendingSignupData.phone,
                  vehicle_type: pendingSignupData.vehicleType,
                  vehicle_capacity: pendingSignupData.vehicleCapacity || 0,
                  vehicle_model: pendingSignupData.vehicleModel,
                  preferences: pendingSignupData.preferences,
                  total_rides_offered: 0,
                  total_rides_taken: 0,
                  rating: 5.0,
                  total_co2_saved: 0,
                  reward_points: 1000,
                  wallet_balance: 0,
                  emergency_contacts: [],
                  created_at: new Date().toISOString(),
                  aadhaar_verified: false,
                  aadhaar_match_score: 0
                };
                mockProfiles.push(mockUser);
                setNewUserEmail(mockUser.email);
              }
            } else {
              console.log('📝 Creating user in mock data...');
              
              const newUser = {
                id: generateSecureId('user-'),
                email: pendingSignupData.email,
                full_name: pendingSignupData.fullName,
                role: selectedRole,
                phone: pendingSignupData.phone,
                vehicle_type: pendingSignupData.vehicleType,
                vehicle_capacity: pendingSignupData.vehicleCapacity || 0,
                vehicle_model: pendingSignupData.vehicleModel,
                preferences: pendingSignupData.preferences,
                total_rides_offered: 0,
                total_rides_taken: 0,
                rating: 5.0,
                total_co2_saved: 0,
                reward_points: 1000,
                wallet_balance: 0,
                emergency_contacts: [],
                created_at: new Date().toISOString(),
                aadhaar_verified: false,
                aadhaar_match_score: 0
              };

              mockProfiles.push(newUser);
            }
            
            // Show tutorial
            setCurrentScreen('tutorial');
          }}
        />
      );
    }

    if (currentScreen === 'tutorial') {
      return (
        <DashboardTutorial
          role={selectedRole}
          onComplete={() => {
            console.log('Tutorial completed, logging in user');
            // Auto-login the new user after tutorial
            login(newUserEmail, selectedRole).then(() => {
              console.log('Auto-login successful');
              setCurrentScreen('dashboard');
            }).catch((err) => {
              console.error('Auto-login failed:', err);
              alert('Account created successfully! Please login.');
              setCurrentScreen('login');
            });
          }}
        />
      );
    }

    if (currentScreen === 'login') {
      return <Login onBack={() => setCurrentScreen('landing')} />;
    }
  }

  // User is authenticated, show appropriate dashboard
  if (user) {
  if (user.role === 'passenger') {
    return <PassengerDashboard />;
  } else {
    return <DriverDashboard />;
  }
  }

  // Fallback (should never reach here)
  return <LandingPage onGetStarted={() => setCurrentScreen('signup')} onLogin={() => setCurrentScreen('login')} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

# ShareWay - Intelligent Carpooling System Architecture

## Overview

**ShareWay** is an AI-powered carpooling platform designed to reduce traffic congestion and lower emissions, directly contributing to **SDG 11: Sustainable Cities and Communities**. The application uses intelligent algorithms for ride matching, route optimization, sustainability tracking, and comprehensive safety features.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                          │
│  (React + TypeScript + Tailwind CSS)                        │
├─────────────────────────────────────────────────────────────┤
│  - Authentication (Login/Logout)                             │
│  - Dashboard (Find Rides, My Rides, Impact, Profile)       │
│  - Ride Management (Create, Search, Join)                   │
│  - Impact Visualization (Charts, Metrics)                   │
│  - Gamification (Rewards, Leaderboard)                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│                  (Services & Algorithms)                     │
├─────────────────────────────────────────────────────────────┤
│  AI Ride Matching Engine:                                   │
│  - Route similarity calculation (Haversine formula)         │
│  - Timing compatibility scoring                             │
│  - Detour cost analysis                                     │
│  - Distance-based ranking                                   │
│  - Multi-factor weighted scoring                            │
│                                                              │
│  Route Optimization:                                         │
│  - Nearest neighbor algorithm for waypoints                 │
│  - Distance calculations                                    │
│  - CO₂ and fuel savings estimation                         │
│                                                              │
│  Impact Calculation:                                         │
│  - Real-time CO₂ tracking                                   │
│  - Aggregated metrics computation                           │
│  - Trend analysis                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│            (Supabase PostgreSQL + Mock Data)                │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                     │
│  - profiles (user accounts & vehicles)                      │
│  - rides (ride offerings)                                   │
│  - ride_participants (carpoolers)                           │
│  - impact_metrics (sustainability data)                     │
│  - rewards (gamification points)                            │
│                                                              │
│  Security:                                                   │
│  - Row Level Security (RLS) policies                        │
│  - Authentication-based access control                      │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Authentication System
- **Location**: `src/contexts/AuthContext.tsx`
- **Features**:
  - Simple email-based authentication
  - User session management
  - Profile data integration
- **Demo Users**:
  - sarah.johnson@example.com
  - michael.chen@example.com
  - emma.wilson@example.com

### 2. AI Ride-Matching Algorithm
- **Location**: `src/services/rideMatching.ts`
- **Algorithm**: Multi-factor weighted scoring system

#### Matching Factors:
1. **Route Similarity (40% weight)**
   - Calculates distance between user origin/destination and ride origin/destination
   - Uses Haversine formula for accurate geographic distance
   - Rejects matches with >30% detour from direct route

2. **Timing Score (30% weight)**
   - Compares departure times
   - Allows 30-minute flexibility window
   - Linear decay for time differences

3. **Distance Score (20% weight)**
   - Measures proximity to pickup point
   - Maximum acceptable distance: 5km
   - Prioritizes nearby pickups

4. **Detour Cost (10% weight)**
   - Calculates additional distance for driver
   - Minimizes impact on driver's route
   - Ensures efficient carpooling

#### Match Quality Thresholds:
- **Excellent (≥80%)**: Near-perfect route and timing alignment
- **Good (≥60%)**: Strong route match with minor timing differences
- **Fair (≥40%)**: Acceptable match with some detour
- **Minimum (≥30%)**: Threshold for displaying match

### 3. Route Optimization System
- **Algorithm**: Greedy nearest-neighbor approach
- **Features**:
  - Optimizes waypoint order to minimize total distance
  - Calculates CO₂ savings based on avoided individual trips
  - Estimates fuel savings using average consumption rates

#### Calculations:
- **CO₂ per km per car**: 0.21 kg
- **Fuel consumption**: 8L per 100km average
- **Cost savings**: Based on fuel price and distance

### 4. Impact Dashboard
- **Location**: `src/components/ImpactDashboard.tsx`
- **Metrics Tracked**:
  - Total CO₂ saved (kg)
  - Total rides completed
  - Total carpoolers
  - Fuel savings (liters)
  - Cost savings (currency)
  - Average vehicle occupancy
  - Distance shared (km)

- **Visualizations**:
  - Time-series charts for CO₂ trends
  - Comparative week-over-week statistics
  - Progress bars with gradient styling
  - SDG 11 impact explanation

### 5. Gamification System
- **Features**:
  - Reward points for completed rides
  - Milestone bonuses (50 rides, 100 rides, etc.)
  - Capacity bonuses (full vehicle rewards)
  - Leaderboard display
  - Point redemption system (future enhancement)

#### Point Structure:
- Base ride completion: 50 points
- Milestone achievements: 100+ points
- Full capacity bonus: 75 points
- Consistent user bonus: Variable

## Database Schema

### profiles
```sql
id (uuid, PK) → auth.users.id
email (text)
full_name (text)
phone (text)
vehicle_type (text)
vehicle_capacity (integer)
vehicle_model (text)
preferences (jsonb)
total_rides_offered (integer)
total_rides_taken (integer)
rating (numeric)
total_co2_saved (numeric)
reward_points (integer)
created_at (timestamptz)
```

### rides
```sql
id (uuid, PK)
driver_id (uuid, FK → profiles)
origin, destination (text)
origin_lat, origin_lng (numeric)
dest_lat, dest_lng (numeric)
departure_time (timestamptz)
available_seats (integer)
status (text: pending/active/completed/cancelled)
route_data (jsonb)
estimated_duration (integer, minutes)
estimated_distance (numeric, km)
estimated_co2_saved (numeric, kg)
price_per_seat (numeric)
created_at, updated_at (timestamptz)
```

### ride_participants
```sql
id (uuid, PK)
ride_id (uuid, FK → rides)
passenger_id (uuid, FK → profiles)
pickup_location, dropoff_location (text)
pickup_lat, pickup_lng (numeric)
dropoff_lat, dropoff_lng (numeric)
status (text: requested/confirmed/picked_up/completed/cancelled)
rating_given (integer, 1-5)
review (text)
co2_saved (numeric, kg)
joined_at, completed_at (timestamptz)
```

### impact_metrics
```sql
id (uuid, PK)
date (date, unique)
total_rides (integer)
total_participants (integer)
total_co2_saved (numeric, kg)
total_distance_shared (numeric, km)
average_occupancy (numeric)
fuel_saved_liters (numeric)
cost_saved (numeric)
created_at (timestamptz)
```

### rewards
```sql
id (uuid, PK)
user_id (uuid, FK → profiles)
points (integer)
reason (text)
type (text: ride_completed/milestone/bonus/redemption)
metadata (jsonb)
created_at (timestamptz)
```

## Security Model

### Row Level Security Policies

1. **Profiles**
   - Users can view all profiles (for driver info)
   - Users can only insert/update own profile

2. **Rides**
   - Authenticated users can view pending/active rides
   - Drivers can view their own rides in any status
   - Only drivers can update their own rides

3. **Ride Participants**
   - Participants can view their rides
   - Drivers can view participants in their rides
   - Participants can update their own status
   - Drivers can update participant status in their rides

4. **Impact Metrics**
   - Public read access for transparency

5. **Rewards**
   - Users can only view own rewards

## API Endpoints (Conceptual)

```
Authentication:
POST   /auth/login
POST   /auth/logout
GET    /auth/profile

Rides:
GET    /rides              - Search available rides
POST   /rides              - Create new ride
GET    /rides/:id          - Get ride details
PATCH  /rides/:id          - Update ride
DELETE /rides/:id          - Cancel ride

Participants:
POST   /rides/:id/join     - Join a ride
PATCH  /participants/:id   - Update participant status
POST   /participants/:id/rate - Rate completed ride

Matching:
POST   /match              - AI-powered ride matching
POST   /optimize-route     - Route optimization

Impact:
GET    /impact/user/:id    - User impact metrics
GET    /impact/global      - Global impact data
GET    /impact/trends      - Historical trends

Rewards:
GET    /rewards/:userId    - User rewards history
POST   /rewards/redeem     - Redeem points
GET    /leaderboard        - Top users by points
```

## Technology Stack

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **Vite**: Build tool and dev server

### Backend (Conceptual)
- **Supabase**: Database and authentication
- **PostgreSQL**: Relational database
- **PostGIS**: Spatial data extensions (future)

### Algorithms
- **Haversine Formula**: Geographic distance calculation
- **Nearest Neighbor**: Route optimization
- **Weighted Scoring**: Multi-factor matching

## Sustainability Impact

### SDG 11 Contribution

**Target 11.2**: "Provide access to safe, affordable, accessible and sustainable transport systems for all"

Our platform contributes by:
1. **Reducing Congestion**: Fewer vehicles on roads
2. **Lowering Emissions**: Shared trips reduce per-capita CO₂
3. **Cost Efficiency**: Shared fuel costs make transport affordable
4. **Community Building**: Connects people through shared mobility
5. **Data Transparency**: Public impact metrics encourage participation

### Environmental Calculations

**CO₂ Savings Formula**:
```
CO₂ saved = distance (km) × passengers × 0.21 kg/km
```

**Fuel Savings Formula**:
```
Fuel saved = (distance / 100) × passengers × 8 L/100km
```

**Cost Savings Formula**:
```
Cost saved = fuel_saved × fuel_price_per_liter
```

## Future Enhancements

1. **Real-time Tracking**: GPS integration for live ride tracking
2. **Google Maps Integration**: Actual route data and traffic info
3. **Machine Learning**: Predictive matching based on user patterns
4. **Chat System**: In-app communication between drivers and passengers
5. **Payment Integration**: Automated cost splitting
6. **Carbon Credits**: Blockchain-based carbon offset tokens
7. **Route Predictions**: ML-based traffic avoidance
8. **Social Features**: User ratings, reviews, and trust scores
9. **Corporate Partnerships**: Integration with employee commute programs
10. **Public Transit Integration**: Combine carpooling with public transport

## Performance Considerations

1. **Spatial Indexing**: Database indexes on lat/lng columns
2. **Caching**: Frequently accessed routes and metrics
3. **Lazy Loading**: Component-based code splitting
4. **Optimistic Updates**: Instant UI feedback
5. **Debounced Search**: Reduced API calls during typing
6. **Paginated Results**: Limit large result sets

## Deployment Architecture

```
User Browser
     ↓
CDN (Static Assets)
     ↓
React App (Client-side)
     ↓
Supabase API
     ↓
PostgreSQL Database
```

## Development Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Configure Supabase credentials in `.env`
4. Run migrations (future)
5. Start dev server: `npm run dev`
6. Build for production: `npm run build`

## Testing Strategy

1. **Unit Tests**: Algorithm correctness
2. **Integration Tests**: API endpoints
3. **E2E Tests**: User flows
4. **Performance Tests**: Load and stress testing
5. **Security Tests**: RLS policy validation

## Monitoring & Analytics

1. **User Metrics**: Active users, ride completion rates
2. **Environmental Impact**: CO₂ saved, trend analysis
3. **System Health**: API response times, error rates
4. **Business Metrics**: User growth, engagement rates

---

**Version**: 1.0.0
**Last Updated**: 2025-10-07
**Status**: MVP Complete

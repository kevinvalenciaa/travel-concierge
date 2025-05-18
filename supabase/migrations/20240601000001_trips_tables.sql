-- Create tables for trips, activities, and related data
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trip types enum
CREATE TYPE trip_status AS ENUM ('draft', 'planning', 'confirmed', 'completed', 'cancelled');
CREATE TYPE booking_status AS ENUM ('not_booked', 'pending', 'booked', 'completed', 'cancelled');
CREATE TYPE activity_icon AS ENUM ('hotel', 'food', 'attraction', 'sunset', 'entertainment', 'nightlife');

-- User trips table
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  image TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  dates TEXT, -- Human-readable date representation
  status trip_status NOT NULL DEFAULT 'draft',
  budget NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trip bookings table
CREATE TABLE trip_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  flight_status booking_status NOT NULL DEFAULT 'not_booked',
  hotel_status booking_status NOT NULL DEFAULT 'not_booked',
  flight_details JSONB, -- departure, arrival, from, to, duration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trip days table
CREATE TABLE trip_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (trip_id, day_number)
);

-- Trip activities table
CREATE TABLE trip_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_day_id UUID NOT NULL REFERENCES trip_days(id) ON DELETE CASCADE,
  time TEXT NOT NULL, -- using text for flexibility (e.g., "09:00")
  title TEXT NOT NULL,
  description TEXT,
  icon activity_icon NOT NULL DEFAULT 'attraction',
  price_range TEXT,
  order_index INTEGER NOT NULL,
  details JSONB, -- For additional details like address, phone, website, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_currency TEXT NOT NULL DEFAULT 'USD',
  preferred_trip_type TEXT,
  preferred_budget INTEGER,
  preferred_activities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add triggers for updated_at
CREATE TRIGGER update_trips_updated_at
BEFORE UPDATE ON trips
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_trip_bookings_updated_at
BEFORE UPDATE ON trip_bookings
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_trip_days_updated_at
BEFORE UPDATE ON trip_days
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_trip_activities_updated_at
BEFORE UPDATE ON trip_activities
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Row level security policies
-- Enable RLS on all tables
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Trips policies
CREATE POLICY "Users can view only their own trips"
ON trips FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trips"
ON trips FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update only their own trips"
ON trips FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete only their own trips"
ON trips FOR DELETE
USING (auth.uid() = user_id);

-- Trip bookings policies
CREATE POLICY "Users can view only their own trip bookings"
ON trip_bookings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM trips
  WHERE trips.id = trip_bookings.trip_id
  AND trips.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own trip bookings"
ON trip_bookings FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM trips
  WHERE trips.id = trip_bookings.trip_id
  AND trips.user_id = auth.uid()
));

CREATE POLICY "Users can update only their own trip bookings"
ON trip_bookings FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM trips
  WHERE trips.id = trip_bookings.trip_id
  AND trips.user_id = auth.uid()
));

CREATE POLICY "Users can delete only their own trip bookings"
ON trip_bookings FOR DELETE
USING (EXISTS (
  SELECT 1 FROM trips
  WHERE trips.id = trip_bookings.trip_id
  AND trips.user_id = auth.uid()
));

-- Trip days policies
CREATE POLICY "Users can view only their own trip days"
ON trip_days FOR SELECT
USING (EXISTS (
  SELECT 1 FROM trips
  WHERE trips.id = trip_days.trip_id
  AND trips.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own trip days"
ON trip_days FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM trips
  WHERE trips.id = trip_days.trip_id
  AND trips.user_id = auth.uid()
));

CREATE POLICY "Users can update only their own trip days"
ON trip_days FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM trips
  WHERE trips.id = trip_days.trip_id
  AND trips.user_id = auth.uid()
));

CREATE POLICY "Users can delete only their own trip days"
ON trip_days FOR DELETE
USING (EXISTS (
  SELECT 1 FROM trips
  WHERE trips.id = trip_days.trip_id
  AND trips.user_id = auth.uid()
));

-- Trip activities policies
CREATE POLICY "Users can view only their own trip activities"
ON trip_activities FOR SELECT
USING (EXISTS (
  SELECT 1 FROM trip_days
  JOIN trips ON trips.id = trip_days.trip_id
  WHERE trip_days.id = trip_activities.trip_day_id
  AND trips.user_id = auth.uid()
));

CREATE POLICY "Users can insert their own trip activities"
ON trip_activities FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM trip_days
  JOIN trips ON trips.id = trip_days.trip_id
  WHERE trip_days.id = trip_activities.trip_day_id
  AND trips.user_id = auth.uid()
));

CREATE POLICY "Users can update only their own trip activities"
ON trip_activities FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM trip_days
  JOIN trips ON trips.id = trip_days.trip_id
  WHERE trip_days.id = trip_activities.trip_day_id
  AND trips.user_id = auth.uid()
));

CREATE POLICY "Users can delete only their own trip activities"
ON trip_activities FOR DELETE
USING (EXISTS (
  SELECT 1 FROM trip_days
  JOIN trips ON trips.id = trip_days.trip_id
  WHERE trip_days.id = trip_activities.trip_day_id
  AND trips.user_id = auth.uid()
));

-- User preferences policies
CREATE POLICY "Users can view only their own preferences"
ON user_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update only their own preferences"
ON user_preferences FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete only their own preferences"
ON user_preferences FOR DELETE
USING (auth.uid() = user_id); 
/*
  # User Authentication and Profile System

  1. New Tables
    - `profiles` - Extended user profile information
      - `id` (uuid, references auth.users)
      - `full_name` (text)
      - `avatar_url` (text, optional)
      - `skill_level` (text)
      - `game_preference` (text)
      - `search_radius` (integer, in miles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `user_stats` - User game statistics
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `games_played` (integer)
      - `games_won` (integer)
      - `total_points` (integer)
      - `total_assists` (integer)
      - `total_rebounds` (integer)
      - `average_rating` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `courts` - Basketball court information
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text) - Indoor/Outdoor
      - `address` (text)
      - `latitude` (decimal, optional)
      - `longitude` (decimal, optional)
      - `hoops` (integer)
      - `surface` (text)
      - `lighting` (boolean)
      - `amenities` (text array)
      - `rating` (decimal)
      - `hours_weekday` (text)
      - `hours_weekend` (text)
      - `popular_times` (text)
      - `created_at` (timestamp)

    - `games` - Basketball game sessions
      - `id` (uuid, primary key)
      - `court_id` (uuid, references courts)
      - `organizer_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `game_date` (date)
      - `game_time` (time)
      - `duration` (interval)
      - `max_players` (integer)
      - `current_players` (integer)
      - `skill_level` (text)
      - `game_type` (text)
      - `status` (text) - active, cancelled, completed
      - `created_at` (timestamp)

    - `game_participants` - Players registered for games
      - `id` (uuid, primary key)
      - `game_id` (uuid, references games)
      - `user_id` (uuid, references profiles)
      - `joined_at` (timestamp)
      - `status` (text) - registered, attended, no_show

    - `friendships` - User friend connections
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `friend_id` (uuid, references profiles)
      - `status` (text) - pending, accepted, blocked
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access where appropriate
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  avatar_url text,
  skill_level text DEFAULT 'Beginner' CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced')),
  game_preference text DEFAULT 'Pickup' CHECK (game_preference IN ('Pickup', 'Competitive', 'Practice', 'Tournament')),
  search_radius integer DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  games_played integer DEFAULT 0,
  games_won integer DEFAULT 0,
  total_points integer DEFAULT 0,
  total_assists integer DEFAULT 0,
  total_rebounds integer DEFAULT 0,
  average_rating decimal(3,2) DEFAULT 0.00,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create courts table
CREATE TABLE IF NOT EXISTS courts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text DEFAULT 'Outdoor' CHECK (type IN ('Indoor', 'Outdoor')),
  address text NOT NULL,
  latitude decimal(10,8),
  longitude decimal(11,8),
  hoops integer DEFAULT 2,
  surface text DEFAULT 'Concrete',
  lighting boolean DEFAULT false,
  amenities text[] DEFAULT '{}',
  rating decimal(3,2) DEFAULT 0.00,
  hours_weekday text DEFAULT '6:00 AM - 10:00 PM',
  hours_weekend text DEFAULT '7:00 AM - 9:00 PM',
  popular_times text DEFAULT 'Evenings',
  created_at timestamptz DEFAULT now()
);

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid REFERENCES courts(id) ON DELETE CASCADE,
  organizer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  game_date date NOT NULL,
  game_time time NOT NULL,
  duration interval DEFAULT '2 hours',
  max_players integer DEFAULT 10,
  current_players integer DEFAULT 0,
  skill_level text DEFAULT 'All Levels',
  game_type text DEFAULT 'Pickup' CHECK (game_type IN ('Pickup', 'Competitive', 'Practice', 'Tournament')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Create game_participants table
CREATE TABLE IF NOT EXISTS game_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  status text DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'no_show')),
  UNIQUE(game_id, user_id)
);

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- User stats policies
CREATE POLICY "Users can view all user stats"
  ON user_stats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Courts policies (public read, authenticated write)
CREATE POLICY "Anyone can view courts"
  ON courts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create courts"
  ON courts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Games policies
CREATE POLICY "Anyone can view active games"
  ON games FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Users can create games"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their games"
  ON games FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id);

-- Game participants policies
CREATE POLICY "Users can view game participants"
  ON game_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can join games"
  ON game_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave games"
  ON game_participants FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Friendships policies
CREATE POLICY "Users can view their friendships"
  ON friendships FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendships"
  ON friendships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their friendships"
  ON friendships FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  INSERT INTO public.user_stats (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  END IF;
END $$;

-- Insert sample courts data
INSERT INTO courts (name, type, address, hoops, surface, lighting, amenities, rating, hours_weekday, hours_weekend, popular_times) VALUES
('Central Park Basketball Court', 'Outdoor', '5th Ave & W 85th St', 4, 'Concrete', true, ARRAY['Water Fountain', 'Benches', 'Public Restrooms'], 4.5, '6:00 AM - 10:00 PM', '7:00 AM - 9:00 PM', 'Evenings & Weekends'),
('Downtown Recreation Center', 'Indoor', '125 Main Street', 6, 'Hardwood', true, ARRAY['Air Conditioning', 'Locker Rooms', 'Water Fountains', 'Bleachers'], 4.8, '5:30 AM - 11:00 PM', '7:00 AM - 10:00 PM', 'Afternoons'),
('Riverside Park Courts', 'Outdoor', 'Riverside Dr & W 76th St', 2, 'Asphalt', false, ARRAY['Benches', 'Street Parking'], 4.0, 'Dawn to Dusk', 'Dawn to Dusk', 'Mornings & Weekends'),
('East Side Community Center', 'Indoor', '230 East 56th Street', 4, 'Synthetic', true, ARRAY['Showers', 'Pro Shop', 'Cafe'], 4.6, '6:00 AM - 10:00 PM', '8:00 AM - 8:00 PM', 'All Day'),
('Sunset Park Basketball Courts', 'Outdoor', '7th Ave & 43rd St', 6, 'Concrete', true, ARRAY['Water Fountain', 'Playground Nearby', 'Food Trucks'], 4.3, '6:00 AM - 9:00 PM', '8:00 AM - 8:00 PM', 'Late Afternoon')
ON CONFLICT DO NOTHING;
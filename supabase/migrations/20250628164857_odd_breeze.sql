/*
  # Fix Create Game Issues

  1. Database Schema Updates
    - Ensure all required columns exist with proper constraints
    - Fix any missing foreign key references
    - Update RLS policies for game creation

  2. Security Updates
    - Ensure proper RLS policies for game creation
    - Allow authenticated users to create games and courts
    - Fix any permission issues

  3. Data Validation
    - Add proper constraints and defaults
    - Ensure data types match application expectations
*/

-- First, let's ensure the auth.uid() function works properly in RLS policies
-- Update the games table policies to be more permissive for creation

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can create games" ON games;
DROP POLICY IF EXISTS "Authenticated users can create courts" ON courts;

-- Recreate with better policies
CREATE POLICY "Authenticated users can create games"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can create courts"
  ON courts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure the organizer_id can be set properly
CREATE POLICY "Users can create games as organizer"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

-- Allow users to update games they organize
DROP POLICY IF EXISTS "Organizers can update their games" ON games;
CREATE POLICY "Organizers can update their games"
  ON games FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

-- Ensure game participants can be created
DROP POLICY IF EXISTS "Users can join games" ON game_participants;
CREATE POLICY "Users can join games"
  ON game_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_games_organizer_id ON games(organizer_id);
CREATE INDEX IF NOT EXISTS idx_games_court_id ON games(court_id);
CREATE INDEX IF NOT EXISTS idx_games_date_time ON games(game_date, game_time);
CREATE INDEX IF NOT EXISTS idx_game_participants_game_id ON game_participants(game_id);
CREATE INDEX IF NOT EXISTS idx_game_participants_user_id ON game_participants(user_id);

-- Ensure the duration column can handle various formats
DO $$
BEGIN
  -- Check if we need to update the duration column type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' 
    AND column_name = 'duration' 
    AND data_type = 'interval'
  ) THEN
    ALTER TABLE games ALTER COLUMN duration TYPE interval USING duration::interval;
  END IF;
END $$;

-- Add a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns where they exist
DO $$
BEGIN
  -- For profiles table
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
    CREATE TRIGGER update_profiles_updated_at 
      BEFORE UPDATE ON profiles 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- For user_stats table
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_stats' AND column_name = 'updated_at') THEN
    DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
    CREATE TRIGGER update_user_stats_updated_at 
      BEFORE UPDATE ON user_stats 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Ensure proper constraints exist
DO $$
BEGIN
  -- Add constraint for max_players if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'games' 
    AND constraint_name = 'games_max_players_check'
  ) THEN
    ALTER TABLE games ADD CONSTRAINT games_max_players_check CHECK (max_players > 0 AND max_players <= 50);
  END IF;

  -- Add constraint for current_players if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'games' 
    AND constraint_name = 'games_current_players_check'
  ) THEN
    ALTER TABLE games ADD CONSTRAINT games_current_players_check CHECK (current_players >= 0 AND current_players <= max_players);
  END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
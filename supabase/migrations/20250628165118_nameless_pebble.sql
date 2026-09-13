/*
  # Fix Create Game Issues - Final Solution

  1. Problem 1: Conflicting RLS Policies
    - Remove duplicate and conflicting policies
    - Create single, clear policies for each operation

  2. Problem 2: Court Creation and Validation
    - Ensure court creation works properly
    - Add proper error handling for court_id validation
*/

-- Problem 1: Fix conflicting RLS policies
-- Drop ALL existing game policies to start fresh
DROP POLICY IF EXISTS "Users can create games" ON games;
DROP POLICY IF EXISTS "Authenticated users can create games" ON games;
DROP POLICY IF EXISTS "Users can create games as organizer" ON games;
DROP POLICY IF EXISTS "Organizers can update their games" ON games;

-- Create single, clear policies for games
CREATE POLICY "games_select_policy"
  ON games FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "games_insert_policy"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "games_update_policy"
  ON games FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

-- Fix courts policies
DROP POLICY IF EXISTS "Authenticated users can create courts" ON courts;
DROP POLICY IF EXISTS "Anyone can view courts" ON courts;

CREATE POLICY "courts_select_policy"
  ON courts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "courts_insert_policy"
  ON courts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Problem 2: Ensure court_id is properly validated
-- Add a constraint to ensure games always have a valid court_id
DO $$
BEGIN
  -- Remove existing foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'games' 
    AND constraint_name = 'games_court_id_fkey'
  ) THEN
    ALTER TABLE games DROP CONSTRAINT games_court_id_fkey;
  END IF;

  -- Add the foreign key constraint back
  ALTER TABLE games ADD CONSTRAINT games_court_id_fkey 
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE;
END $$;

-- Ensure the court_id column cannot be null
ALTER TABLE games ALTER COLUMN court_id SET NOT NULL;

-- Fix game participants policies
DROP POLICY IF EXISTS "Users can join games" ON game_participants;
DROP POLICY IF EXISTS "Users can view game participants" ON game_participants;
DROP POLICY IF EXISTS "Users can leave games" ON game_participants;

CREATE POLICY "game_participants_select_policy"
  ON game_participants FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "game_participants_insert_policy"
  ON game_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "game_participants_delete_policy"
  ON game_participants FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure all necessary permissions are granted
GRANT ALL ON games TO authenticated;
GRANT ALL ON courts TO authenticated;
GRANT ALL ON game_participants TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
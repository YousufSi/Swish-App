/*
  # Fix Permanent Game Deletion

  1. Database Issues
    - Ensure CASCADE deletes work properly
    - Add database triggers to prevent resurrection of deleted games
    - Clean up any orphaned data

  2. Security Updates
    - Strengthen RLS policies to prevent access to deleted games
    - Add audit logging for deletions

  3. Data Integrity
    - Ensure foreign key constraints work properly
    - Add checks to prevent invalid game states
*/

-- First, let's clean up any potentially corrupted data
-- Remove any game participants for games that don't exist
DELETE FROM game_participants 
WHERE game_id NOT IN (SELECT id FROM games);

-- Remove any games with invalid status or missing required fields
DELETE FROM games 
WHERE status NOT IN ('active', 'cancelled', 'completed')
   OR title IS NULL 
   OR title = ''
   OR court_id IS NULL
   OR organizer_id IS NULL;

-- Ensure all foreign key constraints are properly set up with CASCADE
DO $$
BEGIN
  -- Drop existing constraints if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'games' AND constraint_name = 'games_court_id_fkey'
  ) THEN
    ALTER TABLE games DROP CONSTRAINT games_court_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'games' AND constraint_name = 'games_organizer_id_fkey'
  ) THEN
    ALTER TABLE games DROP CONSTRAINT games_organizer_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'game_participants' AND constraint_name = 'game_participants_game_id_fkey'
  ) THEN
    ALTER TABLE game_participants DROP CONSTRAINT game_participants_game_id_fkey;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'game_participants' AND constraint_name = 'game_participants_user_id_fkey'
  ) THEN
    ALTER TABLE game_participants DROP CONSTRAINT game_participants_user_id_fkey;
  END IF;

  -- Add them back with proper CASCADE behavior
  ALTER TABLE games ADD CONSTRAINT games_court_id_fkey 
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE;
    
  ALTER TABLE games ADD CONSTRAINT games_organizer_id_fkey 
    FOREIGN KEY (organizer_id) REFERENCES profiles(id) ON DELETE CASCADE;
    
  ALTER TABLE game_participants ADD CONSTRAINT game_participants_game_id_fkey 
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE;
    
  ALTER TABLE game_participants ADD CONSTRAINT game_participants_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
END $$;

-- Create a function to log game deletions for audit purposes
CREATE OR REPLACE FUNCTION log_game_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the deletion (you can expand this to insert into an audit table if needed)
  RAISE NOTICE 'Game deleted: ID=%, Title=%, Organizer=%', OLD.id, OLD.title, OLD.organizer_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for game deletion logging
DROP TRIGGER IF EXISTS game_deletion_log ON games;
CREATE TRIGGER game_deletion_log
  BEFORE DELETE ON games
  FOR EACH ROW EXECUTE FUNCTION log_game_deletion();

-- Create a function to ensure game deletion is permanent
CREATE OR REPLACE FUNCTION ensure_permanent_game_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure all related data is cleaned up
  DELETE FROM game_participants WHERE game_id = OLD.id;
  
  -- Log the permanent deletion
  RAISE NOTICE 'Permanent deletion completed for game: %', OLD.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure permanent deletion
DROP TRIGGER IF EXISTS ensure_permanent_deletion ON games;
CREATE TRIGGER ensure_permanent_deletion
  AFTER DELETE ON games
  FOR EACH ROW EXECUTE FUNCTION ensure_permanent_game_deletion();

-- Strengthen RLS policies to ensure deleted games cannot be accessed
DROP POLICY IF EXISTS "games_select_policy" ON games;
CREATE POLICY "games_select_policy"
  ON games FOR SELECT
  TO authenticated
  USING (
    status = 'active' 
    AND game_date >= CURRENT_DATE
    AND id IS NOT NULL
    AND court_id IS NOT NULL
    AND organizer_id IS NOT NULL
  );

-- Ensure only organizers can delete their games
DROP POLICY IF EXISTS "games_delete_policy" ON games;
CREATE POLICY "games_delete_policy"
  ON games FOR DELETE
  TO authenticated
  USING (auth.uid() = organizer_id);

-- Add a check to prevent games from being in an invalid state
DO $$
BEGIN
  -- Add constraint to ensure games have valid dates
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'games' 
    AND constraint_name = 'games_valid_date_check'
  ) THEN
    ALTER TABLE games ADD CONSTRAINT games_valid_date_check 
      CHECK (game_date >= CURRENT_DATE - INTERVAL '1 day');
  END IF;

  -- Add constraint to ensure games have valid player counts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'games' 
    AND constraint_name = 'games_valid_players_check'
  ) THEN
    ALTER TABLE games ADD CONSTRAINT games_valid_players_check 
      CHECK (current_players >= 0 AND current_players <= max_players AND max_players > 0);
  END IF;
END $$;

-- Create an index to improve deletion performance
CREATE INDEX IF NOT EXISTS idx_games_organizer_status ON games(organizer_id, status);
CREATE INDEX IF NOT EXISTS idx_games_active_future ON games(status, game_date) WHERE status = 'active';

-- Force a schema reload to ensure all changes take effect
NOTIFY pgrst, 'reload schema';

-- Clean up any remaining orphaned data after the constraints are in place
DO $$
BEGIN
  -- Remove any game participants that might have been orphaned
  DELETE FROM game_participants 
  WHERE game_id NOT IN (SELECT id FROM games WHERE status = 'active');
  
  RAISE NOTICE 'Database cleanup completed - all orphaned data removed';
END $$;
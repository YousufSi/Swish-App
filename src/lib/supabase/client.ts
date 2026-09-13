import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Database types
export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  skill_level: 'Beginner' | 'Intermediate' | 'Advanced';
  game_preference: 'Pickup' | 'Competitive' | 'Practice' | 'Tournament';
  search_radius: number;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  games_played: number;
  games_won: number;
  total_points: number;
  total_assists: number;
  total_rebounds: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
}

export interface Court {
  id: string;
  name: string;
  type: 'Indoor' | 'Outdoor';
  address: string;
  latitude?: number;
  longitude?: number;
  hoops: number;
  surface: string;
  lighting: boolean;
  amenities: string[];
  rating: number;
  hours_weekday: string;
  hours_weekend: string;
  popular_times: string;
  created_at: string;
}

export interface Game {
  id: string;
  court_id: string;
  organizer_id: string;
  title: string;
  description?: string;
  game_date: string;
  game_time: string;
  duration: string;
  max_players: number;
  current_players: number;
  skill_level: string;
  game_type: 'Pickup' | 'Competitive' | 'Practice' | 'Tournament';
  status: 'active' | 'cancelled' | 'completed';
  created_at: string;
  court?: Court;
  organizer?: Profile;
}

export interface GameParticipant {
  id: string;
  game_id: string;
  user_id: string;
  joined_at: string;
  status: 'registered' | 'attended' | 'no_show';
  user?: Profile;
}
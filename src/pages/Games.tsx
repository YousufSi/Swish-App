import React, { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, Trophy, Clock, Loader, CheckCircle, MessageCircle, Plus, X, Trash2, Edit } from 'lucide-react';
import { supabase, Game, GameParticipant } from '../lib/supabase/client';
import { courtDiscovery } from '../services/courtDiscovery';
import GameChat from '../components/GameChat';
import CreateGameModal from '../components/CreateGameModal';
import EditGameModal from '../components/EditGameModal';

interface LocationData {
  zipcode: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  searchRadius: number;
}

interface BasketballCourt {
  id: string;
  name: string;
  type: 'Indoor' | 'Outdoor';
  address: string;
  latitude: number;
  longitude: number;
  hoops: number;
  surface: string;
  lighting: boolean;
  amenities: string[];
  rating: number;
  hours_weekday: string;
  hours_weekend: string;
  popular_times: string;
  distance?: number;
}

export default function Games() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGameChat, setSelectedGameChat] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [nearbyGames, setNearbyGames] = useState<Game[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [nearbyCourts, setNearbyCourts] = useState<BasketballCourt[]>([]);

  useEffect(() => {
    fetchUser();
    loadUserLocation();
    fetchGames();

    // Set up real-time subscriptions
    let gamesChannel: any = null;
    let participantsChannel: any = null;

    const setupRealTimeSubscriptions = () => {
      console.log('🔌 Setting up real-time subscriptions...');

      // Games subscription
      gamesChannel = supabase
        .channel(`games-realtime-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'games'
          },
          async (payload) => {
            console.log('➕ NEW GAME CREATED (real-time):', payload.new);
            
            try {
              const { data: newGameData, error } = await supabase
                .from('games')
                .select(`
                  *,
                  court:courts(*),
                  organizer:profiles(*)
                `)
                .eq('id', payload.new.id)
                .eq('status', 'active')
                .single();

              if (!error && newGameData) {
                console.log('✅ Fetched complete new game data:', newGameData.title);
                
                setGames(prevGames => {
                  const exists = prevGames.some(game => game.id === newGameData.id);
                  if (exists) {
                    console.log('⚠️ Game already exists, skipping');
                    return prevGames;
                  }
                  
                  const newList = [newGameData, ...prevGames].sort((a, b) => {
                    const dateA = new Date(`${a.game_date} ${a.game_time}`);
                    const dateB = new Date(`${b.game_date} ${b.game_time}`);
                    return dateA.getTime() - dateB.getTime();
                  });
                  
                  console.log(`✅ Added new game "${newGameData.title}" to list`);
                  return newList;
                });
              }
            } catch (error) {
              console.error('❌ Error fetching new game data:', error);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'games'
          },
          (payload) => {
            console.log('🗑️ GAME PERMANENTLY DELETED (real-time):', payload.old.id);
            const deletedGameId = payload.old.id;
            
            setGames(prevGames => {
              const filtered = prevGames.filter(game => game.id !== deletedGameId);
              console.log(`✅ PERMANENTLY removed deleted game from main list: ${deletedGameId}`);
              return filtered;
            });
            
            setNearbyGames(prevGames => {
              const filtered = prevGames.filter(game => game.id !== deletedGameId);
              console.log(`✅ PERMANENTLY removed deleted game from nearby list: ${deletedGameId}`);
              return filtered;
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'games'
          },
          async (payload) => {
            console.log('🔄 GAME UPDATED (real-time):', payload.new.id);
            const updatedGameId = payload.new.id;
            
            try {
              // Fetch complete updated game data with relations
              const { data: updatedGameData, error } = await supabase
                .from('games')
                .select(`
                  *,
                  court:courts(*),
                  organizer:profiles(*)
                `)
                .eq('id', updatedGameId)
                .single();

              if (!error && updatedGameData) {
                console.log('✅ Fetched complete updated game data:', updatedGameData.title);
                
                // Update in both lists with complete game data
                setGames(prevGames => 
                  prevGames.map(game => 
                    game.id === updatedGameId ? updatedGameData : game
                  )
                );
                
                setNearbyGames(prevGames => 
                  prevGames.map(game => 
                    game.id === updatedGameId ? updatedGameData : game
                  )
                );
              }
            } catch (error) {
              console.error('❌ Error fetching updated game data:', error);
              // Fallback to basic update
              const updatedGame = payload.new as Game;
              setGames(prevGames => 
                prevGames.map(game => 
                  game.id === updatedGame.id 
                    ? { ...game, current_players: updatedGame.current_players, status: updatedGame.status }
                    : game
                )
              );
              
              setNearbyGames(prevGames => 
                prevGames.map(game => 
                  game.id === updatedGame.id 
                    ? { ...game, current_players: updatedGame.current_players, status: updatedGame.status }
                    : game
                )
              );
            }
          }
        )
        .subscribe((status) => {
          console.log('🔌 Games subscription status:', status);
        });

      // Participants subscription - this will trigger game updates
      participantsChannel = supabase
        .channel(`participants-realtime-${Date.now()}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'game_participants'
          },
          async (payload) => {
            console.log('👥 PLAYER JOINED (real-time):', payload.new);
            const gameId = payload.new.game_id;
            
            // Fetch updated game data to get the correct player count
            try {
              const { data: updatedGame, error } = await supabase
                .from('games')
                .select('current_players')
                .eq('id', gameId)
                .single();

              if (!error && updatedGame) {
                console.log(`🔢 Updated player count for game ${gameId}: ${updatedGame.current_players}`);
                
                setGames(prevGames => 
                  prevGames.map(game => 
                    game.id === gameId 
                      ? { ...game, current_players: updatedGame.current_players }
                      : game
                  )
                );
                
                setNearbyGames(prevGames => 
                  prevGames.map(game => 
                    game.id === gameId 
                      ? { ...game, current_players: updatedGame.current_players }
                      : game
                  )
                );
              }
            } catch (error) {
              console.error('❌ Error fetching updated game data:', error);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'game_participants'
          },
          async (payload) => {
            console.log('👥 PLAYER LEFT (real-time):', payload.old);
            const gameId = payload.old.game_id;
            
            // Fetch updated game data to get the correct player count
            try {
              const { data: updatedGame, error } = await supabase
                .from('games')
                .select('current_players')
                .eq('id', gameId)
                .single();

              if (!error && updatedGame) {
                console.log(`🔢 Updated player count for game ${gameId}: ${updatedGame.current_players}`);
                
                setGames(prevGames => 
                  prevGames.map(game => 
                    game.id === gameId 
                      ? { ...game, current_players: updatedGame.current_players }
                      : game
                  )
                );
                
                setNearbyGames(prevGames => 
                  prevGames.map(game => 
                    game.id === gameId 
                      ? { ...game, current_players: updatedGame.current_players }
                      : game
                  )
                );
              }
            } catch (error) {
              console.error('❌ Error fetching updated game data:', error);
            }
          }
        )
        .subscribe((status) => {
          console.log('🔌 Participants subscription status:', status);
        });
    };

    const subscriptionTimeout = setTimeout(setupRealTimeSubscriptions, 1000);

    return () => {
      clearTimeout(subscriptionTimeout);
      if (gamesChannel) {
        console.log('🧹 Cleaning up games subscription');
        supabase.removeChannel(gamesChannel);
      }
      if (participantsChannel) {
        console.log('🧹 Cleaning up participants subscription');
        supabase.removeChannel(participantsChannel);
      }
    };
  }, []);

  useEffect(() => {
    if (userLocation) {
      discoverNearbyCourts();
      filterNearbyGames();
    }
  }, [games, userLocation]);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadUserLocation = () => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setUserLocation(JSON.parse(savedLocation));
    }
  };

  const discoverNearbyCourts = async () => {
    if (!userLocation) return;

    try {
      const discoveredCourts = await courtDiscovery.findBasketballCourts(userLocation);
      setNearbyCourts(discoveredCourts);
    } catch (error) {
      console.error('Error discovering courts:', error);
    }
  };

  const fetchGames = async () => {
    try {
      console.log('📋 Fetching ONLY active, future games...');
      
      const { data, error } = await supabase
        .from('games')
        .select(`
          *,
          court:courts(*),
          organizer:profiles(*)
        `)
        .eq('status', 'active')
        .gte('game_date', new Date().toISOString().split('T')[0])
        .not('id', 'is', null)
        .not('court_id', 'is', null)
        .not('organizer_id', 'is', null)
        .order('game_date', { ascending: true })
        .order('game_time', { ascending: true });

      if (error) {
        console.error('❌ Error fetching games:', error);
        return;
      }

      const validGames = (data || []).filter(game => 
        game.id && 
        game.court_id && 
        game.organizer_id && 
        game.status === 'active' &&
        game.title &&
        game.title.trim() !== ''
      );

      console.log(`✅ Fetched ${validGames.length} valid active games (filtered from ${data?.length || 0} total)`);
      setGames(validGames);
    } catch (error) {
      console.error('❌ Unexpected error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNearbyGames = () => {
    if (!userLocation) {
      setNearbyGames(games);
      return;
    }

    setLocationLoading(true);
    
    const nearby = games.filter(game => {
      if (!game.court?.latitude || !game.court?.longitude) return false;
      
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        game.court.latitude,
        game.court.longitude
      );
      
      return distance <= userLocation.searchRadius;
    });

    nearby.sort((a, b) => {
      if (!a.court?.latitude || !a.court?.longitude || !b.court?.latitude || !b.court?.longitude) return 0;
      
      const distanceA = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        a.court.latitude,
        a.court.longitude
      );
      
      const distanceB = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        b.court.latitude,
        b.court.longitude
      );
      
      return distanceA - distanceB;
    });

    setNearbyGames(nearby);
    setLocationLoading(false);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleBookSpot = async (gameId: string) => {
    if (!user) return;

    try {
      console.log(`🎯 Booking spot for game ${gameId}`);

      // Check if user is already registered
      const { data: existingParticipant } = await supabase
        .from('game_participants')
        .select('id')
        .eq('game_id', gameId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingParticipant) {
        alert('You are already registered for this game.');
        return;
      }

      // Get current game data to check capacity
      const { data: currentGame, error: gameError } = await supabase
        .from('games')
        .select('current_players, max_players')
        .eq('id', gameId)
        .single();

      if (gameError) {
        console.error('Error fetching game data:', gameError);
        alert('Error booking spot. Please try again.');
        return;
      }

      if (currentGame.current_players >= currentGame.max_players) {
        alert('This game is already full.');
        return;
      }

      console.log(`📊 Current game state: ${currentGame.current_players}/${currentGame.max_players} players`);

      // STEP 1: Add participant first
      console.log('👤 Adding participant to game...');
      const { error: participantError } = await supabase
        .from('game_participants')
        .insert({
          game_id: gameId,
          user_id: user.id,
          status: 'registered'
        });

      if (participantError) {
        console.error('❌ Error adding participant:', participantError);
        alert('Error booking your spot. Please try again.');
        return;
      }

      console.log('✅ Participant added successfully');

      // STEP 2: Update player count in games table
      const newPlayerCount = currentGame.current_players + 1;
      console.log(`🔢 Updating player count to: ${newPlayerCount}`);
      
      const { error: updateError } = await supabase
        .from('games')
        .update({ current_players: newPlayerCount })
        .eq('id', gameId);

      if (updateError) {
        console.error('❌ Error updating player count:', updateError);
        // Rollback participant addition
        await supabase
          .from('game_participants')
          .delete()
          .eq('game_id', gameId)
          .eq('user_id', user.id);
        alert('Error updating player count. Please try again.');
        return;
      }

      console.log(`✅ Successfully booked spot - new count: ${newPlayerCount}`);
      
      // STEP 3: Immediately update local state for instant feedback
      setGames(prevGames => 
        prevGames.map(game => 
          game.id === gameId 
            ? { ...game, current_players: newPlayerCount }
            : game
        )
      );
      
      setNearbyGames(prevGames => 
        prevGames.map(game => 
          game.id === gameId 
            ? { ...game, current_players: newPlayerCount }
            : game
        )
      );

      alert('🏀 Spot booked successfully! You can now chat with other players.');
    } catch (error) {
      console.error('❌ Error booking spot:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const handleCancelSpot = async (gameId: string) => {
    if (!user) return;

    try {
      console.log(`❌ Canceling spot for game ${gameId}`);

      // Check if user is actually registered
      const { data: participant } = await supabase
        .from('game_participants')
        .select('id')
        .eq('game_id', gameId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!participant) {
        alert('You are not registered for this game.');
        return;
      }

      // Get current game data
      const { data: currentGame, error: gameError } = await supabase
        .from('games')
        .select('current_players, organizer_id')
        .eq('id', gameId)
        .single();

      if (gameError) {
        console.error('Error fetching game data:', gameError);
        alert('Error canceling spot. Please try again.');
        return;
      }

      // Don't let organizer cancel their own spot
      if (currentGame.organizer_id === user.id) {
        alert('As the organizer, you cannot cancel your spot. Delete the game instead.');
        return;
      }

      console.log(`📊 Current game state: ${currentGame.current_players} players`);

      // STEP 1: Remove participant
      console.log('👤 Removing participant from game...');
      const { error: participantError } = await supabase
        .from('game_participants')
        .delete()
        .eq('game_id', gameId)
        .eq('user_id', user.id);

      if (participantError) {
        console.error('❌ Error removing participant:', participantError);
        alert('Error canceling your spot. Please try again.');
        return;
      }

      console.log('✅ Participant removed successfully');

      // STEP 2: Update player count (ensure it doesn't go below 1)
      const newPlayerCount = Math.max(1, currentGame.current_players - 1);
      console.log(`🔢 Updating player count to: ${newPlayerCount}`);
      
      const { error: updateError } = await supabase
        .from('games')
        .update({ current_players: newPlayerCount })
        .eq('id', gameId);

      if (updateError) {
        console.error('❌ Error updating player count:', updateError);
        // Rollback participant removal
        await supabase
          .from('game_participants')
          .insert({
            game_id: gameId,
            user_id: user.id,
            status: 'registered'
          });
        alert('Error updating player count. Please try again.');
        return;
      }

      console.log(`✅ Successfully canceled spot - new count: ${newPlayerCount}`);
      
      // STEP 3: Immediately update local state for instant feedback
      setGames(prevGames => 
        prevGames.map(game => 
          game.id === gameId 
            ? { ...game, current_players: newPlayerCount }
            : game
        )
      );
      
      setNearbyGames(prevGames => 
        prevGames.map(game => 
          game.id === gameId 
            ? { ...game, current_players: newPlayerCount }
            : game
        )
      );

      alert('Spot canceled successfully.');
    } catch (error) {
      console.error('❌ Error canceling spot:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!user) return;

    const confirmDelete = window.confirm('⚠️ PERMANENT DELETION WARNING ⚠️\n\nThis will PERMANENTLY delete this game from the database. This action cannot be undone and will remove all participants.\n\nAre you absolutely sure you want to proceed?');
    if (!confirmDelete) return;

    try {
      console.log(`🗑️ INITIATING PERMANENT DELETION of game ${gameId}`);

      // Verify user is the organizer
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('organizer_id, title')
        .eq('id', gameId)
        .single();

      if (gameError) {
        console.error('❌ Error fetching game for deletion:', gameError);
        alert('Error deleting game. Please try again.');
        return;
      }

      if (game.organizer_id !== user.id) {
        alert('Only the organizer can delete this game.');
        return;
      }

      console.log(`✅ VERIFIED: User is organizer of "${game.title}"`);

      // IMMEDIATELY remove from organizer's UI for instant feedback
      setGames(prevGames => prevGames.filter(g => g.id !== gameId));
      setNearbyGames(prevGames => prevGames.filter(g => g.id !== gameId));

      // EXECUTE PERMANENT DATABASE DELETION
      console.log(`🗑️ EXECUTING: Permanent database deletion with CASCADE...`);
      const { error: deleteError } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId)
        .eq('organizer_id', user.id);

      if (deleteError) {
        console.error('❌ PERMANENT DELETION FAILED:', deleteError);
        alert(`Failed to permanently delete game: ${deleteError.message}`);
        
        // Restore game to UI if deletion failed
        console.log('🔄 Restoring game to UI due to deletion failure');
        fetchGames();
        return;
      }

      console.log(`✅ PERMANENT DELETION SUCCESSFUL: "${game.title}" has been PERMANENTLY removed from database`);
      console.log(`🔄 Real-time subscriptions will notify all other users of the deletion`);
      
      alert('🗑️ Game permanently deleted successfully!\n\nThe game has been completely removed from the database and all participants have been notified.');
      
    } catch (error) {
      console.error('❌ UNEXPECTED ERROR during permanent deletion:', error);
      alert('An unexpected error occurred during deletion. Please try again.');
      
      // Restore game to UI if unexpected error
      console.log('🔄 Restoring game to UI due to unexpected error');
      fetchGames();
    }
  };

  const handleEditGame = (game: Game) => {
    setEditingGame(game);
    setShowEditModal(true);
  };

  const handleOpenChat = (gameId: string) => {
    setSelectedGameChat(gameId);
  };

  const handleGameCreated = () => {
    console.log('🎮 Game created - real-time subscription should handle the update');
    // Real-time subscription will handle adding the new game
    // But we'll also do a manual refresh as fallback
    setTimeout(() => {
      console.log('🔄 Fallback refresh after game creation');
      fetchGames();
    }, 2000);
  };

  const handleGameUpdated = () => {
    console.log('✏️ Game updated - real-time subscription should handle the update');
    // Real-time subscription will handle updating the game
    // But we'll also do a manual refresh as fallback
    setTimeout(() => {
      console.log('🔄 Fallback refresh after game update');
      fetchGames();
    }, 1000);
  };

  if (loading) {
    return (
      <div className="nike-container py-8">
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="nike-card p-6">
              <div className="h-6 bg-nike-gray-200 dark:bg-nike-gray-700 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-nike-gray-200 dark:bg-nike-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-nike-gray-200 dark:bg-nike-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayGames = userLocation ? nearbyGames : games;

  return (
    <div className="nike-container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-nike-black dark:text-nike-white">Basketball Games</h2>
            <p className="text-nike-gray-600 dark:text-nike-gray-400 mt-2">
              {userLocation 
                ? `Games within ${userLocation.searchRadius} miles of ${userLocation.city}, ${userLocation.state} ${userLocation.zipcode}`
                : 'Find and join games near you'
              }
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="nike-button flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Game
          </button>
        </div>

        {userLocation && (
          <div className="mt-4 p-4 bg-nike-gray-100 dark:bg-nike-gray-800 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-nike-red" />
              <span className="text-nike-black dark:text-nike-white font-medium">
                {locationLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    Finding games near you...
                  </span>
                ) : (
                  `Showing ${displayGames.length} games near ${userLocation.city}, ${userLocation.state} ${userLocation.zipcode}`
                )}
              </span>
            </div>
            {nearbyCourts.length > 0 && (
              <p className="text-xs text-nike-gray-600 dark:text-nike-gray-400 mt-1">
                Found {nearbyCourts.length} basketball courts in your area
              </p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {displayGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            user={user}
            userLocation={userLocation}
            onBookSpot={handleBookSpot}
            onCancelSpot={handleCancelSpot}
            onDeleteGame={handleDeleteGame}
            onEditGame={handleEditGame}
            onOpenChat={handleOpenChat}
          />
        ))}
      </div>

      {displayGames.length === 0 && !loading && !locationLoading && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-nike-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-nike-gray-900 dark:text-nike-gray-100">
            {userLocation ? 'No games found in your area' : 'No games available'}
          </h3>
          <p className="mt-1 text-sm text-nike-gray-500 dark:text-nike-gray-400">
            {userLocation 
              ? `Try expanding your search radius in location settings or create your own game. We found ${nearbyCourts.length} courts in your area where you could organize a game.`
              : 'Set your location to find games near you, or create your own game.'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 nike-button"
          >
            Create Your First Game
          </button>
        </div>
      )}

      {selectedGameChat && (
        <GameChat
          gameId={selectedGameChat}
          onClose={() => setSelectedGameChat(null)}
        />
      )}

      <CreateGameModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGameCreated={handleGameCreated}
      />

      {editingGame && (
        <EditGameModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingGame(null);
          }}
          onGameUpdated={handleGameUpdated}
          game={editingGame}
        />
      )}
    </div>
  );
}

interface GameCardProps {
  game: Game;
  user: any;
  userLocation: LocationData | null;
  onBookSpot: (gameId: string) => void;
  onCancelSpot: (gameId: string) => void;
  onDeleteGame: (gameId: string) => void;
  onEditGame: (game: Game) => void;
  onOpenChat: (gameId: string) => void;
}

function GameCard({ game, user, userLocation, onBookSpot, onCancelSpot, onDeleteGame, onEditGame, onOpenChat }: GameCardProps) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    checkRegistration();
  }, [game.id, user, game.current_players]);

  const checkRegistration = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('game_participants')
        .select('id')
        .eq('game_id', game.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      setIsRegistered(!!data);
    } catch (error) {
      console.error('Error checking registration:', error);
      setIsRegistered(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSpot = async () => {
    setActionLoading(true);
    try {
      await onBookSpot(game.id);
      await checkRegistration();
    } catch (error) {
      console.error('Error booking spot:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSpot = async () => {
    setActionLoading(true);
    try {
      await onCancelSpot(game.id);
      await checkRegistration();
    } catch (error) {
      console.error('Error canceling spot:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGame = async () => {
    setActionLoading(true);
    try {
      await onDeleteGame(game.id);
    } catch (error) {
      console.error('Error deleting game:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getDistance = () => {
    if (!userLocation || !game.court?.latitude || !game.court?.longitude) return null;
    
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      game.court.latitude,
      game.court.longitude
    );
    
    return distance.toFixed(1);
  };

  // Format time to 12-hour format
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      const minute = parseInt(minutes, 10);
      
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      return timeString; // Fallback to original format if parsing fails
    }
  };

  const distance = getDistance();
  const isGameFull = game.current_players >= game.max_players;
  const isOrganizer = user && game.organizer_id === user.id;

  return (
    <div className="nike-card nike-card-hover p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Calendar className="h-5 w-5 text-purple-500" />
          <h3 className="ml-2 text-lg font-bold text-nike-black dark:text-nike-white">
            {game.title}
          </h3>
          {distance && (
            <span className="ml-2 nike-tag bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
              {distance} mi away
            </span>
          )}
          {isOrganizer && (
            <span className="ml-2 nike-tag bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400">
              Organizer
            </span>
          )}
        </div>
        <span className="nike-tag">
          {game.game_type}
        </span>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center text-nike-gray-600 dark:text-nike-gray-400 mb-2">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="font-medium">{game.court?.name || 'Unknown Court'}</span>
        </div>
        <p className="text-nike-gray-600 dark:text-nike-gray-400 text-sm ml-6">
          {game.court?.address}
        </p>
      </div>
      
      {game.description && (
        <p className="text-nike-gray-600 dark:text-nike-gray-400 mb-6 whitespace-pre-line">{game.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-nike-gray-400 mr-2" />
          <div>
            <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">Date</p>
            <p className="font-medium text-nike-black dark:text-nike-white">
              {new Date(game.game_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-green-500 mr-2" />
          <div>
            <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">Time</p>
            <p className="font-medium text-nike-black dark:text-nike-white">
              {formatTime(game.game_time)}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
          <div>
            <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">Level</p>
            <p className="font-medium text-nike-black dark:text-nike-white">{game.skill_level}</p>
          </div>
        </div>
        <div className="flex items-center">
          <Users className="h-4 w-4 text-blue-500 mr-2" />
          <div>
            <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">Players</p>
            <p className="font-medium text-nike-black dark:text-nike-white">
              {game.current_players}/{game.max_players}
              {isGameFull && <span className="text-nike-red ml-1">(Full)</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-nike-gray-200 dark:border-nike-gray-700">
        <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">
          Organized by <span className="font-medium text-nike-black dark:text-nike-white">
            {game.organizer?.full_name || 'Unknown'}
          </span>
        </p>
        <div className="flex gap-3">
          {loading ? (
            <div className="animate-pulse bg-nike-gray-200 dark:bg-nike-gray-700 h-8 w-20 rounded"></div>
          ) : isOrganizer ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onEditGame(game)}
                className="nike-button-outline flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={handleDeleteGame}
                disabled={actionLoading}
                className="nike-button-outline flex items-center gap-2 disabled:opacity-50 text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
              >
                {actionLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
              <button
                onClick={() => onOpenChat(game.id)}
                className="nike-button-outline flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </button>
            </div>
          ) : !isRegistered ? (
            !isGameFull ? (
              <button
                onClick={handleBookSpot}
                disabled={actionLoading}
                className="nike-button flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Book Spot
                  </>
                )}
              </button>
            ) : (
              <span className="nike-tag bg-nike-gray-100 dark:bg-nike-gray-700 text-nike-gray-600 dark:text-nike-gray-400">
                Game Full
              </span>
            )
          ) : (
            <div className="flex items-center gap-3">
              <span className="nike-tag bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Spot Booked
              </span>
              <button
                onClick={handleCancelSpot}
                disabled={actionLoading}
                className="nike-button-outline flex items-center gap-2 disabled:opacity-50 text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
              >
                {actionLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" />
                    Cancel
                  </>
                )}
              </button>
              <button
                onClick={() => onOpenChat(game.id)}
                className="nike-button-outline flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
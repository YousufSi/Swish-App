import React, { useState, useEffect } from 'react';
import { X, MapPin, Calendar, Clock, Users, Trophy, Plus, Loader, Search } from 'lucide-react';
import { supabase } from '../lib/supabase/client';
import { courtDiscovery } from '../services/courtDiscovery';

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

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameCreated: () => void;
}

export default function CreateGameModal({ isOpen, onClose, onGameCreated }: CreateGameModalProps) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [nearbyCourts, setNearbyCourts] = useState<BasketballCourt[]>([]);
  const [courtsLoading, setCourtsLoading] = useState(false);
  const [showCustomLocation, setShowCustomLocation] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    court_id: '',
    custom_location: '',
    game_date: '',
    game_time: '',
    duration: '2',
    max_players: '10',
    skill_level: 'All Levels',
    game_type: 'Pickup',
    players_bring: '',
    organizer_provides: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      fetchUser();
      loadUserLocation();
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (userLocation && isOpen) {
      loadNearbyCourts();
    }
  }, [userLocation, isOpen]);

  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      console.log('🔍 Current user for game creation:', user?.id);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const loadUserLocation = () => {
    try {
      const savedLocation = localStorage.getItem('userLocation');
      if (savedLocation) {
        setUserLocation(JSON.parse(savedLocation));
      }
    } catch (error) {
      console.error('Error loading user location:', error);
    }
  };

  const loadNearbyCourts = async () => {
    if (!userLocation) return;

    setCourtsLoading(true);
    try {
      const courts = await courtDiscovery.findBasketballCourts(userLocation);
      setNearbyCourts(courts);
    } catch (error) {
      console.error('Error loading courts:', error);
      setNearbyCourts([]);
    } finally {
      setCourtsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      court_id: '',
      custom_location: '',
      game_date: '',
      game_time: '',
      duration: '2',
      max_players: '10',
      skill_level: 'All Levels',
      game_type: 'Pickup',
      players_bring: '',
      organizer_provides: ''
    });
    setErrors({});
    setShowCustomLocation(false);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Game title is required';
    }

    if (!formData.court_id && !formData.custom_location.trim()) {
      newErrors.location = 'Please select a court or enter a custom location';
    }

    if (!formData.game_date) {
      newErrors.game_date = 'Game date is required';
    } else {
      const selectedDate = new Date(formData.game_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.game_date = 'Game date cannot be in the past';
      }
    }

    if (!formData.game_time) {
      newErrors.game_time = 'Game time is required';
    }

    const maxPlayers = parseInt(formData.max_players);
    if (isNaN(maxPlayers) || maxPlayers < 2) {
      newErrors.max_players = 'At least 2 players required';
    }

    if (maxPlayers > 50) {
      newErrors.max_players = 'Maximum 50 players allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const findOrCreateCourt = async (selectedCourtId: string): Promise<string> => {
    console.log('🏀 Finding or creating court for ID:', selectedCourtId);
    
    // If it's already a valid UUID (from database), return it
    if (selectedCourtId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.log('✅ Court ID is already a valid UUID:', selectedCourtId);
      return selectedCourtId;
    }

    // Find the court from our discovered courts
    const selectedCourt = nearbyCourts.find(court => court.id === selectedCourtId);
    if (!selectedCourt) {
      throw new Error('Selected court not found');
    }

    console.log('🔍 Found court in discovery list:', selectedCourt.name);

    // Check if this court already exists in the database by name and address
    const { data: existingCourt } = await supabase
      .from('courts')
      .select('id')
      .eq('name', selectedCourt.name)
      .eq('address', selectedCourt.address)
      .maybeSingle();

    if (existingCourt) {
      console.log('✅ Found existing court in database:', existingCourt.id);
      return existingCourt.id;
    }

    // Create new court in database
    console.log('➕ Creating new court in database:', selectedCourt.name);
    const { data: newCourt, error: courtError } = await supabase
      .from('courts')
      .insert({
        name: selectedCourt.name,
        type: selectedCourt.type,
        address: selectedCourt.address,
        latitude: selectedCourt.latitude,
        longitude: selectedCourt.longitude,
        hoops: selectedCourt.hoops,
        surface: selectedCourt.surface,
        lighting: selectedCourt.lighting,
        amenities: selectedCourt.amenities,
        rating: selectedCourt.rating,
        hours_weekday: selectedCourt.hours_weekday,
        hours_weekend: selectedCourt.hours_weekend,
        popular_times: selectedCourt.popular_times
      })
      .select('id')
      .single();

    if (courtError) {
      console.error('❌ Error creating court:', courtError);
      throw new Error(`Failed to create court: ${courtError.message}`);
    }

    if (!newCourt?.id) {
      throw new Error('Failed to create court - no ID returned');
    }

    console.log('✅ Created new court with ID:', newCourt.id);
    return newCourt.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🎮 STARTING GAME CREATION PROCESS');
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }
    
    if (!user) {
      alert('You must be logged in to create a game');
      return;
    }

    setLoading(true);

    try {
      let courtId: string;

      if (formData.court_id) {
        // Handle selected court (might need to be created in database)
        console.log('🏀 Using selected court:', formData.court_id);
        courtId = await findOrCreateCourt(formData.court_id);
      } else if (formData.custom_location.trim()) {
        // Create custom court
        console.log('📍 Creating custom court for location:', formData.custom_location);
        
        const { data: courtData, error: courtError } = await supabase
          .from('courts')
          .insert({
            name: `Custom Location - ${formData.custom_location}`,
            type: 'Outdoor',
            address: formData.custom_location.trim(),
            hoops: 2,
            surface: 'Unknown',
            lighting: false,
            amenities: [],
            rating: 0.0,
            hours_weekday: '6:00 AM - 10:00 PM',
            hours_weekend: '7:00 AM - 10:00 PM',
            popular_times: 'Evenings'
          })
          .select('id')
          .single();

        if (courtError) {
          console.error('❌ Error creating custom court:', courtError);
          throw new Error(`Failed to create custom location: ${courtError.message}`);
        }

        if (!courtData?.id) {
          throw new Error('Failed to create custom location - no court ID returned');
        }

        courtId = courtData.id;
        console.log('✅ Created custom court with ID:', courtId);
      } else {
        throw new Error('No court selected or custom location provided');
      }

      // Prepare description with equipment info
      let finalDescription = formData.description.trim();
      
      if (formData.players_bring.trim() || formData.organizer_provides.trim()) {
        finalDescription += '\n\n📋 EQUIPMENT DETAILS:';
        
        if (formData.players_bring.trim()) {
          finalDescription += `\n🎒 Players should bring: ${formData.players_bring.trim()}`;
        }
        
        if (formData.organizer_provides.trim()) {
          finalDescription += `\n🏀 Organizer will provide: ${formData.organizer_provides.trim()}`;
        }
      }

      // Prepare game data - organizer starts as 1 player (minimum)
      const gameData = {
        title: formData.title.trim(),
        description: finalDescription || null,
        court_id: courtId,
        organizer_id: user.id,
        game_date: formData.game_date,
        game_time: formData.game_time,
        duration: `${formData.duration} hours`,
        max_players: parseInt(formData.max_players),
        current_players: 1, // Organizer is automatically included and counts as 1 player minimum
        skill_level: formData.skill_level,
        game_type: formData.game_type,
        status: 'active'
      };

      console.log('🎮 Creating game with data:', gameData);

      // Create the game
      const { data: game, error: gameError } = await supabase
        .from('games')
        .insert(gameData)
        .select()
        .single();

      if (gameError) {
        console.error('❌ Error creating game:', gameError);
        throw new Error(`Failed to create game: ${gameError.message}`);
      }

      if (!game?.id) {
        throw new Error('Failed to create game - no game ID returned');
      }

      console.log('✅ Created game with ID:', game.id);

      // Add organizer as participant
      console.log('👤 Adding organizer as participant...');
      const { error: participantError } = await supabase
        .from('game_participants')
        .insert({
          game_id: game.id,
          user_id: user.id,
          status: 'registered'
        });

      if (participantError) {
        console.error('⚠️ Error adding organizer as participant:', participantError);
        // Don't throw error here as game was created successfully
      } else {
        console.log('✅ Organizer added as participant');
      }

      console.log('🎉 GAME CREATION COMPLETED SUCCESSFULLY');
      
      // Notify parent component
      onGameCreated();
      onClose();
      alert('🏀 Game created successfully! Other players can now join your game.');
      
    } catch (error: any) {
      console.error('❌ GAME CREATION FAILED:', error);
      alert(`Failed to create game: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-nike-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-nike-black dark:text-nike-white flex items-center gap-2">
              <Plus className="h-6 w-6 text-nike-red" />
              Create New Game
            </h3>
            <button
              onClick={onClose}
              className="text-nike-gray-400 hover:text-nike-gray-500 dark:hover:text-nike-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Game Title */}
            <div>
              <label className="block text-sm font-bold text-nike-black dark:text-nike-white mb-2">
                Game Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Saturday Morning Pickup Game"
                className="w-full px-3 py-2 border border-nike-gray-300 dark:border-nike-gray-600 rounded-md bg-white dark:bg-nike-gray-700 text-nike-black dark:text-nike-white focus:ring-nike-red focus:border-nike-red"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-nike-black dark:text-nike-white mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Add any additional details about the game..."
                rows={3}
                className="w-full px-3 py-2 border border-nike-gray-300 dark:border-nike-gray-600 rounded-md bg-white dark:bg-nike-gray-700 text-nike-black dark:text-nike-white focus:ring-nike-red focus:border-nike-red"
              />
            </div>

            {/* Location Selection */}
            <div>
              <label className="block text-sm font-bold text-nike-black dark:text-nike-white mb-2">
                Location *
              </label>
              
              <div className="space-y-3">
                {/* Toggle between court selection and custom location */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomLocation(false)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      !showCustomLocation
                        ? 'bg-nike-red text-white'
                        : 'bg-nike-gray-100 dark:bg-nike-gray-700 text-nike-gray-600 dark:text-nike-gray-400'
                    }`}
                  >
                    Select Court
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomLocation(true)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      showCustomLocation
                        ? 'bg-nike-red text-white'
                        : 'bg-nike-gray-100 dark:bg-nike-gray-700 text-nike-gray-600 dark:text-nike-gray-400'
                    }`}
                  >
                    Custom Location
                  </button>
                </div>

                {!showCustomLocation ? (
                  <div>
                    {courtsLoading ? (
                      <div className="flex items-center gap-2 p-3 bg-nike-gray-100 dark:bg-nike-gray-700 rounded-md">
                        <Loader className="h-4 w-4 animate-spin text-nike-red" />
                        <span className="text-sm text-nike-gray-600 dark:text-nike-gray-400">Loading nearby courts...</span>
                      </div>
                    ) : nearbyCourts.length > 0 ? (
                      <select
                        value={formData.court_id}
                        onChange={(e) => handleInputChange('court_id', e.target.value)}
                        className="w-full px-3 py-2 border border-nike-gray-300 dark:border-nike-gray-600 rounded-md bg-white dark:bg-nike-gray-700 text-nike-black dark:text-nike-white focus:ring-nike-red focus:border-nike-red"
                      >
                        <option value="">Select a court</option>
                        {nearbyCourts.map((court) => (
                          <option key={court.id} value={court.id}>
                            {court.name} - {court.address} {court.distance && `(${court.distance.toFixed(1)} mi)`}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-nike-gray-100 dark:bg-nike-gray-700 rounded-md">
                        <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">
                          No courts found nearby. Please use custom location or set your location in settings.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.custom_location}
                    onChange={(e) => handleInputChange('custom_location', e.target.value)}
                    placeholder="Enter full address or location description"
                    className="w-full px-3 py-2 border border-nike-gray-300 dark:border-nike-gray-600 rounded-md bg-white dark:bg-nike-gray-700 text-nike-black dark:text-nike-white focus:ring-nike-red focus:border-nike-red"
                  />
                )}
              </div>
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-nike-black dark:text-nike-white mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.game_date}
                  onChange={(e) => handleInputChange('game_date', e.target.value)}
                  min={getMinDate()}
                  className="w-full px-3 py-2 border border-nike-gray-300 dark:border-nike-gray-600 rounded-md bg-white dark:bg-nike-gray-700 text-nike-black dark:text-nike-white focus:ring-nike-red focus:border-nike-red"
                />
                {errors.game_date && <p className="text-red-500 text-sm mt-1">{errors.game_date}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-nike-black dark:text-nike-white mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.game_time}
                  onChange={(e) => handleInputChange('game_time', e.target.value)}
                  className="w-full px-3 py-2 border border-nike-gray-300 dark:border-nike-gray-600 rounded-md bg-white dark:bg-nike-gray-700 text-nike-black dark:text-nike-white focus:ring-nike-red focus:border-nike-red"
                />
                {errors.game_time && <p className="text-red-500 text-sm mt-1">{errors.game_time}</p>}
              </div>
            </div>

            {/* Duration and Max Players */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-nike-black dark:text-nike-white mb-2">
                  Duration (hours)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full px-3 py-2 border border-nike-gray-300 dark:border-nike-gray-600 rounded-md bg-white dark:bg-nike-gray-700 text-nike-black dark:text-nike-white focus:ring-nike-red focus:border-nike-red"
                >
                  <option value="1">1 hour</option>
                  <option value="1.5">1.5 hours</option>
                  <option value="2">2 hours</option>
                  <option value="2.5">2.5 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-nike-black dark:text-nike-white mb-2">
                  Max Players *
                </label>
                <input
                  type="number"
                  value={formData.max_players}
                  onChange={(e) => handleInputChange('max_players', e.target.value)}
                  min="2"
                  max="50"
                  className="w-full px-3 py-2 border border-nike-gray-300 dark:border-nike-gray-600 rounded-md bg-white dark:bg-nike-gray-700 text-nike-black dark:text-nike-white focus:ring-nike-red focus:border-nike-red"
                />
                {errors.max_players && <p className="text-red-500 text-sm mt-1">{errors.max_players}</p>}
                <p className="text-xs text-nike-gray-500 dark:text-nike-gray-400 mt-1">
                  You (organizer) count as 1 player automatically
                </p>
              </div>
            </div>

            {/* Skill Level and Game Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-nike-black dark:text-nike-white mb-2">
                  Skill Level
                </label>
                <select
                  value={formData.skill_level}
                  onChange={(e) => handleInputChange('skill_level', e.target.value)}
                  className="w-full px-3 py-2 border border-nike-gray-300 dark:border-nike-gray-600 rounded-md bg-white dark:bg-nike-gray-700 text-nike-black dark:text-nike-white focus:ring-nike-red focus:border-nike-red"
                >
                  <option value="All Levels">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-nike-black dark:text-nike-white mb-2">
                  Game Type
                </label>
                <select
                  value={formData.game_type}
                  onChange={(e) => handleInputChange('game_type', e.target.value)}
                  className="w-full px-3 py-2 border border-nike-gray-300 dark:border-nike-gray-600 rounded-md bg-white dark:bg-nike-gray-700 text-nike-black dark:text-nike-white focus:ring-nike-red focus:border-nike-red"
                >
                  <option value="Pickup">Pickup</option>
                  <option value="Competitive">Competitive</option>
                  <option value="Practice">Practice</option>
                  <option value="Tournament">Tournament</option>
                </select>
              </div>
            </div>

            {/* Equipment Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-nike-black dark:text-nike-white flex items-center gap-2">
                🏀 Equipment & What to Bring
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* What Players Should Bring */}
                <div>
                  <label className="block text-sm font-medium text-nike-black dark:text-nike-white mb-2">
                    🎒 What players should bring
                  </label>
                  <textarea
                    value={formData.players_bring}
                    onChange={(e) => handleInputChange('players_bring', e.target.value)}
                    placeholder="e.g., Water bottle, towel, basketball shoes"
                    rows={3}
                    className="w-full px-3 py-2 border border-nike-gray-300 dark:border-nike-gray-600 rounded-md bg-white dark:bg-nike-gray-700 text-nike-black dark:text-nike-white focus:ring-nike-red focus:border-nike-red"
                  />
                  <p className="text-xs text-nike-gray-500 dark:text-nike-gray-400 mt-1">
                    List items each player should bring
                  </p>
                </div>

                {/* What Organizer Will Provide */}
                <div>
                  <label className="block text-sm font-medium text-nike-black dark:text-nike-white mb-2">
                    🏀 What you (organizer) will provide
                  </label>
                  <textarea
                    value={formData.organizer_provides}
                    onChange={(e) => handleInputChange('organizer_provides', e.target.value)}
                    placeholder="e.g., Basketball, first aid kit, cones"
                    rows={3}
                    className="w-full px-3 py-2 border border-nike-gray-300 dark:border-nike-gray-600 rounded-md bg-white dark:bg-nike-gray-700 text-nike-black dark:text-nike-white focus:ring-nike-red focus:border-nike-red"
                  />
                  <p className="text-xs text-nike-gray-500 dark:text-nike-gray-400 mt-1">
                    List items you'll bring for everyone
                  </p>
                </div>
              </div>

              {/* Equipment Tips */}
              <div className="bg-nike-gray-100 dark:bg-nike-gray-700 rounded-lg p-3">
                <p className="text-xs text-nike-gray-600 dark:text-nike-gray-400">
                  💡 <strong>Tip:</strong> Being clear about equipment helps players come prepared and ensures a smooth game experience!
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-6 border-t border-nike-gray-200 dark:border-nike-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="nike-button-outline"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="nike-button disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Creating Game...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Game
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
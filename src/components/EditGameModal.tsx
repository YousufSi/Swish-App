import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, Users, Trophy, Loader, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase/client';
import { Game } from '../lib/supabase/client';

interface EditGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGameUpdated: () => void;
  game: Game;
}

export default function EditGameModal({ isOpen, onClose, onGameUpdated, game }: EditGameModalProps) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    game_date: '',
    game_time: '',
    duration: '2',
    max_players: '10',
    skill_level: 'All Levels',
    game_type: 'Pickup'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen && game) {
      fetchUser();
      populateForm();
    }
  }, [isOpen, game]);

  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const populateForm = () => {
    // Parse duration from interval format (e.g., "2 hours" -> "2")
    const durationMatch = game.duration?.match(/(\d+(?:\.\d+)?)/);
    const durationValue = durationMatch ? durationMatch[1] : '2';

    setFormData({
      title: game.title || '',
      description: game.description || '',
      game_date: game.game_date || '',
      game_time: game.game_time || '',
      duration: durationValue,
      max_players: game.max_players?.toString() || '10',
      skill_level: game.skill_level || 'All Levels',
      game_type: game.game_type || 'Pickup'
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Game title is required';
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
    if (isNaN(maxPlayers) || maxPlayers < 1) {
      newErrors.max_players = 'At least 1 player required';
    }

    if (maxPlayers > 50) {
      newErrors.max_players = 'Maximum 50 players allowed';
    }

    // Check if new max_players is less than current_players
    if (maxPlayers < game.current_players) {
      newErrors.max_players = `Cannot reduce max players below current players (${game.current_players})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!user) {
      alert('You must be logged in to edit a game');
      return;
    }

    // Verify user is the organizer
    if (game.organizer_id !== user.id) {
      alert('Only the organizer can edit this game');
      return;
    }

    setLoading(true);

    try {
      console.log('✏️ Updating game:', game.id);

      // Prepare updated game data
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        game_date: formData.game_date,
        game_time: formData.game_time,
        duration: `${formData.duration} hours`,
        max_players: parseInt(formData.max_players),
        skill_level: formData.skill_level,
        game_type: formData.game_type
      };

      console.log('📝 Update data:', updateData);

      // Update the game
      const { error: updateError } = await supabase
        .from('games')
        .update(updateData)
        .eq('id', game.id)
        .eq('organizer_id', user.id); // Extra security check

      if (updateError) {
        console.error('❌ Error updating game:', updateError);
        throw new Error(`Failed to update game: ${updateError.message}`);
      }

      console.log('✅ Game updated successfully');
      
      onGameUpdated();
      onClose();
      alert('🏀 Game updated successfully!');
    } catch (error: any) {
      console.error('❌ Error updating game:', error);
      alert(`Failed to update game: ${error.message || 'Unknown error occurred'}`);
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
              <Calendar className="h-6 w-6 text-nike-red" />
              Edit Game
            </h3>
            <button
              onClick={onClose}
              className="text-nike-gray-400 hover:text-nike-gray-500 dark:hover:text-nike-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Current Game Info */}
          <div className="mb-6 p-4 bg-nike-gray-100 dark:bg-nike-gray-700 rounded-lg">
            <h4 className="font-bold text-nike-black dark:text-nike-white mb-2">Current Game Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-nike-gray-600 dark:text-nike-gray-400">Court:</span>
                <p className="font-medium text-nike-black dark:text-nike-white">{game.court?.name}</p>
              </div>
              <div>
                <span className="text-nike-gray-600 dark:text-nike-gray-400">Players:</span>
                <p className="font-medium text-nike-black dark:text-nike-white">
                  {game.current_players}/{game.max_players}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-nike-gray-600 dark:text-nike-gray-400">Location:</span>
              <p className="text-sm text-nike-black dark:text-nike-white">{game.court?.address}</p>
            </div>
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
                  min={game.current_players}
                  max="50"
                  className="w-full px-3 py-2 border border-nike-gray-300 dark:border-nike-gray-600 rounded-md bg-white dark:bg-nike-gray-700 text-nike-black dark:text-nike-white focus:ring-nike-red focus:border-nike-red"
                />
                {errors.max_players && <p className="text-red-500 text-sm mt-1">{errors.max_players}</p>}
                <p className="text-xs text-nike-gray-500 dark:text-nike-gray-400 mt-1">
                  Current players: {game.current_players} (cannot reduce below this)
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
                    Updating Game...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update Game
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
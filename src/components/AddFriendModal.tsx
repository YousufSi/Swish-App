import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, Users, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase/client';

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  skill_level: string;
  game_preference: string;
}

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFriendAdded: () => void;
}

export default function AddFriendModal({ isOpen, onClose, onFriendAdded }: AddFriendModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [suggestedFriends, setSuggestedFriends] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [existingFriends, setExistingFriends] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      fetchUser();
      loadSuggestedFriends();
      loadExistingFriends();
    }
  }, [isOpen]);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadExistingFriends = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('friendships')
        .select('friend_id, user_id')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      const friendIds = new Set<string>();
      data?.forEach(friendship => {
        if (friendship.user_id === user.id) {
          friendIds.add(friendship.friend_id);
        } else {
          friendIds.add(friendship.user_id);
        }
      });
      
      setExistingFriends(friendIds);
    } catch (error) {
      console.error('Error loading existing friends:', error);
    }
  };

  const loadSuggestedFriends = async () => {
    if (!user) return;

    try {
      // Get users with similar preferences or skill levels
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('skill_level, game_preference')
        .eq('id', user.id)
        .single();

      if (!userProfile) return;

      const { data: suggested } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, skill_level, game_preference')
        .neq('id', user.id)
        .or(`skill_level.eq.${userProfile.skill_level},game_preference.eq.${userProfile.game_preference}`)
        .limit(6);

      setSuggestedFriends(suggested || []);
    } catch (error) {
      console.error('Error loading suggested friends:', error);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim() || !user) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, skill_level, game_preference')
        .neq('id', user.id)
        .ilike('full_name', `%${query}%`)
        .limit(10);

      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchUsers(searchQuery);
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: user.id,
          friend_id: friendId,
          status: 'pending'
        });

      if (error) {
        console.error('Error sending friend request:', error);
        alert('Error sending friend request. Please try again.');
        return;
      }

      // Update local state
      setExistingFriends(prev => new Set([...prev, friendId]));
      onFriendAdded();
      alert('Friend request sent successfully!');
    } catch (error) {
      console.error('Error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const isFriend = (userId: string) => existingFriends.has(userId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-nike-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-nike-black dark:text-nike-white flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-nike-red" />
              Add Friends
            </h3>
            <button
              onClick={onClose}
              className="text-nike-gray-400 hover:text-nike-gray-500 dark:hover:text-nike-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search Section */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-nike-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for friends by name..."
                  className="w-full pl-10 pr-4 py-2 border border-nike-gray-300 dark:border-nike-gray-600 rounded-md bg-white dark:bg-nike-gray-700 text-nike-black dark:text-nike-white focus:ring-nike-red focus:border-nike-red"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="nike-button flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </button>
            </form>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-bold text-nike-black dark:text-nike-white mb-4 flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Results
                </h4>
                <div className="space-y-3">
                  {searchResults.map((profile) => (
                    <UserCard
                      key={profile.id}
                      profile={profile}
                      onAddFriend={sendFriendRequest}
                      isFriend={isFriend(profile.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Friends */}
            <div>
              <h4 className="text-lg font-bold text-nike-black dark:text-nike-white mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Suggested Friends
              </h4>
              {suggestedFriends.length > 0 ? (
                <div className="space-y-3">
                  {suggestedFriends
                    .filter(profile => !isFriend(profile.id))
                    .map((profile) => (
                      <UserCard
                        key={profile.id}
                        profile={profile}
                        onAddFriend={sendFriendRequest}
                        isFriend={false}
                      />
                    ))}
                </div>
              ) : (
                <p className="text-nike-gray-600 dark:text-nike-gray-400 text-center py-8">
                  No suggested friends available at the moment.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface UserCardProps {
  profile: Profile;
  onAddFriend: (friendId: string) => void;
  isFriend: boolean;
}

function UserCard({ profile, onAddFriend, isFriend }: UserCardProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-nike-gray-100 dark:bg-nike-gray-700 rounded-lg">
      <div className="flex items-center gap-3">
        <img
          src={profile.avatar_url || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
          alt={profile.full_name}
          className="h-12 w-12 rounded-full object-cover"
        />
        <div>
          <h5 className="font-medium text-nike-black dark:text-nike-white">
            {profile.full_name || 'Unknown User'}
          </h5>
          <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">
            {profile.skill_level} • {profile.game_preference}
          </p>
        </div>
      </div>
      
      {isFriend ? (
        <span className="nike-tag bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-400">
          Friends
        </span>
      ) : (
        <button
          onClick={() => onAddFriend(profile.id)}
          className="nike-button-outline flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add Friend
        </button>
      )}
    </div>
  );
}
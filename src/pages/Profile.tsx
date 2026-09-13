import React, { useState, useEffect } from 'react';
import { User, MapPin, Calendar, Trophy, Clock, Award, Star, Zap, Target, Flame, Users, UserPlus, Mail, Crown, Medal, Shield, Rocket, TrendingUp, Activity, CheckCircle, Lock } from 'lucide-react';
import AddFriendModal from '../components/AddFriendModal';

const MOCK_PROFILE = {
  name: 'Alex Thompson',
  email: 'alex.thompson@example.com',
  avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  skillLevel: 'Intermediate',
  gamePreference: 'Pickup',
  searchRadius: '5 miles',
  stats: {
    gamesPlayed: 47,
    averageRating: 4.8,
    winRate: '65%',
    favoritePosition: 'Point Guard',
    totalPoints: 385,
    assists: 156,
    rebounds: 203,
    currentStreak: 5,
    longestStreak: 8,
    courtsVisited: 12,
    monthlyGoal: 20,
    monthlyProgress: 15
  },
  level: {
    current: 15,
    progress: 75,
    title: 'Rising Star',
    xp: 2850,
    nextLevelXp: 3000,
    totalXp: 15420
  },
  badges: [
    {
      id: 'streak_master',
      title: 'Streak Master',
      description: 'Won 5 games in a row',
      icon: Flame,
      rarity: 'legendary',
      earned: true,
      earnedDate: '2024-02-15',
      category: 'Performance'
    },
    {
      id: 'court_explorer',
      title: 'Court Explorer',
      description: 'Played on 10 different courts',
      icon: MapPin,
      rarity: 'epic',
      earned: true,
      earnedDate: '2024-02-10',
      category: 'Exploration'
    },
    {
      id: 'team_player',
      title: 'Team Player',
      description: '100+ assists recorded',
      icon: Users,
      rarity: 'rare',
      earned: true,
      earnedDate: '2024-01-25',
      category: 'Teamwork'
    },
    {
      id: 'sharp_shooter',
      title: 'Sharp Shooter',
      description: 'Scored 20+ points in 5 games',
      icon: Target,
      rarity: 'rare',
      earned: true,
      earnedDate: '2024-01-20',
      category: 'Scoring'
    },
    {
      id: 'mvp_candidate',
      title: 'MVP Candidate',
      description: 'Maintain 4.5+ rating for 10 games',
      icon: Crown,
      rarity: 'legendary',
      earned: true,
      earnedDate: '2024-02-01',
      category: 'Excellence'
    },
    {
      id: 'iron_man',
      title: 'Iron Man',
      description: 'Play 50 games without missing',
      icon: Shield,
      rarity: 'epic',
      earned: false,
      progress: 47,
      target: 50,
      category: 'Consistency'
    },
    {
      id: 'triple_threat',
      title: 'Triple Threat',
      description: 'Record 10+ points, assists, and rebounds in one game',
      icon: Medal,
      rarity: 'epic',
      earned: false,
      category: 'Performance'
    },
    {
      id: 'social_butterfly',
      title: 'Social Butterfly',
      description: 'Make 25 friends on the platform',
      icon: UserPlus,
      rarity: 'common',
      earned: false,
      progress: 3,
      target: 25,
      category: 'Social'
    }
  ],
  monthlyChallenge: {
    title: 'February Hoops Challenge',
    description: 'Play 20 games this month',
    progress: 15,
    target: 20,
    reward: 'Exclusive "February Finisher" badge',
    daysLeft: 8
  },
  weeklyGoals: [
    {
      title: 'Play 3 Games',
      progress: 2,
      target: 3,
      xpReward: 150,
      completed: false
    },
    {
      title: 'Visit 2 New Courts',
      progress: 1,
      target: 2,
      xpReward: 200,
      completed: false
    },
    {
      title: 'Win 2 Games',
      progress: 2,
      target: 2,
      xpReward: 100,
      completed: true
    }
  ],
  friends: [
    {
      id: 1,
      name: 'Sarah Williams',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      gamesPlayed: 35,
      skillLevel: 'Advanced'
    },
    {
      id: 2,
      name: 'Mike Johnson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      gamesPlayed: 42,
      skillLevel: 'Intermediate'
    },
    {
      id: 3,
      name: 'Lisa Chen',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      gamesPlayed: 28,
      skillLevel: 'Intermediate'
    }
  ],
  recentGames: [
    {
      date: '2024-03-10',
      court: 'Central Park Court',
      result: 'Won',
      highlights: '15 points, 5 assists',
      teammates: [
        {
          id: 1,
          name: 'Sarah Williams',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        },
        {
          id: 2,
          name: 'Mike Johnson',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        }
      ]
    },
    {
      date: '2024-03-08',
      court: 'Downtown Rec Center',
      result: 'Lost',
      highlights: '12 points, 8 rebounds',
      teammates: [
        {
          id: 3,
          name: 'Lisa Chen',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        }
      ]
    }
  ],
  availability: [
    { day: 'Monday', time: '18:00 - 20:00' },
    { day: 'Wednesday', time: '18:00 - 20:00' },
    { day: 'Saturday', time: '10:00 - 14:00' }
  ]
};

const getRarityConfig = (rarity: string) => {
  switch (rarity) {
    case 'legendary':
      return {
        gradient: 'from-yellow-400 via-orange-500 to-red-500',
        glow: 'shadow-yellow-500/50',
        border: 'border-yellow-400',
        bg: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
        text: 'text-yellow-800 dark:text-yellow-200'
      };
    case 'epic':
      return {
        gradient: 'from-purple-500 via-blue-500 to-cyan-500',
        glow: 'shadow-purple-500/50',
        border: 'border-purple-400',
        bg: 'bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20',
        text: 'text-purple-800 dark:text-purple-200'
      };
    case 'rare':
      return {
        gradient: 'from-blue-500 to-cyan-500',
        glow: 'shadow-blue-500/50',
        border: 'border-blue-400',
        bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
        text: 'text-blue-800 dark:text-blue-200'
      };
    case 'common':
      return {
        gradient: 'from-gray-400 to-gray-600',
        glow: 'shadow-gray-500/50',
        border: 'border-gray-400',
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50',
        text: 'text-gray-800 dark:text-gray-200'
      };
    default:
      return {
        gradient: 'from-gray-400 to-gray-600',
        glow: 'shadow-gray-500/50',
        border: 'border-gray-400',
        bg: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50',
        text: 'text-gray-800 dark:text-gray-200'
      };
  }
};

export default function Profile() {
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [selectedBadgeCategory, setSelectedBadgeCategory] = useState('All');

  const badgeCategories = ['All', 'Performance', 'Exploration', 'Teamwork', 'Scoring', 'Excellence', 'Consistency', 'Social'];
  const filteredBadges = selectedBadgeCategory === 'All' 
    ? MOCK_PROFILE.badges 
    : MOCK_PROFILE.badges.filter(badge => badge.category === selectedBadgeCategory);

  const earnedBadges = MOCK_PROFILE.badges.filter(badge => badge.earned);
  const totalBadges = MOCK_PROFILE.badges.length;

  const handleFriendAdded = () => {
    // Refresh friends list or update state
    console.log('Friend added successfully');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Gamified Profile Banner */}
      <div className="relative overflow-hidden rounded-2xl mb-8">
        {/* Background with gradient and pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-nike-red via-orange-500 to-yellow-500"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
        
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Profile Info */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={MOCK_PROFILE.avatar}
                  alt={MOCK_PROFILE.name}
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-white/50 shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                  <Crown className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
              
              <div className="text-white">
                <h1 className="text-3xl font-black tracking-tight mb-2">{MOCK_PROFILE.name}</h1>
                <div className="flex items-center gap-4 mb-3">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                    Level {MOCK_PROFILE.level.current}
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                    {MOCK_PROFILE.level.title}
                  </span>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                    {earnedBadges.length}/{totalBadges} Badges
                  </span>
                </div>
                
                {/* XP Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium">{MOCK_PROFILE.level.xp} / {MOCK_PROFILE.level.nextLevelXp} XP</span>
                    <span className="font-medium">{MOCK_PROFILE.level.nextLevelXp - MOCK_PROFILE.level.xp} XP to next level</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-white to-yellow-200 rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${MOCK_PROFILE.level.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-white">{MOCK_PROFILE.stats.gamesPlayed}</div>
                <div className="text-sm text-white/80 font-medium">Games Played</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-white">{MOCK_PROFILE.stats.winRate}</div>
                <div className="text-sm text-white/80 font-medium">Win Rate</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-white">{MOCK_PROFILE.stats.currentStreak}</div>
                <div className="text-sm text-white/80 font-medium">Current Streak</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-white">{MOCK_PROFILE.stats.courtsVisited}</div>
                <div className="text-sm text-white/80 font-medium">Courts Visited</div>
              </div>
            </div>
          </div>

          {/* Recent Badges */}
          <div className="mt-8">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Achievements
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {earnedBadges.slice(0, 5).map((badge) => {
                const Icon = badge.icon;
                const config = getRarityConfig(badge.rarity);
                return (
                  <div
                    key={badge.id}
                    className={`flex-shrink-0 relative group cursor-pointer`}
                    title={badge.description}
                  >
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${config.gradient} p-0.5 ${config.glow} shadow-lg`}>
                      <div className="w-full h-full bg-white/90 dark:bg-nike-gray-800/90 rounded-xl flex items-center justify-center">
                        <Icon className="h-8 w-8 text-nike-black dark:text-nike-white" />
                      </div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-white" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Challenge & Weekly Goals */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Challenge */}
        <div className="nike-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-nike-black dark:text-nike-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-nike-red" />
              {MOCK_PROFILE.monthlyChallenge.title}
            </h3>
            <span className="nike-tag bg-nike-red/10 text-nike-red">
              {MOCK_PROFILE.monthlyChallenge.daysLeft} days left
            </span>
          </div>
          
          <p className="text-nike-gray-600 dark:text-nike-gray-400 mb-4">
            {MOCK_PROFILE.monthlyChallenge.description}
          </p>
          
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-nike-black dark:text-nike-white">
                Progress: {MOCK_PROFILE.monthlyChallenge.progress}/{MOCK_PROFILE.monthlyChallenge.target}
              </span>
              <span className="text-nike-gray-600 dark:text-nike-gray-400">
                {Math.round((MOCK_PROFILE.monthlyChallenge.progress / MOCK_PROFILE.monthlyChallenge.target) * 100)}%
              </span>
            </div>
            <div className="nike-progress-bar">
              <div
                className="nike-progress-bar-fill"
                style={{ width: `${(MOCK_PROFILE.monthlyChallenge.progress / MOCK_PROFILE.monthlyChallenge.target) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="bg-nike-gray-100 dark:bg-nike-gray-700 rounded-lg p-3">
            <p className="text-sm font-medium text-nike-black dark:text-nike-white">
              🏆 Reward: {MOCK_PROFILE.monthlyChallenge.reward}
            </p>
          </div>
        </div>

        {/* Weekly Goals */}
        <div className="nike-card p-6">
          <h3 className="text-lg font-bold text-nike-black dark:text-nike-white mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Weekly Goals
          </h3>
          
          <div className="space-y-4">
            {MOCK_PROFILE.weeklyGoals.map((goal, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-nike-gray-100 dark:bg-nike-gray-700 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-nike-black dark:text-nike-white">{goal.title}</span>
                    {goal.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                  <div className="text-sm text-nike-gray-600 dark:text-nike-gray-400">
                    {goal.progress}/{goal.target} • +{goal.xpReward} XP
                  </div>
                </div>
                <div className="w-16 h-2 bg-nike-gray-200 dark:bg-nike-gray-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      goal.completed ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min((goal.progress / goal.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="nike-card p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-nike-black dark:text-nike-white flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Achievement Badges ({earnedBadges.length}/{totalBadges})
          </h3>
          
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto">
            {badgeCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedBadgeCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedBadgeCategory === category
                    ? 'bg-nike-red text-white'
                    : 'bg-nike-gray-100 dark:bg-nike-gray-700 text-nike-gray-600 dark:text-nike-gray-400 hover:bg-nike-gray-200 dark:hover:bg-nike-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBadges.map((badge) => {
            const Icon = badge.icon;
            const config = getRarityConfig(badge.rarity);
            
            return (
              <div
                key={badge.id}
                className={`relative group cursor-pointer transition-transform hover:scale-105 ${
                  badge.earned ? '' : 'opacity-60'
                }`}
              >
                <div className={`p-1 rounded-xl bg-gradient-to-br ${config.gradient} ${badge.earned ? config.glow : ''} shadow-lg`}>
                  <div className={`${config.bg} p-4 rounded-xl border ${config.border}`}>
                    <div className="text-center">
                      <div className="relative inline-block mb-3">
                        <Icon className={`h-8 w-8 ${config.text}`} />
                        {badge.earned ? (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                            <Lock className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <h4 className={`font-bold text-sm mb-1 ${config.text}`}>
                        {badge.title}
                      </h4>
                      <p className="text-xs text-nike-gray-600 dark:text-nike-gray-400 mb-2">
                        {badge.description}
                      </p>
                      
                      {badge.earned ? (
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          Earned {badge.earnedDate}
                        </span>
                      ) : badge.progress !== undefined ? (
                        <div className="text-xs">
                          <div className="text-nike-gray-600 dark:text-nike-gray-400 mb-1">
                            {badge.progress}/{badge.target}
                          </div>
                          <div className="w-full bg-nike-gray-200 dark:bg-nike-gray-600 rounded-full h-1">
                            <div
                              className="h-1 bg-blue-500 rounded-full transition-all duration-300"
                              style={{ width: `${(badge.progress! / badge.target!) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-nike-gray-500 dark:text-nike-gray-400">
                          Not earned yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Career Stats */}
      <div className="nike-card p-6 mb-8">
        <h3 className="text-lg font-bold text-nike-black dark:text-nike-white mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Career Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="nike-stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="nike-stat-label">Games Won</span>
            </div>
            <p className="nike-stat-value">
              {Math.round(MOCK_PROFILE.stats.gamesPlayed * (parseInt(MOCK_PROFILE.stats.winRate) / 100))}
            </p>
            <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">{MOCK_PROFILE.stats.winRate} win rate</p>
          </div>
          
          <div className="nike-stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-red-500" />
              <span className="nike-stat-label">Total Points</span>
            </div>
            <p className="nike-stat-value">{MOCK_PROFILE.stats.totalPoints}</p>
            <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">
              {(MOCK_PROFILE.stats.totalPoints / MOCK_PROFILE.stats.gamesPlayed).toFixed(1)} PPG
            </p>
          </div>
          
          <div className="nike-stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-blue-500" />
              <span className="nike-stat-label">Assists</span>
            </div>
            <p className="nike-stat-value">{MOCK_PROFILE.stats.assists}</p>
            <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">
              {(MOCK_PROFILE.stats.assists / MOCK_PROFILE.stats.gamesPlayed).toFixed(1)} APG
            </p>
          </div>
          
          <div className="nike-stat-card">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-purple-500" />
              <span className="nike-stat-label">Rebounds</span>
            </div>
            <p className="nike-stat-value">{MOCK_PROFILE.stats.rebounds}</p>
            <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">
              {(MOCK_PROFILE.stats.rebounds / MOCK_PROFILE.stats.gamesPlayed).toFixed(1)} RPG
            </p>
          </div>
        </div>
      </div>

      {/* Friends Section */}
      <div className="nike-card p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-nike-black dark:text-nike-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Friends ({MOCK_PROFILE.friends.length})
          </h3>
          <button 
            onClick={() => setShowAddFriendModal(true)}
            className="nike-button-outline flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add Friend
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_PROFILE.friends.map((friend) => (
            <div key={friend.id} className="flex items-center p-4 border border-nike-gray-200 dark:border-nike-gray-700 rounded-lg bg-white dark:bg-nike-gray-800 hover:border-nike-red transition-colors">
              <img
                src={friend.avatar}
                alt={friend.name}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="ml-3 flex-1">
                <h5 className="font-medium text-nike-black dark:text-nike-white">{friend.name}</h5>
                <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">
                  {friend.gamesPlayed} games • {friend.skillLevel}
                </p>
              </div>
              <button className="nike-button-outline py-1 px-3">
                Invite
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Games */}
      <div className="nike-card p-6">
        <h3 className="text-lg font-bold text-nike-black dark:text-nike-white mb-6 flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-500" />
          Recent Games
        </h3>
        
        <div className="space-y-4">
          {MOCK_PROFILE.recentGames.map((game, index) => (
            <div key={index} className="bg-white dark:bg-nike-gray-800 border border-nike-gray-200 dark:border-nike-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-nike-black dark:text-nike-white">{game.court}</p>
                  <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">{game.date}</p>
                </div>
                <span className={`nike-tag ${
                  game.result === 'Won' ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                }`}>
                  {game.result}
                </span>
              </div>
              <p className="mt-2 text-sm text-nike-gray-600 dark:text-nike-gray-400">{game.highlights}</p>
              <div className="mt-3">
                <p className="text-sm font-medium text-nike-gray-600 dark:text-nike-gray-400 mb-2">Played with:</p>
                <div className="flex -space-x-2">
                  {game.teammates.map((teammate) => (
                    <img
                      key={teammate.id}
                      src={teammate.avatar}
                      alt={teammate.name}
                      className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-nike-gray-800"
                      title={teammate.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Friend Modal */}
      <AddFriendModal
        isOpen={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
        onFriendAdded={handleFriendAdded}
      />
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBasket as Basketball, Map, Calendar, User, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase/client';
import ThemeToggle from './ThemeToggle';

const navigation = [
  { name: 'Home', href: '/', icon: Basketball },
  { name: 'Courts', href: '/courts', icon: Map },
  { name: 'Games', href: '/games', icon: Calendar },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowUserMenu(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-nike-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-nike-gray-900 border-b border-neutral-200 dark:border-nike-gray-700 z-50 transition-colors duration-300">
        <div className="nike-container py-4">
          <div className="flex items-center justify-between">
            <Basketball className="h-8 w-8 text-nike-black dark:text-nike-white" />
            <h1 className="text-xl font-bold text-nike-black dark:text-nike-white">Swish</h1>
            
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              
              {/* User Menu */}
              <div className="relative">
                {user ? (
                  <div>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 p-2 rounded-full hover:bg-nike-gray-100 dark:hover:bg-nike-gray-800 transition-colors"
                    >
                      <img
                        src={user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-nike-gray-800 rounded-lg shadow-lg border border-nike-gray-200 dark:border-nike-gray-700 py-2">
                        <div className="px-4 py-2 border-b border-nike-gray-200 dark:border-nike-gray-700">
                          <p className="text-sm font-medium text-nike-black dark:text-nike-white">
                            {user.user_metadata?.full_name || user.email}
                          </p>
                          <p className="text-xs text-nike-gray-600 dark:text-nike-gray-400">{user.email}</p>
                        </div>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-4 py-2 text-sm text-nike-black dark:text-nike-white hover:bg-nike-gray-100 dark:hover:bg-nike-gray-700 flex items-center space-x-2"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="nike-button-outline py-2 px-4"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-16 pb-20">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="nike-nav">
        <div className="nike-container">
          <div className="flex justify-between">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nike-nav-link ${isActive ? 'nike-nav-link-active' : ''}`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="mt-1 text-xs">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
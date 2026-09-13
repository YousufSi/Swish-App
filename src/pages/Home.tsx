import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBasket as Basketball } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[70vh] bg-gradient-to-br from-nike-red to-nike-black flex items-center">
        <div className="nike-container relative z-10">
          <h1 className="nike-heading text-5xl sm:text-7xl mb-4 text-white">
            FIND YOUR GAME
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Connect with ballers. Play more games.
          </p>
          <button 
            className="bg-white text-nike-black font-bold py-3 px-8 rounded-full hover:bg-nike-gray-100 transition-colors duration-200 uppercase text-sm tracking-wider"
            onClick={() => navigate('/games')}
          >
            Find Games Near You
          </button>
        </div>
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center opacity-30"></div>
      </div>

      {/* Featured Sections */}
      <div className="nike-container py-12 space-y-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="nike-card p-8">
            <h2 className="nike-subheading mb-6 text-nike-black dark:text-nike-white">Nearby Games</h2>
            <div className="space-y-4">
              {[1, 2].map((game) => (
                <div key={game} className="flex items-center space-x-4 p-4 bg-nike-gray-100 dark:bg-nike-gray-700 rounded-xl transition-colors duration-300">
                  <div className="flex-1">
                    <p className="font-bold text-nike-black dark:text-nike-white">Central Park Court</p>
                    <p className="text-nike-gray-600 dark:text-nike-gray-400">2 spots left • 5:30 PM Today</p>
                  </div>
                  <button 
                    className="nike-button py-2 px-4"
                    onClick={() => navigate('/games')}
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="nike-card p-8">
            <h2 className="nike-subheading mb-6 text-nike-black dark:text-nike-white">Available Courts</h2>
            <div className="space-y-4">
              {[1, 2].map((court) => (
                <div key={court} className="flex items-center space-x-4 p-4 bg-nike-gray-100 dark:bg-nike-gray-700 rounded-xl transition-colors duration-300">
                  <div className="flex-1">
                    <p className="font-bold text-nike-black dark:text-nike-white">Downtown Rec Center</p>
                    <p className="text-nike-gray-600 dark:text-nike-gray-400">4.8 ★ • 0.8 miles away</p>
                  </div>
                  <button 
                    className="nike-button py-2 px-4"
                    onClick={() => navigate('/courts')}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
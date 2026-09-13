import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Star, Loader, Settings } from 'lucide-react';
import { courtDiscovery } from '../services/courtDiscovery';
import LocationSettings from '../components/LocationSettings';

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

export default function Courts() {
  const [courts, setCourts] = useState<BasketballCourt[]>([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      discoverCourts();
    }
  }, [userLocation]);

  const loadUserLocation = () => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setUserLocation(JSON.parse(savedLocation));
    }
  };

  const discoverCourts = async () => {
    if (!userLocation) return;

    setLoading(true);
    setError('');

    try {
      const discoveredCourts = await courtDiscovery.findBasketballCourts(userLocation);
      setCourts(discoveredCourts);
      
      if (discoveredCourts.length === 0) {
        setError('No basketball courts found in your area. Try expanding your search radius.');
      }
    } catch (error) {
      console.error('Error discovering courts:', error);
      setError('Failed to find basketball courts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationUpdate = (location: LocationData) => {
    setUserLocation(location);
  };

  const handleNavigate = (court: BasketballCourt) => {
    // Create Google Maps URL for navigation
    const destination = encodeURIComponent(court.address);
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    
    // Open in new tab/window
    window.open(googleMapsUrl, '_blank');
  };

  if (!userLocation) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-nike-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-nike-gray-900 dark:text-nike-gray-100">Set Your Location</h3>
          <p className="mt-1 text-sm text-nike-gray-500 dark:text-nike-gray-400">
            Enter your ZIP code to discover basketball courts near you.
          </p>
          <button
            onClick={() => setShowLocationSettings(true)}
            className="mt-4 nike-button"
          >
            Set Location
          </button>
        </div>

        <LocationSettings
          isOpen={showLocationSettings}
          onClose={() => setShowLocationSettings(false)}
          onLocationUpdate={handleLocationUpdate}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-nike-black dark:text-nike-white">Basketball Courts</h2>
            <p className="text-nike-gray-600 dark:text-nike-gray-400 mt-2">
              Courts within {userLocation.searchRadius} miles of {userLocation.city}, {userLocation.state} {userLocation.zipcode}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={discoverCourts}
              disabled={loading}
              className="nike-button-outline flex items-center gap-2"
            >
              {loading ? <Loader className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              Refresh Courts
            </button>
            <button
              onClick={() => setShowLocationSettings(true)}
              className="nike-button-outline flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Change Location
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-4 p-4 bg-nike-gray-100 dark:bg-nike-gray-800 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Loader className="h-4 w-4 animate-spin text-nike-red" />
              <span className="text-nike-black dark:text-nike-white font-medium">
                Discovering basketball courts near you...
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>

      {loading && courts.length === 0 ? (
        <div className="animate-pulse space-y-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="nike-card p-6">
              <div className="h-6 bg-nike-gray-200 dark:bg-nike-gray-700 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-nike-gray-200 dark:bg-nike-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-nike-gray-200 dark:bg-nike-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courts.map((court) => (
            <div
              key={court.id}
              className="nike-card nike-card-hover"
            >
              <div className="px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-nike-red" />
                    <h3 className="ml-2 text-lg font-medium text-nike-black dark:text-nike-white">{court.name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 rounded-full bg-nike-gray-100 dark:bg-nike-gray-700 text-nike-black dark:text-nike-white hover:bg-nike-red hover:text-white dark:hover:bg-nike-red transition-all duration-200 group"
                      onClick={() => handleNavigate(court)}
                      title="Navigate to court"
                    >
                      <Navigation className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    </button>
                    <span className="nike-tag">
                      {court.type}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">
                    <span className="font-medium">Address:</span> {court.address}{court.city ? `, ${court.city}` : ''}{court.state ? `, ${court.state}` : ''}{court.zipcode ? ` ${court.zipcode}` : ''}
                  </p>
                  
                  {court.distance && (
                    <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">
                      <span className="font-medium">Distance:</span> {court.distance.toFixed(1)} miles away
                    </p>
                  )}
                  
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">
                        <span className="font-medium">Weekdays:</span> {court.hours_weekday}
                      </p>
                      <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">
                        <span className="font-medium">Weekends:</span> {court.hours_weekend}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">
                        <span className="font-medium">Surface:</span> {court.surface}
                      </p>
                      <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">
                        <span className="font-medium">Hoops:</span> {court.hoops}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">
                        <span className="font-medium">Lighting:</span> {court.lighting ? 'Yes' : 'No'}
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">{court.rating}/5.0</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">
                    <span className="font-medium">Busiest:</span> {court.popular_times}
                  </p>
                  
                  <div className="mt-3">
                    <p className="text-sm font-medium text-nike-gray-600 dark:text-nike-gray-400 mb-2">Amenities:</p>
                    <div className="flex flex-wrap gap-2">
                      {court.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="nike-tag text-xs"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {courts.length === 0 && !loading && userLocation && (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-nike-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-nike-gray-900 dark:text-nike-gray-100">No courts found</h3>
          <p className="mt-1 text-sm text-nike-gray-500 dark:text-nike-gray-400">
            Try expanding your search radius or check a different location.
          </p>
          <button
            onClick={() => setShowLocationSettings(true)}
            className="mt-4 nike-button"
          >
            Adjust Search Settings
          </button>
        </div>
      )}

      <LocationSettings
        isOpen={showLocationSettings}
        onClose={() => setShowLocationSettings(false)}
        onLocationUpdate={handleLocationUpdate}
      />
    </div>
  );
}
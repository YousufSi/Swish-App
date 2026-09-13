import React, { useState, useEffect } from 'react';
import { MapPin, Settings, Save, X, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase/client';

interface LocationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationUpdate: (location: LocationData) => void;
}

interface LocationData {
  zipcode: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  searchRadius: number;
}

export default function LocationSettings({ isOpen, onClose, onLocationUpdate }: LocationSettingsProps) {
  const [zipcode, setZipcode] = useState('');
  const [searchRadius, setSearchRadius] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSavedLocation();
    }
  }, [isOpen]);

  const loadSavedLocation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setSearchRadius(profile.search_radius || 10);
        // Load saved location from localStorage
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
          const location = JSON.parse(savedLocation);
          setCurrentLocation(location);
          setZipcode(location.zipcode);
        }
      }
    } catch (error) {
      console.error('Error loading location:', error);
    }
  };

  const validateZipcode = async (zip: string): Promise<LocationData | null> => {
    // Use Zippopotam.us API for real zip code validation
    try {
      const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
      if (!response.ok) {
        throw new Error('Invalid zip code');
      }
      
      const data = await response.json();
      const place = data.places[0];
      
      return {
        zipcode: zip,
        city: place['place name'],
        state: place['state abbreviation'],
        latitude: parseFloat(place.latitude),
        longitude: parseFloat(place.longitude),
        searchRadius: searchRadius
      };
    } catch (error) {
      console.error('Error validating zip code:', error);
      return null;
    }
  };

  const handleSaveLocation = async () => {
    if (!zipcode.trim()) {
      setError('Please enter a zip code');
      return;
    }

    if (!/^\d{5}$/.test(zipcode.trim())) {
      setError('Please enter a valid 5-digit zip code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const locationData = await validateZipcode(zipcode.trim());
      if (!locationData) {
        setError('Invalid zip code. Please enter a valid US zip code.');
        setLoading(false);
        return;
      }

      // Save to user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ search_radius: searchRadius })
          .eq('id', user.id);
      }

      // Save to localStorage
      localStorage.setItem('userLocation', JSON.stringify(locationData));
      
      setCurrentLocation(locationData);
      onLocationUpdate(locationData);
      onClose();
    } catch (error) {
      console.error('Error saving location:', error);
      setError('Failed to save location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError('');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocode to get zip code
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          
          if (response.ok) {
            const data = await response.json();
            const zipCode = data.postcode;
            
            if (zipCode) {
              const locationData: LocationData = {
                zipcode: zipCode,
                city: data.city || data.locality || 'Current Location',
                state: data.principalSubdivision || 'Unknown',
                latitude,
                longitude,
                searchRadius: searchRadius
              };

              localStorage.setItem('userLocation', JSON.stringify(locationData));
              setCurrentLocation(locationData);
              setZipcode(locationData.zipcode);
              onLocationUpdate(locationData);
            } else {
              setError('Unable to determine zip code from your location');
            }
          } else {
            setError('Unable to get location details');
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          setError('Unable to get location details');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to get your current location. Please check your browser permissions.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-nike-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-nike-black dark:text-nike-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-nike-red" />
              Location Settings
            </h3>
            <button
              onClick={onClose}
              className="text-nike-gray-400 hover:text-nike-gray-500 dark:hover:text-nike-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {currentLocation && (
            <div className="mb-4 p-3 bg-nike-gray-100 dark:bg-nike-gray-700 rounded-lg">
              <p className="text-sm font-medium text-nike-black dark:text-nike-white">Current Location</p>
              <p className="text-sm text-nike-gray-600 dark:text-nike-gray-400">
                {currentLocation.city}, {currentLocation.state} {currentLocation.zipcode}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-nike-black dark:text-nike-white mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="Enter any US ZIP code (e.g., 10001)"
                className="w-full px-3 py-2 border border-nike-gray-300 dark:border-nike-gray-600 rounded-md bg-white dark:bg-nike-gray-700 text-nike-black dark:text-nike-white focus:ring-nike-red focus:border-nike-red"
                maxLength={5}
              />
              <p className="text-xs text-nike-gray-500 dark:text-nike-gray-400 mt-1">
                Enter any valid US ZIP code to find nearby basketball courts
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-nike-black dark:text-nike-white mb-2">
                Search Radius: {searchRadius} miles
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={searchRadius}
                onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-nike-gray-200 dark:bg-nike-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-nike-gray-500 dark:text-nike-gray-400 mt-1">
                <span>1 mile</span>
                <span>50 miles</span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={getCurrentLocation}
                disabled={loading}
                className="flex-1 nike-button-outline disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                Use Current Location
              </button>
              <button
                onClick={handleSaveLocation}
                disabled={loading || !zipcode.trim()}
                className="flex-1 nike-button disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Search, Menu, Clock, User, Mic, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import VehicleSelectionPanel from './VehicleSelectionPanel';
import SimpleMapComponent from './SimpleMapComponent';
import { BookingData } from '../App';
import { toast } from 'sonner@2.0.3';

interface MapScreenProps {
  onBookRide: (data: BookingData) => void;
  onViewHistory: () => void;
}

interface Coordinates {
  lat: number;
  lng: number;
}

export default function MapScreen({ onBookRide, onViewHistory }: MapScreenProps) {
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropCoords, setDropCoords] = useState<[number, number] | null>(null);
  const [showVehiclePanel, setShowVehiclePanel] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<'Bike' | 'Auto' | 'Cab' | null>(null);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingPickup, setIsEditingPickup] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showDropSuggestions, setShowDropSuggestions] = useState(false);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Auto-detect location on mount using Geolocation API
  useEffect(() => {
    detectCurrentLocation();
    
    // Show helpful message after a delay
    const timer = setTimeout(() => {
      if (!dropCoords) {
        toast.info('Popular locations: Koramangala, Indiranagar, Whitefield, Airport', {
          duration: 6000
        });
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const detectCurrentLocation = () => {
    setIsDetectingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setPickupCoords([latitude, longitude]);
          
          // Reverse geocode to get address
          try {
            const address = await reverseGeocode(latitude, longitude);
            setPickupLocation(address);
            toast.success('Location detected successfully');
          } catch (error) {
            // Use a formatted coordinate string
            const coordString = `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`;
            setPickupLocation(coordString);
            toast.success('Location detected');
          }
          setIsDetectingLocation(false);
        },
        (error) => {
          let errorMessage = 'Could not detect location';
          
          if (error.code === 1) {
            errorMessage = 'Location permission denied';
          } else if (error.code === 2) {
            errorMessage = 'Location unavailable';
          } else if (error.code === 3) {
            errorMessage = 'Location request timeout';
          }
          
          // Fallback to Bangalore coordinates
          const defaultLat = 12.9352;
          const defaultLng = 77.6245;
          setPickupCoords([defaultLat, defaultLng]);
          setPickupLocation('Koramangala, Bangalore');
          
          if (error.code === 1) {
            toast.info('Using Koramangala as default pickup location. You can change it anytime.');
          } else {
            toast.info(`${errorMessage}. Using Koramangala as default.`);
          }
          setIsDetectingLocation(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      // Geolocation not supported, use default
      setPickupCoords([12.9352, 77.6245]);
      setPickupLocation('Koramangala, Bangalore');
      toast.info('Using Koramangala as default pickup location');
      setIsDetectingLocation(false);
    }
  };

  // Mock location database for common locations
  const mockLocations: { [key: string]: { lat: number; lng: number } } = {
    'koramangala': { lat: 12.9352, lng: 77.6245 },
    'indiranagar': { lat: 12.9716, lng: 77.6412 },
    'whitefield': { lat: 12.9698, lng: 77.7500 },
    'mg road': { lat: 12.9759, lng: 77.6061 },
    'airport': { lat: 13.1986, lng: 77.7066 },
    'electronic city': { lat: 12.8399, lng: 77.6770 },
    'hsr layout': { lat: 12.9121, lng: 77.6446 },
    'hsr': { lat: 12.9121, lng: 77.6446 },
    'jayanagar': { lat: 12.9250, lng: 77.5838 },
    'btm layout': { lat: 12.9165, lng: 77.6101 },
    'btm': { lat: 12.9165, lng: 77.6101 },
    'marathahalli': { lat: 12.9591, lng: 77.6974 },
    'silk board': { lat: 12.9177, lng: 77.6237 },
    'hebbal': { lat: 13.0358, lng: 77.5970 },
    'yelahanka': { lat: 13.1007, lng: 77.5963 },
    'jp nagar': { lat: 12.9077, lng: 77.5859 },
    'banashankari': { lat: 12.9250, lng: 77.5461 },
    'rajajinagar': { lat: 12.9917, lng: 77.5553 },
    'malleshwaram': { lat: 13.0029, lng: 77.5707 },
    'vijayanagar': { lat: 12.9718, lng: 77.5341 },
    'yeshwanthpur': { lat: 13.0281, lng: 77.5385 },
    'kr puram': { lat: 13.0094, lng: 77.6963 },
    'bellandur': { lat: 12.9259, lng: 77.6784 },
    'sarjapur': { lat: 12.8756, lng: 77.7509 },
    'bannerghatta': { lat: 12.8007, lng: 77.5963 },
    'basavanagudi': { lat: 12.9423, lng: 77.5738 },
  };

  // Get location name suggestions based on input
  const getLocationSuggestions = (query: string): string[] => {
    if (!query || query.length < 2) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    const suggestions: string[] = [];
    
    // Search in mock locations
    for (const key in mockLocations) {
      if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
        // Format the key nicely for display
        const formatted = key.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        if (!suggestions.includes(formatted)) {
          suggestions.push(formatted);
        }
      }
    }
    
    return suggestions.slice(0, 5);
  };

  // Fetch suggestions from Nominatim API
  const fetchNominatimSuggestions = async (query: string): Promise<string[]> => {
    if (!query || query.length < 3) return [];
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Bangalore, India')}&limit=5&addressdetails=1`,
        { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      
      return data.map((item: any) => {
        const parts = item.display_name.split(',');
        return parts.slice(0, 3).join(',').trim();
      });
    } catch (error) {
      return [];
    }
  };

  // Handle location input change with real-time suggestions
  const handleLocationInputChange = async (type: 'pickup' | 'drop', value: string) => {
    if (type === 'pickup') {
      setPickupLocation(value);
      setShowPickupSuggestions(true);
    } else {
      setDropLocation(value);
      setShowDropSuggestions(true);
    }
    
    // Get instant suggestions from mock data
    const instantSuggestions = getLocationSuggestions(value);
    
    if (type === 'pickup') {
      setPickupSuggestions(instantSuggestions);
    } else {
      setDropSuggestions(instantSuggestions);
    }
    
    // Fetch API suggestions in background
    if (value.length >= 3) {
      setIsLoadingSuggestions(true);
      const apiSuggestions = await fetchNominatimSuggestions(value);
      
      // Merge suggestions, prioritizing instant ones
      const allSuggestions = [...new Set([...instantSuggestions, ...apiSuggestions])].slice(0, 5);
      
      if (type === 'pickup') {
        setPickupSuggestions(allSuggestions);
      } else {
        setDropSuggestions(allSuggestions);
      }
      setIsLoadingSuggestions(false);
    }
  };

  // Reverse geocoding using Nominatim (OpenStreetMap) with fallback
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      if (data.display_name) {
        // Extract a shorter, more readable address
        const parts = data.display_name.split(',');
        return parts.slice(0, 3).join(',').trim();
      }
      throw new Error('Could not get address');
    } catch (error) {
      // Return coordinates if geocoding fails
      throw error;
    }
  };

  // Geocoding using Nominatim (OpenStreetMap) with fallback to mock data
  const geocodeLocation = async (location: string): Promise<Coordinates> => {
    // Check mock locations first (case-insensitive)
    const normalizedLocation = location.toLowerCase().trim();
    if (mockLocations[normalizedLocation]) {
      return mockLocations[normalizedLocation];
    }
    
    // Try partial matches
    for (const key in mockLocations) {
      if (normalizedLocation.includes(key) || key.includes(normalizedLocation)) {
        return mockLocations[key];
      }
    }
    
    // Try API as fallback
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location + ', Bangalore, India')}&limit=1`,
        { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    } catch (error) {
      console.warn('Geocoding API failed, location not found in mock data');
    }
    
    throw new Error('Location not found');
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (coord1: [number, number], coord2: [number, number]): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return parseFloat(distance.toFixed(1));
  };

  const calculateRoute = async (pickupCoords: [number, number], dropCoords: [number, number]) => {
    if (pickupCoords && dropCoords) {
      const dist = calculateDistance(pickupCoords, dropCoords);
      const dur = Math.round(dist * 3 + Math.random() * 10); // rough estimate in minutes
      setDistance(dist);
      setDuration(dur);
    }
  };

  const handleDestinationSelect = async (destination: string) => {
    setDropLocation(destination);
    
    if (!pickupCoords) {
      toast.error('Please set pickup location first');
      return;
    }
    
    try {
      // Geocode the destination
      const coords = await geocodeLocation(destination);
      setDropCoords([coords.lat, coords.lng]);
      
      await calculateRoute(pickupCoords, [coords.lat, coords.lng]);
      setShowVehiclePanel(true);
      toast.success('Destination set');
    } catch (error) {
      toast.error('Location not found. Try: Indiranagar, Whitefield, MG Road');
      setDropLocation('');
    }
  };

  const handlePickupChange = async (location: string) => {
    setPickupLocation(location);
    setShowPickupSuggestions(false);
    
    try {
      // Geocode the pickup location
      const coords = await geocodeLocation(location);
      setPickupCoords([coords.lat, coords.lng]);
      
      if (dropCoords) {
        await calculateRoute([coords.lat, coords.lng], dropCoords);
      }
      toast.success('Pickup location updated');
    } catch (error) {
      toast.error('Location not found. Try: Koramangala, HSR Layout, Jayanagar');
      // Keep the text but don't update coordinates
    }
  };

  // Handle marker drag on map
  const handlePickupMarkerDrag = async (coords: [number, number]) => {
    setPickupCoords(coords);
    
    try {
      const address = await reverseGeocode(coords[0], coords[1]);
      setPickupLocation(address);
      toast.success('Pickup location updated');
      
      if (dropCoords) {
        await calculateRoute(coords, dropCoords);
      }
    } catch (error) {
      const coordString = `${coords[0].toFixed(4)}°N, ${coords[1].toFixed(4)}°E`;
      setPickupLocation(coordString);
      toast.success('Pickup location set');
    }
  };

  const handleDropMarkerDrag = async (coords: [number, number]) => {
    setDropCoords(coords);
    
    if (!pickupCoords) {
      toast.error('Please set pickup location first');
      return;
    }
    
    try {
      const address = await reverseGeocode(coords[0], coords[1]);
      setDropLocation(address);
      
      await calculateRoute(pickupCoords, coords);
      setShowVehiclePanel(true);
      toast.success('Drop location updated');
    } catch (error) {
      const coordString = `${coords[0].toFixed(4)}°N, ${coords[1].toFixed(4)}°E`;
      setDropLocation(coordString);
      toast.success('Drop location set');
    }
  };

  const handleVehicleSelect = (vehicle: 'Bike' | 'Auto' | 'Cab', fare: number) => {
    setSelectedVehicle(vehicle);
    const bookingData: BookingData = {
      pickupLocation,
      dropLocation,
      distance,
      duration,
      vehicleType: vehicle,
      fare
    };
    onBookRide(bookingData);
  };

  return (
    <div className="fixed inset-0 bg-gray-100">
      {/* OpenStreetMap */}
      <SimpleMapComponent
        pickupCoords={pickupCoords}
        dropCoords={dropCoords}
        pickupLocation={pickupLocation}
        dropLocation={dropLocation}
        onPickupMarkerDrag={handlePickupMarkerDrag}
        onDropMarkerDrag={handleDropMarkerDrag}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10">
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            className="bg-white shadow-lg"
            onClick={() => setShowMenu(!showMenu)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex-1 bg-white rounded-lg shadow-lg p-3 space-y-3">
            {/* Pickup Location */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0" />
              {isEditingPickup ? (
                <>
                  <Input
                    placeholder="Pickup from? (e.g., Koramangala)"
                    value={pickupLocation}
                    onChange={(e) => handleLocationInputChange('pickup', e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && pickupLocation) {
                        handlePickupChange(pickupLocation);
                        setIsEditingPickup(false);
                        setShowPickupSuggestions(false);
                      }
                    }}
                    onFocus={() => {
                      if (pickupLocation) {
                        handleLocationInputChange('pickup', pickupLocation);
                      }
                    }}
                    autoFocus
                    className="border-0 p-0 h-auto focus-visible:ring-0 text-sm"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => setIsEditingPickup(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditingPickup(true)}
                    className="flex-1 text-left text-sm text-gray-600 hover:text-gray-900 truncate"
                  >
                    {pickupLocation || 'Set pickup location'}
                  </button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={detectCurrentLocation}
                    disabled={isDetectingLocation}
                  >
                    {isDetectingLocation ? (
                      <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                    ) : (
                      <Navigation className="w-4 h-4 text-green-600" />
                    )}
                  </Button>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Drop Location */}
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-red-600 fill-red-600 flex-shrink-0" />
              <Input
                placeholder="Where to? (e.g., Indiranagar, Airport)"
                value={dropLocation}
                onChange={(e) => handleLocationInputChange('drop', e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && dropLocation && pickupLocation) {
                    handleDestinationSelect(dropLocation);
                    setShowDropSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (dropLocation) {
                    handleLocationInputChange('drop', dropLocation);
                  }
                }}
                className="border-0 p-0 h-auto focus-visible:ring-0 text-sm"
              />
              {dropLocation && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => {
                    setDropLocation('');
                    setDropCoords(null);
                    setShowVehiclePanel(false);
                    setDistance(0);
                    setDuration(0);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0">
                <Mic className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Destinations */}
        {!dropLocation && pickupCoords && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex gap-2 overflow-x-auto pb-2"
          >
            {['MG Road', 'Indiranagar', 'Whitefield', 'Airport', 'Electronic City'].map((place) => (
              <button
                key={place}
                onClick={() => handleDestinationSelect(place)}
                className="bg-white px-4 py-2 rounded-full shadow text-sm whitespace-nowrap hover:bg-gray-50 transition-colors"
              >
                {place}
              </button>
            ))}
          </motion.div>
        )}

        {/* Pickup Suggestions Dropdown */}
        {isEditingPickup && showPickupSuggestions && pickupSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 bg-white rounded-lg shadow-lg p-2 space-y-1 max-h-64 overflow-y-auto"
          >
            {pickupSuggestions.map((place, index) => (
              <button
                key={`${place}-${index}`}
                onClick={() => {
                  handlePickupChange(place);
                  setIsEditingPickup(false);
                  setShowPickupSuggestions(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{place}</span>
                </div>
              </button>
            ))}
            {isLoadingSuggestions && (
              <div className="flex items-center justify-center py-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="ml-2 text-xs">Searching...</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Drop Suggestions Dropdown */}
        {!isEditingPickup && showDropSuggestions && dropSuggestions.length > 0 && dropLocation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 bg-white rounded-lg shadow-lg p-2 space-y-1 max-h-64 overflow-y-auto"
          >
            {dropSuggestions.map((place, index) => (
              <button
                key={`${place}-${index}`}
                onClick={() => {
                  handleDestinationSelect(place);
                  setShowDropSuggestions(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-sm transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{place}</span>
                </div>
              </button>
            ))}
            {isLoadingSuggestions && (
              <div className="flex items-center justify-center py-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="ml-2 text-xs">Searching...</span>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Side Menu */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 z-20"
              onClick={() => setShowMenu(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-white z-30 shadow-xl"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-600 rounded-full p-3">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3>Rajesh Kumar</h3>
                    <p className="text-sm text-gray-600">+91 98765 43210</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <button 
                    onClick={() => {
                      onViewHistory();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 flex items-center gap-3"
                  >
                    <Clock className="w-5 h-5" />
                    Ride History
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Current Location Button */}
      <div className="absolute right-4 top-32 z-10">
        <Button
          size="icon"
          className="bg-white shadow-lg rounded-full w-12 h-12 hover:bg-gray-50"
          variant="outline"
        >
          <Navigation className="w-5 h-5 text-green-600" />
        </Button>
      </div>

      {/* Trip Info Card */}
      {dropLocation && distance > 0 && !showVehiclePanel && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="absolute bottom-20 left-4 right-4 bg-white rounded-lg shadow-xl p-4 z-10"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Distance</p>
              <p className="text-xl">{distance} km</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Time</p>
              <p className="text-xl">{duration} min</p>
            </div>
            <Button
              onClick={() => setShowVehiclePanel(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              Select Vehicle
            </Button>
          </div>
        </motion.div>
      )}

      {/* Vehicle Selection Panel */}
      {showVehiclePanel && (
        <VehicleSelectionPanel
          distance={distance}
          duration={duration}
          onSelectVehicle={handleVehicleSelect}
          onClose={() => setShowVehiclePanel(false)}
        />
      )}
    </div>
  );
}

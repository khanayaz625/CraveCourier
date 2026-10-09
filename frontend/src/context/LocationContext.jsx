import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

const defaultIndianLocations = [
  { 
    id: 'loc-1', 
    label: 'Indiranagar (Home)', 
    address: '100ft Road, 12th Main, HAL 2nd Stage, Indiranagar', 
    city: 'Bengaluru', 
    state: 'Karnataka',
    postalCode: '560038',
    lat: 12.9784, 
    lng: 77.6408,
    isGPS: false,
    default: true 
  },
  { 
    id: 'loc-2', 
    label: 'Koramangala (Office)', 
    address: '80ft Road, 4th Block, Near Sony World Signal, Koramangala', 
    city: 'Bengaluru', 
    state: 'Karnataka',
    postalCode: '560034',
    lat: 12.9352, 
    lng: 77.6245,
    isGPS: false,
    default: false 
  },
  { 
    id: 'loc-3', 
    label: 'Bandra West (Flat)', 
    address: 'Hill Road, Near Bandstand Promenade, Bandra West', 
    city: 'Mumbai', 
    state: 'Maharashtra',
    postalCode: '400050',
    lat: 19.0596, 
    lng: 72.8295,
    isGPS: false,
    default: false 
  },
  { 
    id: 'loc-4', 
    label: 'Connaught Place', 
    address: 'Inner Circle, Block C, Connaught Place', 
    city: 'New Delhi', 
    state: 'Delhi',
    postalCode: '110001',
    lat: 28.6315, 
    lng: 77.2167,
    isGPS: false,
    default: false 
  }
];

export const LocationProvider = ({ children }) => {
  const [savedLocations, setSavedLocations] = useState(() => {
    try {
      const saved = localStorage.getItem('crave_saved_locations');
      return saved ? JSON.parse(saved) : defaultIndianLocations;
    } catch {
      return defaultIndianLocations;
    }
  });

  const [currentLocation, setCurrentLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('crave_current_location');
      return saved ? JSON.parse(saved) : defaultIndianLocations[0];
    } catch {
      return defaultIndianLocations[0];
    }
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('crave_saved_locations', JSON.stringify(savedLocations));
    } catch (e) {
      console.warn('Failed to save locations to localStorage:', e);
    }
  }, [savedLocations]);

  useEffect(() => {
    try {
      localStorage.setItem('crave_current_location', JSON.stringify(currentLocation));
    } catch (e) {
      console.warn('Failed to save current location to localStorage:', e);
    }
  }, [currentLocation]);

  // Calculate distance in kilometers using Haversine formula
  const calculateDistance = (targetLat, targetLng) => {
    if (!currentLocation?.lat || !currentLocation?.lng || !targetLat || !targetLng) {
      return 2.5; // default fallback km
    }
    const R = 6371; // Earth's radius in km
    const dLat = (targetLat - currentLocation.lat) * (Math.PI / 180);
    const dLon = (targetLng - currentLocation.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(currentLocation.lat * (Math.PI / 180)) *
      Math.cos(targetLat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  };

  // Reverse Geocoding with OpenStreetMap Nominatim and BigDataCloud fallback
  const reverseGeocode = async (lat, lng) => {
    try {
      // 1. Try OpenStreetMap Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'CraveCourierFoodDeliveryApp/1.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const addr = data.address || {};
        
        const neighbourhood = addr.suburb || addr.neighbourhood || addr.residential || addr.road || 'Current Location';
        const city = addr.city || addr.town || addr.county || addr.state_district || 'Bengaluru';
        const state = addr.state || 'Karnataka';
        const postalCode = addr.postcode || '';
        const fullDisplay = [addr.road, neighbourhood, city, state, postalCode].filter(Boolean).join(', ');

        return {
          label: `${neighbourhood}, ${city}`,
          address: fullDisplay || data.display_name,
          city,
          state,
          postalCode
        };
      }
    } catch (err) {
      console.warn('Nominatim reverse geocode notice:', err.message);
    }

    try {
      // 2. Try BigDataCloud Free Client API fallback
      const bdcResp = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      if (bdcResp.ok) {
        const bdcData = await bdcResp.json();
        const locality = bdcData.locality || bdcData.city || 'My Location';
        const city = bdcData.city || bdcData.principalSubdivision || 'Bengaluru';
        const state = bdcData.principalSubdivision || 'Karnataka';
        const postalCode = bdcData.postcode || '';

        return {
          label: `${locality}, ${city}`,
          address: `${locality}, ${city}, ${state} ${postalCode}`.trim(),
          city,
          state,
          postalCode
        };
      }
    } catch (bdcErr) {
      console.warn('BigDataCloud reverse geocode notice:', bdcErr.message);
    }

    // Default fallback based on coordinates
    return {
      label: `GPS (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`,
      address: `Live GPS Location @ ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      city: 'India Hub',
      state: '',
      postalCode: ''
    };
  };

  // Live GPS Detection via Browser Geolocation API
  const detectGPSLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = 'Geolocation is not supported by your browser.';
        setGpsError(err);
        reject(new Error(err));
        return;
      }

      setIsDetectingGPS(true);
      setGpsError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy || 10);
          setGpsAccuracy(accuracy);

          try {
            const geoInfo = await reverseGeocode(lat, lng);
            const newLoc = {
              id: `loc-gps-${Date.now()}`,
              label: geoInfo.label,
              address: geoInfo.address,
              city: geoInfo.city,
              state: geoInfo.state,
              postalCode: geoInfo.postalCode,
              lat,
              lng,
              accuracy,
              isGPS: true,
              updatedAt: new Date().toLocaleTimeString()
            };

            setCurrentLocation(newLoc);
            setSavedLocations(prev => {
              const filtered = prev.filter(l => !l.isGPS);
              return [newLoc, ...filtered];
            });

            setIsDetectingGPS(false);
            resolve(newLoc);
          } catch (err) {
            setIsDetectingGPS(false);
            const fallbackLoc = {
              id: `loc-gps-${Date.now()}`,
              label: `GPS Location (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
              address: `Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
              city: 'Detected Locality',
              lat,
              lng,
              accuracy,
              isGPS: true
            };
            setCurrentLocation(fallbackLoc);
            resolve(fallbackLoc);
          }
        },
        (error) => {
          setIsDetectingGPS(false);
          let message = 'Unable to retrieve your location.';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Location access was denied. Please allow location permissions in your browser.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'GPS location information is currently unavailable.';
          } else if (error.code === error.TIMEOUT) {
            message = 'GPS detection timed out. Please try again.';
          }
          setGpsError(message);
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 0
        }
      );
    });
  };

  const addLocation = (newLoc) => {
    const loc = { 
      ...newLoc, 
      id: `loc-${Date.now()}`,
      isGPS: false 
    };
    setSavedLocations(prev => [loc, ...prev]);
    setCurrentLocation(loc);
  };

  const removeLocation = (locId) => {
    setSavedLocations(prev => prev.filter(l => l.id !== locId));
  };

  return (
    <LocationContext.Provider value={{
      currentLocation,
      setCurrentLocation,
      savedLocations,
      addLocation,
      removeLocation,
      isLocationModalOpen,
      setIsLocationModalOpen,
      detectGPSLocation,
      isDetectingGPS,
      gpsError,
      gpsAccuracy,
      calculateDistance
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);

'use client';

import { useState, useEffect, useCallback } from 'react';

const LOCATION_STORAGE_KEY = 'egarage_user_location';

interface LocationData {
  lat: number;
  lng: number;
  city?: string;
  timestamp: number;
}

interface UseLocationState {
  lat: number | null;
  lng: number | null;
  city: string | null;
  isLoading: boolean;
  error: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unknown';
}

interface UseLocationReturn extends UseLocationState {
  requestPermission: () => Promise<boolean>;
  clearLocation: () => void;
}

// Cache duration: 1 hour
const CACHE_DURATION = 60 * 60 * 1000;

export function useLocation(): UseLocationReturn {
  const [state, setState] = useState<UseLocationState>({
    lat: null,
    lng: null,
    city: null,
    isLoading: true,
    error: null,
    permissionStatus: 'unknown',
  });

  // Load cached location on mount
  useEffect(() => {
    const loadCachedLocation = () => {
      try {
        const cached = localStorage.getItem(LOCATION_STORAGE_KEY);
        if (cached) {
          const data: LocationData = JSON.parse(cached);
          const isExpired = Date.now() - data.timestamp > CACHE_DURATION;

          if (!isExpired) {
            setState(prev => ({
              ...prev,
              lat: data.lat,
              lng: data.lng,
              city: data.city || null,
              isLoading: false,
            }));
            return;
          }
        }
      } catch {
        // Ignore parse errors
      }
      setState(prev => ({ ...prev, isLoading: false }));
    };

    // Check permission status
    const checkPermission = async () => {
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          setState(prev => ({
            ...prev,
            permissionStatus: result.state as 'prompt' | 'granted' | 'denied',
          }));

          // Listen for permission changes
          result.addEventListener('change', () => {
            setState(prev => ({
              ...prev,
              permissionStatus: result.state as 'prompt' | 'granted' | 'denied',
            }));
          });
        } catch {
          // permissions API not supported
        }
      }
    };

    loadCachedLocation();
    checkPermission();
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('geolocation' in navigator)) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        isLoading: false,
      }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Try to get city name via reverse geocoding (optional)
          let city: string | undefined;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );
            const data = await response.json();
            city = data.address?.city || data.address?.town || data.address?.county;
          } catch {
            // Reverse geocoding failed, continue without city name
          }

          // Cache the location
          const locationData: LocationData = {
            lat: latitude,
            lng: longitude,
            city,
            timestamp: Date.now(),
          };
          localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));

          setState({
            lat: latitude,
            lng: longitude,
            city: city || null,
            isLoading: false,
            error: null,
            permissionStatus: 'granted',
          });
          resolve(true);
        },
        (error) => {
          let errorMessage: string;
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied';
              setState(prev => ({ ...prev, permissionStatus: 'denied' }));
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'An unknown error occurred';
          }
          setState(prev => ({
            ...prev,
            error: errorMessage,
            isLoading: false,
          }));
          resolve(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: CACHE_DURATION,
        }
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
    setState({
      lat: null,
      lng: null,
      city: null,
      isLoading: false,
      error: null,
      permissionStatus: 'unknown',
    });
  }, []);

  return {
    ...state,
    requestPermission,
    clearLocation,
  };
}

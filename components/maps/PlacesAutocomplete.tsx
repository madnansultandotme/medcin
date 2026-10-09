'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface PlaceResult {
  formattedAddress: string;
  city: string;
  country: string;
  countryCode: string;
  streetAddress: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: PlaceResult) => void;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  countries?: string[]; // Restrict to specific countries (e.g., ['sg', 'th', 'my'])
}

export function PlacesAutocomplete({
  onPlaceSelect,
  defaultValue = '',
  placeholder = 'Enter location...',
  className = '',
  countries = ['sg', 'th', 'my', 'vn', 'id', 'ph'], // ASEAN countries
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      setError('Google Maps API key not configured');
      console.error('Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file');
      return;
    }

    // Check if already loaded
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      setIsLoaded(true);
      return;
    }

    // Load Google Maps API with Places library
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      setError('Failed to load Google Maps API');
    };

    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    // Initialize Autocomplete with proper options
    const options: google.maps.places.AutocompleteOptions = {
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: countries },
      fields: [
        'formatted_address',
        'address_components',
        'geometry',
        'place_id',
        'name',
      ],
    };

    autocompleteRef.current = new google.maps.places.Autocomplete(
      inputRef.current,
      options
    );

    // Listen for place selection
    const listener = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();

      if (!place || !place.geometry || !place.geometry.location) {
        console.error('No details available for input:', place?.name);
        return;
      }

      // Extract address components
      const addressComponents = place.address_components || [];
      let city = '';
      let country = '';
      let countryCode = '';
      let streetNumber = '';
      let route = '';
      let locality = '';
      let administrativeArea = '';
      let sublocality = '';

      for (const component of addressComponents) {
        const types = component.types;

        if (types.includes('street_number')) {
          streetNumber = component.long_name;
        }
        if (types.includes('route')) {
          route = component.long_name;
        }
        if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
          sublocality = component.long_name;
        }
        if (types.includes('locality')) {
          locality = component.long_name;
          city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          administrativeArea = component.long_name;
          if (!city) city = component.long_name;
        }
        if (types.includes('country')) {
          country = component.long_name;
          countryCode = component.short_name;
        }
      }

      // Build street address
      const streetParts = [streetNumber, route, sublocality].filter(Boolean);
      let streetAddress = '';
      
      if (place.name && !streetParts.some(part => place.name?.includes(part))) {
        streetAddress = place.name;
        if (streetParts.length > 0) {
          streetAddress += ', ' + streetParts.join(' ');
        }
      } else {
        streetAddress = streetParts.join(' ') || place.formatted_address?.split(',')[0] || '';
      }

      // Extract coordinates
      const latitude = place.geometry.location.lat();
      const longitude = place.geometry.location.lng();

      const placeResult: PlaceResult = {
        formattedAddress: place.formatted_address || '',
        city: city || locality || administrativeArea || '',
        country: country,
        countryCode: countryCode.toUpperCase(),
        streetAddress: streetAddress,
        latitude,
        longitude,
        placeId: place.place_id || '',
      };

      console.log('Place selected:', placeResult);
      onPlaceSelect(placeResult);
    });

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [isLoaded, onPlaceSelect, countries]);

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
        <MapPin className="h-4 w-4 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        <MapPin className="h-5 w-5 text-gray-400" />
      </div>
      <input
        ref={inputRef}
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={!isLoaded}
        className={`w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1769AA] focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      />
      {!isLoaded && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#1769AA] rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

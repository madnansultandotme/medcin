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

// Declare the custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmp-place-autocomplete': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

export function PlacesAutocomplete({
  onPlaceSelect,
  defaultValue = '',
  placeholder = 'Enter location...',
  className = '',
  countries = ['sg', 'th', 'my', 'vn', 'id', 'ph'], // ASEAN countries
}: PlacesAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
      setError('Google Maps API key not configured');
      console.error('Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file');
      setIsLoading(false);
      return;
    }

    let autocompleteElement: google.maps.places.PlaceAutocompleteElement | null = null;
    let isMounted = true;

    async function initAutocomplete() {
      try {
        // Wait for google.maps to be available
        if (!window.google?.maps?.importLibrary) {
          console.error('Google Maps not loaded');
          setError('Google Maps not loaded');
          setIsLoading(false);
          return;
        }

        // Load the Places library using importLibrary
        const placesLibrary = await window.google.maps.importLibrary('places') as any;
        
        if (!placesLibrary) {
          throw new Error('Failed to load Places library');
        }

        // @ts-ignore - PlaceAutocompleteElement is available but not in type definitions yet
        const { PlaceAutocompleteElement } = placesLibrary;

        if (!PlaceAutocompleteElement) {
          throw new Error('PlaceAutocompleteElement not available');
        }

        if (!isMounted || !containerRef.current) return;

        // Create the PlaceAutocompleteElement
        // @ts-ignore - PlaceAutocompleteElement constructor
        autocompleteElement = new PlaceAutocompleteElement({
          componentRestrictions: { country: countries },
        });

        // Set placeholder if provided
        if (placeholder && autocompleteElement) {
          autocompleteElement.setAttribute('placeholder', placeholder);
        }

        // Append to container
        if (autocompleteElement && containerRef.current) {
          containerRef.current.appendChild(autocompleteElement);
        }

        // Listen for place selection (gmp-select event)
        const handlePlaceSelect = async (event: Event) => {
          const selectEvent = event as any; // PlacePredictionSelectEvent
          const placePrediction = selectEvent.placePrediction;

          if (!placePrediction) {
            console.error('No place prediction available');
            return;
          }

          try {
            // Convert prediction to Place object
            const place = placePrediction.toPlace();

            // Fetch detailed fields
            await place.fetchFields({
              fields: [
                'displayName',
                'formattedAddress',
                'addressComponents',
                'location',
                'id',
              ],
            });

            // Extract address components
            const addressComponents = place.addressComponents || [];
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
                streetNumber = component.longText || '';
              }
              if (types.includes('route')) {
                route = component.longText || '';
              }
              if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
                sublocality = component.longText || '';
              }
              if (types.includes('locality')) {
                locality = component.longText || '';
                city = component.longText || '';
              }
              if (types.includes('administrative_area_level_1')) {
                administrativeArea = component.longText || '';
                if (!city) city = component.longText || '';
              }
              if (types.includes('country')) {
                country = component.longText || '';
                countryCode = component.shortText || '';
              }
            }

            // Build street address
            const streetParts = [streetNumber, route, sublocality].filter(Boolean);
            let streetAddress = '';
            
            const displayName = place.displayName || '';
            if (displayName && !streetParts.some(part => displayName.includes(part))) {
              streetAddress = displayName;
              if (streetParts.length > 0) {
                streetAddress += ', ' + streetParts.join(' ');
              }
            } else {
              streetAddress = streetParts.join(' ') || place.formattedAddress?.split(',')[0] || '';
            }

            // Extract coordinates
            const location = place.location;
            const latitude = location?.lat() || 0;
            const longitude = location?.lng() || 0;

            const placeResult: PlaceResult = {
              formattedAddress: place.formattedAddress || '',
              city: city || locality || administrativeArea || '',
              country: country,
              countryCode: countryCode.toUpperCase(),
              streetAddress: streetAddress,
              latitude,
              longitude,
              placeId: place.id || '',
            };

            console.log('Place selected:', placeResult);
            onPlaceSelect(placeResult);
          } catch (err) {
            console.error('Error fetching place details:', err);
          }
        };

        if (autocompleteElement) {
          autocompleteElement.addEventListener('gmp-select', handlePlaceSelect);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load Google Maps Places');
        setIsLoading(false);
      }
    }

    // Check if Google Maps is already loaded
    if (window.google?.maps && typeof window.google.maps.importLibrary === 'function') {
      initAutocomplete();
    } else {
      // Load the Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        // Give the API a moment to initialize
        setTimeout(() => {
          if (window.google?.maps && typeof window.google.maps.importLibrary === 'function') {
            initAutocomplete();
          } else {
            console.error('Google Maps API loaded but importLibrary not available');
            setError('Failed to initialize Google Maps');
            setIsLoading(false);
          }
        }, 200);
      };

      script.onerror = () => {
        setError('Failed to load Google Maps script');
        setIsLoading(false);
      };

      document.head.appendChild(script);
    }

    return () => {
      isMounted = false;
      // Cleanup: remove the autocomplete element
      if (autocompleteElement && containerRef.current) {
        try {
          containerRef.current.innerHTML = '';
        } catch (e) {
          console.error('Error cleaning up autocomplete:', e);
        }
      }
    };
  }, [onPlaceSelect, countries, placeholder]);

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
      <div
        ref={containerRef}
        className={`w-full ${isLoading ? 'opacity-50' : ''}`}
        style={{
          paddingLeft: '2.5rem', // space for icon
        }}
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#1769AA] rounded-full animate-spin"></div>
        </div>
      )}
      
      <style jsx global>{`
        gmp-place-autocomplete {
          width: 100%;
          display: block;
        }
        
        gmp-place-autocomplete input {
          width: 100%;
          padding: 0.75rem 2.5rem 0.75rem 0;
          border-radius: 0.5rem;
          border: 1px solid rgb(229, 231, 235);
          background-color: white;
          color: rgb(17, 24, 39);
          font-size: 1rem;
          transition: all 0.2s;
        }
        
        gmp-place-autocomplete input:focus {
          outline: none;
          ring: 2px;
          ring-color: #1769AA;
          border-color: transparent;
        }
        
        gmp-place-autocomplete input::placeholder {
          color: rgb(156, 163, 175);
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          gmp-place-autocomplete input {
            border-color: rgb(55, 65, 81);
            background-color: rgb(17, 24, 39);
            color: white;
          }
        }
      `}</style>
    </div>
  );
}

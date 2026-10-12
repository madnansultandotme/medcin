/**
 * Centralized Google Maps API Loader
 * 
 * This utility prevents multiple loading of the Google Maps API
 * by using the @googlemaps/js-api-loader package which has built-in
 * double-load prevention.
 */

import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

// Configure the loader once with the API key
let isConfigured = false;

export function configureGoogleMaps() {
  if (isConfigured) return;
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    console.error('Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file');
    throw new Error('Google Maps API key not configured');
  }

  setOptions({
    key: apiKey,
    v: 'weekly', // v for version
  });

  isConfigured = true;
}

/**
 * Load the Google Maps Places library
 * This function ensures the API is only loaded once
 */
export async function loadPlacesLibrary() {
  configureGoogleMaps();
  
  try {
    const placesLib = await importLibrary('places');
    return placesLib;
  } catch (error) {
    console.error('Failed to load Places library:', error);
    throw error;
  }
}

/**
 * Load the Google Maps library
 * This function ensures the API is only loaded once
 */
export async function loadMapsLibrary() {
  configureGoogleMaps();
  
  try {
    const mapsLib = await importLibrary('maps');
    return mapsLib;
  } catch (error) {
    console.error('Failed to load Maps library:', error);
    throw error;
  }
}

/**
 * Load both Maps and Places libraries concurrently
 */
export async function loadMapsAndPlaces() {
  configureGoogleMaps();
  
  try {
    const [mapsLib, placesLib] = await Promise.all([
      importLibrary('maps'),
      importLibrary('places'),
    ]);
    return { mapsLib, placesLib };
  } catch (error) {
    console.error('Failed to load Maps libraries:', error);
    throw error;
  }
}

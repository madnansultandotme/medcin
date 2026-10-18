/**
 * Authenticated Fetch Wrapper
 * 
 * Automatically injects device tracking headers to all API requests.
 */

import { getOrCreateDeviceId, getDeviceName } from '@/lib/device-id';

/**
 * Wrapper for fetch() that automatically adds device tracking headers
 * Use this for all authenticated API calls from client components
 */
export async function authenticatedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  // Get device identification
  const deviceId = getOrCreateDeviceId();
  const deviceName = getDeviceName();

  // Merge headers with device tracking
  const headers = new Headers(init?.headers || {});
  headers.set('X-Device-ID', deviceId);
  headers.set('X-Device-Name', deviceName);

  // Make request with enhanced headers
  return fetch(input, {
    ...init,
    headers,
  });
}

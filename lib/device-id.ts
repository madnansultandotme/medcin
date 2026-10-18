/**
 * Client-side Device ID Management
 * 
 * Manages persistent device identification for security tracking.
 * Device IDs are stored in localStorage and sent with all authenticated requests.
 */

/**
 * Get or create a persistent device ID for this browser
 * Stores UUID in localStorage to identify the device across sessions
 */
export function getOrCreateDeviceId(): string {
  const key = 'medcin_device_id';
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    throw new Error('getOrCreateDeviceId can only be called in browser environment');
  }
  
  let deviceId = localStorage.getItem(key);
  
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(key, deviceId);
  }
  
  return deviceId;
}

/**
 * Get a human-readable device name based on user agent
 */
export function getDeviceName(): string {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'Unknown Device';
  }
  
  const ua = navigator.userAgent;
  
  // Check for specific browsers
  if (ua.includes('Edg/') || ua.includes('Edge/')) return 'Microsoft Edge';
  if (ua.includes('Chrome/') && !ua.includes('Edg')) return 'Google Chrome';
  if (ua.includes('Firefox/')) return 'Mozilla Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera';
  
  // Fallback
  return 'Web Browser';
}

/**
 * Get device type for classification
 */
export function getDeviceType(): 'WEB' | 'MOBILE_IOS' | 'MOBILE_ANDROID' {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'WEB';
  }
  
  const ua = navigator.userAgent;
  
  if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) {
    return 'MOBILE_IOS';
  }
  if (ua.includes('Android')) {
    return 'MOBILE_ANDROID';
  }
  
  return 'WEB';
}

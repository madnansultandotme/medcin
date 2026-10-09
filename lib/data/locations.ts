/**
 * ASEAN Countries and Cities Data
 * Used for structured address input across the platform
 */

export interface City {
  name: string;
  areas?: string; // Optional popular areas/districts
}

export interface Country {
  name: string;
  code: string;
  flag: string;
  cities: City[];
}

export const ASEAN_COUNTRIES: Record<string, Country> = {
  SG: {
    name: 'Singapore',
    code: 'SG',
    flag: '🇸🇬',
    cities: [
      { name: 'Singapore', areas: 'Novena · Orchard · Marina Bay · Jurong · Tampines' },
    ],
  },
  TH: {
    name: 'Thailand',
    code: 'TH',
    flag: '🇹🇭',
    cities: [
      { name: 'Bangkok', areas: 'Sukhumvit · Sathorn · Silom · Ratchada' },
      { name: 'Phuket', areas: 'Laguna · Patong · Kata · Karon' },
      { name: 'Chiang Mai', areas: 'Nimman · Old City · Riverside' },
      { name: 'Pattaya', areas: 'Central · Jomtien · Naklua' },
      { name: 'Hua Hin', areas: 'Beach Front · City Centre' },
    ],
  },
  MY: {
    name: 'Malaysia',
    code: 'MY',
    flag: '🇲🇾',
    cities: [
      { name: 'Kuala Lumpur', areas: 'KLCC · Bangsar · Mont Kiara · Bukit Bintang' },
      { name: 'Penang', areas: 'George Town · Batu Ferringhi · Tanjung Tokong' },
      { name: 'Johor Bahru', areas: 'City Centre · Medini · Skudai' },
      { name: 'Malacca', areas: 'Historic Centre · Ayer Keroh' },
      { name: 'Kuching', areas: 'City Centre · Petra Jaya' },
    ],
  },
  VN: {
    name: 'Vietnam',
    code: 'VN',
    flag: '🇻🇳',
    cities: [
      { name: 'Ho Chi Minh City', areas: 'District 1 · District 3 · District 7 · Phu My Hung' },
      { name: 'Hanoi', areas: 'Ba Dinh · Hoan Kiem · Tay Ho · Cau Giay' },
      { name: 'Da Nang', areas: 'Hai Chau · Son Tra · Ngu Hanh Son' },
      { name: 'Nha Trang', areas: 'City Centre · Tran Phu Beach' },
    ],
  },
  ID: {
    name: 'Indonesia',
    code: 'ID',
    flag: '🇮🇩',
    cities: [
      { name: 'Jakarta', areas: 'Sudirman · Menteng · Kemang · Kelapa Gading' },
      { name: 'Bali', areas: 'Seminyak · Ubud · Sanur · Nusa Dua' },
      { name: 'Surabaya', areas: 'Tunjungan · Darmo · Gubeng' },
      { name: 'Bandung', areas: 'Dago · Setiabudi · Cihampelas' },
    ],
  },
  PH: {
    name: 'Philippines',
    code: 'PH',
    flag: '🇵🇭',
    cities: [
      { name: 'Manila', areas: 'Makati · BGC · Ortigas · Quezon City' },
      { name: 'Cebu', areas: 'Cebu City · Mactan · Mandaue' },
      { name: 'Davao', areas: 'City Centre · Lanang' },
    ],
  },
};

// Helper function to get cities for a country
export function getCitiesForCountry(countryCode: string): City[] {
  return ASEAN_COUNTRIES[countryCode]?.cities || [];
}

// Helper function to get all countries as array
export function getAllCountries(): Country[] {
  return Object.values(ASEAN_COUNTRIES);
}

// Helper function to format full address
export function formatFullAddress(city: string, country: string, streetAddress: string): string {
  const parts = [streetAddress, city, ASEAN_COUNTRIES[country]?.name].filter(Boolean);
  return parts.join(', ');
}

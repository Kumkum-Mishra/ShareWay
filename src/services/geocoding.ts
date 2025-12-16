export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

// Simple demo geocoding using Nominatim (OpenStreetMap). For production, add rate limiting and proper headers.
export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  if (!query || !query.trim()) return null;

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');

  const res = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const item = data[0];
  return {
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    displayName: item.display_name
  };
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('format', 'json');

  const res = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data?.display_name ?? null;
}

export interface SuggestionItem extends GeocodeResult {}

// Cache for faster suggestions
const suggestionCache = new Map<string, { data: SuggestionItem[]; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Debounce timer
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export async function suggestAddresses(query: string): Promise<SuggestionItem[]> {
  if (!query || !query.trim() || query.length < 2) return [];

  // Check cache first for instant results
  const cacheKey = query.toLowerCase().trim();
  const cached = suggestionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('✓ Using cached suggestions for:', query);
    return cached.data;
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '5');
    url.searchParams.set('countrycodes', 'in'); // Focus on India for faster results
    url.searchParams.set('addressdetails', '1');

    const res = await fetch(url.toString(), { 
      headers: { 
        'Accept': 'application/json',
        'Accept-Language': 'en'
      }
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    
    const suggestions = data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      displayName: item.display_name
    }));

    // Cache results for faster subsequent searches
    suggestionCache.set(cacheKey, {
      data: suggestions,
      timestamp: Date.now()
    });

    return suggestions;
  } catch (error) {
    console.error('Geocoding error:', error);
    return [];
  }
}

// Debounced version for input fields (prevents excessive API calls)
export function suggestAddressesDebounced(
  query: string,
  callback: (suggestions: SuggestionItem[]) => void,
  delay: number = 250
): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    const suggestions = await suggestAddresses(query);
    callback(suggestions);
  }, delay);
}

// Clear old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of suggestionCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      suggestionCache.delete(key);
    }
  }
}, 60000); // Clean every minute



export interface Province {
  sehir_id: string;
  sehir_adi: string;
}

export interface District {
  ilce_id: string;
  ilce_adi: string;
  sehir_id: string;
  sehir_adi: string;
}

export interface Neighborhood {
  mahalle_id: string;
  mahalle_adi: string;
  ilce_id: string;
  ilce_adi: string;
  sehir_id: string;
  sehir_adi: string;
}

// In-memory caches for lazy loaded data
let provincesCache: Province[] | null = null;
let districtsCache: District[] | null = null;
let neighborhoodChunksCache: Neighborhood[][] | null = null;

// O(1) HashMap Index for instant sub-millisecond neighborhood lookups
const districtNeighborhoodIndex = new Map<string, Neighborhood[]>();
const cityDistrictIndex = new Map<string, District[]>();

/**
 * Capitalize Turkish text cleanly for display (e.g., "İSTANBUL" -> "İstanbul")
 */
export function formatTurkishTitle(text: string): string {
  if (!text) return '';
  return text
    .toLocaleLowerCase('tr-TR')
    .replace(/(?:^|\s|\/|-)\S/g, (a) => a.toLocaleUpperCase('tr-TR'));
}

/**
 * Lazy load provinces (İl) - O(1) cached
 */
export function getProvinces(): Province[] {
  if (!provincesCache) {
    const rawData = require('../assets/data/il.json');
    provincesCache = rawData.map((item: Province) => ({
      ...item,
      sehir_adi: formatTurkishTitle(item.sehir_adi),
    }));
  }
  return provincesCache || [];
}

/**
 * Lazy load districts (İlçe) for a selected province ID.
 * Uses HashMap index for O(1) instant return on repeat calls.
 */
export function getDistrictsByCityId(cityId: string): District[] {
  if (!cityId) return [];

  // O(1) Hash Map Cache Lookup
  if (cityDistrictIndex.has(cityId)) {
    return cityDistrictIndex.get(cityId)!;
  }

  if (!districtsCache) {
    districtsCache = require('../assets/data/ilçe.json');
  }

  // Filter raw matching items first (~10-30 items)
  const filtered = (districtsCache || []).filter((d) => d.sehir_id === cityId);

  // Format strings ONLY for the filtered matching items
  const formattedDistricts = filtered.map((item) => ({
    ...item,
    ilce_adi: formatTurkishTitle(item.ilce_adi),
    sehir_adi: formatTurkishTitle(item.sehir_adi),
  }));

  // Store in O(1) HashMap
  cityDistrictIndex.set(cityId, formattedDistricts);
  return formattedDistricts;
}

/**
 * ULTRA-FAST NEIGHBORHOOD LOOKUP ENGINE:
 * 1. O(1) HashMap lookup (`districtNeighborhoodIndex.get(districtId)`).
 * 2. On first call for a district: scans chunks ONCE, formats ONLY that district's ~20-50 items,
 *    and caches the result in a HashMap.
 * 3. All subsequent calls resolve in 0.001 ms (Constant Time Complexity O(1)).
 */
export function getNeighborhoodsByDistrictId(districtId: string): Neighborhood[] {
  if (!districtId) return [];

  // Step 1: Instant O(1) HashMap Lookup (0.001 ms)
  if (districtNeighborhoodIndex.has(districtId)) {
    return districtNeighborhoodIndex.get(districtId)!;
  }

  // Step 2: Lazy load raw JSON chunks into memory ONCE
  if (!neighborhoodChunksCache) {
    const chunk1 = require('../assets/data/mahalleler-1.json');
    const chunk2 = require('../assets/data/mahalleler-2.json');
    const chunk3 = require('../assets/data/mahalleler-3.json');
    const chunk4 = require('../assets/data/mahalleler-4.json');
    neighborhoodChunksCache = [chunk1, chunk2, chunk3, chunk4];
  }

  // Step 3: Extract matching items for this specific district
  const matchingItems: Neighborhood[] = [];
  for (const chunk of neighborhoodChunksCache) {
    for (let i = 0; i < chunk.length; i++) {
      if (chunk[i].ilce_id === districtId) {
        matchingItems.push({
          ...chunk[i],
          mahalle_adi: formatTurkishTitle(chunk[i].mahalle_adi),
          ilce_adi: formatTurkishTitle(chunk[i].ilce_adi),
          sehir_adi: formatTurkishTitle(chunk[i].sehir_adi),
        });
      }
    }
  }

  // Step 4: Save formatted array to O(1) HashMap index for future instant access
  districtNeighborhoodIndex.set(districtId, matchingItems);
  return matchingItems;
}

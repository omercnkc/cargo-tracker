export interface LocationPoint {
  id?: string;
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  recordedAt: string; // ISO string
}

export interface ShipmentRoute {
  shipmentId: string;
  origin: LocationPoint;
  destination: LocationPoint;
  currentCourierLocation?: LocationPoint; // 15 dk gecikmeli konum
  rawCourierLocations?: LocationPoint[]; // Tüm konum geçmişi
  waypoints?: LocationPoint[]; // Transfer merkezleri
}

/**
 * Kurye güvenliği için konum verilerini 15 dakika (900.000 ms) geciktirerek filtreler.
 * Verilen konum geçmişi içerisinden "recordedAt <= NOW - 15 dk" olan en güncel güvenli noktayı veya listeyi döner.
 */
export const DELAY_MS = 15 * 60 * 1000; // 15 dakika

export function filter15MinDelayedLocations(locations: LocationPoint[], nowMs: number = Date.now()): LocationPoint[] {
  const cutoffTime = nowMs - DELAY_MS;
  return locations.filter((loc) => new Date(loc.recordedAt).getTime() <= cutoffTime);
}

export function getLatest15MinDelayedLocation(locations: LocationPoint[], nowMs: number = Date.now()): LocationPoint | undefined {
  const validLocations = filter15MinDelayedLocations(locations, nowMs);
  if (validLocations.length > 0) {
    // recordedAt tarihine göre en güncelini seç
    return validLocations.reduce((latest, current) =>
      new Date(current.recordedAt).getTime() > new Date(latest.recordedAt).getTime() ? current : latest
    );
  }
  // Eğer henüz 15 dakikalık veri birikmediyse ilk bilinen noktayı (orijin) emniyetli olarak dön
  return locations[0];
}

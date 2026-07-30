import { LocationPoint, filter15MinDelayedLocations, getLatest15MinDelayedLocation } from './location';

describe('15-Minute Security Location Filter', () => {
  const now = new Date('2026-07-30T12:00:00Z').getTime();

  const mockLocations: LocationPoint[] = [
    {
      latitude: 41.0082,
      longitude: 28.9784,
      recordedAt: new Date(now - 30 * 60 * 1000).toISOString(), // 30 dk önce
      title: 'Gönderici Şube',
    },
    {
      latitude: 41.0150,
      longitude: 28.9850,
      recordedAt: new Date(now - 20 * 60 * 1000).toISOString(), // 20 dk önce
      title: 'Transfer Merkezi',
    },
    {
      latitude: 41.0200,
      longitude: 28.9900,
      recordedAt: new Date(now - 5 * 60 * 1000).toISOString(), // 5 dk önce (Hassas/Yeni!)
      title: 'Kurye Güncel Konum',
    },
  ];

  it('should filter out location points recorded less than 15 minutes ago', () => {
    const delayed = filter15MinDelayedLocations(mockLocations, now);
    expect(delayed.length).toBe(2);
    expect(delayed.some((loc: LocationPoint) => loc.title === 'Kurye Güncel Konum')).toBe(false);
  });

  it('should select the most recent location older than 15 minutes', () => {
    const latestDelayed = getLatest15MinDelayedLocation(mockLocations, now);
    expect(latestDelayed).toBeDefined();
    expect(latestDelayed?.title).toBe('Transfer Merkezi'); // 20 dk önce olan nokta
  });

  it('should fallback to origin if all locations are newer than 15 minutes', () => {
    const brandNewLocations: LocationPoint[] = [
      {
        latitude: 41.0082,
        longitude: 28.9784,
        recordedAt: new Date(now - 2 * 60 * 1000).toISOString(), // 2 dk önce
        title: 'Çıkış Noktası',
      },
    ];
    const latestDelayed = getLatest15MinDelayedLocation(brandNewLocations, now);
    expect(latestDelayed?.title).toBe('Çıkış Noktası');
  });
});

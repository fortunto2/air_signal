import { DataModule } from '../../types';

export const geomagneticModule: DataModule = {
  id: 'geomagnetic',
  name: 'Geomagnetic',
  weight: 0.03,
  icon: 'compass',
  enabled: true,
  async fetch() {
    // NOAA SWPC planetary Kp index (last 3 hours)
    const url =
      'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json';
    const response = await fetch(url);
    if (!response.ok) return { kp: 0 };
    const data: string[][] = await response.json();
    // First row is header, last row is most recent
    if (data.length < 2) return { kp: 0 };
    const latest = data[data.length - 1];
    // Column 1 is Kp value
    return { kp: parseFloat(latest[1]) || 0 };
  },
  normalize(data: { kp: number }) {
    // Kp 0-2: quiet (100), Kp 5: storm (50), Kp 9: extreme (0)
    return Math.max(0, Math.min(100, 100 - data.kp * 11));
  },
};

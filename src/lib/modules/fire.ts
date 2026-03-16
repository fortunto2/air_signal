import { DataModule } from '../../types';
import { haversine, normalizeFire } from '../airq-core';

export const fireModule: DataModule = {
  id: 'fire',
  name: 'Fire',
  weight: 0.05,
  icon: 'flame',
  enabled: true,
  async fetch(lat: number, lon: number) {
    const apiKey = process.env.FIRMS_API_KEY;
    if (!apiKey) {
      console.warn('FIRMS_API_KEY is not set');
      return { error: 'Missing API key', data: null, lat, lon };
    }

    const delta = 0.9;
    const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
    const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/VIIRS_SNPP_NRT/${bbox}/1`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        return { error: `HTTP error! status: ${response.status}`, data: null, lat, lon };
      }
      const text = await response.text();
      return { data: text, lat, lon };
    } catch {
      return { error: 'Failed to fetch', data: null, lat, lon };
    }
  },
  normalize(raw: { error?: string; data: string | null; lat: number; lon: number }) {
    if (raw.error || !raw.data) return normalizeFire(100);

    const lines = raw.data.trim().split('\n');
    if (lines.length <= 1) return normalizeFire(100);

    let minDistance = 100;

    const headers = lines[0].split(',');
    const latIdx = headers.indexOf('latitude');
    const lonIdx = headers.indexOf('longitude');

    if (latIdx === -1 || lonIdx === -1) return normalizeFire(100);

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      if (cols.length <= Math.max(latIdx, lonIdx)) continue;

      const fireLat = parseFloat(cols[latIdx]);
      const fireLon = parseFloat(cols[lonIdx]);

      if (isNaN(fireLat) || isNaN(fireLon)) continue;

      const distance = haversine(raw.lat, raw.lon, fireLat, fireLon);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }

    return normalizeFire(minDistance);
  },
};

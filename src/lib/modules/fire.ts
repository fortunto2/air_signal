import { DataModule } from '../../types';

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
    
    // 100km is roughly 0.9 degrees
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
    } catch (e) {
      return { error: 'Failed to fetch', data: null, lat, lon };
    }
  },
  normalize(raw: any) {
    if (raw.error || !raw.data) return 100;
    
    const lines = raw.data.trim().split('\n');
    if (lines.length <= 1) return 100; // Only header or empty
    
    let minDistance = 100; // Start with max distance 100km
    
    const headers = lines[0].split(',');
    const latIdx = headers.indexOf('latitude');
    const lonIdx = headers.indexOf('longitude');
    
    if (latIdx === -1 || lonIdx === -1) return 100;
    
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      if (cols.length <= Math.max(latIdx, lonIdx)) continue;
      
      const fireLat = parseFloat(cols[latIdx]);
      const fireLon = parseFloat(cols[lonIdx]);
      
      if (isNaN(fireLat) || isNaN(fireLon)) continue;
      
      // Calculate distance using Haversine formula
      const R = 6371; // Earth radius in km
      const dLat = (fireLat - raw.lat) * Math.PI / 180;
      const dLon = (fireLon - raw.lon) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(raw.lat * Math.PI / 180) * Math.cos(fireLat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      if (distance < minDistance) {
        minDistance = distance;
      }
    }
    
    // Normalize: no fire within 100km = 100, fire at 0km = 0
    return Math.max(0, Math.min(100, minDistance));
  }
};

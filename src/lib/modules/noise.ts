import { DataModule } from '../../types';

export const noiseModule: DataModule = {
  id: 'noise',
  name: 'Noise Level',
  weight: 0.08,
  icon: 'volume-2',
  enabled: true,
  async fetch(lat, lon) {
    // Deterministic mock based on lat/lon/hour
    const hour = new Date().getHours();
    
    // Base noise level
    let noiseDb = 40;
    
    // Daytime is noisier (8 AM to 8 PM)
    if (hour >= 8 && hour <= 20) {
      noiseDb += 15;
    }
    
    // "Urban" heuristic: simple hash of lat/lon to add some variance (0-20 dB)
    const variance = (Math.abs(Math.sin(lat * lon)) * 20);
    noiseDb += variance;
    
    // Tropical heuristic: closer to equator might be noisier
    if (Math.abs(lat) < 23.5) {
      noiseDb += 5;
    }
    
    return { decibels: Math.round(noiseDb) };
  },
  normalize(data: any) {
    const db = data?.decibels ?? 40;
    // 100 = quiet (<= 40dB)
    // 0 = loud (>= 85dB)
    if (db <= 40) return 100;
    if (db >= 85) return 0;
    
    // Linear interpolation between 40 and 85
    return Math.max(0, Math.round(100 - ((db - 40) / 45) * 100));
  }
};

import { DataModule } from '../../types';
import { normalizeNoise } from '../airq-core';

export const noiseModule: DataModule = {
  id: 'noise',
  name: 'Noise Level',
  weight: 0.08,
  icon: 'volume-2',
  enabled: true,
  async fetch(lat, lon) {
    // Deterministic mock based on lat/lon/hour
    const hour = new Date().getHours();

    let noiseDb = 40;
    if (hour >= 8 && hour <= 20) {
      noiseDb += 15;
    }
    const variance = Math.abs(Math.sin(lat * lon)) * 20;
    noiseDb += variance;
    if (Math.abs(lat) < 23.5) {
      noiseDb += 5;
    }

    return { decibels: Math.round(noiseDb) };
  },
  normalize(data: { decibels?: number }) {
    return normalizeNoise(data?.decibels ?? 40);
  },
};

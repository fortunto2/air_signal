import { DataModule } from '../../types';
import { fetchOpenMeteo } from '../apis/open-meteo';

export const airModule: DataModule = {
  id: 'air',
  name: 'Air Quality',
  weight: 0.22,
  icon: 'wind',
  enabled: true,
  async fetch(lat, lon) {
    const data = await fetchOpenMeteo('air-quality', {
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'pm2_5',
    });
    return data;
  },
  normalize(pm25: number) {
    // Linear interpolation for 0-100 scale: 0-50ug/m3 -> 100-0
    const score = Math.max(0, Math.min(100, 100 - (pm25 * 2)));
    return score;
  }
};

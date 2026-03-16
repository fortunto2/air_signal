import { DataModule } from '../../types';
import { fetchOpenMeteo } from '../apis/open-meteo';
import { normalizeAir } from '../airq-core';

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
    return normalizeAir(pm25);
  },
};

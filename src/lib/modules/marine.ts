import { DataModule } from '../../types';
import { fetchOpenMeteo } from '../apis/open-meteo';
import { normalizeMarine } from '../airq-core';

export const marineModule: DataModule = {
  id: 'sea',
  name: 'Marine',
  weight: 0.12,
  icon: 'anchor',
  enabled: true,
  async fetch(lat, lon) {
    const data = await fetchOpenMeteo('marine', {
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'wave_height',
    });
    return data.current;
  },
  normalize(data: { wave_height: number }) {
    return normalizeMarine(data.wave_height);
  },
};

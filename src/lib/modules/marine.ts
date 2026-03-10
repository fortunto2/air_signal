import { DataModule } from '../../types';
import { fetchOpenMeteo } from '../apis/open-meteo';

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
    // Wave height 0-1m=100, >4m=0
    return Math.max(0, 100 - (data.wave_height * 25));
  }
};

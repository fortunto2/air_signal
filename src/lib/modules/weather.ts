import { DataModule } from '../../types';
import { fetchOpenMeteo } from '../apis/open-meteo';

export const weatherModule: DataModule = {
  id: 'temperature',
  name: 'Temperature',
  weight: 0.18,
  icon: 'thermometer',
  enabled: true,
  async fetch(lat, lon) {
    const data = await fetchOpenMeteo('forecast', {
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'temperature_2m',
    });
    return data.current;
  },
  normalize(data: { temperature_2m: number }) {
    // Ideal 18-28C -> 100, <10 or >35 -> 0
    const t = data.temperature_2m;
    if (t >= 18 && t <= 28) return 100;
    if (t < 18) return Math.max(0, 100 - (18 - t) * 5);
    return Math.max(0, 100 - (t - 28) * 5);
  }
};

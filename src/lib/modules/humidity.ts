import { DataModule } from '../../types';
import { fetchOpenMeteo } from '../apis/open-meteo';

export const humidityModule: DataModule = {
  id: 'humidity',
  name: 'Humidity',
  weight: 0.15, // Example weight, can be adjusted
  icon: 'droplet',
  enabled: true,
  async fetch(lat, lon) {
    const data = await fetchOpenMeteo('forecast', {
      latitude: lat.toString(),
      longitude: lon.toString(),
      current: 'relative_humidity_2m',
    });
    return data;
  },
  normalize(raw: any) {
    const humidity = raw.current.relative_humidity_2m;
    // Normalize humidity: 0% -> 100, 100% -> 0. Ideal range around 40-60%.
    // This is a simplified normalization. Can be refined.
    if (humidity >= 40 && humidity <= 60) {
      return 100;
    } else if (humidity < 40) {
      return Math.max(0, 100 - (40 - humidity) * 2.5); // Drops 2.5 points per % below 40
    } else {
      return Math.max(0, 100 - (humidity - 60) * 2.5); // Drops 2.5 points per % above 60
    }
  }
};

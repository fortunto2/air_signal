import { DataModule } from '../../types';
import { fetchOpenMeteo } from '../apis/open-meteo';

export const daylightModule: DataModule = {
  id: 'daylight',
  name: 'Daylight',
  weight: 0.02,
  icon: 'sunrise',
  enabled: true,
  async fetch(lat, lon) {
    const data = await fetchOpenMeteo('forecast', {
      latitude: lat.toString(),
      longitude: lon.toString(),
      daily: 'sunrise,sunset',
      forecast_days: '1',
      timezone: 'auto',
    });
    return {
      sunrise: data.daily?.sunrise?.[0],
      sunset: data.daily?.sunset?.[0],
    };
  },
  normalize(data: { sunrise?: string; sunset?: string }) {
    if (!data.sunrise || !data.sunset) return 50;

    const rise = new Date(data.sunrise).getTime();
    const set = new Date(data.sunset).getTime();
    const hours = (set - rise) / (1000 * 60 * 60);

    // 14+ hours = 100 (summer), 8 hours = 50, <6 hours = 0 (polar winter)
    return Math.max(0, Math.min(100, (hours - 6) * 12.5));
  },
};

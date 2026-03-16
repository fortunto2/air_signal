import { DataModule } from '../../types';
import { fetchOpenMeteo } from '../apis/open-meteo';
import { normalizeDaylight } from '../airq-core';

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
    if (!data.sunrise || !data.sunset) return normalizeDaylight(12);

    const rise = new Date(data.sunrise).getTime();
    const set = new Date(data.sunset).getTime();
    const hours = (set - rise) / (1000 * 60 * 60);

    return normalizeDaylight(hours);
  },
};

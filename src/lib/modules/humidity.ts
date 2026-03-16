import { DataModule } from '../../types';
import { fetchOpenMeteo } from '../apis/open-meteo';
import { normalizeHumidity } from '../airq-core';

export const humidityModule: DataModule = {
  id: 'humidity',
  name: 'Humidity',
  weight: 0.15,
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
  normalize(raw: { current: { relative_humidity_2m: number } }) {
    return normalizeHumidity(raw.current.relative_humidity_2m);
  },
};

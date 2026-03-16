import { DataModule } from '../../types';
import { fetchOpenMeteo } from '../apis/open-meteo';
import { normalizeTemperature } from '../airq-core';

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
    return normalizeTemperature(data.temperature_2m);
  },
};

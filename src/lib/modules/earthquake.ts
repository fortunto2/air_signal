import { DataModule } from '../../types';
import { normalizeEarthquake } from '../airq-core';

export const earthquakeModule: DataModule = {
  id: 'earthquake',
  name: 'Earthquake',
  weight: 0.08,
  icon: 'alert-triangle',
  enabled: true,
  async fetch(lat, lon) {
    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}&maxradiuskm=500&limit=1`;
    const response = await fetch(url);
    return await response.json();
  },
  normalize(data: { features: Array<{ properties: { mag: number } }> }) {
    if (!data.features || data.features.length === 0) return normalizeEarthquake(-1);
    const mag = data.features[0].properties.mag;
    return normalizeEarthquake(mag);
  },
};

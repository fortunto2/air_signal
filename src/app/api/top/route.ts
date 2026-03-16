import { NextResponse } from 'next/server';

interface CityAqi {
  name: string;
  country: string;
  lat: number;
  lon: number;
  pm25: number;
  aqi: number;
}

const POPULAR_CITIES = [
  { name: 'Gazipasha', country: 'Turkey', lat: 36.27, lon: 32.32 },
  { name: 'Alanya', country: 'Turkey', lat: 36.54, lon: 32.00 },
  { name: 'Antalya', country: 'Turkey', lat: 36.89, lon: 30.71 },
  { name: 'Istanbul', country: 'Turkey', lat: 41.01, lon: 28.98 },
  { name: 'Barcelona', country: 'Spain', lat: 41.39, lon: 2.17 },
  { name: 'Lisbon', country: 'Portugal', lat: 38.72, lon: -9.14 },
  { name: 'Bangkok', country: 'Thailand', lat: 13.76, lon: 100.50 },
  { name: 'Bali', country: 'Indonesia', lat: -8.34, lon: 115.09 },
  { name: 'Dubai', country: 'UAE', lat: 25.20, lon: 55.27 },
  { name: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.41 },
  { name: 'Moscow', country: 'Russia', lat: 55.76, lon: 37.62 },
  { name: 'Tbilisi', country: 'Georgia', lat: 41.69, lon: 44.80 },
];

export async function GET() {
  const results: CityAqi[] = [];

  // Batch fetch AQI for all cities
  const lats = POPULAR_CITIES.map(c => c.lat).join(',');
  const lons = POPULAR_CITIES.map(c => c.lon).join(',');
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lats}&longitude=${lons}&current=pm2_5`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    // Open-Meteo returns array for multi-location
    const items = Array.isArray(data) ? data : [data];
    for (let i = 0; i < POPULAR_CITIES.length && i < items.length; i++) {
      const pm25 = items[i]?.current?.pm2_5 ?? 0;
      // Simple AQI from PM2.5 (EPA)
      let aqi = 0;
      if (pm25 <= 12) aqi = Math.round((pm25 / 12) * 50);
      else if (pm25 <= 35.4) aqi = Math.round(51 + ((pm25 - 12.1) / 23.3) * 49);
      else if (pm25 <= 55.4) aqi = Math.round(101 + ((pm25 - 35.5) / 19.9) * 49);
      else aqi = Math.round(151 + ((pm25 - 55.5) / 94.9) * 49);

      results.push({
        ...POPULAR_CITIES[i],
        pm25: Math.round(pm25 * 10) / 10,
        aqi,
      });
    }
  } catch {
    // Fallback: return cities without AQI data
    for (const city of POPULAR_CITIES) {
      results.push({ ...city, pm25: 0, aqi: 0 });
    }
  }

  // Sort by AQI (best first)
  results.sort((a, b) => a.aqi - b.aqi);

  return NextResponse.json({ cities: results });
}

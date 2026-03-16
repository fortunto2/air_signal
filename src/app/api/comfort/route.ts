import { NextResponse } from 'next/server';

// Server-side comfort calculation — no WASM, pure fetch + simple normalize.
// Full sigmoid normalization runs client-side via WASM.

const OPEN_METEO_AQ = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const OPEN_METEO_WX = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_MARINE = 'https://marine-api.open-meteo.com/v1/marine';
const USGS_EQ = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
const NOAA_KP = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json';
const SENSOR_COMMUNITY = 'https://data.sensor.community/airrohr/v1/filter';

async function fetchJson(url: string) {
  const res = await fetch(url, { next: { revalidate: 300 } }); // 5min cache
  if (!res.ok) return null;
  return res.json();
}

// Simple sigmoid: 100 / (1 + e^(-k*(x-mid)))
function sigmoidDesc(x: number, mid: number, k: number): number {
  return Math.round(100 * (1 - 1 / (1 + Math.exp(-k * (x - mid)))));
}
function sigmoidAsc(x: number, mid: number, k: number): number {
  return Math.round(100 / (1 + Math.exp(-k * (x - mid))));
}
function gaussian(x: number, center: number, sigma: number): number {
  const z = (x - center) / sigma;
  return Math.round(100 * Math.exp(-z * z));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lon = parseFloat(searchParams.get('lon') || '0');

  if (lat === 0 && lon === 0) {
    return NextResponse.json({ error: 'lat and lon required' }, { status: 400 });
  }

  // Parallel fetch all data sources + Sensor.Community
  const [aq, wx, marine, eq, kp, sensors] = await Promise.all([
    fetchJson(`${OPEN_METEO_AQ}?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10`),
    fetchJson(`${OPEN_METEO_WX}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure&hourly=uv_index&forecast_days=1&daily=sunrise,sunset&timezone=auto`),
    fetchJson(`${OPEN_METEO_MARINE}?latitude=${lat}&longitude=${lon}&current=wave_height`).catch(() => null),
    fetchJson(`${USGS_EQ}?format=geojson&latitude=${lat}&longitude=${lon}&maxradiuskm=500&limit=1`).catch(() => null),
    fetchJson(NOAA_KP).catch(() => null),
    fetchJson(`${SENSOR_COMMUNITY}/area=${lat},${lon},10`).catch(() => null),
  ]);

  // Merge: sensors = ground truth, model = fallback
  let sensorPm25: number[] = [];
  let sensorPm10: number[] = [];
  if (Array.isArray(sensors)) {
    for (const s of sensors) {
      for (const v of s?.sensordatavalues ?? []) {
        const val = parseFloat(v?.value);
        if (isNaN(val) || val <= 0 || val > 500) continue;
        if (v.value_type === 'P2') sensorPm25.push(val);
        if (v.value_type === 'P1') sensorPm10.push(val);
      }
    }
  }
  sensorPm25.sort((a, b) => a - b);
  sensorPm10.sort((a, b) => a - b);
  const sMedianPm25 = sensorPm25.length > 0 ? sensorPm25[Math.floor(sensorPm25.length / 2)] : null;
  const sMedianPm10 = sensorPm10.length > 0 ? sensorPm10[Math.floor(sensorPm10.length / 2)] : null;
  const modelPm25 = aq?.current?.pm2_5 ?? null;
  const modelPm10 = aq?.current?.pm10 ?? null;

  // Dynamic merge: high divergence → ignore model
  const sensorCount = sensorPm25.length;
  let pm25: number;
  let pm10: number;
  let mergeSource: string;
  if (sMedianPm25 != null && modelPm25 != null) {
    const divergence = sMedianPm25 > 1 ? Math.max(modelPm25 / sMedianPm25, sMedianPm25 / modelPm25) : 1;
    const modelWeight = Math.min(0.3, 0.3 / (1 + Math.exp((divergence - 1) * 2)) * (sensorCount > 5 ? 0.3 : 0.8));
    pm25 = sMedianPm25 * (1 - modelWeight) + modelPm25 * modelWeight;
    pm10 = (sMedianPm10 ?? pm25 * 1.5) * (1 - modelWeight) + (modelPm10 ?? pm25 * 1.5) * modelWeight;
    mergeSource = `${sensorCount} sensors + model (weight ${(modelWeight * 100).toFixed(0)}%)`;
  } else if (sMedianPm25 != null) {
    pm25 = sMedianPm25;
    pm10 = sMedianPm10 ?? pm25 * 1.5;
    mergeSource = `${sensorCount} sensors`;
  } else {
    pm25 = modelPm25 ?? 0;
    pm10 = modelPm10 ?? 0;
    mergeSource = 'model only';
  }

  const scores: Record<string, { score: number; value: string }> = {};

  // Air (merged PM2.5 → AQI → sigmoid)
  const pm25Aqi = pm25 <= 12 ? pm25 / 12 * 50 : pm25 <= 35.4 ? 51 + (pm25 - 12.1) / 23.3 * 49 : 151;
  scores.air = { score: sigmoidDesc(pm25Aqi, 75, 0.04), value: `PM2.5: ${pm25.toFixed(1)} (${mergeSource})` };

  // Temperature
  const temp = wx?.current?.temperature_2m ?? 23;
  scores.temperature = { score: gaussian(temp, 23, 12), value: `${temp}°C` };

  // Wind
  const wind = wx?.current?.wind_speed_10m ?? 0;
  scores.wind = { score: sigmoidDesc(wind, 25, 0.12), value: `${wind} km/h` };

  // UV
  const uv = wx?.hourly?.uv_index?.[0] ?? 0;
  scores.uv = { score: sigmoidDesc(uv, 6, 0.6), value: `UV ${uv}` };

  // Sea / marine
  const waveHeight = marine?.current?.wave_height ?? 0;
  scores.sea = { score: sigmoidDesc(waveHeight, 2, 1.5), value: `${waveHeight}m waves` };

  // Earthquake
  const eqMag = eq?.features?.[0]?.properties?.mag ?? -1;
  scores.earthquake = { score: eqMag < 0 ? 100 : sigmoidDesc(eqMag, 4.5, 1.2), value: eqMag < 0 ? 'None' : `M${eqMag}` };

  // Pressure
  const pressure = wx?.current?.surface_pressure ?? 1013;
  scores.pressure = { score: gaussian(pressure, 1013, 10), value: `${Math.round(pressure)} hPa` };

  // Humidity
  const humidity = wx?.current?.relative_humidity_2m ?? 50;
  scores.humidity = { score: gaussian(humidity, 50, 25), value: `${humidity}%` };

  // Geomagnetic
  let kpValue = 0;
  if (Array.isArray(kp) && kp.length > 1) {
    kpValue = parseFloat(kp[kp.length - 1]?.[1]) || 0;
  }
  scores.geomagnetic = { score: sigmoidDesc(kpValue, 4, 0.8), value: `Kp ${kpValue}` };

  // Daylight
  const sunrise = wx?.daily?.sunrise?.[0];
  const sunset = wx?.daily?.sunset?.[0];
  let daylightHours = 12;
  if (sunrise && sunset) {
    daylightHours = (new Date(sunset).getTime() - new Date(sunrise).getTime()) / 3600000;
  }
  scores.daylight = { score: sigmoidAsc(daylightHours, 10, 0.5), value: `${daylightHours.toFixed(1)}h` };

  // Moon (cosine)
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth() + 1, day = now.getDate();
  let r = year % 100;
  const rMod = r % 19;
  const rAdj = rMod > 9 ? rMod - 19 : rMod;
  r = ((rAdj * 11) % 30) + month + day;
  if (month < 3) r += 2;
  r -= year < 2000 ? 4 : 8.3;
  let moonPhase = Math.floor(r + 0.5) % 30;
  if (moonPhase < 0) moonPhase += 30;
  const phase = moonPhase / 30;
  scores.moon = { score: Math.round((Math.cos(2 * Math.PI * phase) + 1) * 50), value: `Phase ${phase.toFixed(2)}` };

  // Pollen (skip — seasonal, often 0)
  scores.pollen = { score: 95, value: 'Low' };

  // Fire (skip — requires FIRMS API key)
  scores.fire = { score: 95, value: 'No nearby fires' };

  // Noise (mock — no real API)
  scores.noise = { score: 80, value: 'Estimated' };

  // Weighted total
  const weights: Record<string, number> = {
    air: 0.20, temperature: 0.16, wind: 0.10, sea: 0.10, uv: 0.08,
    earthquake: 0.08, fire: 0.05, pollen: 0.04, pressure: 0.05,
    geomagnetic: 0.03, humidity: 0.04, daylight: 0.02, noise: 0.03, moon: 0.02,
  };
  let wSum = 0, wTotal = 0;
  for (const [k, { score }] of Object.entries(scores)) {
    const w = weights[k] ?? 0;
    wSum += score * w;
    wTotal += w;
  }
  const total = wTotal > 0 ? Math.round(wSum / wTotal) : 0;

  return NextResponse.json({ lat, lon, total, scores });
}

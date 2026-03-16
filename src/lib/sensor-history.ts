// In-memory sensor history accumulator (per city)
// Each comfort API call records sensor PM2.5 here.
// History API reads from here.

interface Reading {
  ts: number;
  pm25: number;
  pm10: number;
}

const store = new Map<string, Reading[]>();
const MAX_HISTORY = 168; // 7 days * 24 hours

function key(lat: number, lon: number) {
  return `${lat.toFixed(1)},${lon.toFixed(1)}`;
}

export function recordSensorReading(lat: number, lon: number, pm25: number, pm10: number) {
  const k = key(lat, lon);
  if (!store.has(k)) store.set(k, []);
  const hist = store.get(k)!;
  const now = Date.now();
  if (hist.length > 0 && now - hist[hist.length - 1].ts < 5 * 60 * 1000) return;
  hist.push({ ts: now, pm25, pm10 });
  while (hist.length > MAX_HISTORY) hist.shift();
}

export function getSensorHistory(lat: number, lon: number): Reading[] {
  return store.get(key(lat, lon)) || [];
}

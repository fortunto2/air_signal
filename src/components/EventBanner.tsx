'use client';

interface Sensor {
  id: number;
  lat: number;
  lon: number;
  pm25: number;
  pm10: number;
}

interface EventBannerProps {
  sensors: Sensor[];
  cityName: string;
}

function classifySource(ratio: number, pm25: number): { label: string; color: string; advice: string } {
  if (pm25 < 12) return { label: '', color: '', advice: '' };
  if (ratio > 4) return { label: 'Dust storm detected', color: 'bg-orange-900/30 border-orange-700', advice: 'Wear N95 mask. Close windows.' };
  if (ratio > 2.5) return { label: 'Construction dust', color: 'bg-yellow-900/30 border-yellow-700', advice: 'Coarse dust nearby. Standard mask helps.' };
  if (pm25 > 55 && ratio < 1.5) return { label: 'Smoke/fine particles', color: 'bg-red-900/30 border-red-700', advice: 'Use N95/FFP2. Run air purifier.' };
  if (pm25 > 35) return { label: 'Elevated pollution', color: 'bg-orange-900/30 border-orange-700', advice: 'Limit outdoor exertion.' };
  return { label: '', color: '', advice: '' };
}

export function EventBanner({ sensors, cityName }: EventBannerProps) {
  if (sensors.length < 2) return null;

  const pm25s = sensors.map(s => s.pm25).filter(v => v > 0);
  const pm10s = sensors.map(s => s.pm10).filter(v => v > 0);
  if (pm25s.length === 0) return null;

  pm25s.sort((a, b) => a - b);
  pm10s.sort((a, b) => a - b);
  const medianPm25 = pm25s[Math.floor(pm25s.length / 2)];
  const medianPm10 = pm10s.length > 0 ? pm10s[Math.floor(pm10s.length / 2)] : medianPm25 * 1.5;
  const ratio = medianPm25 > 1 ? medianPm10 / medianPm25 : 1;

  const { label, color, advice } = classifySource(ratio, medianPm25);
  if (!label) return null;

  // Check concordance: how many sensors above median + 2σ?
  const mean = pm25s.reduce((a, b) => a + b, 0) / pm25s.length;
  const std = Math.sqrt(pm25s.reduce((a, b) => a + (b - mean) ** 2, 0) / pm25s.length);
  const anomalyCount = pm25s.filter(v => v > mean + 2 * Math.max(std, 1)).length;

  return (
    <div className={`rounded-lg border p-3 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="font-semibold text-sm">{label}</span>
          <span className="text-xs text-muted-foreground ml-2">
            {cityName} — PM2.5: {medianPm25.toFixed(0)} | PM10/PM2.5: {ratio.toFixed(1)}
            {anomalyCount > 0 && ` | ${anomalyCount} sensor${anomalyCount > 1 ? 's' : ''} spiking`}
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{advice}</p>
    </div>
  );
}

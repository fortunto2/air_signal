'use client';

import useSWR from 'swr';

interface ComfortPanelProps {
  city: { name: string; lat: number; lon: number; country?: string };
}

function scoreColor(score: number) {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

function scoreEmoji(score: number) {
  if (score >= 80) return '🟢';
  if (score >= 60) return '🟡';
  if (score >= 40) return '🟠';
  return '🔴';
}

const SIGNAL_LABELS: Record<string, string> = {
  air: 'Air Quality',
  temperature: 'Temperature',
  wind: 'Wind',
  sea: 'Sea',
  uv: 'UV Index',
  earthquake: 'Earthquake',
  fire: 'Fire Risk',
  pollen: 'Pollen',
  pressure: 'Pressure',
  geomagnetic: 'Geomagnetic',
  humidity: 'Humidity',
  daylight: 'Daylight',
  noise: 'Noise',
  moon: 'Moon Phase',
};

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function ComfortPanel({ city }: ComfortPanelProps) {
  const { data, isLoading } = useSWR(
    `/api/comfort?lat=${city.lat}&lon=${city.lon}`,
    fetcher,
    { refreshInterval: 5 * 60 * 1000 }
  );

  if (isLoading) {
    return <div className="animate-pulse h-80 bg-muted rounded-lg" />;
  }

  if (!data || data.error) {
    return <div className="text-muted-foreground p-4">Failed to load data</div>;
  }

  const total = data.total as number;
  const scores = data.scores as Record<string, { score: number }>;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold">{city.name}</h2>
          {city.country && <p className="text-sm text-muted-foreground">{city.country}</p>}
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{scoreEmoji(total)} {total}</div>
          <div className="text-xs text-muted-foreground">Comfort Score</div>
        </div>
      </div>

      {/* Score bars */}
      <div className="space-y-2">
        {Object.entries(scores)
          .sort(([, a], [, b]) => b.score - a.score)
          .map(([key, { score }]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-24 text-right truncate">
                {SIGNAL_LABELS[key] || key}
              </span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${scoreColor(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="text-xs font-mono w-8 text-right">{score}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

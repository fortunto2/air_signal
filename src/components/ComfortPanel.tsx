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

function scoreLabel(score: number) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Poor';
  return 'Bad';
}

const SIGNAL_LABELS: Record<string, string> = {
  air: 'Air Quality',
  temperature: 'Temperature',
  wind: 'Wind',
  sea: 'Sea / Waves',
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
  const scores = data.scores as Record<string, { score: number; value: string }>;

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">{city.name}</h2>
          {city.country && <p className="text-sm text-muted-foreground">{city.country}</p>}
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{scoreEmoji(total)} {total}</div>
          <div className="text-xs text-muted-foreground">{scoreLabel(total)}</div>
        </div>
      </div>

      {/* Signals table with bar + raw value */}
      <div className="space-y-1.5">
        {Object.entries(scores)
          .sort(([, a], [, b]) => a.score - b.score) // worst first
          .map(([key, { score, value }]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20 text-right truncate shrink-0">
                {SIGNAL_LABELS[key] || key}
              </span>
              <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden min-w-[60px]">
                <div
                  className={`h-full rounded-full transition-all ${scoreColor(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className="text-xs font-mono w-6 text-right shrink-0">{score}</span>
              <span className="text-[10px] text-muted-foreground w-36 truncate shrink-0" title={value}>
                {value}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

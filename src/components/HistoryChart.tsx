'use client';

import useSWR from 'swr';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

interface HistoryChartProps {
  lat: number;
  lon: number;
  days?: number;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function HistoryChart({ lat, lon, days = 7 }: HistoryChartProps) {
  const { data, isLoading } = useSWR(
    `/api/history?lat=${lat}&lon=${lon}&days=${days}`,
    fetcher,
    { refreshInterval: 30 * 60 * 1000 }
  );

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />;
  }

  const points = data?.points || [];
  if (points.length === 0) return null;

  const hasSensors = points.some((p: { sensor_pm25: number | null }) => p.sensor_pm25 != null);

  const chartData = points.map((p: { date: string; model_pm25: number | null; sensor_pm25: number | null }) => ({
    date: p.date.slice(5),
    model: p.model_pm25,
    sensor: p.sensor_pm25,
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">PM2.5 — Last {days} days</h3>
        <span className="text-[10px] text-muted-foreground">
          {hasSensors ? `${data?.sensor_readings} sensor readings` : 'model estimate — sensor data accumulates with visits'}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={170}>
        <ComposedChart data={chartData}>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} />
          <YAxis tick={{ fontSize: 10, fill: '#888' }} width={30} />
          <Tooltip
            contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#888' }}
          />
          <ReferenceLine y={12} stroke="#00c853" strokeDasharray="3 3" label={{ value: 'WHO', position: 'right', fill: '#00c853', fontSize: 9 }} />
          {/* Model: dashed line (reference) */}
          <Line type="monotone" dataKey="model" stroke="#555" strokeDasharray="4 4" strokeWidth={1} dot={false} name="Model (CAMS)" />
          {/* Sensor: solid bars (primary) */}
          {hasSensors && <Bar dataKey="sensor" fill="#4fc3f7" radius={[3, 3, 0, 0]} name="Sensors" />}
          {/* If no sensors yet, show model as bars */}
          {!hasSensors && <Bar dataKey="model" fill="#4f46e5" opacity={0.5} radius={[3, 3, 0, 0]} name="Model estimate" />}
          <Legend wrapperStyle={{ fontSize: 10 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

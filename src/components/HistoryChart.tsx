'use client';

import useSWR from 'swr';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface HistoryChartProps {
  lat: number;
  lon: number;
  days?: number;
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

function aqiColor(pm25: number) {
  if (pm25 <= 12) return '#00c853';
  if (pm25 <= 35) return '#ffc107';
  if (pm25 <= 55) return '#ff9800';
  return '#f44336';
}

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

  const chartData = points.map((p: { date: string; pm25: number }) => ({
    date: p.date.slice(5), // "03-16"
    pm25: p.pm25,
    fill: aqiColor(p.pm25),
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="text-sm font-semibold mb-3">PM2.5 — Last {days} days <span className="font-normal text-muted-foreground">(model)</span></h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData}>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} />
          <YAxis tick={{ fontSize: 10, fill: '#888' }} width={30} />
          <Tooltip
            contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#888' }}
            formatter={(value) => [`${value} ug/m3`, 'PM2.5']}
          />
          <ReferenceLine y={12} stroke="#00c853" strokeDasharray="3 3" label={{ value: 'WHO', position: 'right', fill: '#00c853', fontSize: 9 }} />
          <Bar dataKey="pm25" radius={[3, 3, 0, 0]} fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

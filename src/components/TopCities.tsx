'use client';

import useSWR from 'swr';

interface CityAqi {
  name: string;
  country: string;
  lat: number;
  lon: number;
  pm25: number;
  aqi: number;
  source?: string;
}

interface TopCitiesProps {
  onCityClick?: (city: CityAqi) => void;
}

function aqiLabel(aqi: number) {
  if (aqi <= 50) return { text: 'Good', color: 'text-green-400' };
  if (aqi <= 100) return { text: 'Moderate', color: 'text-yellow-400' };
  if (aqi <= 150) return { text: 'Sensitive', color: 'text-orange-400' };
  if (aqi <= 200) return { text: 'Unhealthy', color: 'text-red-400' };
  return { text: 'Hazardous', color: 'text-purple-400' };
}

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function TopCities({ onCityClick }: TopCitiesProps) {
  const { data, isLoading } = useSWR<{ cities: CityAqi[] }>('/api/top', fetcher, {
    refreshInterval: 10 * 60 * 1000,
  });

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  const cities = data?.cities || [];

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">AQI Ranking</h3>
      </div>
      <div className="divide-y divide-border">
        {cities.map((city, i) => {
          const label = aqiLabel(city.aqi);
          return (
            <button
              key={`${city.lat}-${city.lon}`}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
              onClick={() => onCityClick?.(city)}
            >
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm w-5">{i + 1}</span>
                <div>
                  <span className="font-medium text-sm">{city.name}</span>
                  <span className="text-muted-foreground text-xs ml-1">{city.country}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">PM2.5 {city.pm25}</span>
                <span className={`text-sm font-mono font-semibold ${label.color}`}>
                  {city.aqi}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

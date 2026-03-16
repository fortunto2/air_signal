'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { CitySearch } from '@/components/CitySearch';
import { TopCities } from '@/components/TopCities';
import { ComfortPanel } from '@/components/ComfortPanel';

const CityMap = dynamic(() => import('@/components/CityMap').then(m => m.CityMap), {
  ssr: false,
  loading: () => <div className="w-full h-[450px] bg-muted rounded-lg animate-pulse" />,
});

interface SelectedCity {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

const DEFAULT_CITY: SelectedCity = {
  name: 'Gazipasha',
  country: 'Turkey',
  lat: 36.27,
  lon: 32.32,
};

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Restore city from URL params
  const initialCity = (() => {
    const name = searchParams.get('city');
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lon = parseFloat(searchParams.get('lon') || '0');
    const country = searchParams.get('country') || '';
    if (name && lat && lon) return { name, country, lat, lon };
    return DEFAULT_CITY;
  })();

  const [selectedCity, setSelectedCity] = useState<SelectedCity>(initialCity);
  const [mapCities, setMapCities] = useState<Array<SelectedCity & { aqi?: number; pm25?: number }>>([]);

  // Top cities for map markers
  const { data: topData } = useSWR<{ cities: Array<SelectedCity & { aqi: number; pm25: number }> }>('/api/top', fetcher);

  // Sensors for selected city
  const { data: sensorData } = useSWR(
    `/api/sensors?lat=${selectedCity.lat}&lon=${selectedCity.lon}&radius=15`,
    fetcher,
    { refreshInterval: 5 * 60 * 1000 }
  );

  useEffect(() => {
    if (topData?.cities) setMapCities(topData.cities);
  }, [topData]);

  const handleCitySelect = (city: { name: string; country: string; lat: number; lon: number }) => {
    setSelectedCity(city);
    // Update URL for shareable links
    router.push(`/?city=${encodeURIComponent(city.name)}&lat=${city.lat}&lon=${city.lon}&country=${encodeURIComponent(city.country)}`, { scroll: false });
    // Add to map
    setMapCities(prev => {
      if (prev.some(c => Math.abs(c.lat - city.lat) < 0.01 && Math.abs(c.lon - city.lon) < 0.01)) return prev;
      return [...prev, city];
    });
  };

  const sensors = sensorData?.sensors || [];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-[1001]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <a href="/" className="text-xl font-bold text-foreground whitespace-nowrap">Air Signal</a>
            <CitySearch onSelect={handleCitySelect} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Map with sensors */}
        <CityMap
          cities={mapCities}
          sensors={sensors}
          selectedCity={selectedCity}
          center={[selectedCity.lat, selectedCity.lon]}
          zoom={selectedCity === DEFAULT_CITY ? 5 : 10}
          onCityClick={(c) => handleCitySelect({ ...c, country: c.country || '' })}
        />

        {/* Sensor count badge */}
        {sensors.length > 0 && (
          <div className="text-xs text-muted-foreground">
            {sensors.length} Sensor.Community sensors in 15km radius
          </div>
        )}

        {/* Comfort + ranking */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ComfortPanel city={selectedCity} />
          </div>
          <div>
            <TopCities onCityClick={handleCitySelect} />
          </div>
        </div>
      </main>

      <footer className="bg-card border-t border-border mt-8">
        <div className="max-w-7xl mx-auto px-4 py-3 text-center text-xs text-muted-foreground">
          Air Signal — Environmental comfort powered by Rust WASM
        </div>
      </footer>
    </div>
  );
}

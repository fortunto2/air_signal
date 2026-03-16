'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { CitySearch } from '@/components/CitySearch';
import { TopCities } from '@/components/TopCities';
import { ComfortPanel } from '@/components/ComfortPanel';

// Leaflet must be loaded client-side only (no SSR)
const CityMap = dynamic(() => import('@/components/CityMap').then(m => m.CityMap), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-muted rounded-lg animate-pulse" />,
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

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<SelectedCity>(DEFAULT_CITY);
  const [mapCities, setMapCities] = useState<Array<SelectedCity & { aqi?: number; pm25?: number }>>([]);

  // Load top cities for map markers
  const fetcher = (url: string) => fetch(url).then(r => r.json());
  const { data: topData } = useSWR<{ cities: Array<SelectedCity & { aqi: number; pm25: number }> }>('/api/top', fetcher);

  useEffect(() => {
    if (topData?.cities) {
      setMapCities(topData.cities);
    }
  }, [topData]);

  const handleCitySelect = (city: { name: string; country: string; lat: number; lon: number }) => {
    setSelectedCity(city);
    // Add to map if not already there
    setMapCities(prev => {
      if (prev.some(c => c.lat === city.lat && c.lon === city.lon)) return prev;
      return [...prev, city];
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl font-bold text-foreground whitespace-nowrap">Air Signal</h1>
            <CitySearch onSelect={handleCitySelect} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Map */}
        <CityMap
          cities={mapCities}
          selectedCity={selectedCity}
          center={[selectedCity.lat, selectedCity.lon]}
          zoom={6}
          onCityClick={(c) => setSelectedCity({ ...c, country: c.country || '' })}
        />

        {/* Two columns: comfort + ranking */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ComfortPanel city={selectedCity} />
          </div>
          <div>
            <TopCities onCityClick={handleCitySelect} />
          </div>
        </div>
      </main>

      <footer className="bg-card border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          Air Signal — Environmental comfort powered by Rust WASM
        </div>
      </footer>
    </div>
  );
}

'use client';

import { use } from 'react';
import { ComfortPanel } from '@/components/ComfortPanel';

const CITIES: Record<string, { name: string; country: string; lat: number; lon: number }> = {
  gazipasha: { name: 'Gazipasha', country: 'Turkey', lat: 36.27, lon: 32.32 },
  alanya: { name: 'Alanya', country: 'Turkey', lat: 36.54, lon: 32.00 },
  antalya: { name: 'Antalya', country: 'Turkey', lat: 36.89, lon: 30.71 },
};

export default function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = use(params);
  const config = CITIES[city.toLowerCase()];

  if (!config) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">City not found. Try searching from the homepage.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <a href="/" className="text-xl font-bold text-foreground">Air Signal</a>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <ComfortPanel city={config} />
      </main>
    </div>
  );
}

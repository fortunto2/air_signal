import React from 'react';
import { ComfortScore } from '@/components/ComfortScore';
import { MetricCard } from '@/components/MetricCard';
import { cities as CITIES } from '@/lib/cities';

export default async function CityPage({ params }: { params: { city: string } }) {
  const city = params.city.toLowerCase();
  const config = CITIES[city];

  if (!config) return <div>City not found</div>;

  // For initial server side render
  const res = await fetch(`http://localhost:3000/api/comfort?lat=${config.lat}&lon=${config.lon}`);
  const data = await res.json();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">{city} Dashboard</h1>
      <ComfortScore score={data.totalScore} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {Object.entries(data.subScores).map(([key, sub]: [string, any]) => (
          <MetricCard 
            key={key} 
            name={key} 
            normalizedScore={sub.normalized} 
            rawValue={sub.value.toString()} 
            icon="temp" 
          />
        ))}
      </div>
    </div>
  );
}
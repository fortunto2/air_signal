'use client';

import { useState, useEffect, useRef } from 'react';

interface GeoResult {
  name: string;
  country: string;
  lat: number;
  lon: number;
  admin1: string;
}

interface CitySearchProps {
  onSelect: (city: GeoResult) => void;
}

export function CitySearch({ onSelect }: CitySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
      setOpen(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-md z-[1000]">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search city..."
        className="w-full px-4 py-2.5 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {open && results.length > 0 && (
        <ul className="absolute z-[2000] w-full mt-1 bg-card border border-border rounded-lg shadow-xl max-h-64 overflow-auto">
          {results.map((r, i) => (
            <li
              key={`${r.lat}-${r.lon}-${i}`}
              className="px-4 py-2.5 hover:bg-muted cursor-pointer text-sm"
              onClick={() => {
                onSelect(r);
                setQuery(`${r.name}, ${r.country}`);
                setOpen(false);
              }}
            >
              <span className="font-medium">{r.name}</span>
              {r.admin1 && <span className="text-muted-foreground">, {r.admin1}</span>}
              <span className="text-muted-foreground"> — {r.country}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

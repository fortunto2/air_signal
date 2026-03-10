'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const CITIES = ['Gazipasha', 'Alanya', 'Antalya'];

export const CitySelector = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');

  return (
    <div className="flex gap-4 p-4">
      <select onChange={(e) => router.push(`/${e.target.value.toLowerCase()}`)} className="p-2 border rounded">
        <option>Select a city</option>
        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <input 
        type="text" 
        value={search} 
        onChange={(e) => setSearch(e.target.value)} 
        placeholder="Add custom city..." 
        className="p-2 border rounded"
      />
    </div>
  );
};
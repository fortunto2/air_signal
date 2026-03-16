'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapCity {
  name: string;
  country?: string;
  lat: number;
  lon: number;
  aqi?: number;
  pm25?: number;
}

interface CityMapProps {
  cities: MapCity[];
  center?: [number, number];
  zoom?: number;
  onCityClick?: (city: MapCity) => void;
  selectedCity?: { lat: number; lon: number } | null;
}

function aqiColor(aqi: number): string {
  if (aqi <= 50) return '#00c853';
  if (aqi <= 100) return '#ffc107';
  if (aqi <= 150) return '#ff9800';
  if (aqi <= 200) return '#f44336';
  if (aqi <= 300) return '#9c27b0';
  return '#800000';
}

export function CityMap({ cities, center = [36.5, 32], zoom = 5, onCityClick, selectedCity }: CityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    leafletMap.current = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
    }).addTo(leafletMap.current);

    return () => {
      leafletMap.current?.remove();
      leafletMap.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!leafletMap.current) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    for (const city of cities) {
      const color = city.aqi != null ? aqiColor(city.aqi) : '#888';
      const radius = city.aqi != null ? Math.max(6, Math.min(20, city.aqi / 10)) : 8;

      const marker = L.circleMarker([city.lat, city.lon], {
        radius,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.6,
      }).addTo(leafletMap.current!);

      const label = city.aqi != null
        ? `<b>${city.name}</b><br>AQI: ${city.aqi}<br>PM2.5: ${city.pm25} ug/m3`
        : `<b>${city.name}</b>`;
      marker.bindTooltip(label, { direction: 'top', offset: [0, -8] });

      if (onCityClick) {
        marker.on('click', () => onCityClick(city));
      }

      markersRef.current.push(marker);
    }
  }, [cities, onCityClick]);

  useEffect(() => {
    if (selectedCity && leafletMap.current) {
      leafletMap.current.setView([selectedCity.lat, selectedCity.lon], 8, { animate: true });
    }
  }, [selectedCity]);

  return <div ref={mapRef} className="w-full h-[400px] rounded-lg border border-border" />;
}

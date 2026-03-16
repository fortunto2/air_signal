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

interface Sensor {
  id: number;
  lat: number;
  lon: number;
  pm25: number;
  pm10: number;
}

interface CityMapProps {
  cities: MapCity[];
  sensors?: Sensor[];
  center?: [number, number];
  zoom?: number;
  onCityClick?: (city: MapCity) => void;
  selectedCity?: { lat: number; lon: number } | null;
}

function pm25Color(pm25: number): string {
  if (pm25 <= 12) return '#00c853';
  if (pm25 <= 35) return '#ffc107';
  if (pm25 <= 55) return '#ff9800';
  if (pm25 <= 150) return '#f44336';
  return '#9c27b0';
}

function aqiColor(aqi: number): string {
  if (aqi <= 50) return '#00c853';
  if (aqi <= 100) return '#ffc107';
  if (aqi <= 150) return '#ff9800';
  if (aqi <= 200) return '#f44336';
  if (aqi <= 300) return '#9c27b0';
  return '#800000';
}

export function CityMap({ cities, sensors = [], center = [36.5, 32], zoom = 5, onCityClick, selectedCity }: CityMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const cityMarkersRef = useRef<L.CircleMarker[]>([]);
  const sensorMarkersRef = useRef<L.CircleMarker[]>([]);

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

  // City markers (large, interactive)
  useEffect(() => {
    if (!leafletMap.current) return;

    cityMarkersRef.current.forEach(m => m.remove());
    cityMarkersRef.current = [];

    for (const city of cities) {
      const color = city.aqi != null ? aqiColor(city.aqi) : '#888';
      const radius = city.aqi != null ? Math.max(8, Math.min(22, city.aqi / 8)) : 10;

      const marker = L.circleMarker([city.lat, city.lon], {
        radius,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.7,
      }).addTo(leafletMap.current!);

      const label = city.aqi != null
        ? `<b>${city.name}</b><br>AQI: ${city.aqi}<br>PM2.5: ${city.pm25} ug/m3`
        : `<b>${city.name}</b>`;
      marker.bindTooltip(label, { direction: 'top', offset: [0, -8] });

      if (onCityClick) {
        marker.on('click', () => onCityClick(city));
      }

      cityMarkersRef.current.push(marker);
    }
  }, [cities, onCityClick]);

  // Sensor markers (small dots, colored by PM2.5)
  useEffect(() => {
    if (!leafletMap.current) return;

    sensorMarkersRef.current.forEach(m => m.remove());
    sensorMarkersRef.current = [];

    for (const s of sensors) {
      const color = pm25Color(s.pm25);
      const marker = L.circleMarker([s.lat, s.lon], {
        radius: 4,
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.5,
      }).addTo(leafletMap.current!);

      marker.bindTooltip(
        `Sensor #${s.id}<br>PM2.5: ${s.pm25.toFixed(1)}<br>PM10: ${s.pm10.toFixed(1)}`,
        { direction: 'top', offset: [0, -4] }
      );

      sensorMarkersRef.current.push(marker);
    }
  }, [sensors]);

  // Fly to selected city
  useEffect(() => {
    if (selectedCity && leafletMap.current) {
      leafletMap.current.setView([selectedCity.lat, selectedCity.lon], 10, { animate: true });
    }
  }, [selectedCity]);

  return <div ref={mapRef} className="w-full h-[450px] rounded-lg border border-border" />;
}

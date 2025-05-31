import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAirQuality(value: number): string {
  if (value <= 12) return "Отличное"
  if (value <= 35) return "Хорошее"
  if (value <= 55) return "Умеренное"
  if (value <= 150) return "Нездоровое для чувствительных"
  if (value <= 250) return "Нездоровое"
  return "Очень нездоровое"
}

export function getAirQualityColor(value: number): string {
  if (value <= 12) return "text-green-600"
  if (value <= 35) return "text-green-500"
  if (value <= 55) return "text-yellow-500"
  if (value <= 150) return "text-orange-500"
  if (value <= 250) return "text-red-500"
  return "text-red-600"
}

export function getAirQualityBgColor(value: number): string {
  if (value <= 12) return "bg-green-100"
  if (value <= 35) return "bg-green-50"
  if (value <= 55) return "bg-yellow-50"
  if (value <= 150) return "bg-orange-50"
  if (value <= 250) return "bg-red-50"
  return "bg-red-100"
} 
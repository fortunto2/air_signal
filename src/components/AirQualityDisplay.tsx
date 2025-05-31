'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatAirQuality, getAirQualityColor, getAirQualityBgColor } from '@/lib/utils'
import type { SensorData } from '@/types/sensor'
import { Wind, Thermometer, Droplets, Gauge } from 'lucide-react'

interface AirQualityDisplayProps {
  data?: SensorData
  loading?: boolean
}

export function AirQualityDisplay({ data, loading }: AirQualityDisplayProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <CardTitle>Загрузка данных...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <Card className="border-yellow-500/50 bg-yellow-500/10">
        <CardHeader>
          <CardTitle className="text-yellow-400">Данные недоступны</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-300">
            Не удалось получить данные с датчика. Попробуйте позже.
          </p>
        </CardContent>
      </Card>
    )
  }

  const pm25Status = formatAirQuality(data.pm25)
  const pm25Color = getAirQualityColor(data.pm25)

  const pm10Status = formatAirQuality(data.pm10)
  const pm10Color = getAirQualityColor(data.pm10)

  return (
    <div className="space-y-6">
      {/* Основные показатели PM2.5 */}
      <Card className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-500/30">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Качество воздуха в Газипаше
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-2">
            <div className="text-6xl font-bold text-green-400">
              {data.pm25.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">µg/m³ PM2.5</div>
            <div className="text-xl font-semibold text-green-400">
              {pm25Status}
            </div>
            <div className="text-xs text-muted-foreground">
              Обновлено: {new Date(data.timestamp).toLocaleString('ru-RU')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Дополнительные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* PM10 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PM10</CardTitle>
            <Wind className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${pm10Color}`}>
              {data.pm10.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              µg/m³ • {pm10Status}
            </p>
          </CardContent>
        </Card>

        {/* Температура */}
        {data.temperature && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Температура</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">
                {data.temperature.toFixed(1)}°C
              </div>
              <p className="text-xs text-muted-foreground">
                Текущая температура
              </p>
            </CardContent>
          </Card>
        )}

        {/* Влажность */}
        {data.humidity && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Влажность</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {data.humidity.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Относительная влажность
              </p>
            </CardContent>
          </Card>
        )}

        {/* Давление */}
        {data.pressure && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Давление</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(data.pressure / 100)}
              </div>
              <p className="text-xs text-muted-foreground">
                hPa атмосферное давление
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 
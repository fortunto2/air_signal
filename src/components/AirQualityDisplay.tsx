'use client'

import React from 'react'
import { SensorData } from '@/types/sensor'
import { formatAirQuality, getAirQualityColor } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

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
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Нет данных</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Данные о качестве воздуха временно недоступны. Попробуйте обновить страницу.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pm25Status = formatAirQuality(data.pm25)
  const pm10Status = formatAirQuality(data.pm10)
  
  const pm25Color = getAirQualityColor(data.pm25)
  const pm10Color = getAirQualityColor(data.pm10)

  return (
    <div className="space-y-6">
      {/* Main indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PM2.5 Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">PM2.5</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold mb-2">{data.pm25}</div>
            <div className="text-lg text-muted-foreground mb-3">µg/m³</div>
            <div className={`text-lg font-medium ${pm25Color}`}>
              {pm25Status}
            </div>
          </CardContent>
        </Card>

        {/* PM10 Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">PM10</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold mb-2">{data.pm10}</div>
            <div className="text-lg text-muted-foreground mb-3">µg/m³</div>
            <div className={`text-lg font-medium ${pm10Color}`}>
              {pm10Status}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional metrics */}
      {(data.temperature !== undefined || data.humidity !== undefined || data.pressure !== undefined) && (
        <Card>
          <CardHeader>
            <CardTitle>Дополнительные показатели</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.temperature !== undefined && (
                <div className="text-center">
                  <div className="text-2xl font-bold">{data.temperature}°C</div>
                  <div className="text-sm text-muted-foreground">Температура</div>
                </div>
              )}
              {data.humidity !== undefined && (
                <div className="text-center">
                  <div className="text-2xl font-bold">{data.humidity}%</div>
                  <div className="text-sm text-muted-foreground">Влажность</div>
                </div>
              )}
              {data.pressure !== undefined && (
                <div className="text-center">
                  <div className="text-2xl font-bold">{Math.round(data.pressure)} hPa</div>
                  <div className="text-sm text-muted-foreground">Давление</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last updated */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-sm text-muted-foreground">
            Последнее обновление: {new Date(data.timestamp).toLocaleString('ru-RU')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 
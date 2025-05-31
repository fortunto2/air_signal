import { NextResponse } from 'next/server'
import { SensorData, ApiResponse } from '@/types/sensor'

// Константы для API
const SENSOR_COMMUNITY_API = 'https://data.sensor.community/airrohr/v1'
const CHIP_ID = 'esp8266-15072310'
const TARGET_SENSOR_ID = 77955
const USER_AGENT = 'Mozilla/5.0 (compatible; AirQualityBot/1.0)'

// Кэш для текущих данных (5 минут)
const CURRENT_CACHE_DURATION = 5 * 60 * 1000
let currentCache: { data: ApiResponse; timestamp: number } | null = null

// Интерфейс для данных от sensor.community
interface SensorReading {
  id: number
  value: string
  value_type: 'P1' | 'P2' | 'temperature' | 'humidity' | 'pressure'
}

interface SensorResponse {
  id: number
  timestamp: string
  sensordatavalues: SensorReading[]
}

function parseSensorData(readings: SensorReading[]): SensorData | null {
  const data: Partial<SensorData> = {}
  
  for (const reading of readings) {
    const value = parseFloat(reading.value)
    if (isNaN(value)) continue
    
    switch (reading.value_type) {
      case 'P1': // PM10
        data.pm10 = value
        break
      case 'P2': // PM2.5
        data.pm25 = value
        break
      case 'temperature':
        data.temperature = value
        break
      case 'humidity':
        data.humidity = value
        break
      case 'pressure':
        data.pressure = parseFloat(item.value)
        break
    }
  }
  
  // Проверяем, что есть основные данные
  if (typeof data.pm25 !== 'number' || typeof data.pm10 !== 'number') {
    return null
  }
  
  return {
    timestamp: new Date().toISOString(),
    pm25: data.pm25,
    pm10: data.pm10,
    temperature: data.temperature,
    humidity: data.humidity,
    pressure: data.pressure
  }
}

async function fetchSensorCommunityData(): Promise<SensorData | null> {
  try {
    // Прямой запрос к конкретному датчику
    const url = `${SENSOR_COMMUNITY_API}/sensor/${TARGET_SENSOR_ID}/`
    console.log(`Fetching from: ${url}`)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT
      }
    })
    
    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`)
    }
    
    const data: SensorResponse[] = await response.json()
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data received from API')
    }
    
    // Берем последнее измерение
    const latest = data[0]
    console.log(`Received data from sensor ${latest.id} at ${latest.timestamp}`)
    
    return parseSensorData(latest.sensordatavalues)
    
  } catch (error) {
    console.error('Error fetching from sensor.community:', error)
    return null
  }
}

export async function GET() {
  try {
    // Проверяем кэш текущих данных
    if (currentCache && Date.now() - currentCache.timestamp < CURRENT_CACHE_DURATION) {
      return NextResponse.json(currentCache.data)
    }
    
    // Получаем текущие данные
    const current = await fetchSensorCommunityData()
    
    const response: ApiResponse = {
      current: current || undefined,
      historical: [] // Убираем исторические данные
    }
    
    // Обновляем кэш
    currentCache = {
      data: response,
      timestamp: Date.now()
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('API Error:', error)
    
    // Возвращаем кэшированные данные при ошибке
    if (currentCache) {
      console.log('Returning cached data due to API error')
      return NextResponse.json(currentCache.data)
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch sensor data' },
      { status: 500 }
    )
  }
} 
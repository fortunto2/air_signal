export interface SensorData {
  timestamp: string
  pm1?: number
  pm25: number
  pm10: number
  temperature?: number
  humidity?: number
  pressure?: number
  wifi_signal?: number
}

export interface SensorReading {
  sensor: {
    id: number
    sensor_type: {
      name: string
    }
  }
  location: {
    id: number
    latitude: string
    longitude: string
    altitude?: string
    country?: string
    exact_location?: number
    indoor?: number
  }
  sensordatavalues: Array<{
    value_type: string
    value: string
  }>
  timestamp: string
}

export interface ApiResponse {
  current?: SensorData
  historical: SensorData[]
  error?: string
}

export interface AirQualityMetrics {
  pm25: {
    current: number
    status: string
    color: string
    bgColor: string
  }
  pm10: {
    current: number
    status: string
    color: string
    bgColor: string
  }
  temperature?: number
  humidity?: number
  pressure?: number
} 
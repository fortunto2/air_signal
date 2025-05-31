// Константы для API
const SENSOR_COMMUNITY_API = 'https://data.sensor.community/airrohr/v1'
const TARGET_SENSOR_ID = 77955
const USER_AGENT = 'Mozilla/5.0 (compatible; AirQualityBot/1.0)'

// Кэш для данных (5 минут)
const CACHE_DURATION = 5 * 60 * 1000
let dataCache = null

// Функция для парсинга данных датчика
function parseSensorData(readings) {
  const data = {}
  
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
        data.pressure = value
        break
    }
  }
  
  // Проверяем наличие основных данных
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

// Функция для получения данных от API
async function fetchSensorData() {
  try {
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
    
    const data = await response.json()
    
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No data received from API')
    }
    
    // Берем последнее измерение
    const latest = data[0]
    console.log(`Received data from sensor ${latest.id} at ${latest.timestamp}`)
    
    return parseSensorData(latest.sensordatavalues)
    
  } catch (error) {
    console.error('Error fetching sensor data:', error)
    return null
  }
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url)
    
    // Обработка статических файлов Next.js
    if (url.pathname.startsWith('/_next/static/')) {
      return env.ASSETS.fetch(request)
    }
    
    // API endpoint для данных датчика
    if (url.pathname === '/api/sensor') {
      // Проверяем кэш
      if (dataCache && Date.now() - dataCache.timestamp < CACHE_DURATION) {
        return new Response(JSON.stringify(dataCache.data), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        })
      }
      
      // Получаем свежие данные
      const current = await fetchSensorData()
      
      const responseData = {
        current: current || undefined,
        historical: []
      }
      
      // Обновляем кэш
      dataCache = {
        data: responseData,
        timestamp: Date.now()
      }
      
      return new Response(JSON.stringify(responseData), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
    
    // Главная страница - полноценный HTML дашборд
    const html = `
<!DOCTYPE html>
<html lang="ru" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Мониторинг воздуха в Газипаше</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {}
            }
        }
    </script>
</head>
<body class="bg-gray-900 text-white min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
        <header class="text-center mb-8">
            <h1 class="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                🌬️ Мониторинг воздуха в Газипаше
            </h1>
            <p class="text-gray-400">Реальные данные качества воздуха</p>
            <button id="refreshBtn" class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                🔄 Обновить
            </button>
        </header>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 class="text-xl font-semibold mb-4">PM2.5</h2>
                <div id="pm25" class="text-4xl font-bold mb-2">-</div>
                <div class="text-sm text-gray-400 mb-2">µg/m³</div>
                <div id="pm25Status" class="text-sm font-medium">-</div>
            </div>
            
            <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 class="text-xl font-semibold mb-4">PM10</h2>
                <div id="pm10" class="text-4xl font-bold mb-2">-</div>
                <div class="text-sm text-gray-400 mb-2">µg/m³</div>
                <div id="pm10Status" class="text-sm font-medium">-</div>
            </div>
        </div>
        
        <div class="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <div id="lastUpdate" class="text-center text-gray-400">
                Последнее обновление: -
            </div>
        </div>
        
        <div class="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
                📊 Исторические данные
            </h2>
            <p class="text-gray-400 mb-4">
                Для просмотра исторических данных и детальной аналитики перейдите в официальный дашборд Grafana:
            </p>
            <a href="https://api-rrd.madavi.de:3000/grafana/d/GUaL5aZMz/pm-sensors?orgId=1&var-chipID=esp8266-15072310&theme=light" 
               target="_blank" 
               class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                📈 Открыть Grafana дашборд
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
            </a>
            <div class="mt-4 text-sm text-gray-500">
                <strong>Возможности Grafana:</strong> Графики за последние 24 часа, недели и месяцы • Экспорт данных • Настройка временных интервалов • Сравнение показателей
            </div>
        </div>
        
        <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 class="text-xl font-semibold mb-6">ℹ️ О показателях качества воздуха</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 class="text-lg font-medium mb-3 text-blue-400">PM2.5 (Мелкие частицы)</h3>
                    <p class="text-gray-300 text-sm mb-4">
                        Частицы диаметром менее 2.5 микрометров. Самые опасные для здоровья, так как могут проникать глубоко в легкие и кровеносную систему.
                    </p>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-green-400">0-12 µg/m³</span>
                            <span class="text-gray-400">Отличное</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-yellow-400">12-35 µg/m³</span>
                            <span class="text-gray-400">Хорошее</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-orange-400">35-55 µg/m³</span>
                            <span class="text-gray-400">Умеренное</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-red-400">55+ µg/m³</span>
                            <span class="text-gray-400">Плохое</span>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-lg font-medium mb-3 text-blue-400">PM10 (Крупные частицы)</h3>
                    <p class="text-gray-300 text-sm mb-4">
                        Частицы диаметром менее 10 микрометров. Могут раздражать дыхательные пути и ухудшать работу легких.
                    </p>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-green-400">0-20 µg/m³</span>
                            <span class="text-gray-400">Отличное</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-yellow-400">20-50 µg/m³</span>
                            <span class="text-gray-400">Хорошее</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-orange-400">50-100 µg/m³</span>
                            <span class="text-gray-400">Умеренное</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-red-400">100+ µg/m³</span>
                            <span class="text-gray-400">Плохое</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="text-center mt-8 text-sm text-gray-500">
            Дашборд развернут на Cloudflare Workers! 🎉
        </div>
        
        <!-- Футер с ссылками -->
        <footer class="mt-12 pt-8 border-t border-gray-700">
            <div class="flex flex-col md:flex-row justify-center items-center gap-6 text-sm text-gray-400">
                <a href="https://github.com/fortunto2/air_signal" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   class="flex items-center gap-2 hover:text-blue-400 transition-colors">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                </a>
                
                <a href="https://maps.sensor.community/#10/36.1523/32.1523" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   class="flex items-center gap-2 hover:text-green-400 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    Карта датчиков
                </a>
                
                <a href="https://t.me/life2film" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   class="flex items-center gap-2 hover:text-blue-300 transition-colors">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121L9.864 13.63l-2.915-.918c-.63-.196-.64-.63.135-.931l11.4-4.39c.528-.196.99.119.82.83z"/>
                    </svg>
                    Telegram
                </a>
            </div>
            
            <div class="text-center mt-4 text-xs text-gray-600">
                © 2025 • Мониторинг воздуха в Газипаше • Данные: <a href="https://sensor.community/" target="_blank" class="hover:text-blue-400">Sensor.Community</a>
            </div>
        </footer>
    </div>
    
    <script>
        // Функция для определения уровня качества воздуха PM2.5
        function getAirQualityLevel(pm25) {
            if (pm25 <= 12) return { level: 'Отличное', color: 'text-green-400' }
            if (pm25 <= 35) return { level: 'Хорошее', color: 'text-yellow-400' }
            if (pm25 <= 55) return { level: 'Умеренное', color: 'text-orange-400' }
            if (pm25 <= 150) return { level: 'Плохое', color: 'text-red-400' }
            return { level: 'Очень плохое', color: 'text-purple-400' }
        }
        
        // Функция для определения уровня качества воздуха PM10
        function getPM10Level(pm10) {
            if (pm10 <= 20) return { level: 'Отличное', color: 'text-green-400' }
            if (pm10 <= 50) return { level: 'Хорошее', color: 'text-yellow-400' }
            if (pm10 <= 100) return { level: 'Умеренное', color: 'text-orange-400' }
            return { level: 'Плохое', color: 'text-red-400' }
        }
        
        // Загрузка данных
        async function loadData() {
            try {
                const response = await fetch('/api/sensor')
                const data = await response.json()
                
                if (data.current) {
                    const { pm25, pm10, timestamp } = data.current
                    
                    // Обновляем значения PM2.5
                    document.getElementById('pm25').textContent = pm25.toFixed(2)
                    const pm25Quality = getAirQualityLevel(pm25)
                    const pm25StatusEl = document.getElementById('pm25Status')
                    pm25StatusEl.textContent = pm25Quality.level
                    pm25StatusEl.className = 'text-sm font-medium ' + pm25Quality.color
                    
                    // Обновляем значения PM10
                    document.getElementById('pm10').textContent = pm10.toFixed(2)
                    const pm10Quality = getPM10Level(pm10)
                    const pm10StatusEl = document.getElementById('pm10Status')
                    pm10StatusEl.textContent = pm10Quality.level
                    pm10StatusEl.className = 'text-sm font-medium ' + pm10Quality.color
                    
                    // Обновляем время последнего обновления
                    const updateTime = new Date(timestamp).toLocaleString('ru-RU', {
                        timeZone: 'Europe/Istanbul',
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                    document.getElementById('lastUpdate').textContent = \`Последнее обновление: \${updateTime}\`
                } else {
                    document.getElementById('pm25').textContent = '-'
                    document.getElementById('pm10').textContent = '-'
                    document.getElementById('lastUpdate').textContent = 'Данные временно недоступны'
                }
            } catch (error) {
                console.error('Ошибка загрузки данных:', error)
                document.getElementById('pm25').textContent = 'Ошибка'
                document.getElementById('pm10').textContent = 'Ошибка'
                document.getElementById('lastUpdate').textContent = 'Ошибка загрузки данных'
            }
        }
        
        // Загружаем данные при загрузке страницы
        loadData()
        
        // Обновляем каждые 5 минут
        setInterval(loadData, 5 * 60 * 1000)
        
        // Кнопка ручного обновления
        document.getElementById('refreshBtn').addEventListener('click', loadData)
    </script>
</body>
</html>`
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=UTF-8'
      }
    })
  }
}

export default worker 
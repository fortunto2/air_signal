'use client'

import { AirQualityDisplay } from '@/components/AirQualityDisplay'
import useSWR from 'swr'
import { MapPin, RefreshCw, BarChart3, ExternalLink } from 'lucide-react'
import type { ApiResponse } from '@/types/sensor'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function Home() {
  const { data, error, isLoading, mutate } = useSWR<ApiResponse>('/api/sensor', fetcher, {
    refreshInterval: 5 * 60 * 1000, // Обновляем каждые 5 минут
    revalidateOnFocus: false,
  })

  const handleRefresh = () => {
    mutate()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                Мониторинг воздуха в Газипаше
              </h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Обновить</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Current Air Quality */}
        <div className="mb-8">
          {error && (
            <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <h3 className="text-destructive font-semibold mb-2">Ошибка загрузки данных</h3>
              <p className="text-destructive/80 text-sm">
                Не удалось получить данные с сервера. Проверьте подключение к интернету и попробуйте обновить страницу.
              </p>
            </div>
          )}
          <AirQualityDisplay data={data?.current} loading={isLoading} />
        </div>

        {/* Grafana Dashboard Link */}
        <div className="mb-8">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                  Исторические данные
                </h3>
              </div>
            </div>
            <div className="p-6 pt-0">
              <p className="text-muted-foreground mb-4">
                Для просмотра исторических данных и детальной аналитики перейдите в официальный дашборд Grafana:
              </p>
              
              <a
                href="https://api-rrd.madavi.de:3000/grafana/d/GUaL5aZMz/pm-sensors?orgId=1&var-chipID=esp8266-15072310&theme=light"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                <BarChart3 className="h-5 w-5" />
                <span>Открыть Grafana дашборд</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              
              <div className="mt-4 p-3 bg-muted/50 rounded-md">
                <p className="text-sm text-muted-foreground">
                  <strong>Возможности Grafana:</strong> Графики за последние 24 часа, недели и месяцы • 
                  Экспорт данных • Настройка временных интервалов • Сравнение показателей
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Air Quality Information */}
        <div className="mb-8">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">О показателях качества воздуха</h3>
            </div>
            <div className="p-6 pt-0">
              <div className="grid md:grid-cols-2 gap-6">
                {/* PM2.5 Info */}
                <div className="space-y-3">
                  <h4 className="text-lg font-medium text-foreground">PM2.5 (Мелкие частицы)</h4>
                  <p className="text-sm text-muted-foreground">
                    Частицы диаметром менее 2.5 микрометров. Самые опасные для здоровья, так как могут проникать глубоко в легкие и кровеносную систему.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="px-2 py-1 rounded text-green-300 bg-green-900/30">0-12 µg/m³</span>
                      <span className="text-muted-foreground">Хорошо</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="px-2 py-1 rounded text-yellow-300 bg-yellow-900/30">12-35 µg/m³</span>
                      <span className="text-muted-foreground">Умеренно</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="px-2 py-1 rounded text-orange-300 bg-orange-900/30">35-55 µg/m³</span>
                      <span className="text-muted-foreground">Нездорово для чувствительных</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="px-2 py-1 rounded text-red-300 bg-red-900/30">55+ µg/m³</span>
                      <span className="text-muted-foreground">Нездорово</span>
                    </div>
                  </div>
                </div>

                {/* PM10 Info */}
                <div className="space-y-3">
                  <h4 className="text-lg font-medium text-foreground">PM10 (Крупные частицы)</h4>
                  <p className="text-sm text-muted-foreground">
                    Частицы диаметром менее 10 микрометров. Могут раздражать дыхательные пути и ухудшать работу легких.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="px-2 py-1 rounded text-green-300 bg-green-900/30">0-25 µg/m³</span>
                      <span className="text-muted-foreground">Хорошо</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="px-2 py-1 rounded text-yellow-300 bg-yellow-900/30">25-50 µg/m³</span>
                      <span className="text-muted-foreground">Умеренно</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="px-2 py-1 rounded text-orange-300 bg-orange-900/30">50-90 µg/m³</span>
                      <span className="text-muted-foreground">Нездорово для чувствительных</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="px-2 py-1 rounded text-red-300 bg-red-900/30">90+ µg/m³</span>
                      <span className="text-muted-foreground">Нездорово</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Health Recommendations */}
              <div className="mt-6 p-4 rounded-lg bg-blue-950/30 border border-blue-800/30">
                <h4 className="font-medium text-blue-300 mb-3">💡 Рекомендации по защите здоровья</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="text-sm text-blue-100 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>При плохом качестве воздуха ограничьте время на улице</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>Закрывайте окна при высоких показателях PM</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>Используйте воздухоочистители в помещении</span>
                    </li>
                  </ul>
                  <ul className="text-sm text-blue-100 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>Носите маски N95/FFP2 при выходе на улицу</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>Люди с астмой и болезнями сердца должны быть особенно осторожны</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>Занимайтесь спортом в помещении при плохом воздухе</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2">
                <span>📊</span>
                <span>Стандарты основаны на рекомендациях ВОЗ (WHO) и Агентства по охране окружающей среды США (EPA)</span>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">О проекте</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p className="mb-4">
                Этот дашборд отображает актуальные данные о качестве воздуха в регионе Газипаши, 
                получаемые с датчиков сети{' '}
                <a 
                  href="https://sensor.community/" 
                  className="text-primary hover:underline" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Sensor.Community
                </a>. Система получает данные с реального датчика #77955 (esp8266-15072310) в Газипаше.
              </p>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Измеряемые параметры:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>PM2.5 - мелкие частицы (основной показатель)</li>
                    <li>PM10 - крупные частицы</li>
                    <li>Температура воздуха (при наличии BME280)</li>
                    <li>Влажность воздуха (при наличии BME280)</li>
                    <li>Атмосферное давление (при наличии BME280)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Технические детали:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Датчик: esp8266-15072310 (SDS011)</li>
                    <li>Локация: Газипаша (36.266°N, 32.294°E)</li>
                    <li>Обновление данных: каждые 5 минут</li>
                    <li>API: Sensor.Community (реальные данные)</li>
                    <li>Стандарты: WHO Air Quality Guidelines</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-primary/10 rounded-md">
                <p className="text-sm text-primary">
                  <strong>Статус:</strong> Дашборд получает реальные данные с датчика #77955 в Газипаше. 
                  Для исторических данных используйте Grafana дашборд выше.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Дашборд качества воздуха • Создано с ❤️ для Газипаши •
              <a 
                href="https://github.com/opendata-stuttgart" 
                className="ml-1 text-primary hover:underline" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Open Data Stuttgart
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

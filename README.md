# 🌍 Дашборд качества воздуха - Газипаша

Современный веб-дашборд для мониторинга качества воздуха в городе Газипаша, Турция. Отображает данные с датчика ESP8266-15072310, подключенного к международной сети [Sensor.Community](https://sensor.community/).

## ✨ Особенности

- 📊 **Крупное отображение** текущих показателей PM2.5 и PM10
- 📈 **Исторические графики** с возможностью анализа трендов
- 🌡️ **Климатические данные** (температура, влажность, давление)
- 🎨 **Современный дизайн** с использованием shadcn/ui
- 📱 **Адаптивный интерфейс** для всех устройств
- ⚡ **Быстрая загрузка** благодаря SWR кэшированию
- 🔄 **Автообновление** данных каждые 5 минут

## 🏗️ Технический стек

- **Framework**: Next.js 15 (App Router)
- **UI Components**: shadcn/ui + Tailwind CSS v4
- **Charts**: Recharts
- **Data Fetching**: SWR
- **Deployment**: Cloudflare Pages
- **Package Manager**: pnpm
- **Language**: TypeScript

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ 
- pnpm (рекомендуется) или npm

### Локальная разработка

1. **Клонирование и установка зависимостей:**
```bash
git clone <repository-url>
cd air_signal
pnpm install
```

2. **Запуск dev сервера:**
```bash
pnpm dev
```

3. **Откройте в браузере:**
```
http://localhost:3000
```

### Сборка проекта

```bash
pnpm build
```

## 🌐 Деплой на Cloudflare Pages

### Автоматический деплой

1. **Подключите репозиторий к Cloudflare Pages**
2. **Настройки сборки:**
   - Build command: `pnpm run pages:build`
   - Build output directory: `.next`
   - Root directory: `/` (или оставьте пустым)

### Ручной деплой

```bash
# Сборка проекта
pnpm build

# Деплой через Wrangler CLI
npx wrangler pages deploy .next --project-name air-signal-gazipasa
```

## 📊 API Endpoints

### `/api/sensor`

Возвращает текущие и исторические данные датчика.

**Response format:**
```json
{
  "current": {
    "timestamp": "2024-01-15T10:00:00Z",
    "pm25": 25.5,
    "pm10": 35.2,
    "temperature": 22.3,
    "humidity": 45.7,
    "pressure": 1013.25
  },
  "historical": [
    // массив исторических данных
  ]
}
```

## 🎯 Структура проекта

```
src/
├── app/
│   ├── api/sensor/         # API endpoint для данных датчика
│   ├── globals.css         # Глобальные стили
│   └── page.tsx           # Главная страница
├── components/
│   ├── ui/                # Базовые UI компоненты (shadcn/ui)
│   ├── AirQualityDisplay.tsx  # Текущие показатели
│   └── HistoricalChart.tsx    # Исторические графики
├── lib/
│   └── utils.ts           # Утилитарные функции
└── types/
    └── sensor.ts          # TypeScript типы
```

## 📈 Показатели качества воздуха

Дашборд использует стандарты WHO для классификации качества воздуха по PM2.5:

| Значение (µg/m³) | Статус | Цвет |
|------------------|--------|------|
| 0-12 | Отличное | 🟢 Зеленый |
| 13-35 | Хорошее | 🟡 Желтый |
| 36-55 | Умеренное | 🟠 Оранжевый |
| 56-150 | Нездоровое | 🔴 Красный |
| 150+ | Опасное | 🟣 Темно-красный |

## 🔧 Настройка и расширение

### Добавление новых датчиков

1. Обновите `CHIP_ID` в `src/app/api/sensor/route.ts`
2. Добавьте логику парсинга для новых типов данных
3. Обновите типы в `src/types/sensor.ts`

### Добавление новых источников данных

1. Создайте новый API endpoint в `src/app/api/`
2. Добавьте соответствующие компоненты в `src/components/`
3. Интегрируйте в главную страницу

### Кастомизация UI

- Цвета и темы: `src/app/globals.css`
- Компоненты: `src/components/ui/`
- Утилиты: `src/lib/utils.ts`

## 📊 Источники данных

- **Текущие данные**: [Sensor.Community API](https://data.sensor.community/)
- **Исторические данные**: [Madavi.de Archive](https://api-rrd.madavi.de/)
- **Датчик**: ESP8266-15072310 (SDS011 + BME280)

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📝 Лицензия

Проект распространяется под лицензией MIT. См. `LICENSE` для подробностей.

## 🙏 Благодарности

- [Sensor.Community](https://sensor.community/) за открытые данные
- [Madavi.de](https://www.madavi.de/) за архивирование исторических данных
- [OpenData Stuttgart](https://github.com/opendata-stuttgart) за инициативу
- Сообщество разработчиков за инструменты с открытым исходным кодом

## 📞 Контакты

Если у вас есть вопросы или предложения, создайте issue в репозитории.

---

**Сделано с ❤️ для чистого воздуха в Газипаше** 🌿

# Анализ API для датчика качества воздуха

## Информация о датчике
- **ChipID**: esp8266-15072310
- **Тип**: Датчик качества воздуха (PM1, PM2.5, PM10, температура, влажность, давление)
- **Сенсоры**: SDS011 (PM), BME280 (температура/влажность/давление)

## Доступные API endpoints

### 1. Sensor.Community API (data.sensor.community)

**Основные endpoints:**
- `https://data.sensor.community/static/v1/data.json` - все измерения за последние 5 минут
- `https://data.sensor.community/static/v2/data.json` - усредненные данные за 5 минут
- `https://data.sensor.community/static/v2/data.1h.json` - данные за час
- `https://data.sensor.community/static/v2/data.24h.json` - данные за 24 часа

**Фильтрация:**
- По типу сенсора: `type=SDS011,BME280`
- По геозоне: `box=lat1,lon1,lat2,lon2`
- По стране: `country=DE,NL`

**Требования:**
- Обязательный User-Agent header
- Обновление данных каждые 5 минут для актуальных данных

### 2. Madavi.de API (api-rrd.madavi.de)

**CSV данные (архив):**
- `https://api-rrd.madavi.de/csvfiles.php?sensor=esp8266-15072310` - список файлов
- `https://api-rrd.madavi.de/data_csv/2024/12/data-esp8266-15072310-2024-12.zip` - месячный архив

**Simple API:**
- `https://api-rrd.madavi.de/data_simple.php?sensor=esp8266-15072310` - простой API

**Grafana дашборд:**
- `https://api-rrd.madavi.de/grafana/d/GUaL5aZMz/pm-sensors?var-chipID=esp8266-15072310`

### 3. Структура данных

**PM измерения (SDS011):**
```json
{
  "value_type": "P1", // PM10
  "value": "66.04"
},
{
  "value_type": "P2", // PM2.5  
  "value": "53.32"
}
```

**Климатические данные (BME280):**
```json
{
  "value_type": "temperature",
  "value": "22.30"
},
{
  "value_type": "humidity", 
  "value": "34.70"
},
{
  "value_type": "pressure",
  "value": "1013.25"
}
```

## Возможности для дашборда

### ✅ Что можно сделать:

1. **Исторические данные**
   - Скачивание месячных архивов из Madavi.de
   - Данные доступны с 2023 года
   - Формат: ZIP с CSV файлами

2. **Актуальные данные** 
   - API sensor.community для последних измерений
   - Обновление каждые 5 минут
   - Данные за час/сутки с усреднением

3. **Метрики для дашборда**
   - PM1, PM2.5, PM10 (мкг/м³)
   - Температура (°C)
   - Влажность (%)
   - Атмосферное давление (hPa)
   - Wi-Fi сигнал

4. **Визуализация**
   - Графики временных рядов
   - Текущие значения
   - Сравнение с нормами качества воздуха
   - Тренды и прогнозы

### 🔴 Ограничения:

1. **Нет прямого API для нашего chipID**
   - Нужно найти mapping chipID → API ID
   - Или использовать архивные данные

2. **Grafana API требует авторизации**
   - Прямые запросы к InfluxDB заблокированы
   - Нужно использовать публичные endpoints

3. **Rate limiting**
   - Нужен User-Agent
   - Разумные интервалы запросов

## Рекомендации для дашборда

1. **Архитектура:**
   - Фоновое скачивание CSV архивов
   - Периодические запросы к актуальным API  
   - Локальная база данных для агрегации

2. **Технологии:**
   - Python/JavaScript для API
   - InfluxDB/TimescaleDB для хранения
   - Grafana/Chart.js для визуализации

3. **Обновления:**
   - Исторические данные: раз в месяц
   - Актуальные данные: каждые 5-15 минут
   - Прогнозы: раз в час

## Пример запросов

```bash
# Текущие данные всех датчиков
curl -A "air_signal_dashboard" "https://data.sensor.community/static/v2/data.json"

# Данные за час
curl -A "air_signal_dashboard" "https://data.sensor.community/static/v2/data.1h.json"

# Скачивание архива
curl "https://api-rrd.madavi.de/data_csv/2024/12/data-esp8266-15072310-2024-12.zip"
```

## Вывод

✅ **API данные ДОСТУПНЫ** для создания дашборда!

Можно создать полноценный дашборд с:
- Историческими данными (2+ года)
- Актуальными измерениями  
- Различными метриками качества воздуха
- Красивой визуализацией

Основной подход: комбинировать архивные CSV данные с Madavi и актуальные данные из Sensor.Community API. 
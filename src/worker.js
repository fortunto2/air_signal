export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Обработка статических файлов Next.js
    if (url.pathname.startsWith('/_next/static/')) {
      return env.ASSETS.fetch(request);
    }
    
    // Простая заглушка для демонстрации
    // В реальности здесь должна быть логика Next.js
    if (url.pathname === '/api/sensor') {
      // Mock данные для API
      const mockData = {
        current: {
          timestamp: new Date().toISOString(),
          pm25: 12.5,
          pm10: 18.3,
          temperature: 22.1,
          humidity: 65.2,
          pressure: 101325
        },
        historical: []
      };
      
      return new Response(JSON.stringify(mockData), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Главная страница - возвращаем простой HTML
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
    <div class="container mx-auto px-4 py-8">
        <header class="text-center mb-8">
            <h1 class="text-4xl font-bold mb-4">🌬️ Мониторинг воздуха в Газипаше</h1>
            <p class="text-gray-400">Реальные данные качества воздуха</p>
        </header>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="bg-gray-800 rounded-lg p-6">
                <h2 class="text-xl font-semibold mb-4">PM2.5</h2>
                <div id="pm25" class="text-3xl font-bold text-green-400">-</div>
                <div class="text-sm text-gray-400">µg/m³</div>
            </div>
            
            <div class="bg-gray-800 rounded-lg p-6">
                <h2 class="text-xl font-semibold mb-4">PM10</h2>
                <div id="pm10" class="text-3xl font-bold text-green-400">-</div>
                <div class="text-sm text-gray-400">µg/m³</div>
            </div>
        </div>
        
        <div class="text-center">
            <p class="text-sm text-gray-400">
                Дашборд развернут на Cloudflare Workers! 🎉<br>
                <a href="https://api-rrd.madavi.de:3000/grafana/d/GUaL5aZMz/pm-sensors?orgId=1&var-chipID=esp8266-15072310&theme=light" 
                   target="_blank" 
                   class="text-blue-400 hover:text-blue-300">
                    Подробные графики в Grafana →
                </a>
            </p>
        </div>
    </div>
    
    <script>
        // Загрузка данных
        async function loadData() {
            try {
                const response = await fetch('/api/sensor');
                const data = await response.json();
                
                if (data.current) {
                    document.getElementById('pm25').textContent = data.current.pm25.toFixed(1);
                    document.getElementById('pm10').textContent = data.current.pm10.toFixed(1);
                }
            } catch (error) {
                console.error('Ошибка загрузки данных:', error);
            }
        }
        
        // Загружаем данные при загрузке страницы
        loadData();
        
        // Обновляем каждые 5 минут
        setInterval(loadData, 5 * 60 * 1000);
    </script>
</body>
</html>`;
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=UTF-8'
      }
    });
  }
}; 
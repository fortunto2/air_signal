import React from 'react';
import { TrendPoint } from '@/lib/trends';

interface TrendChartProps {
  data: TrendPoint[];
  cityName: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, cityName }) => {
  const getColor = (score: number) => {
    if (score > 70) return 'bg-green-500';
    if (score > 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-6 bg-card rounded-xl shadow mt-6">
      <h3 className="text-lg font-semibold mb-4">{cityName} 30-Day Trend</h3>
      <div className="flex items-end h-32 gap-1">
        {data.map((point, i) => {
          // Map 40-90 range to 0-100% height
          // height % = ((score - 40) / (90 - 40)) * 100
          const heightPercent = Math.max(0, Math.min(100, ((point.score - 40) / 50) * 100));
          
          return (
            <div
              key={point.date}
              className="flex-1 flex flex-col justify-end group relative"
              title={`${point.date}: ${Math.round(point.score)}`}
            >
              <div
                className={`w-full rounded-t-sm transition-all duration-300 ${getColor(point.score)}`}
                style={{ height: `${heightPercent}%`, minHeight: '4px' }}
              />
              
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-popover text-popover-foreground text-xs rounded px-2 py-1 shadow-md whitespace-nowrap">
                  {point.date}<br/>
                  Score: {Math.round(point.score)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
};

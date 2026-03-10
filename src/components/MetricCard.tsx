import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  name: string;
  normalizedScore: number;
  rawValue: string;
  icon: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ name, normalizedScore, rawValue, icon }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{Math.round(normalizedScore)}%</div>
        <p className="text-xs text-muted-foreground">Raw: {rawValue}</p>
      </CardContent>
    </Card>
  );
};
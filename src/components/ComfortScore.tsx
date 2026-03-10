import React from 'react';

interface ComfortScoreProps {
  score: number;
}

export const ComfortScore: React.FC<ComfortScoreProps> = ({ score }) => {
  const getColor = (s: number) => {
    if (s > 70) return 'text-green-500';
    if (s > 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card rounded-xl shadow">
      <div className={`text-6xl font-bold ${getColor(score)}`}>{Math.round(score)}</div>
      <div className="text-sm text-muted-foreground">Comfort Score</div>
    </div>
  );
};
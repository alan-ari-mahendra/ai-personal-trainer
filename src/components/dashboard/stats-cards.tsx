'use client';

import { Dumbbell, Flame, Heart, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboard } from '@/hooks/use-dashboard';

export function StatsCards() {
  const { overview, loading } = useDashboard();

  const cards = [
    {
      title: 'Workouts (7d)',
      icon: Dumbbell,
      value: overview
        ? `${overview.weeklyWorkouts.count} sesi`
        : '—',
      sub: overview
        ? `Volume: ${Number(overview.weeklyWorkouts.volume).toLocaleString()} kg`
        : '',
    },
    {
      title: 'Kalori Hari Ini',
      icon: Flame,
      value: overview
        ? `${overview.todayNutrition.calories.toLocaleString()} kcal`
        : '—',
      sub: overview
        ? `Protein: ${overview.todayNutrition.protein}g`
        : '',
    },
    {
      title: 'Cardio (7d)',
      icon: Heart,
      value: overview
        ? `${overview.weeklyCardio.sessions} sesi`
        : '—',
      sub: overview
        ? `Total: ${overview.weeklyCardio.totalMin} menit`
        : '',
    },
    {
      title: 'Berat Badan',
      icon: Scale,
      value: overview?.latestWeight
        ? `${overview.latestWeight.weightKg} kg`
        : '—',
      sub: overview?.latestWeight
        ? `Update: ${overview.latestWeight.recordedAt}`
        : 'Belum ada data',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <div className="h-7 w-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.sub}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

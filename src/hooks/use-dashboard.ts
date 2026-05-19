'use client';

import { useState, useEffect } from 'react';
import { getOverview, getChartData } from '@/lib/actions/analytics';

interface OverviewData {
  weeklyWorkouts: { count: number; volume: string };
  todayNutrition: { calories: number; protein: string };
  weeklyCardio: { sessions: number; total_min: number };
  latestWeight: { weight_kg: string; recorded_at: string } | null;
}

export function useDashboard() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOverview()
      .then((data) => {
        setOverview(data as OverviewData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { overview, loading };
}

export function useChartData(type: string, days: number) {
  const [data, setData] = useState<{ date: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChartData(type, days)
      .then((data) => {
        setData((data ?? []) as { date: string; value: number }[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [type, days]);

  return { data, loading };
}

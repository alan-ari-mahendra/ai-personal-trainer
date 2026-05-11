'use client';

import { useState, useEffect } from 'react';

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
    fetch('/api/analytics/overview', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setOverview(data);
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
    fetch(`/api/analytics/chart?type=${type}&days=${days}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((res) => {
        setData(res.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [type, days]);

  return { data, loading };
}

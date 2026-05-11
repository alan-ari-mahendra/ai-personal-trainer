'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChartData } from '@/hooks/use-dashboard';

export function WorkoutChart() {
  const { data, loading } = useChartData('workouts', 30);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Volume Latihan (30 hari)</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] animate-pulse rounded bg-muted" />
        ) : data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Belum ada data. Mulai catat di Chat!
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(d: string) => {
                  const date = new Date(d);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                labelFormatter={(d) => new Date(String(d)).toLocaleDateString('id-ID')}
                formatter={(v) => [`${Number(v).toLocaleString()} kg`, 'Volume']}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

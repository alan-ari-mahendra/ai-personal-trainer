'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChartData } from '@/hooks/use-dashboard';

const TABS = [
  { key: 'weight', label: 'Berat Badan', days: 90, unit: 'kg' },
  { key: 'calories', label: 'Kalori', days: 30, unit: 'kcal' },
] as const;

export function ProgressChart() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>(TABS[0]);
  const { data, loading } = useChartData(activeTab.key, activeTab.days);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Progress</CardTitle>
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                activeTab.key === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
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
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(d: string) => {
                  const date = new Date(d);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                }}
              />
              <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip
                labelFormatter={(d) => new Date(String(d)).toLocaleDateString('id-ID')}
                formatter={(v) => [
                  `${Number(v).toLocaleString()} ${activeTab.unit}`,
                  activeTab.label,
                ]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { StatsCards } from '@/components/dashboard/stats-cards';
import { WorkoutChart } from '@/components/dashboard/workout-chart';
import { ProgressChart } from '@/components/dashboard/progress-chart';

export default function DashboardPage() {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <StatsCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WorkoutChart />
        <ProgressChart />
      </div>
    </div>
  );
}

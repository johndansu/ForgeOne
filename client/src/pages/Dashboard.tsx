import { Timeline } from '@/components/timeline/Timeline';
import { ForgeOneStatsCards } from '@/components/dashboard/StatsCards';

export function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ForgeOne Work Memory
          </h1>
          <p className="text-muted-foreground">
            Track your productivity and insights across all your work sessions
          </p>
        </div>
        
        <div className="mb-12">
          <ForgeOneStatsCards />
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Recent Work Entries</h2>
          <p className="text-sm text-muted-foreground">
            Your work memory with categories, time tracking, and outcomes
          </p>
        </div>
        
        <Timeline />
      </div>
    </div>
  );
}

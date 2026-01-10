import { ForgeOneStatsCards } from '@/components/dashboard/StatsCards';
import { ForgeOneActivityFeed } from '@/components/dashboard/ActivityFeed';
import { WorkEntryTimeline } from '@/components/ui/timeline';

export function Dashboard() {
  // Sample work entries data
  const workEntries = [
    {
      id: "1",
      title: "Project Setup",
      description: "Configured development environment and project structure",
      category: "project",
      timeSpent: 3,
      state_after: "Resolved",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: "2", 
      title: "React Hooks Study",
      description: "Learned useEffect and custom hooks",
      category: "study",
      timeSpent: 2.5,
      state_after: "Advanced",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      id: "3",
      title: "Morning Workout",
      description: "Completed 30min cardio and strength training",
      category: "personal", 
      timeSpent: 1,
      state_after: "Resolved",
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    },
    {
      id: "4",
      title: "Client Meeting",
      description: "Discussed project requirements and timeline",
      category: "client",
      timeSpent: 1.5,
      state_after: "Stuck",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
  ];

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
        
        {/* Stats Cards */}
        <div className="mb-12">
          <ForgeOneStatsCards />
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Work Timeline - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Work Timeline</h2>
              <p className="text-sm text-muted-foreground">
                Your chronological work memory with categories and outcomes
              </p>
            </div>
            <div className="bg-card rounded-xl border p-6">
              <WorkEntryTimeline entries={workEntries} />
            </div>
          </div>
          
          {/* Activity Feed - Takes 1 column */}
          <div className="lg:col-span-1">
            <ForgeOneActivityFeed />
          </div>
        </div>
      </div>
    </div>
  );
}

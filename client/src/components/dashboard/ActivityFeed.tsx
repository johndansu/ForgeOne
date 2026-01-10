import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Briefcase, GraduationCap, Heart, Clock, Database } from 'lucide-react';

// Define the icon type.
type IconType = React.ElementType | React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

// --- 📦 API (Props) Definition ---
export interface ActivityItem {
  /** A unique ID for the activity item. */
  id: string;
  /** The icon representing the type of activity. */
  icon: IconType;
  /** The main message describing the activity. */
  message: React.ReactNode;
  /** The timestamp or relative time of the activity (e.g., "2 hours ago", "Just now"). */
  timestamp: string;
  /** Optional color class for the icon (e.g., "text-green-500", "text-red-500"). */
  iconColorClass?: string;
}

export interface RecentActivityFeedProps {
  /** Array of activity items to display. */
  activities: ActivityItem[];
  /** Optional title for the activity feed card. */
  cardTitle?: string;
  /** Optional class name for the main card container. */
  className?: string;
}

/**
 * A professional component for displaying a feed of recent activities in an admin dashboard.
 */
const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
  cardTitle = "Recent Activity",
  className,
}) => {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">{cardTitle}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            No recent activity to display.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors duration-200"
              >
                {/* Icon */}
                <div className={cn(
                  "flex-shrink-0 p-1 rounded-full",
                  activity.iconColorClass || "text-muted-foreground bg-muted" // Default styling
                )}>
                  <activity.icon className="h-4 w-4" aria-hidden="true" />
                </div>
                
                {/* Message and Timestamp */}
                <div className="flex-grow flex flex-col">
                  <p className="text-sm font-medium text-foreground leading-tight">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ForgeOne specific work activities
export function ForgeOneActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: "1",
      icon: Briefcase,
      message: <>New work entry <span className="font-bold text-foreground">"Project Setup"</span> created.</>,
      timestamp: "Just now",
      iconColorClass: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50",
    },
    {
      id: "2",
      icon: GraduationCap,
      message: <>Study session <span className="font-bold text-foreground">"React Hooks"</span> completed.</>,
      timestamp: "2 hours ago",
      iconColorClass: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50",
    },
    {
      id: "3",
      icon: Heart,
      message: <>Personal task <span className="font-bold text-foreground">"Workout"</span> logged.</>,
      timestamp: "5 hours ago",
      iconColorClass: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50",
    },
    {
      id: "4",
      icon: Database,
      message: "Work memory database synchronized successfully.",
      timestamp: "1 day ago",
      iconColorClass: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50",
    },
    {
      id: "5",
      icon: Clock,
      message: <>Total time logged this week: <span className="font-bold text-foreground">24.5 hours</span></>,
      timestamp: "2 days ago",
    },
  ]);

  // Simulate new activity being added
  useEffect(() => {
    const timer = setTimeout(() => {
      setActivities((prev) => [
        {
          id: "6",
          icon: FileText,
          message: <>New insight generated for <span className="font-bold text-foreground">"Project Analytics"</span></>,
          timestamp: "Just now",
          iconColorClass: "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/50",
        },
        ...prev.slice(0, -1), // Keep only 5 most recent
      ]);
    }, 5000); // Add a new activity after 5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <RecentActivityFeed 
      activities={activities} 
      cardTitle="ForgeOne Activities"
      className="h-96"
    />
  );
}

export default RecentActivityFeed;

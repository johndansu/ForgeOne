import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Database, 
  Clock, 
  FolderOpen, 
  Lightbulb, 
  TrendingUp, 
  TrendingDown,
  MoreVertical,
  Settings,
  Share2,
  Pin,
  Trash
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardToolbar } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StatCardData {
  title: string;
  value: string | number;
  delta: number;
  lastPeriod: string;
  positive: boolean;
  icon: React.ElementType;
  description: string;
}

const statsData: StatCardData[] = [
  {
    title: 'Total Entries',
    value: '1,247',
    delta: 12.5,
    lastPeriod: '1,109 last month',
    positive: true,
    icon: Database,
    description: 'Memory entries logged',
  },
  {
    title: 'Time Logged',
    value: '342h',
    delta: 8.3,
    lastPeriod: '316h last month',
    positive: true,
    icon: Clock,
    description: 'Total work hours tracked',
  },
  {
    title: 'Categories',
    value: '24',
    delta: -4.2,
    lastPeriod: '25 last month',
    positive: false,
    icon: FolderOpen,
    description: 'Active categories',
  },
  {
    title: 'Insights Generated',
    value: '89',
    delta: 15.7,
    lastPeriod: '77 last month',
    positive: true,
    icon: Lightbulb,
    description: 'AI-powered insights',
  },
];

function formatNumber(n: number | string): string {
  if (typeof n === 'string') return n;
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return n.toLocaleString();
  return n.toString();
}

interface StatsCardProps {
  data: StatCardData;
}

function StatsCard({ data }: StatsCardProps) {
  const Icon = data.icon;
  
  return (
    <Card>
      <CardHeader className="border-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-lg",
              data.positive 
                ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400" 
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {data.title}
              </CardTitle>
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                {data.description}
              </p>
            </div>
          </div>
          <CardToolbar>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="-me-1.5">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="bottom">
                <DropdownMenuItem>
                  <Settings className="w-4 h-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Pin className="w-4 h-4" />
                  Pin to Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="w-4 h-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash className="w-4 h-4" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardToolbar>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="text-3xl font-semibold text-foreground tracking-tight">
            {formatNumber(data.value)}
          </span>
          <Badge 
            variant={data.positive ? 'success' : 'destructive'}
            className="gap-1"
          >
            {data.positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(data.delta)}%
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground pt-2 border-t">
          <span className="font-medium text-foreground">{data.lastPeriod}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ForgeOneStatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <StatsCard key={index} data={stat} />
      ))}
    </div>
  );
}

export { ForgeOneStatsCards, StatsCard, type StatCardData };

"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useFlowLedger } from '@/lib/flowledger';
import { useRecall } from '@/lib/recall';
import { useLifeOS } from '@/lib/lifeos';
import { useMicroCRM } from '@/lib/microcrm';
import { 
  Brain, 
  Users, 
  TrendingUp, 
  Activity,
  Heart,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export function ForgeOneDashboard() {
  const { workLogs, getStats } = useFlowLedger();
  const { memoryAnchors } = useRecall();
  const { systemOverview, inferHabits } = useLifeOS();
  const { people, meetings, getRelationshipInsights } = useMicroCRM();
  const [activeTab, setActiveTab] = useState('overview');

  const stats = getStats();
  const healthScore = systemOverview?.healthScore;
  const habits = inferHabits(workLogs);
  const relationshipInsights = getRelationshipInsights(people, meetings);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ForgeOne System Dashboard
          </h1>
          <p className="text-muted-foreground">
            Your complete work memory system - see the difference between manual tracking and intelligent inference
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b">
          {['overview', 'flowledger', 'recall', 'lifeos', 'microcrm'].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab)}
              className="capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* Overview Tab - Shows the BIG difference */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* The Difference Section */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  The ForgeOne Difference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Before - Manual Tracking */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-destructive">❌ Traditional Apps</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span>Manual habit tracking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span>Separate goal apps</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span>Duplicate data entry</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span>No memory of decisions</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span>Manual CRM entry</span>
                      </div>
                    </div>
                  </div>

                  {/* After - ForgeOne */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-primary">✅ ForgeOne System</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>Habits inferred automatically</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>Goals extracted from work</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>Single source of truth</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>Git history for your life</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span>People tracked naturally</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Work Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workLogs.length}</div>
                  <p className="text-xs text-muted-foreground">Everything feeds from here</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Memory Anchors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{memoryAnchors.length}</div>
                  <p className="text-xs text-muted-foreground">Decisions, insights, milestones</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Inferred Habits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{habits.length}</div>
                  <p className="text-xs text-muted-foreground">No manual tracking needed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">People Tracked</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{people.length}</div>
                  <p className="text-xs text-muted-foreground">Natural relationship tracking</p>
                </CardContent>
              </Card>
            </div>

            {/* Health Score */}
            {healthScore && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Weekly Health Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">{healthScore.overall}/100</div>
                      <p className="text-sm text-muted-foreground">Overall wellness</p>
                    </div>
                    
                    <div className="space-y-2">
                      {Object.entries(healthScore.dimensions).map(([dimension, score]) => (
                        <div key={dimension} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{dimension}</span>
                            <span>{score}/100</span>
                          </div>
                          <Progress value={score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* FlowLedger Tab */}
        {activeTab === 'flowledger' && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  FlowLedger Core Engine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold">{stats.totalLogs}</div>
                      <p className="text-sm text-muted-foreground">Total Logs</p>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold">{Math.round(stats.totalTime / 60)}h</div>
                      <p className="text-sm text-muted-foreground">Total Time</p>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold">{Math.round(stats.averageTime)}m</div>
                      <p className="text-sm text-muted-foreground">Avg Session</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Category Breakdown</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {Object.entries(stats.categoryStats).map(([category, count]) => (
                        <Badge key={category} variant="secondary" className="justify-center">
                          {category}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Work Logs */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Work Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="p-3 border rounded">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{log.what}</h4>
                        <Badge variant="outline">{log.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{log.why}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{log.time}min</span>
                        <span>{log.outcome}</span>
                        <span>{log.timestamp.toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recall Tab */}
        {activeTab === 'recall' && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Recall Memory Layer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold">{memoryAnchors.length}</div>
                      <p className="text-sm text-muted-foreground">Memory Anchors</p>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold">
                        {memoryAnchors.filter(a => a.type === 'decision').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Decisions</p>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold">
                        {memoryAnchors.filter(a => a.type === 'insight').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Insights</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Memory Anchors */}
            <Card>
              <CardHeader>
                <CardTitle>Memory Anchors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {memoryAnchors.slice(0, 5).map((anchor) => (
                    <div key={anchor.id} className="p-3 border rounded">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary">{anchor.type}</Badge>
                        <div className="text-xs text-muted-foreground">
                          Importance: {anchor.importance}/10
                        </div>
                      </div>
                      <p className="text-sm mb-2">{anchor.content}</p>
                      <div className="text-xs text-muted-foreground">
                        {anchor.timestamp.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* LifeOS Tab */}
        {activeTab === 'lifeos' && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  LifeOS System View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 border rounded">
                    <div className="text-3xl font-bold text-primary">
                      {systemOverview?.healthScore.overall || 0}/100
                    </div>
                    <p className="text-sm text-muted-foreground">Weekly Health Score</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Calculated from productivity, energy, consistency, growth, balance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inferred Habits */}
            <Card>
              <CardHeader>
                <CardTitle>Inferred Habits (No Manual Tracking!)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {habits.slice(0, 5).map((habit) => (
                    <div key={habit.id} className="p-3 border rounded">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{habit.name}</h4>
                        <Badge variant="outline">
                          Impact: {Math.round(habit.impact)}/10
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Frequency: {habit.frequency} times</div>
                        <div>Consistency: {Math.round(habit.consistency * 100)}%</div>
                        {habit.pattern.timeOfDay && (
                          <div>Time: {habit.pattern.timeOfDay}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* MicroCRM Tab */}
        {activeTab === 'microcrm' && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  MicroCRM Relationship Module
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold">{people.length}</div>
                      <p className="text-sm text-muted-foreground">People Tracked</p>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold">{relationshipInsights.activeRelationships}</div>
                      <p className="text-sm text-muted-foreground">Active Relationships</p>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold">{meetings.length}</div>
                      <p className="text-sm text-muted-foreground">Meetings</p>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold">{relationshipInsights.relationshipHealth.score || 0}</div>
                      <p className="text-sm text-muted-foreground">Relationship Health</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* People */}
            <Card>
              <CardHeader>
                <CardTitle>People (Tracked from Work Logs)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {people.slice(0, 5).map((person) => (
                    <div key={person.id} className="p-3 border rounded">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{person.name}</h4>
                        <Badge variant="secondary">{person.type}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Interactions: {person.interactionCount}</div>
                        <div>Context: {person.context}</div>
                        <div>Last contact: {person.lastInteraction.toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

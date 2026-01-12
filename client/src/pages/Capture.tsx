"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkEntryForm, QuickCapture, AdvancedCapture } from '@/components/entries/WorkEntryForm';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Zap, Clock, Briefcase } from 'lucide-react';

export function CapturePage() {
  const [showForm, setShowForm] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recentEntries, setRecentEntries] = useState<any[]>([]);

  const handleSaveEntry = (entry: any) => {
    setRecentEntries(prev => [entry, ...prev.slice(0, 4)]);
    setShowForm(false);
  };

  const handleSaveAdvanced = (entry: any) => {
    setRecentEntries(prev => [entry, ...prev.slice(0, 4)]);
    setShowAdvanced(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Capture Work Memory
          </h1>
          <p className="text-muted-foreground">
            Document your work sessions to build insights and track productivity patterns
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowForm(true)}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold">Standard Capture</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Complete work entry with all details including category, time, and blockers
            </p>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Start Capture
            </Button>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowAdvanced(true)}>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-semibold">Advanced Capture</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Enhanced tracking with energy cost, context notes, and detailed analytics
            </p>
            <Button variant="outline" className="w-full">
              <Zap className="h-4 w-4 mr-2" />
              Advanced Mode
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold">Quick Capture</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Fast entry for when you need to capture work quickly without interruption
            </p>
            <QuickCapture onSave={handleSaveEntry} />
          </Card>
        </div>

        {/* Capture Forms */}
        {showForm && (
          <div className="mb-8">
            <WorkEntryForm
              open={showForm}
              onOpenChange={setShowForm}
              onSuccess={() => handleSaveEntry({})}
            />
          </div>
        )}

        {showAdvanced && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Advanced Work Capture</h2>
              <Button variant="ghost" onClick={() => setShowAdvanced(false)}>
                Cancel
              </Button>
            </div>
            <AdvancedCapture onSave={handleSaveAdvanced} />
          </div>
        )}

        {/* Recent Captures */}
        {recentEntries.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Captures</h2>
            <div className="grid gap-4">
              {recentEntries.map((entry, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{entry.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{entry.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {entry.category}
                        </Badge>
                        {entry.timeSpent && (
                          <Badge variant="outline">
                            {entry.timeSpent}h
                          </Badge>
                        )}
                        {entry.energyCost && (
                          <Badge variant="outline">
                            Energy: {entry.energyCost}/10
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Just now
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Capture Tips */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Capture Best Practices
            </CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Be Specific</h4>
              <p className="text-sm text-muted-foreground">
                Include concrete details about what you accomplished, decisions made, and outcomes achieved.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Track Energy</h4>
              <p className="text-sm text-muted-foreground">
                Energy cost helps identify patterns in your productivity and work-life balance.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Document Blockers</h4>
              <p className="text-sm text-muted-foreground">
                Note challenges and obstacles to identify recurring patterns and solutions.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Stay Consistent</h4>
              <p className="text-sm text-muted-foreground">
                Regular capture creates valuable data for insights and productivity improvements.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

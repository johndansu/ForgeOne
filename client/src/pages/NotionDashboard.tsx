"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFlowLedger } from '@/lib/flowledger';
import { useRecall } from '@/lib/recall';
import { useLifeOS } from '@/lib/lifeos';
import { useMicroCRM } from '@/lib/microcrm';
import { 
  Plus, 
  Search, 
  Target, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';

export function NotionDashboard() {
  const { workLogs, createWorkLog } = useFlowLedger();
  const { memoryAnchors } = useRecall();
  const { systemOverview } = useLifeOS();
  const { people } = useMicroCRM();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');

  const todayLogs = workLogs.filter(log => 
    log.timestamp.toDateString() === new Date().toDateString()
  );

  const recentLogs = workLogs.slice(0, 5);
  const topMemories = memoryAnchors.slice(0, 3);
  const healthScore = systemOverview?.healthScore?.overall || 0;

  const handleQuickAdd = async () => {
    if (quickAddText.trim()) {
      await createWorkLog({
        what: quickAddText,
        why: 'Quick capture',
        time: 15,
        outcome: 'completed' as any,
        category: 'other' as any,
        energyCost: 5,
        source: 'quick_capture' as any,
      });
      setQuickAddText('');
      setShowQuickAdd(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">ForgeOne</h1>
              <p className="text-sm text-gray-500">Your work memory, simplified</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search everything..."
                  className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <Button 
                onClick={() => setShowQuickAdd(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96 p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Add</h3>
            <textarea
              placeholder="What did you work on?"
              value={quickAddText}
              onChange={(e) => setQuickAddText(e.target.value)}
              className="w-full p-3 border rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleQuickAdd} className="flex-1">
                Add
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowQuickAdd(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Today's Overview */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Tasks</span>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{todayLogs.length}</div>
              <div className="text-xs text-gray-500">Completed today</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Energy</span>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{healthScore}</div>
              <div className="text-xs text-gray-500">Health score</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">People</span>
                <Users className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{people.length}</div>
              <div className="text-xs text-gray-500">Connections</div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Memories</span>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{memoryAnchors.length}</div>
              <div className="text-xs text-gray-500">Important moments</div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <Card key={log.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{log.what}</h3>
                        <p className="text-sm text-gray-600 mb-2">{log.why}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <Badge variant="secondary">{log.category}</Badge>
                          <span>{log.time} min</span>
                          <span>{log.timestamp.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        {log.outcome === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Capture */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Capture</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => setShowQuickAdd(true)}
                  >
                    <Target className="h-6 w-6 mb-2" />
                    <span className="text-sm">Task</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => setShowQuickAdd(true)}
                  >
                    <Users className="h-6 w-6 mb-2" />
                    <span className="text-sm">Meeting</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => setShowQuickAdd(true)}
                  >
                    <TrendingUp className="h-6 w-6 mb-2" />
                    <span className="text-sm">Learning</span>
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Important Memories */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Important Memories</h3>
              <div className="space-y-3">
                {topMemories.map((anchor) => (
                  <div key={anchor.id} className="pb-3 border-b last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {anchor.type}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {anchor.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{anchor.content}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* People */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent People</h3>
              <div className="space-y-3">
                {people.slice(0, 3).map((person) => (
                  <div key={person.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-gray-900">{person.name}</div>
                      <div className="text-xs text-gray-500">{person.context}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {person.interactionCount}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Goals Progress */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Active Goals</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">Project Completion</span>
                    <span className="text-gray-500">75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">Learning Goals</span>
                    <span className="text-gray-500">60%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

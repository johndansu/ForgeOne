"use client";

import { useState } from 'react';
import { useFlowLedger } from '@/lib/flowledger';
import { useRecall } from '@/lib/recall';
import { useLifeOS } from '@/lib/lifeos';
import { TextureButton } from '@/components/ui/texture-button';
import { 
  Plus, 
  Search, 
  Target, 
  Users, 
  CheckCircle,
  Star,
  Coffee,
  BookOpen,
  Briefcase,
  Heart
} from 'lucide-react';

export function ModernForgeOne() {
  const { workLogs, createWorkLog } = useFlowLedger();
  const { memoryAnchors } = useRecall();
  const { systemOverview } = useLifeOS();
  const [activeView, setActiveView] = useState('today');
  const [showCapture, setShowCapture] = useState(false);
  const [captureText, setCaptureText] = useState('');

  const todayLogs = workLogs.filter(log => 
    log.timestamp.toDateString() === new Date().toDateString()
  );

  const handleCapture = async () => {
    if (captureText.trim()) {
      await createWorkLog({
        what: captureText,
        why: 'Quick capture',
        time: 15,
        outcome: 'completed' as any,
        category: 'other' as any,
        energyCost: 5,
        source: 'quick_capture' as any,
      });
      setCaptureText('');
      setShowCapture(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'project': return <Briefcase className="h-4 w-4" />;
      case 'study': return <BookOpen className="h-4 w-4" />;
      case 'personal': return <Heart className="h-4 w-4" />;
      case 'client': return <Users className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'project': return 'bg-blue-100 text-blue-700';
      case 'study': return 'bg-green-100 text-green-700';
      case 'personal': return 'bg-pink-100 text-pink-700';
      case 'client': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar - Minimal */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">ForgeOne</h1>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                {['today', 'recent', 'memories'].map((view) => (
                  <button
                    key={view}
                    onClick={() => setActiveView(view)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activeView === view
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {view.charAt(0).toUpperCase() + view.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                />
              </div>
              
              <TextureButton
                onClick={() => setShowCapture(true)}
                variant="accent"
                className="w-auto"
              >
                <Plus className="h-4 w-4" />
                Capture
              </TextureButton>
            </div>
          </div>
        </div>
      </div>

      {/* Capture Modal */}
      {showCapture && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">What did you work on?</h3>
            <textarea
              placeholder="Just type what you accomplished..."
              value={captureText}
              onChange={(e) => setCaptureText(e.target.value)}
              className="w-full p-4 border rounded-xl resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleCapture}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowCapture(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Today's Summary */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Today</h2>
              <p className="text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{todayLogs.length}</div>
                <div className="text-xs text-gray-500">tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {systemOverview?.healthScore?.overall || 0}
                </div>
                <div className="text-xs text-gray-500">energy</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { icon: Coffee, label: 'Coffee' },
              { icon: Briefcase, label: 'Project' },
              { icon: BookOpen, label: 'Learning' },
              { icon: Users, label: 'Meeting' },
            ].map(({ icon: Icon, label }) => (
              <TextureButton
                key={label}
                onClick={() => setShowCapture(true)}
                variant="minimal"
                className="h-20 flex-col"
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm font-medium">{label}</span>
              </TextureButton>
            ))}
          </div>
        </div>

        {/* Content Based on Active View */}
        {activeView === 'today' && (
          <div className="space-y-4">
            {todayLogs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Target className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet today</h3>
                <p className="text-gray-500 mb-6">Start by capturing your first task</p>
                <TextureButton
                  onClick={() => setShowCapture(true)}
                  variant="accent"
                  className="w-auto"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Add Task
                </TextureButton>
              </div>
            ) : (
              todayLogs.map((log) => (
                <div key={log.id} className="bg-white border rounded-xl p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(log.category)}`}>
                          {getCategoryIcon(log.category)}
                          {log.category}
                        </span>
                        {log.outcome === 'completed' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">{log.what}</h3>
                      <p className="text-sm text-gray-600 mb-2">{log.why}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{log.time} min</span>
                        <span>{log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeView === 'recent' && (
          <div className="space-y-4">
            {workLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="bg-white border rounded-xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(log.category)}`}>
                        {getCategoryIcon(log.category)}
                        {log.category}
                      </span>
                      {log.outcome === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{log.what}</h3>
                    <p className="text-sm text-gray-600 mb-2">{log.why}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{log.time} min</span>
                      <span>{log.timestamp.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeView === 'memories' && (
          <div className="space-y-4">
            {memoryAnchors.slice(0, 10).map((anchor) => (
              <div key={anchor.id} className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs font-medium text-blue-700">
                    <Star className="h-3 w-3" />
                    {anchor.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {anchor.timestamp.toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-800">{anchor.content}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(anchor.importance / 2)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">Importance: {anchor.importance}/10</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <TextureButton
          onClick={() => setShowCapture(true)}
          variant="primary"
          className="w-14 h-14 rounded-full p-0"
        >
          <Plus className="h-6 w-6" />
        </TextureButton>
      </div>
    </div>
  );
}

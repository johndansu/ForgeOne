"use client";

import { useState } from 'react';
import { Plus, Search, Calendar, FileText, Users, X, Target, Star, Heart } from 'lucide-react';
import { TextureButton } from '@/components/ui/texture-button';
import { NotionEditor } from '@/components/notion-editor';
import { NotionKanban } from '@/components/notion-kanban';
import { EmptyState } from '@/components/ui/empty-state';
import { Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlowLedger } from '@/lib/flowledger';
import { useRecall } from '@/lib/recall';

interface SmartContentProps {
  activeView: string;
  className?: string;
}

export function SmartContent({ activeView, className }: SmartContentProps) {
  const { workLogs, createWorkLog } = useFlowLedger();
  const { memoryAnchors } = useRecall();
  
  // State for different features
  const [showCapture, setShowCapture] = useState(false);
  const [captureText, setCaptureText] = useState('');
  const [editorBlocks, setEditorBlocks] = useState<any[]>([
    { id: '1', type: 'heading1', content: 'Welcome to ForgeOne' },
    { id: '2', type: 'text', content: 'Start capturing your work to build your personal productivity system.' },
    { id: '3', type: 'bullet', content: 'Type "/" for commands to add different block types' },
  ]);
  const [kanbanTasks, setKanbanTasks] = useState<any[]>([
    { id: '1', title: 'Review project documentation', status: 'todo', priority: 'medium' },
    { id: '2', title: 'Implement new feature', status: 'in-progress', priority: 'high' },
    { id: '3', title: 'Write tests', status: 'todo', priority: 'low' },
    { id: '4', title: 'Deploy to production', status: 'done', priority: 'high' },
  ]);

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
      case 'project': return <FileText className="h-4 w-4" />;
      case 'study': return <FileText className="h-4 w-4" />;
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

  // Floating Action Bar
  const renderActionBar = () => (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border rounded-full shadow-lg p-1 flex items-center gap-1 z-40">
      <button
        onClick={() => setShowCapture(true)}
        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        title="Quick Capture"
      >
        <Plus className="h-4 w-4" />
      </button>
      
      <button
        className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
        title="Search"
      >
        <Search className="h-4 w-4" />
      </button>
      
      <button
        className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
        title="Files"
      >
        <FileText className="h-4 w-4" />
      </button>
      
      <button
        className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
        title="Calendar"
      >
        <Calendar className="h-4 w-4" />
      </button>
    </div>
  );

  // Render different views
  const renderContent = () => {
    switch (activeView) {
      case 'today':
        return (
          <div className="space-y-6">
            {/* Today's Summary */}
            <div className="bg-white border rounded-xl p-6">
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
                    <div className="text-2xl font-bold text-gray-900">85</div>
                    <div className="text-xs text-gray-500">energy</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-4 gap-3">
                {['Coffee', 'Project', 'Learning', 'Meeting'].map((action) => (
                  <button
                    key={action}
                    onClick={() => setShowCapture(true)}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center"
                  >
                    <div className="text-2xl mb-2">☕</div>
                    <div className="text-sm font-medium text-gray-700">{action}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Today's Tasks */}
            <div className="space-y-4">
              {todayLogs.length === 0 ? (
                <EmptyState
                  title="Start Your Productivity Journey"
                  description="Capture your first task to begin building your work memory. Every task contributes to your personal productivity insights."
                  icons={[Target, Sparkles, TrendingUp]}
                  action={{
                    label: "Add Your First Task",
                    onClick: () => setShowCapture(true)
                  }}
                />
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
          </div>
        );

      case 'recent':
        return (
          <div className="space-y-4">
            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Recent Activity</h2>
              <p className="text-gray-500">Your latest work and memories</p>
            </div>
            
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
          </div>
        );

      case 'memories':
        return (
          <div className="space-y-4">
            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Memory Anchors</h2>
              <p className="text-gray-500">Important decisions and insights</p>
            </div>
            
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
          </div>
        );

      case 'notes':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border rounded-xl p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notion-like Notes</h3>
                <p className="text-sm text-gray-600">Type "/" to see commands, or just start typing.</p>
              </div>
              <NotionEditor blocks={editorBlocks} onChange={setEditorBlocks} />
            </div>
          </div>
        );

      case 'kanban':
        return (
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Kanban Board</h3>
              <p className="text-sm text-gray-600">Drag tasks between columns to update their status.</p>
            </div>
            <NotionKanban tasks={kanbanTasks} onTasksChange={setKanbanTasks} />
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">View not found</h3>
              <p className="text-gray-500">Select a view from the sidebar</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={cn("flex-1 bg-gray-50 overflow-auto", className)}>
      {/* Main Content */}
      <div className="p-6">
        {renderContent()}
      </div>

      {/* Action Bar */}
      {renderActionBar()}

      {/* Modals */}
      {showCapture && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Quick Capture</h3>
              <button
                onClick={() => setShowCapture(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <textarea
              placeholder="What did you work on?"
              value={captureText}
              onChange={(e) => setCaptureText(e.target.value)}
              className="w-full p-4 border rounded-xl resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <TextureButton
                onClick={handleCapture}
                variant="accent"
                className="flex-1"
              >
                Save
              </TextureButton>
              <TextureButton
                onClick={() => setShowCapture(false)}
                variant="minimal"
                className="flex-1"
              >
                Cancel
              </TextureButton>
            </div>
          </div>
        </div>
      )}

      {/* Other modals would go here - search, files, calendar */}
    </div>
  );
}

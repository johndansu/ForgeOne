"use client";

import { useState } from 'react';
import { useFlowLedger } from '@/lib/flowledger';
import { useRecall } from '@/lib/recall';
import { useLifeOS } from '@/lib/lifeos';
import { TextureButton } from '@/components/ui/texture-button';
import { EmptyState } from '@/components/ui/empty-state';
import { NotionEditor } from '@/components/notion-editor';
import { NotionKanban } from '@/components/notion-kanban';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { UniversalSearch } from '@/components/universal-search';
import { FileAttachments } from '@/components/file-attachments';
import { MobileApp } from '@/components/mobile-app';
import { CalendarIntegration } from '@/components/calendar-integration';
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
  Heart,
  Sparkles,
  TrendingUp,
  Calendar
} from 'lucide-react';

export function ModernForgeOne() {
  const { workLogs, createWorkLog } = useFlowLedger();
  const { memoryAnchors } = useRecall();
  const { systemOverview } = useLifeOS();
  const [activeView, setActiveView] = useState('today');
  const [showCapture, setShowCapture] = useState(false);
  const [captureText, setCaptureText] = useState('');
  
  // Notion-like features state
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

  // New features state
  const [attachments, setAttachments] = useState<any[]>([]);

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
                {['today', 'recent', 'memories', 'notes', 'kanban', 'table', 'search', 'files', 'mobile', 'calendar'].map((view) => (
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
            {workLogs.length === 0 ? (
              <EmptyState
                title="No Work History Yet"
                description="Your recent activities will appear here once you start capturing tasks. Build your work history one task at a time."
                icons={[Calendar, Briefcase, Target]}
                action={{
                  label: "Capture Your First Task",
                  onClick: () => setShowCapture(true)
                }}
              />
            ) : (
              workLogs.slice(0, 10).map((log) => (
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
            ))
            )}
          </div>
        )}

        {activeView === 'memories' && (
          <div className="space-y-4">
            {memoryAnchors.length === 0 ? (
              <EmptyState
                title="No Memory Anchors Yet"
                description="Important decisions, insights, and milestones will automatically appear here as you capture your work. Your personal memory timeline builds over time."
                icons={[Star, Sparkles, Heart]}
                action={{
                  label: "Start Building Memories",
                  onClick: () => setShowCapture(true)
                }}
              />
            ) : (
              memoryAnchors.slice(0, 10).map((anchor) => (
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
              ))
            )}
          </div>
        )}

        {activeView === 'notes' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border rounded-lg shadow-sm p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Notion-like Notes</h3>
                <p className="text-sm text-gray-600">Type "/" to see commands, or just start typing. Drag blocks to reorder.</p>
              </div>
              <NotionEditor blocks={editorBlocks} onChange={setEditorBlocks} />
            </div>
          </div>
        )}

        {activeView === 'kanban' && (
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Kanban Board</h3>
              <p className="text-sm text-gray-600">Drag tasks between columns to update their status.</p>
            </div>
            <NotionKanban tasks={kanbanTasks} onTasksChange={setKanbanTasks} />
          </div>
        )}

        {activeView === 'table' && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Table</h3>
              <p className="text-sm text-gray-600">Interactive table with your work data.</p>
            </div>
            <div className="bg-white border rounded-lg shadow-sm">
              <Table>
                <thead>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </thead>
                <TableBody>
                  {workLogs.slice(0, 10).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.what}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(log.category)}`}>
                          {getCategoryIcon(log.category)}
                          {log.category}
                        </span>
                      </TableCell>
                      <TableCell>{log.time} min</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                          log.outcome === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {log.outcome}
                        </span>
                      </TableCell>
                      <TableCell>{log.timestamp.toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {activeView === 'search' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Universal Search</h3>
              <p className="text-sm text-gray-600">Search across all your content - work logs, memories, people, and more.</p>
            </div>
            <div className="bg-white border rounded-lg shadow-sm p-6">
              <UniversalSearch
                placeholder="Search everything..."
                onResultClick={(result) => {
                  console.log('Search result clicked:', result);
                }}
              />
            </div>
          </div>
        )}

        {activeView === 'files' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">File Attachments</h3>
              <p className="text-sm text-gray-600">Upload and manage files related to your work.</p>
            </div>
            <div className="bg-white border rounded-lg shadow-sm p-6">
              <FileAttachments
                attachments={attachments}
                onAdd={(files) => {
                  const newAttachments = files.map(file => ({
                    id: Date.now().toString() + Math.random(),
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: URL.createObjectURL(file),
                    uploadedAt: new Date()
                  }));
                  setAttachments([...attachments, ...newAttachments]);
                }}
                onRemove={(id) => {
                  setAttachments(attachments.filter(att => att.id !== id));
                }}
              />
            </div>
          </div>
        )}

        {activeView === 'mobile' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile Experience</h3>
              <p className="text-sm text-gray-600">Install ForgeOne on your mobile device for capture on the go.</p>
            </div>
            <MobileApp
              onInstall={() => {
                console.log('Mobile app installed');
              }}
            />
          </div>
        )}

        {activeView === 'calendar' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar Integration</h3>
              <p className="text-sm text-gray-600">Connect your calendar to sync meetings and tasks.</p>
            </div>
            <CalendarIntegration
              onSync={(events) => {
                console.log('Calendar events synced:', events);
              }}
            />
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

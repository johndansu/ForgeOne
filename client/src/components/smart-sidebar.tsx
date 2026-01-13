"use client";

import { useState } from 'react';
import { Search, Plus, Calendar, FileText, Users, Settings, Bell, X } from 'lucide-react';
import { UniversalSearch } from '@/components/universal-search';
import { FileAttachments } from '@/components/file-attachments';
import { MobileApp } from '@/components/mobile-app';
import { CalendarIntegration } from '@/components/calendar-integration';
import { cn } from '@/lib/utils';

interface SmartSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  className?: string;
}

export function SmartSidebar({ activeView, onViewChange, className }: SmartSidebarProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const mainViews = [
    { id: 'today', label: 'Today', icon: <FileText className="h-4 w-4" /> },
    { id: 'recent', label: 'Recent', icon: <Calendar className="h-4 w-4" /> },
    { id: 'memories', label: 'Memories', icon: <Users className="h-4 w-4" /> },
    { id: 'notes', label: 'Notes', icon: <FileText className="h-4 w-4" /> },
    { id: 'kanban', label: 'Kanban', icon: <FileText className="h-4 w-4" /> },
  ];

  const tools = [
    { id: 'search', label: 'Search', icon: <Search className="h-4 w-4" />, action: () => setShowSearch(true) },
    { id: 'files', label: 'Files', icon: <FileText className="h-4 w-4" />, action: () => setShowFiles(true) },
    { id: 'mobile', label: 'Mobile', icon: <FileText className="h-4 w-4" />, action: () => setShowMobile(true) },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="h-4 w-4" />, action: () => setShowCalendar(true) },
  ];

  return (
    <div className={cn("w-64 bg-white border-r h-full flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-gray-900">ForgeOne</h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Settings className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        
        {/* Quick Search */}
        <div className="relative">
          <button
            onClick={() => setShowSearch(true)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Search everything...</span>
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 p-4">
        <div className="space-y-6">
          {/* Main Views */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Main</h3>
            <div className="space-y-1">
              {mainViews.map((view) => (
                <button
                  key={view.id}
                  onClick={() => onViewChange(view.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    activeView === view.id
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {view.icon}
                  <span>{view.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tools</h3>
            <div className="space-y-1">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={tool.action}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  {tool.icon}
                  <span>{tool.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          <button className="p-1 hover:bg-gray-100 rounded">
            <Bell className="h-4 w-4 text-gray-600" />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded">
            <Plus className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Overlays */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Universal Search</h3>
              <button
                onClick={() => setShowSearch(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div className="p-4">
              <UniversalSearch
                placeholder="Search everything..."
                onResultClick={(result) => {
                  console.log('Search result clicked:', result);
                  setShowSearch(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showFiles && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">File Attachments</h3>
              <button
                onClick={() => setShowFiles(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div className="p-4">
              <FileAttachments
                attachments={[]}
                onAdd={(files) => console.log('Files added:', files)}
                onRemove={(id) => console.log('File removed:', id)}
              />
            </div>
          </div>
        </div>
      )}

      {showMobile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Mobile Experience</h3>
              <button
                onClick={() => setShowMobile(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div className="p-4">
              <MobileApp
                onInstall={() => {
                  console.log('Mobile app installed');
                  setShowMobile(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showCalendar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Calendar Integration</h3>
              <button
                onClick={() => setShowCalendar(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div className="p-4">
              <CalendarIntegration
                onSync={(events) => {
                  console.log('Calendar events synced:', events);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Preferences</h4>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-600">Enable notifications</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-600">Dark mode</span>
                </label>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Account</h4>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                  Profile Settings
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded">
                  Privacy Settings
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { Calendar, Clock, Link2, Check, X, RefreshCw, AlertCircle, Users, CheckCircle, Bell } from 'lucide-react';
import { TextureButton } from '@/components/ui/texture-button';
import { cn } from '@/lib/utils';
import { useFlowLedger } from '@/lib/flowledger';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  source: 'google' | 'outlook' | 'forgeone';
  type: 'meeting' | 'task' | 'reminder';
  synced: boolean;
}

interface CalendarIntegrationProps {
  onSync?: (events: CalendarEvent[]) => void;
  className?: string;
}

export function CalendarIntegration({ onSync, className }: CalendarIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'google' | 'outlook'>('google');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const { workLogs } = useFlowLedger();

  // Check if calendar is already connected
  useEffect(() => {
    checkCalendarConnection();
  }, []);

  const checkCalendarConnection = () => {
    // Check for stored calendar tokens
    const googleToken = localStorage.getItem('google_calendar_token');
    const outlookToken = localStorage.getItem('outlook_calendar_token');
    
    setIsConnected(!!(googleToken || outlookToken));
    if (googleToken) setSelectedProvider('google');
    else if (outlookToken) setSelectedProvider('outlook');
  };

  const connectGoogleCalendar = async () => {
    try {
      // In a real app, this would open Google OAuth flow
      console.log('Connecting to Google Calendar...');
      
      // Mock connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('google_calendar_token', 'mock_token');
      setIsConnected(true);
      setSelectedProvider('google');
      setSyncError(null);
      
      // Load calendar events
      await loadCalendarEvents('google');
    } catch (error) {
      setSyncError('Failed to connect to Google Calendar');
    }
  };

  const connectOutlookCalendar = async () => {
    try {
      // In a real app, this would open Microsoft OAuth flow
      console.log('Connecting to Outlook Calendar...');
      
      // Mock connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('outlook_calendar_token', 'mock_token');
      setIsConnected(true);
      setSelectedProvider('outlook');
      setSyncError(null);
      
      // Load calendar events
      await loadCalendarEvents('outlook');
    } catch (error) {
      setSyncError('Failed to connect to Outlook Calendar');
    }
  };

  const disconnectCalendar = () => {
    localStorage.removeItem('google_calendar_token');
    localStorage.removeItem('outlook_calendar_token');
    setIsConnected(false);
    setEvents([]);
  };

  const loadCalendarEvents = async (provider: 'google' | 'outlook') => {
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      // Mock API call to fetch calendar events
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock events
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Team Standup',
          description: 'Daily team sync meeting',
          start: new Date(Date.now() + 3600000), // 1 hour from now
          end: new Date(Date.now() + 5400000), // 1.5 hours from now
          source: provider,
          type: 'meeting',
          synced: true
        },
        {
          id: '2',
          title: 'Project Review',
          description: 'Review project progress with stakeholders',
          start: new Date(Date.now() + 86400000), // Tomorrow
          end: new Date(Date.now() + 90000000), // Tomorrow + 1 hour
          source: provider,
          type: 'meeting',
          synced: true
        },
        {
          id: '3',
          title: 'Code Review',
          description: 'Review pull requests',
          start: new Date(Date.now() + 172800000), // Day after tomorrow
          end: new Date(Date.now() + 180000000), // Day after tomorrow + 2 hours
          source: provider,
          type: 'task',
          synced: true
        }
      ];
      
      setEvents(mockEvents);
      onSync?.(mockEvents);
    } catch (error) {
      setSyncError('Failed to load calendar events');
    } finally {
      setIsSyncing(false);
    }
  };

  const syncWorkLogsToCalendar = async () => {
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      // Convert work logs to calendar events
      const calendarEvents: CalendarEvent[] = workLogs.slice(0, 5).map(log => ({
        id: `forgeone_${log.id}`,
        title: log.what,
        description: log.why,
        start: log.timestamp,
        end: new Date(log.timestamp.getTime() + (log.time * 60000)),
        source: 'forgeone' as const,
        type: 'task' as const,
        synced: true
      }));
      
      // Mock API call to sync to calendar
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update events list
      setEvents(prev => [...prev, ...calendarEvents]);
      onSync?.([...events, ...calendarEvents]);
    } catch (error) {
      setSyncError('Failed to sync work logs to calendar');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatEventTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'task': return <CheckCircle className="h-4 w-4" />;
      case 'reminder': return <Bell className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-700';
      case 'task': return 'bg-green-100 text-green-700';
      case 'reminder': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Connection Status */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Calendar Integration</h3>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Check className="h-4 w-4" />
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <AlertCircle className="h-4 w-4" />
                Not Connected
              </span>
            )}
          </div>
        </div>

        {!isConnected ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Connect your calendar to sync meetings and tasks with ForgeOne
            </p>
            <div className="flex gap-2">
              <TextureButton
                onClick={connectGoogleCalendar}
                variant="accent"
                className="flex-1"
              >
                <Calendar className="h-4 w-4" />
                Connect Google
              </TextureButton>
              <TextureButton
                onClick={connectOutlookCalendar}
                variant="secondary"
                className="flex-1"
              >
                <Calendar className="h-4 w-4" />
                Connect Outlook
              </TextureButton>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Provider Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedProvider === 'google' ? 'Google Calendar' : 'Outlook Calendar'}
                  </p>
                  <p className="text-xs text-gray-500">Connected</p>
                </div>
              </div>
              <TextureButton
                onClick={disconnectCalendar}
                variant="minimal"
              >
                <X className="h-4 w-4" />
              </TextureButton>
            </div>

            {/* Sync Actions */}
            <div className="flex gap-2">
              <TextureButton
                onClick={() => loadCalendarEvents(selectedProvider)}
                variant="minimal"
                disabled={isSyncing}
                className="flex-1"
              >
                <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                {isSyncing ? 'Syncing...' : 'Refresh'}
              </TextureButton>
              <TextureButton
                onClick={syncWorkLogsToCalendar}
                variant="minimal"
                disabled={isSyncing}
                className="flex-1"
              >
                <Link2 className="h-4 w-4" />
                Sync Work Logs
              </TextureButton>
            </div>

            {/* Error Message */}
            {syncError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{syncError}</p>
              </div>
            )}

            {/* Events List */}
            {events.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Upcoming Events</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className={cn("p-1 rounded", getEventColor(event.type))}>
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        <p className="text-xs text-gray-600">{event.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatEventTime(event.start)}</span>
                          <span className="text-gray-400">•</span>
                          <span className={cn(
                            "px-1 py-0.5 rounded text-xs",
                            event.source === 'forgeone' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          )}>
                            {event.source === 'forgeone' ? 'ForgeOne' : event.source}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from 'react';
import { Smartphone, Download, Share2, Bell, Settings, Home, Search, Plus, User } from 'lucide-react';
import { TextureButton } from '@/components/ui/texture-button';
import { cn } from '@/lib/utils';

interface MobileAppProps {
  onInstall?: () => void;
  className?: string;
}

export function MobileApp({ onInstall, className }: MobileAppProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [supportsPWA, setSupportsPWA] = useState(false);

  useEffect(() => {
    // Check if PWA is supported
    setSupportsPWA('serviceWorker' in navigator && 'PushManager' in window);

    // Check if app is already installed
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
      onInstall?.();
    }
    
    setDeferredPrompt(null);
  };

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ForgeOne - Personal Productivity System',
          text: 'Track your work, build habits, and gain insights with ForgeOne',
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Subscribe to push notifications
        console.log('Notification permission granted');
      }
    }
  };

  if (!supportsPWA) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Install Prompt */}
      {deferredPrompt && !isInstalled && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">Install ForgeOne</h3>
                <p className="text-xs text-blue-700">Get the full experience on your device</p>
              </div>
            </div>
            <TextureButton
              onClick={handleInstall}
              variant="accent"
              className="w-auto"
            >
              <Download className="h-4 w-4" />
              Install
            </TextureButton>
          </div>
        </div>
      )}

      {/* Mobile Features */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mobile Experience</h3>
        
        <div className="space-y-4">
          {/* Quick Actions */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <TextureButton variant="minimal" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </TextureButton>
              <TextureButton variant="minimal" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search
              </TextureButton>
              <TextureButton variant="minimal" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Capture
              </TextureButton>
              <TextureButton variant="minimal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TextureButton>
            </div>
          </div>

          {/* Mobile Settings */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Mobile Settings</h4>
            <div className="space-y-2">
              <TextureButton
                onClick={requestNotificationPermission}
                variant="minimal"
                className="w-full justify-start"
              >
                <Bell className="h-4 w-4" />
                Enable Notifications
              </TextureButton>
              <TextureButton
                onClick={shareApp}
                variant="minimal"
                className="w-full justify-start"
              >
                <Share2 className="h-4 w-4" />
                Share App
              </TextureButton>
              <TextureButton
                variant="minimal"
                className="w-full justify-start"
              >
                <Settings className="h-4 w-4" />
                Settings
              </TextureButton>
            </div>
          </div>

          {/* App Info */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Version 1.0.0</span>
              <span>{isInstalled ? 'Installed' : 'Web App'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Preview */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Mobile Preview</h3>
        <div className="bg-white border-2 border-gray-300 rounded-2xl w-64 h-96 mx-auto relative overflow-hidden">
          {/* Status Bar */}
          <div className="bg-gray-900 text-white text-xs p-1 flex justify-between">
            <span>9:41 AM</span>
            <span>100%</span>
          </div>
          
          {/* App Header */}
          <div className="bg-blue-600 text-white p-3">
            <h4 className="text-sm font-bold">ForgeOne</h4>
          </div>
          
          {/* App Content */}
          <div className="p-3 space-y-2">
            <div className="bg-gray-100 rounded p-2">
              <div className="h-2 bg-gray-300 rounded w-3/4 mb-1"></div>
              <div className="h-1 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="bg-gray-100 rounded p-2">
              <div className="h-2 bg-gray-300 rounded w-2/3 mb-1"></div>
              <div className="h-1 bg-gray-300 rounded w-1/3"></div>
            </div>
            <div className="bg-gray-100 rounded p-2">
              <div className="h-2 bg-gray-300 rounded w-4/5 mb-1"></div>
              <div className="h-1 bg-gray-300 rounded w-2/5"></div>
            </div>
          </div>
          
          {/* Floating Action Button */}
          <div className="absolute bottom-4 right-4">
            <div className="bg-blue-600 text-white rounded-full p-2">
              <Plus className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

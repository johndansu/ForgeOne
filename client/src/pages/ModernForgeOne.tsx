"use client";

import { useState } from 'react';
import { SmartSidebar } from '@/components/smart-sidebar';
import { SmartContent } from '@/components/smart-content';

export function ModernForgeOne() {
  const [activeView, setActiveView] = useState('today');

  return (
    <div className="flex h-screen bg-white">
      {/* Smart Sidebar */}
      <SmartSidebar 
        activeView={activeView}
        onViewChange={setActiveView}
      />
      
      {/* Smart Content Area */}
      <SmartContent 
        activeView={activeView}
      />
    </div>
  );
}

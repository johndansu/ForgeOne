"use client";

import { useState, useEffect } from 'react';
import { WorkLog, MemoryAnchor, AnchorType, FlowLedgerResponse } from '@/types/forgeone';
import { useFlowLedger } from '@/lib/flowledger';

// Recall Memory Layer
// Built on top of FlowLedger - Git history for your life
export class Recall {
  private static instance: Recall;
  private memoryAnchors: MemoryAnchor[] = [];
  private listeners: ((anchors: MemoryAnchor[]) => void)[] = [];

  private constructor() {
    this.initializeFromStorage();
  }

  static getInstance(): Recall {
    if (!Recall.instance) {
      Recall.instance = new Recall();
    }
    return Recall.instance;
  }

  // Memory anchor creation
  async createMemoryAnchor(workLog: WorkLog): Promise<FlowLedgerResponse<MemoryAnchor[]>> {
    try {
      const anchors: MemoryAnchor[] = [];

      // Extract decisions
      if (workLog.decisions) {
        workLog.decisions.forEach(decision => {
          anchors.push(this.createAnchor(workLog, AnchorType.DECISION, decision));
        });
      }

      // Extract insights
      if (workLog.insights) {
        workLog.insights.forEach(insight => {
          anchors.push(this.createAnchor(workLog, AnchorType.INSIGHT, insight));
        });
      }

      // Extract milestones (based on outcomes)
      if (workLog.outcome === 'completed' || workLog.outcome === 'advanced') {
        anchors.push(this.createAnchor(workLog, AnchorType.MILESTONE, `Achieved ${workLog.outcome}: ${workLog.what}`));
      }

      // Extract relationship moments
      if (workLog.people && workLog.people.length > 0) {
        anchors.push(this.createAnchor(workLog, AnchorType.RELATIONSHIP, `Interaction with ${workLog.people.join(', ')}`));
      }

      // Extract learning moments
      if (workLog.category === 'study' || workLog.why.includes('learn')) {
        anchors.push(this.createAnchor(workLog, AnchorType.LEARNING, workLog.what));
      }

      // Extract challenges
      if (workLog.blockers && workLog.blockers.length > 0) {
        anchors.push(this.createAnchor(workLog, AnchorType.CHALLENGE, `Blocked by: ${workLog.blockers.join(', ')}`));
      }

      // Extract solutions
      if (workLog.outcome === 'completed' && workLog.blockers && workLog.blockers.length > 0) {
        anchors.push(this.createAnchor(workLog, AnchorType.SOLUTION, `Overcame: ${workLog.blockers.join(', ')}`));
      }

      this.memoryAnchors.push(...anchors);
      await this.saveToStorage();
      this.notifyListeners();

      return {
        success: true,
        data: anchors,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: 'Failed to create memory anchors',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  private createAnchor(workLog: WorkLog, type: AnchorType, content: string): MemoryAnchor {
    return {
      id: this.generateId(),
      workLogId: workLog.id,
      type,
      content,
      timestamp: workLog.timestamp,
      importance: this.calculateImportance(workLog, type),
      connections: this.findRelatedAnchors(workLog.id),
    };
  }

  private calculateImportance(workLog: WorkLog, type: AnchorType): number {
    let importance = 5; // Base importance

    // Type-based importance
    const typeImportance = {
      [AnchorType.DECISION]: 8,
      [AnchorType.INSIGHT]: 7,
      [AnchorType.MILESTONE]: 9,
      [AnchorType.RELATIONSHIP]: 6,
      [AnchorType.LEARNING]: 6,
      [AnchorType.CHALLENGE]: 5,
      [AnchorType.SOLUTION]: 8,
    };

    importance = typeImportance[type];

    // Context-based adjustments
    if (workLog.energyCost > 7) importance += 1;
    if (workLog.time > 120) importance += 1; // More than 2 hours
    if (workLog.people && workLog.people.length > 1) importance += 1;
    if (workLog.outcome === 'completed') importance += 1;
    if (workLog.outcome === 'stuck') importance -= 1;

    return Math.min(Math.max(importance, 1), 10);
  }

  private findRelatedAnchors(workLogId: string): string[] {
    return this.memoryAnchors
      .filter(anchor => 
        anchor.workLogId !== workLogId &&
        this.areAnchorsRelated(anchor.workLogId, workLogId)
      )
      .map(anchor => anchor.id)
      .slice(0, 5);
  }

  private areAnchorsRelated(anchor1Id: string, anchor2Id: string): boolean {
    const anchor1 = this.memoryAnchors.find(a => a.workLogId === anchor1Id);
    const anchor2 = this.memoryAnchors.find(a => a.workLogId === anchor2Id);
    
    if (!anchor1 || !anchor2) return false;

    // Same type within 7 days
    const timeDiff = Math.abs(anchor1.timestamp.getTime() - anchor2.timestamp.getTime());
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

    return anchor1.type === anchor2.type && daysDiff <= 7;
  }

  // Memory retrieval methods
  getMemoryAnchors(query?: {
    type?: AnchorType;
    startDate?: Date;
    endDate?: Date;
    minImportance?: number;
    workLogId?: string;
  }): MemoryAnchor[] {
    let filteredAnchors = [...this.memoryAnchors];

    if (query) {
      if (query.type) {
        filteredAnchors = filteredAnchors.filter(anchor => anchor.type === query.type);
      }
      if (query.startDate) {
        filteredAnchors = filteredAnchors.filter(anchor => anchor.timestamp >= query.startDate!);
      }
      if (query.endDate) {
        filteredAnchors = filteredAnchors.filter(anchor => anchor.timestamp <= query.endDate!);
      }
      if (query.minImportance) {
        filteredAnchors = filteredAnchors.filter(anchor => anchor.importance >= query.minImportance!);
      }
      if (query.workLogId) {
        filteredAnchors = filteredAnchors.filter(anchor => anchor.workLogId === query.workLogId);
      }
    }

    return filteredAnchors.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Timeline methods
  getTimeline(workLogs: WorkLog[]): MemoryTimeline {
    const events = workLogs.map(log => ({
      workLog: log,
      anchors: this.memoryAnchors.filter(anchor => anchor.workLogId === log.id),
      significance: this.calculateSignificance(log),
    }));

    return {
      events,
      totalEvents: events.length,
      timeSpan: this.calculateTimeSpan(workLogs),
      keyMoments: events.filter(event => event.significance >= 8),
    };
  }

  private calculateSignificance(workLog: WorkLog): number {
    let significance = 5;

    // Base on outcomes
    if (workLog.outcome === 'completed') significance += 3;
    if (workLog.outcome === 'advanced') significance += 2;
    if (workLog.outcome === 'stuck') significance += 1;

    // Base on impact
    if (workLog.energyCost > 7) significance += 2;
    if (workLog.time > 180) significance += 1; // More than 3 hours
    if (workLog.people && workLog.people.length > 0) significance += 1;

    return Math.min(significance, 10);
  }

  private calculateTimeSpan(workLogs: WorkLog[]): string {
    if (workLogs.length === 0) return '0 days';
    
    const dates = workLogs.map((log: WorkLog) => log.timestamp);
    const minDate = new Date(Math.min(...dates.map((d: Date) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d: Date) => d.getTime())));
    
    const daysDiff = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return '1 day';
    if (daysDiff === 1) return '2 days';
    if (daysDiff < 7) return `${daysDiff + 1} days`;
    if (daysDiff < 30) return `${Math.ceil(daysDiff / 7)} weeks`;
    return `${Math.ceil(daysDiff / 30)} months`;
  }

  // Decision replay methods
  getDecisions(_query?: {
    category?: string;
    outcome?: string;
    timeRange?: 'week' | 'month' | 'quarter' | 'year';
  }): DecisionReplay {
    const decisionAnchors = this.memoryAnchors.filter(anchor => anchor.type === AnchorType.DECISION);
    
    const filtered = decisionAnchors.filter((_anchor) => {
      // Apply filters here based on query
      return true; // Simplified for now
    });

    return {
      decisions: filtered.map(anchor => ({
        anchor,
        context: this.getDecisionContext(anchor.workLogId),
        outcomes: this.getDecisionOutcomes(anchor.workLogId),
        impact: this.calculateDecisionImpact(anchor),
      })),
      totalDecisions: filtered.length,
      patterns: this.identifyDecisionPatterns(filtered),
    };
  }

  private getDecisionContext(_workLogId: string): string {
    // Return the context around the decision
    return 'Decision context would be extracted from related work logs';
  }

  private getDecisionOutcomes(_workLogId: string): string[] {
    // Return the outcomes of the decision
    return ['Outcome 1', 'Outcome 2'];
  }

  private calculateDecisionImpact(anchor: MemoryAnchor): number {
    return anchor.importance;
  }

  private identifyDecisionPatterns(_decisions: MemoryAnchor[]): string[] {
    // Identify patterns in decision making
    return ['Pattern 1', 'Pattern 2'];
  }

  // Search methods
  searchMemories(query: string): MemorySearchResult {
    const searchTerms = query.toLowerCase().split(' ');
    
    const matchingAnchors = this.memoryAnchors.filter(anchor => 
      searchTerms.some(term => 
        anchor.content.toLowerCase().includes(term)
      )
    );

    return {
      query,
      results: matchingAnchors,
      totalResults: matchingAnchors.length,
      categories: this.categorizeResults(matchingAnchors),
    };
  }

  private categorizeResults(anchors: MemoryAnchor[]): Record<string, number> {
    return anchors.reduce((acc, anchor) => {
      acc[anchor.type] = (acc[anchor.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // Event system
  subscribe(listener: (anchors: MemoryAnchor[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.memoryAnchors]));
  }

  // Storage methods
  private async saveToStorage() {
    try {
      localStorage.setItem('recall_memory_anchors', JSON.stringify(this.memoryAnchors));
    } catch (error) {
      console.error('Failed to save memory anchors:', error);
    }
  }

  private initializeFromStorage() {
    try {
      const stored = localStorage.getItem('recall_memory_anchors');
      if (stored) {
        this.memoryAnchors = JSON.parse(stored).map((anchor: any) => ({
          ...anchor,
          timestamp: new Date(anchor.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to initialize memory anchors:', error);
      this.memoryAnchors = [];
    }
  }

  private generateId(): string {
    return `anchor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Types for the Recall module
export interface MemoryTimeline {
  events: TimelineEvent[];
  totalEvents: number;
  timeSpan: string;
  keyMoments: TimelineEvent[];
}

export interface TimelineEvent {
  workLog: WorkLog;
  anchors: MemoryAnchor[];
  significance: number;
}

export interface DecisionReplay {
  decisions: Decision[];
  totalDecisions: number;
  patterns: string[];
}

export interface Decision {
  anchor: MemoryAnchor;
  context: string;
  outcomes: string[];
  impact: number;
}

export interface MemorySearchResult {
  query: string;
  results: MemoryAnchor[];
  totalResults: number;
  categories: Record<string, number>;
}

// React Hook for Recall
export function useRecall() {
  const [recall] = useState(() => Recall.getInstance());
  const [memoryAnchors, setMemoryAnchors] = useState<MemoryAnchor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { workLogs } = useFlowLedger();

  useEffect(() => {
    const unsubscribe = recall.subscribe(setMemoryAnchors);
    setMemoryAnchors(recall.getMemoryAnchors());
    setIsLoading(false);
    
    return unsubscribe;
  }, [recall]);

  useEffect(() => {
    // Auto-create memory anchors when work logs are updated
    workLogs.forEach(workLog => {
      const existingAnchors = memoryAnchors.filter(anchor => anchor.workLogId === workLog.id);
      if (existingAnchors.length === 0) {
        recall.createMemoryAnchor(workLog);
      }
    });
  }, [workLogs, recall, memoryAnchors]);

  return {
    memoryAnchors,
    isLoading,
    createMemoryAnchor: recall.createMemoryAnchor.bind(recall),
    getMemoryAnchors: recall.getMemoryAnchors.bind(recall),
    getTimeline: recall.getTimeline.bind(recall),
    getDecisions: recall.getDecisions.bind(recall),
    searchMemories: recall.searchMemories.bind(recall),
  };
}

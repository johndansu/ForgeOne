"use client";

import { useState, useEffect } from 'react';
import { WorkLog, WorkLogQuery, FlowLedgerResponse, WorkCategory, WorkOutcome } from '@/types/forgeone';

// FlowLedger Core Engine
// This is the heart of the system - everything feeds from here
export class FlowLedger {
  private static instance: FlowLedger;
  private workLogs: WorkLog[] = [];
  private listeners: ((logs: WorkLog[]) => void)[] = [];

  private constructor() {
    this.initializeFromStorage();
  }

  static getInstance(): FlowLedger {
    if (!FlowLedger.instance) {
      FlowLedger.instance = new FlowLedger();
    }
    return FlowLedger.instance;
  }

  // Core logging methods
  async createWorkLog(logData: Omit<WorkLog, 'id' | 'timestamp'>): Promise<FlowLedgerResponse<WorkLog>> {
    try {
      const workLog: WorkLog = {
        ...logData,
        id: this.generateId(),
        timestamp: new Date(),
      };

      this.workLogs.unshift(workLog);
      await this.saveToStorage();
      this.notifyListeners();

      return {
        success: true,
        data: workLog,
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: 'Failed to create work log',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  async updateWorkLog(id: string, updates: Partial<WorkLog>): Promise<FlowLedgerResponse<WorkLog>> {
    try {
      const index = this.workLogs.findIndex(log => log.id === id);
      if (index === -1) {
        return {
          success: false,
          data: null as any,
          message: 'Work log not found',
        };
      }

      this.workLogs[index] = { ...this.workLogs[index], ...updates };
      await this.saveToStorage();
      this.notifyListeners();

      return {
        success: true,
        data: this.workLogs[index],
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: 'Failed to update work log',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  async deleteWorkLog(id: string): Promise<FlowLedgerResponse<boolean>> {
    try {
      const index = this.workLogs.findIndex(log => log.id === id);
      if (index === -1) {
        return {
          success: false,
          data: null as any,
          message: 'Work log not found',
        };
      }

      this.workLogs.splice(index, 1);
      await this.saveToStorage();
      this.notifyListeners();

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: 'Failed to delete work log',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // Query methods
  getWorkLogs(query?: WorkLogQuery): WorkLog[] {
    let filteredLogs = [...this.workLogs];

    if (query) {
      if (query.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= query.startDate!);
      }
      if (query.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= query.endDate!);
      }
      if (query.categories?.length) {
        filteredLogs = filteredLogs.filter(log => query.categories!.includes(log.category));
      }
      if (query.outcomes?.length) {
        filteredLogs = filteredLogs.filter(log => query.outcomes!.includes(log.outcome));
      }
      if (query.people?.length) {
        filteredLogs = filteredLogs.filter(log => 
          log.people?.some(person => query.people!.includes(person))
        );
      }
      if (query.tags?.length) {
        filteredLogs = filteredLogs.filter(log => 
          log.tags?.some(tag => query.tags!.includes(tag))
        );
      }
      if (query.offset) {
        filteredLogs = filteredLogs.slice(query.offset);
      }
      if (query.limit) {
        filteredLogs = filteredLogs.slice(0, query.limit);
      }
    }

    return filteredLogs;
  }

  getWorkLogById(id: string): WorkLog | undefined {
    return this.workLogs.find(log => log.id === id);
  }

  // Analytics methods
  getStats() {
    const totalLogs = this.workLogs.length;
    const totalTime = this.workLogs.reduce((sum, log) => sum + log.time, 0);
    const averageTime = totalLogs > 0 ? totalTime / totalLogs : 0;
    
    const categoryStats = this.workLogs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<WorkCategory, number>);

    const outcomeStats = this.workLogs.reduce((acc, log) => {
      acc[log.outcome] = (acc[log.outcome] || 0) + 1;
      return acc;
    }, {} as Record<WorkOutcome, number>);

    const recentLogs = this.workLogs.slice(0, 10);

    return {
      totalLogs,
      totalTime,
      averageTime,
      categoryStats,
      outcomeStats,
      recentLogs,
    };
  }

  // Habit inference methods
  getInferredHabits() {
    const patterns = this.analyzePatterns();
    return this.extractHabits(patterns);
  }

  private analyzePatterns() {
    // Group logs by time of day, day of week, context
    const timePatterns = this.workLogs.reduce((acc, log) => {
      const hour = log.timestamp.getHours();
      const dayOfWeek = log.timestamp.getDay();
      const key = `${hour}-${dayOfWeek}`;
      
      if (!acc[key]) {
        acc[key] = {
          hour,
          dayOfWeek,
          activities: [],
          contexts: [],
        };
      }
      
      acc[key].activities.push(log.category);
      if (log.context) {
        acc[key].contexts.push(log.context);
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(timePatterns);
  }

  private extractHabits(patterns: any[]) {
    // Extract recurring patterns as habits
    return patterns
      .filter(pattern => pattern.activities.length >= 3) // At least 3 occurrences
      .map(pattern => ({
        id: this.generateId(),
        name: `${pattern.activities[0]} at ${pattern.hour}:00`,
        frequency: pattern.activities.length,
        consistency: pattern.activities.length / this.workLogs.length,
        lastOccurrence: new Date(),
        impact: this.calculateHabitImpact(pattern),
        source: 'inferred' as const,
      }));
  }

  private calculateHabitImpact(pattern: any): number {
    // Calculate impact based on outcomes and energy cost
    const positiveOutcomes = pattern.activities.filter((log: WorkLog) => 
      log.outcome === WorkOutcome.COMPLETED || log.outcome === WorkOutcome.ADVANCED
    ).length;
    
    return (positiveOutcomes / pattern.activities.length) * 10;
  }

  // Memory anchor methods
  getMemoryAnchors() {
    return this.workLogs
      .filter(log => log.decisions?.length || log.insights?.length)
      .map(log => ({
        id: this.generateId(),
        workLogId: log.id,
        type: log.decisions?.length ? 'decision' : 'insight',
        content: log.decisions?.[0] || log.insights?.[0] || '',
        timestamp: log.timestamp,
        importance: this.calculateImportance(log),
        connections: this.findRelatedLogs(log.id),
      }));
  }

  private calculateImportance(log: WorkLog): number {
    let importance = 5; // Base importance
    
    // Increase importance based on factors
    if (log.energyCost > 7) importance += 2;
    if (log.outcome === WorkOutcome.COMPLETED) importance += 1;
    if (log.decisions?.length) importance += 2;
    if (log.insights?.length) importance += 1;
    if (log.people?.length) importance += 1;
    
    return Math.min(importance, 10);
  }

  private findRelatedLogs(logId: string): string[] {
    const log = this.getWorkLogById(logId);
    if (!log) return [];
    
    return this.workLogs
      .filter(otherLog => 
        otherLog.id !== logId &&
        (
          otherLog.category === log.category ||
          otherLog.people?.some(person => log.people?.includes(person)) ||
          otherLog.tags?.some(tag => log.tags?.includes(tag))
        )
      )
      .map(relatedLog => relatedLog.id)
      .slice(0, 5);
  }

  // Relationship methods
  getRelationships() {
    const peopleMap = new Map<string, any>();
    
    this.workLogs.forEach(log => {
      if (log.people) {
        log.people.forEach(personName => {
          if (!peopleMap.has(personName)) {
            peopleMap.set(personName, {
              id: this.generateId(),
              name: personName,
              interactionCount: 0,
              workLogIds: [],
              lastInteraction: new Date(0),
            });
          }
          
          const person = peopleMap.get(personName);
          person.interactionCount++;
          person.workLogIds.push(log.id);
          if (log.timestamp > person.lastInteraction) {
            person.lastInteraction = log.timestamp;
          }
        });
      }
    });
    
    return Array.from(peopleMap.values());
  }

  // Event system
  subscribe(listener: (logs: WorkLog[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.workLogs]));
  }

  // Storage methods
  private async saveToStorage() {
    try {
      localStorage.setItem('flowledger_worklogs', JSON.stringify(this.workLogs));
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }

  private initializeFromStorage() {
    try {
      const stored = localStorage.getItem('flowledger_worklogs');
      if (stored) {
        this.workLogs = JSON.parse(stored).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to initialize from storage:', error);
      this.workLogs = [];
    }
  }

  // Utility methods
  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Export/Import methods
  exportData(): string {
    return JSON.stringify(this.workLogs);
  }

  async importData(data: string): Promise<FlowLedgerResponse<boolean>> {
    try {
      const importedLogs = JSON.parse(data);
      this.workLogs = [...importedLogs, ...this.workLogs];
      await this.saveToStorage();
      this.notifyListeners();
      
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: 'Failed to import data',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
}

// React Hook for FlowLedger
export function useFlowLedger() {
  const [flowLedger] = useState(() => FlowLedger.getInstance());
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = flowLedger.subscribe(setWorkLogs);
    setWorkLogs(flowLedger.getWorkLogs());
    setIsLoading(false);
    
    return unsubscribe;
  }, [flowLedger]);

  return {
    workLogs,
    isLoading,
    createWorkLog: flowLedger.createWorkLog.bind(flowLedger),
    updateWorkLog: flowLedger.updateWorkLog.bind(flowLedger),
    deleteWorkLog: flowLedger.deleteWorkLog.bind(flowLedger),
    getWorkLogs: flowLedger.getWorkLogs.bind(flowLedger),
    getWorkLogById: flowLedger.getWorkLogById.bind(flowLedger),
    getStats: flowLedger.getStats.bind(flowLedger),
    getInferredHabits: flowLedger.getInferredHabits.bind(flowLedger),
    getMemoryAnchors: flowLedger.getMemoryAnchors.bind(flowLedger),
    getRelationships: flowLedger.getRelationships.bind(flowLedger),
    exportData: flowLedger.exportData.bind(flowLedger),
    importData: flowLedger.importData.bind(flowLedger),
  };
}

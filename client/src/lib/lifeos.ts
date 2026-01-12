"use client";

import { useState, useEffect } from 'react';
import { WorkLog, Goal, InferredHabit, HealthScore, SystemOverview, GoalStatus, WorkCategory, WorkOutcome } from '@/types/forgeone';
import { useFlowLedger } from '@/lib/flowledger';

// LifeOS System View
// Dashboard layer that infers insights without manual tracking
export class LifeOS {
  private static instance: LifeOS;
  private listeners: ((overview: SystemOverview) => void)[] = [];

  private constructor() {}

  static getInstance(): LifeOS {
    if (!LifeOS.instance) {
      LifeOS.instance = new LifeOS();
    }
    return LifeOS.instance;
  }

  // System overview
  getSystemOverview(workLogs: WorkLog[]): SystemOverview {
    const healthScore = this.calculateHealthScore(workLogs);
    const goals = this.inferGoals(workLogs);
    const relationships = this.analyzeRelationships(workLogs);
    const recentActivity = workLogs.slice(0, 10);
    const upcomingDeadlines = this.getUpcomingDeadlines(goals);

    return {
      totalWorkLogs: workLogs.length,
      activeGoals: goals.filter(g => g.status === GoalStatus.ACTIVE).length,
      peopleCount: relationships.length,
      healthScore,
      recentActivity,
      upcomingDeadlines,
      relationshipHealth: this.calculateRelationshipHealth(relationships),
    };
  }

  // Habit inference (no manual tracking!)
  inferHabits(workLogs: WorkLog[]): InferredHabit[] {
    const patterns = this.analyzePatterns(workLogs);
    const habits: InferredHabit[] = [];

    patterns.forEach(pattern => {
      if (pattern.frequency >= 3) { // At least 3 occurrences
        const habit: InferredHabit = {
          id: this.generateId(),
          name: this.generateHabitName(pattern),
          pattern: {
            timeOfDay: pattern.timeOfDay || undefined,
            dayOfWeek: pattern.dayOfWeek || undefined,
            context: pattern.context || undefined,
            triggers: pattern.triggers || [],
          },
          frequency: pattern.frequency,
          consistency: this.calculateConsistency(pattern),
          lastOccurrence: pattern.lastOccurrence,
          impact: this.calculateHabitImpact(pattern),
          source: 'inferred',
        };

        habits.push(habit);
      }
    });

    return habits.sort((a, b) => b.impact - a.impact);
  }

  private analyzePatterns(workLogs: WorkLog[]) {
    const patterns = new Map<string, any>();

    workLogs.forEach(log => {
      // Time-based patterns
      const hour = log.timestamp.getHours();
      const dayOfWeek = log.timestamp.getDay();
      const timeKey = `${hour}-${dayOfWeek}`;
      
      // Category-based patterns
      const categoryKey = `${log.category}-${hour}`;
      
      // Context-based patterns
      const contextKey = log.context ? `${log.context.environment}-${log.category}` : null;

      // Update patterns
      [timeKey, categoryKey, contextKey].filter((k): k is string => Boolean(k)).forEach(key => {
        if (!patterns.has(key)) {
          patterns.set(key, {
            key,
            category: log.category,
            timeOfDay: this.getTimeOfDay(hour) || undefined,
            dayOfWeek: this.getDayOfWeek(dayOfWeek) || undefined,
            context: log.context?.environment || undefined,
            triggers: [],
            occurrences: [],
            frequency: 0,
          });
        }

        const pattern = patterns.get(key)!;
        pattern.occurrences.push(log);
        pattern.frequency++;
        pattern.lastOccurrence = log.timestamp;

        // Extract triggers
        if (log.why) {
          const triggers = this.extractTriggers(log.why);
          pattern.triggers.push(...triggers);
        }
      });
    });

    return Array.from(patterns.values());
  }

  private getTimeOfDay(hour: number): string {
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  private getDayOfWeek(day: number): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[day];
  }

  private extractTriggers(why: string): string[] {
    const triggers: string[] = [];
    
    // Common trigger patterns
    if (why.includes('meeting')) triggers.push('meeting');
    if (why.includes('deadline')) triggers.push('deadline');
    if (why.includes('coffee')) triggers.push('coffee');
    if (why.includes('email')) triggers.push('email');
    if (why.includes('client')) triggers.push('client');
    if (why.includes('urgent')) triggers.push('urgent');
    
    return triggers;
  }

  private generateHabitName(pattern: any): string {
    const category = pattern.category;
    const time = pattern.timeOfDay || 'unknown time';
    const context = pattern.context || 'unknown context';
    
    return `${category} during ${context} (${time})`;
  }

  private calculateConsistency(pattern: any): number {
    if (pattern.occurrences.length < 2) return 0;
    
    // Calculate consistency based on regularity
    const days = new Set(pattern.occurrences.map((log: WorkLog) => 
      log.timestamp.toDateString()
    )).size;
    
    return Math.min(days / pattern.occurrences.length, 1);
  }

  private calculateHabitImpact(pattern: any): number {
    const positiveOutcomes = pattern.occurrences.filter((log: WorkLog) => 
      log.outcome === WorkOutcome.COMPLETED || log.outcome === WorkOutcome.ADVANCED
    ).length;
    
    return (positiveOutcomes / pattern.occurrences.length) * 10;
  }

  // Goal inference from outcomes
  inferGoals(workLogs: WorkLog[]): Goal[] {
    const goalMap = new Map<string, Goal>();

    workLogs.forEach(log => {
      // Extract potential goals from "why" field
      const potentialGoals = this.extractGoalsFromText(log.why + ' ' + log.what);
      
      potentialGoals.forEach(goalText => {
        const key = goalText.toLowerCase();
        
        if (!goalMap.has(key)) {
          goalMap.set(key, {
            id: this.generateId(),
            title: goalText,
            description: `Inferred from work patterns`,
            category: log.category,
            progress: 0,
            milestones: [],
            relatedWorkLogs: [],
            status: GoalStatus.ACTIVE,
          });
        }

        const goal = goalMap.get(key)!;
        goal.relatedWorkLogs.push(log.id);
        
        // Update progress based on outcomes
        if (log.outcome === WorkOutcome.COMPLETED) {
          goal.progress = Math.min(goal.progress + 10, 100);
          
          // Add milestone for significant completions
          if (log.time > 60) { // More than 1 hour
            goal.milestones.push({
              id: this.generateId(),
              title: `Completed: ${log.what}`,
              completed: true,
              completedAt: log.timestamp,
              workLogIds: [log.id],
            });
          }
        }
      });
    });

    return Array.from(goalMap.values()).sort((a, b) => b.progress - a.progress);
  }

  private extractGoalsFromText(text: string): string[] {
    const goals: string[] = [];
    
    // Common goal patterns
    const patterns = [
      /(?:build|create|develop|launch)\s+(.+)/gi,
      /(?:learn|study|master)\s+(.+)/gi,
      /(?:improve|optimize|enhance)\s+(.+)/gi,
      /(?:finish|complete|deliver)\s+(.+)/gi,
    ];

    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const goal = match.trim();
          if (goal.length > 5 && goal.length < 50) {
            goals.push(goal);
          }
        });
      }
    });

    return goals;
  }

  // Health score calculation
  calculateHealthScore(workLogs: WorkLog[]): HealthScore {
    const recentLogs = this.getRecentLogs(workLogs, 7); // Last 7 days
    
    const dimensions = {
      productivity: this.calculateProductivity(recentLogs),
      energy: this.calculateEnergy(recentLogs),
      consistency: this.calculateConsistencyScore(recentLogs),
      growth: this.calculateGrowth(recentLogs),
      balance: this.calculateBalance(recentLogs),
    };

    const overall = Object.values(dimensions).reduce((sum, score) => sum + score, 0) / 5;

    return {
      overall: Math.round(overall),
      dimensions,
      weekEnding: new Date(),
      factors: this.identifyHealthFactors(recentLogs),
    };
  }

  private getRecentLogs(workLogs: WorkLog[], days: number): WorkLog[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return workLogs.filter(log => log.timestamp >= cutoff);
  }

  private calculateProductivity(logs: WorkLog[]): number {
    if (logs.length === 0) return 50;
    
    const completionRate = logs.filter(log => 
      log.outcome === WorkOutcome.COMPLETED || log.outcome === WorkOutcome.ADVANCED
    ).length / logs.length;
    
    const timeProductivity = Math.min(logs.reduce((sum, log) => sum + log.time, 0) / (logs.length * 60), 2);
    
    return Math.round((completionRate * 60 + timeProductivity * 40));
  }

  private calculateEnergy(logs: WorkLog[]): number {
    if (logs.length === 0) return 50;
    
    const avgEnergy = logs.reduce((sum, log) => sum + (log.energyCost || 5), 0) / logs.length;
    
    // Higher energy cost = lower energy score (inverse relationship)
    return Math.round(Math.max(0, 100 - (avgEnergy - 1) * 10));
  }

  private calculateConsistencyScore(logs: WorkLog[]): number {
    if (logs.length === 0) return 50;
    
    // Check daily consistency
    const daysWithLogs = new Set(logs.map(log => log.timestamp.toDateString())).size;
    const expectedDays = 7; // Last week
    
    return Math.round((daysWithLogs / expectedDays) * 100);
  }

  private calculateGrowth(logs: WorkLog[]): number {
    if (logs.length === 0) return 50;
    
    // Growth based on learning activities and new categories
    const learningLogs = logs.filter(log => log.category === WorkCategory.STUDY);
    const categories = new Set(logs.map(log => log.category)).size;
    
    const learningScore = Math.min(learningLogs.length * 20, 60);
    const diversityScore = Math.min(categories * 10, 40);
    
    return Math.round(learningScore + diversityScore);
  }

  private calculateBalance(logs: WorkLog[]): number {
    if (logs.length === 0) return 50;
    
    // Balance across different categories
    const categoryCounts = logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<WorkCategory, number>);
    
    const totalLogs = logs.length;
    const idealBalance = totalLogs / Object.keys(categoryCounts).length;
    
    const variance = Object.values(categoryCounts).reduce((sum, count) => {
      return sum + Math.pow(count - idealBalance, 2);
    }, 0);
    
    // Lower variance = better balance
    return Math.round(Math.max(0, 100 - variance / totalLogs));
  }

  private identifyHealthFactors(logs: WorkLog[]) {
    const factors = [];
    
    // Positive factors
    const completedLogs = logs.filter(log => log.outcome === WorkOutcome.COMPLETED);
    if (completedLogs.length > 0) {
      factors.push({
        dimension: 'productivity',
        impact: completedLogs.length * 5,
        description: `${completedLogs.length} completed tasks`,
        workLogIds: completedLogs.map(log => log.id),
      });
    }

    // Negative factors
    const stuckLogs = logs.filter(log => log.outcome === WorkOutcome.STUCK);
    if (stuckLogs.length > 0) {
      factors.push({
        dimension: 'productivity',
        impact: -stuckLogs.length * 3,
        description: `${stuckLogs.length} stuck tasks`,
        workLogIds: stuckLogs.map(log => log.id),
      });
    }

    return factors;
  }

  private analyzeRelationships(workLogs: WorkLog[]) {
    const peopleMap = new Map();
    
    workLogs.forEach(log => {
      if (log.people) {
        log.people.forEach(personName => {
          if (!peopleMap.has(personName)) {
            peopleMap.set(personName, {
              name: personName,
              interactionCount: 0,
              lastInteraction: new Date(0),
            });
          }
          
          const personData = peopleMap.get(personName)!;
          personData.interactionCount++;
          if (log.timestamp > personData.lastInteraction) {
            personData.lastInteraction = log.timestamp;
          }
        });
      }
    });
    
    return Array.from(peopleMap.values());
  }

  private calculateRelationshipHealth(relationships: any[]) {
    const strongConnections = relationships.filter(r => r.interactionCount >= 3).length;
    const newConnections = relationships.filter(r => {
      const daysSinceLast = (Date.now() - r.lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLast <= 7;
    }).length;
    
    return {
      strongConnections,
      newConnections,
      interactionFrequency: relationships.length > 0 ? relationships.reduce((sum, r) => sum + r.interactionCount, 0) / relationships.length : 0,
      relationshipScore: Math.round((strongConnections * 20 + newConnections * 15)),
    };
  }

  private getUpcomingDeadlines(goals: Goal[]): Goal[] {
    // For now, return goals with progress < 100%
    return goals
      .filter(goal => goal.progress < 100)
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);
  }

  // Event system
  subscribe(listener: (overview: SystemOverview) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private generateId(): string {
    return `lifeos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// React Hook for LifeOS
export function useLifeOS() {
  const [lifeOS] = useState(() => LifeOS.getInstance());
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { workLogs } = useFlowLedger();

  useEffect(() => {
    const overview = lifeOS.getSystemOverview(workLogs);
    setSystemOverview(overview);
    setIsLoading(false);
  }, [workLogs, lifeOS]);

  return {
    systemOverview,
    isLoading,
    inferHabits: lifeOS.inferHabits.bind(lifeOS),
    inferGoals: lifeOS.inferGoals.bind(lifeOS),
    calculateHealthScore: lifeOS.calculateHealthScore.bind(lifeOS),
  };
}

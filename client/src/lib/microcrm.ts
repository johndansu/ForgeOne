"use client";

import { useState, useEffect } from 'react';
import { Person, Meeting, ActionItem, PersonType, MeetingType, WorkLog } from '@/types/forgeone';
import { useFlowLedger } from '@/lib/flowledger';

// MicroCRM Relationship Module
// People are just another entity - no duplicate data
export class MicroCRM {
  private static instance: MicroCRM;
  private listeners: ((people: Person[]) => void)[] = [];

  private constructor() {}

  static getInstance(): MicroCRM {
    if (!MicroCRM.instance) {
      MicroCRM.instance = new MicroCRM();
    }
    return MicroCRM.instance;
  }

  // Extract people from work logs
  extractPeopleFromWorkLogs(workLogs: WorkLog[]): Person[] {
    const peopleMap = new Map<string, Person>();

    workLogs.forEach(log => {
      if (log.people && log.people.length > 0) {
        log.people.forEach(personName => {
          if (!peopleMap.has(personName)) {
            const person: Person = {
              id: this.generateId(),
              name: personName,
              type: this.inferPersonType(log, personName),
              context: this.inferContext(log, personName),
              lastInteraction: log.timestamp,
              interactionCount: 0,
              workLogIds: [],
              tags: [],
              notes: '',
            };
            peopleMap.set(personName, person);
          }

          const person = peopleMap.get(personName)!;
          person.interactionCount++;
          person.workLogIds.push(log.id);
          
          if (log.timestamp > person.lastInteraction) {
            person.lastInteraction = log.timestamp;
            person.context = this.inferContext(log, personName);
          }

          // Extract tags from work log
          if (log.tags) {
            person.tags = person.tags || [];
            person.tags.push(...log.tags);
          }
        });
      }
    });

    // Remove duplicate tags and sort by last interaction
    return Array.from(peopleMap.values())
      .map(person => ({
        ...person,
        tags: [...new Set(person.tags)],
      }))
      .sort((a, b) => b.lastInteraction.getTime() - a.lastInteraction.getTime());
  }

  private inferPersonType(log: WorkLog, _personName: string): PersonType {
    // Infer person type based on context
    const { category, why } = log;
    const text = `${why} ${log.what}`.toLowerCase();

    if (category === 'client' || text.includes('client') || text.includes('customer')) {
      return PersonType.CLIENT;
    }

    if (text.includes('mentor') || text.includes('coach') || text.includes('advisor')) {
      return PersonType.MENTOR;
    }

    if (text.includes('friend') || text.includes('social') || category === 'personal') {
      return PersonType.FRIEND;
    }

    if (text.includes('family') || text.includes('parent') || text.includes('sibling')) {
      return PersonType.FAMILY;
    }

    if (text.includes('network') || text.includes('conference') || text.includes('meetup')) {
      return PersonType.NETWORK;
    }

    return PersonType.COLLEAGUE; // Default
  }

  private inferContext(log: WorkLog, _personName: string): string {
    const { category, why, what } = log;
    
    if (category === 'client') {
      return `Client work: ${what}`;
    }

    if (category === 'project') {
      return `Project collaboration: ${what}`;
    }

    if (category === 'meeting') {
      return `Meeting: ${what}`;
    }

    if (why.includes('learn') || why.includes('study')) {
      return `Learning/mentoring`;
    }

    return `General interaction: ${what}`;
  }

  // Extract meetings from work logs
  extractMeetingsFromWorkLogs(workLogs: WorkLog[]): Meeting[] {
    const meetings: Meeting[] = [];

    workLogs.forEach(log => {
      if (log.category === 'meeting' || log.what.toLowerCase().includes('meeting')) {
        const meeting: Meeting = {
          id: this.generateId(),
          title: log.what,
          timestamp: log.timestamp,
          duration: log.time,
          people: log.people || [],
          workLogId: log.id,
          type: this.inferMeetingType(log),
          outcomes: this.extractMeetingOutcomes(log),
          actionItems: this.extractActionItems(log),
        };

        meetings.push(meeting);
      }
    });

    return meetings.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private inferMeetingType(log: WorkLog): MeetingType {
    const text = `${log.what} ${log.why}`.toLowerCase();

    if (text.includes('client') || text.includes('customer')) {
      return MeetingType.CLIENT_MEETING;
    }

    if (text.includes('1:1') || text.includes('one on one')) {
      return MeetingType.ONE_ON_ONE;
    }

    if (text.includes('team') || text.includes('standup') || text.includes('sync')) {
      return MeetingType.TEAM_MEETING;
    }

    if (text.includes('brainstorm') || text.includes('idea')) {
      return MeetingType.BRAINSTORM;
    }

    if (text.includes('review') || text.includes('retrospective')) {
      return MeetingType.REVIEW;
    }

    if (text.includes('plan') || text.includes('planning')) {
      return MeetingType.PLANNING;
    }

    return MeetingType.TEAM_MEETING; // Default
  }

  private extractMeetingOutcomes(log: WorkLog): string[] {
    const outcomes: string[] = [];

    if (log.outcome === 'completed') {
      outcomes.push('Meeting completed successfully');
    }

    if (log.decisions) {
      outcomes.push(...log.decisions.map(decision => `Decision: ${decision}`));
    }

    if (log.insights) {
      outcomes.push(...log.insights.map(insight => `Insight: ${insight}`));
    }

    return outcomes;
  }

  private extractActionItems(log: WorkLog): ActionItem[] {
    const actionItems: ActionItem[] = [];

    // Extract action items from blockers and description
    const text = `${log.blockers?.join(' ')} ${log.why} ${log.what}`.toLowerCase();
    
    // Look for action patterns
    const actionPatterns = [
      /(?:need to|will|should|must)\s+(.+?)(?:\.|$)/gi,
      /(?:action item|todo|task):\s*(.+?)(?:\.|$)/gi,
      /(?:follow up|followup):\s*(.+?)(?:\.|$)/gi,
    ];

    actionPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          if (match.trim().length > 5) {
            actionItems.push({
              id: this.generateId(),
              description: match.trim(),
              assignee: log.people?.[0], // Assign to first person mentioned
              dueDate: this.inferDueDate(log),
              completed: false,
            });
          }
        });
      }
    });

    return actionItems;
  }

  private inferDueDate(log: WorkLog): Date | undefined {
    // Simple heuristic: if log mentions "tomorrow", "next week", etc.
    const text = `${log.why} ${log.what}`.toLowerCase();
    
    if (text.includes('tomorrow')) {
      const tomorrow = new Date(log.timestamp);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    if (text.includes('next week')) {
      const nextWeek = new Date(log.timestamp);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }

    if (text.includes('asap') || text.includes('urgent')) {
      const tomorrow = new Date(log.timestamp);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    return undefined;
  }

  // Get relationship insights
  getRelationshipInsights(people: Person[], meetings: Meeting[]) {
    const insights = {
      totalPeople: people.length,
      activeRelationships: people.filter(p => {
        const daysSinceLast = (Date.now() - p.lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceLast <= 30; // Active in last 30 days
      }).length,
      relationshipTypes: this.analyzeRelationshipTypes(people),
      interactionFrequency: this.calculateInteractionFrequency(people),
      upcomingFollowUps: this.getUpcomingFollowUps(meetings),
      relationshipHealth: this.calculateRelationshipHealth(people, meetings),
    };

    return insights;
  }

  private analyzeRelationshipTypes(people: Person[]) {
    const typeCounts = people.reduce((acc, person) => {
      acc[person.type] = (acc[person.type] || 0) + 1;
      return acc;
    }, {} as Record<PersonType, number>);

    return typeCounts;
  }

  private calculateInteractionFrequency(people: Person[]) {
    if (people.length === 0) return 0;

    const totalInteractions = people.reduce((sum, person) => sum + person.interactionCount, 0);
    const avgInteractions = totalInteractions / people.length;

    return Math.round(avgInteractions);
  }

  private getUpcomingFollowUps(meetings: Meeting[]) {
    const followUps: ActionItem[] = [];

    meetings.forEach(meeting => {
      if (meeting.actionItems) {
        followUps.push(...meeting.actionItems.filter(item => !item.completed));
      }
    });

    // Sort by due date (if available) or meeting date
    return followUps.sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      return 0;
    });
  }

  private calculateRelationshipHealth(people: Person[], meetings: Meeting[]) {
    const strongRelationships = people.filter(p => p.interactionCount >= 3).length;
    const recentInteractions = people.filter(p => {
      const daysSinceLast = (Date.now() - p.lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLast <= 7;
    }).length;

    const meetingOutcomes = meetings.reduce((sum, meeting) => sum + (meeting.outcomes?.length || 0), 0);
    const actionItemsCompleted = meetings.reduce((sum, meeting) => {
      return sum + (meeting.actionItems?.filter(item => item.completed).length || 0);
    }, 0);

    const healthScore = Math.round(
      (strongRelationships * 20 + 
       recentInteractions * 15 + 
       meetingOutcomes * 10 + 
       actionItemsCompleted * 5) / Math.max(people.length, 1)
    );

    return {
      score: Math.min(healthScore, 100),
      strongRelationships,
      recentInteractions,
      meetingOutcomes,
      actionItemsCompleted,
    };
  }

  // Search people
  searchPeople(query: string, people: Person[]): Person[] {
    const searchTerm = query.toLowerCase();
    
    return people.filter(person => 
      person.name.toLowerCase().includes(searchTerm) ||
      person.context.toLowerCase().includes(searchTerm) ||
      person.notes?.toLowerCase().includes(searchTerm) ||
      (person.tags || []).some((tag: string) => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Get person details
  getPersonDetails(personId: string, people: Person[], workLogs: WorkLog[], meetings: Meeting[]) {
    const person = people.find(p => p.id === personId);
    if (!person) return null;

    const personWorkLogs = workLogs.filter(log => log.people?.includes(person.name));
    const personMeetings = meetings.filter(meeting => meeting.people.includes(person.name));

    return {
      person,
      workLogs: personWorkLogs,
      meetings: personMeetings,
      interactionHistory: this.buildInteractionHistory(personWorkLogs),
      relationshipStrength: this.calculateRelationshipStrength(person),
      communicationPatterns: this.analyzeCommunicationPatterns(personWorkLogs),
    };
  }

  private buildInteractionHistory(workLogs: WorkLog[]) {
    return workLogs.map(log => ({
      date: log.timestamp,
      type: log.category,
      description: log.what,
      outcome: log.outcome,
      duration: log.time,
      energyCost: log.energyCost,
    })).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  private calculateRelationshipStrength(person: Person): number {
    let strength = 0;

    // Base strength from interaction count
    strength += Math.min(person.interactionCount * 10, 50);

    // Recency bonus
    const daysSinceLast = (Date.now() - person.lastInteraction.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLast <= 7) strength += 20;
    else if (daysSinceLast <= 30) strength += 10;

    // Context diversity bonus
    const contexts = new Set(person.workLogIds.map(id => id)); // Simplified
    strength += Math.min(contexts.size * 5, 30);

    return Math.min(strength, 100);
  }

  private analyzeCommunicationPatterns(workLogs: WorkLog[]) {
    const patterns = {
      preferredTimeOfDay: this.getPreferredTimeOfDay(workLogs),
      averageInteractionLength: workLogs.reduce((sum, log) => sum + log.time, 0) / workLogs.length,
      commonTopics: this.getCommonTopics(workLogs),
      outcomeDistribution: this.getOutcomeDistribution(workLogs),
    };

    return patterns;
  }

  private getPreferredTimeOfDay(workLogs: WorkLog[]): string {
    const hourCounts = workLogs.reduce((acc, log) => {
      const hour = log.timestamp.getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const mostCommonHour = Object.entries(hourCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] as string | undefined;

    const hour = parseInt(mostCommonHour || '0', 10);

    if (!mostCommonHour || isNaN(hour)) return 'unknown';

    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  private getCommonTopics(workLogs: WorkLog[]): string[] {
    const topics = workLogs.map(log => log.category);
    const topicCounts = topics.reduce((acc, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(topicCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([topic]) => topic);
  }

  private getOutcomeDistribution(workLogs: WorkLog[]) {
    const distribution = workLogs.reduce((acc, log) => {
      acc[log.outcome] = (acc[log.outcome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return distribution;
  }

  // Event system
  subscribe(listener: (people: Person[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private generateId(): string {
    return `crm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// React Hook for MicroCRM
export function useMicroCRM() {
  const [microCRM] = useState(() => MicroCRM.getInstance());
  const [people, setPeople] = useState<Person[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { workLogs } = useFlowLedger();

  useEffect(() => {
    const extractedPeople = microCRM.extractPeopleFromWorkLogs(workLogs);
    const extractedMeetings = microCRM.extractMeetingsFromWorkLogs(workLogs);
    
    setPeople(extractedPeople);
    setMeetings(extractedMeetings);
    setIsLoading(false);
  }, [workLogs, microCRM]);

  return {
    people,
    meetings,
    isLoading,
    getRelationshipInsights: microCRM.getRelationshipInsights.bind(microCRM),
    searchPeople: microCRM.searchPeople.bind(microCRM),
    getPersonDetails: microCRM.getPersonDetails.bind(microCRM),
  };
}

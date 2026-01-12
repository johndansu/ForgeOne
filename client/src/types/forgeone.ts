// ForgeOne Unified Data Model
// This is the core data structure that feeds all four modules

export interface WorkLog {
  id: string;
  timestamp: Date;
  
  // Core FlowLedger fields
  what: string;           // What you worked on
  why: string;            // Why you did it (purpose/motivation)
  time: number;           // Time spent in minutes
  outcome: WorkOutcome;   // Result/achievement
  blockers?: string[];    // What stopped you
  
  // Extended fields for other modules
  category: WorkCategory;
  energyCost: number;     // 1-10 scale
  context?: WorkContext;
  
  // Relationships (for MicroCRM)
  people?: string[];      // People involved
  meetings?: string[];    // Meeting references
  
  // Memory anchors (for Recall)
  decisions?: string[];   // Key decisions made
  insights?: string[];    // Insights gained
  feelings?: string;     // Emotional state
  
  // System metadata
  source: LogSource;
  tags?: string[];
  related?: string[];     // Related work logs
}

export enum WorkOutcome {
  COMPLETED = 'completed',
  PARTIAL = 'partial', 
  STUCK = 'stuck',
  ADVANCED = 'advanced',
  PAUSED = 'paused',
  BLOCKED = 'blocked'
}

export enum WorkCategory {
  PROJECT = 'project',
  STUDY = 'study',
  PERSONAL = 'personal',
  CLIENT = 'client',
  MEETING = 'meeting',
  HEALTH = 'health',
  RELATIONSHIP = 'relationship',
  FINANCE = 'finance',
  OTHER = 'other'
}

export enum LogSource {
  MANUAL = 'manual',
  QUICK_CAPTURE = 'quick_capture',
  ADVANCED_CAPTURE = 'advanced_capture',
  AUTOMATIC = 'automatic',
  IMPORTED = 'imported'
}

export interface WorkContext {
  location?: string;
  environment?: string;    // quiet, noisy, office, home
  mood?: string;         // focused, tired, energized
  tools?: string[];      // Tools/software used
  state_before?: string; // State before starting
  state_after?: string;  // State after finishing
}

// Memory Layer Types (Recall Module)
export interface MemoryAnchor {
  id: string;
  workLogId: string;
  type: AnchorType;
  content: string;
  timestamp: Date;
  importance: number;     // 1-10 scale
  connections?: string[]; // Related anchors
}

export enum AnchorType {
  DECISION = 'decision',
  INSIGHT = 'insight',
  MILESTONE = 'milestone',
  RELATIONSHIP = 'relationship',
  LEARNING = 'learning',
  CHALLENGE = 'challenge',
  SOLUTION = 'solution'
}

// LifeOS System Types
export interface InferredHabit {
  id: string;
  name: string;
  pattern: HabitPattern;
  frequency: number;      // How often it occurs
  consistency: number;   // How consistent (0-1)
  lastOccurrence: Date;
  impact: number;        // Impact on goals (1-10)
  source: 'inferred';     // Always inferred, not manual
}

export interface HabitPattern {
  timeOfDay?: string;    // morning, afternoon, evening
  dayOfWeek?: string[];  // monday, tuesday, etc.
  context?: string;      // after coffee, before meeting
  triggers?: string[];   // What triggers it
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: WorkCategory;
  progress: number;      // 0-100 percentage
  targetDate?: Date;
  milestones: Milestone[];
  relatedWorkLogs: string[];
  status: GoalStatus;
}

export enum GoalStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
  workLogIds: string[];
}

export interface HealthScore {
  overall: number;       // 0-100
  dimensions: {
    productivity: number;
    energy: number;
    consistency: number;
    growth: number;
    balance: number;
  };
  weekEnding: Date;
  factors: HealthFactor[];
}

export interface HealthFactor {
  dimension: string;
  impact: number;        // Positive or negative impact
  description: string;
  workLogIds: string[];
}

// MicroCRM Types
export interface Person {
  id: string;
  name: string;
  type: PersonType;
  context: string;       // How you know them
  lastInteraction: Date;
  interactionCount: number;
  workLogIds: string[];   // All work logs involving this person
  tags?: string[];
  notes?: string;
}

export enum PersonType {
  CLIENT = 'client',
  COLLEAGUE = 'colleague',
  MENTOR = 'mentor',
  FRIEND = 'friend',
  FAMILY = 'family',
  NETWORK = 'network'
}

export interface Meeting {
  id: string;
  title: string;
  timestamp: Date;
  duration: number;      // minutes
  people: string[];      // Person IDs
  workLogId: string;     // Reference to the work log
  type: MeetingType;
  outcomes?: string[];
  actionItems?: ActionItem[];
}

export enum MeetingType {
  CLIENT_MEETING = 'client_meeting',
  TEAM_MEETING = 'team_meeting',
  ONE_ON_ONE = 'one_on_one',
  BRAINSTORM = 'brainstorm',
  REVIEW = 'review',
  PLANNING = 'planning'
}

export interface ActionItem {
  id: string;
  description: string;
  assignee?: string;     // Person ID
  dueDate?: Date;
  completed: boolean;
  completedAt?: Date;
  workLogId?: string;    // When completed, reference the work log
}

// System View Types
export interface SystemOverview {
  totalWorkLogs: number;
  activeGoals: number;
  peopleCount: number;
  healthScore: HealthScore;
  recentActivity: WorkLog[];
  upcomingDeadlines: Goal[];
  relationshipHealth: RelationshipHealth;
}

export interface RelationshipHealth {
  strongConnections: number;
  newConnections: number;
  interactionFrequency: number;
  relationshipScore: number;
}

// API Response Types
export interface FlowLedgerResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

// Query Types
export interface WorkLogQuery {
  startDate?: Date;
  endDate?: Date;
  categories?: WorkCategory[];
  outcomes?: WorkOutcome[];
  people?: string[];
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface InsightQuery {
  type: InsightType;
  timeRange: TimeRange;
  filters?: Record<string, any>;
}

export enum InsightType {
  HABIT_PATTERNS = 'habit_patterns',
  PRODUCTIVITY_TRENDS = 'productivity_trends',
  RELATIONSHIP_ANALYSIS = 'relationship_analysis',
  GOAL_PROGRESS = 'goal_progress',
  ENERGY_PATTERNS = 'energy_patterns',
  BLOCKER_ANALYSIS = 'blocker_analysis'
}

export enum TimeRange {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  ALL = 'all'
}

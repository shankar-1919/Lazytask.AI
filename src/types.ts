export type Priority = 'low' | 'medium' | 'high';

export interface SubTask {
  id: string;
  title: string;
  estimatedMinutes: number;
  isCompleted: boolean;
  tip?: string;
}

export interface Task {
  id: string;
  title: string;
  subject?: string;
  deadline: string; // ISO date string or YYYY-MM-DD
  deadlineTime?: string; // HH:mm
  priority: Priority;
  availableMinutes: number; // e.g. 30, 60, 120
  notes?: string;
  subtasks: SubTask[];
  createdAt: string;
  completedAt?: string;
  isCompleted: boolean;
}

export type Granularity = 'micro' | 'standard'; // micro = 5-10m baby steps; standard = 15-25m chunks

export interface TaskBreakdownDraft {
  title: string;
  estimatedMinutes: number;
  tip?: string;
}

export interface BreakdownResult {
  subtasks: TaskBreakdownDraft[];
  encouragement: string;
  source: 'demo-heuristic' | 'open-weight-llm';
}

export interface AIServiceSettings {
  mode: 'demo-heuristic' | 'open-weight-llm';
  endpointUrl: string; // e.g. http://localhost:11434/api/generate or custom endpoint
  modelName: string; // e.g. "llama3.2:1b" or "mistral"
}

export type NavigationTab = 'dashboard' | 'planner' | 'settings';

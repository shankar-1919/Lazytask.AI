import { AIServiceSettings, Task } from '../types';

const TASKS_STORAGE_KEY = 'lazytask_tasks_v1';
const SETTINGS_STORAGE_KEY = 'lazytask_settings_v1';

export function getSampleTasks(): Task[] {
  const now = new Date();
  
  // Due in 3 days
  const paperDueDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const paperDueStr = paperDueDate.toISOString().split('T')[0];

  // Due tomorrow
  const mathDueDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  const mathDueStr = mathDueDate.toISOString().split('T')[0];

  return [
    {
      id: 'sample-task-1',
      title: 'Research Paper on Renewable Energy',
      subject: 'Environmental Science',
      deadline: paperDueStr,
      deadlineTime: '17:00',
      priority: 'high',
      availableMinutes: 120,
      notes: '5 pages required with at least 3 peer-reviewed citations in APA format.',
      createdAt: new Date().toISOString(),
      isCompleted: false,
      subtasks: [
        {
          id: 'step-1-1',
          title: 'Open doc & write 3 questions you want to answer',
          estimatedMinutes: 10,
          isCompleted: true,
          tip: 'Starting with curiosity removes writing anxiety.',
        },
        {
          id: 'step-1-2',
          title: 'Find 2 scholarly sources on Google Scholar or JSTOR',
          estimatedMinutes: 20,
          isCompleted: false,
          tip: 'Skim the abstract first to see if it is relevant.',
        },
        {
          id: 'step-1-3',
          title: 'Draft bulleted outline for Intro, Body, Conclusion',
          estimatedMinutes: 25,
          isCompleted: false,
          tip: 'One key argument per body section.',
        },
        {
          id: 'step-1-4',
          title: 'Write a rough draft of the Introduction paragraph',
          estimatedMinutes: 30,
          isCompleted: false,
          tip: 'Do not edit while drafting. Keep forward momentum.',
        },
        {
          id: 'step-1-5',
          title: 'Review citations & compile bibliography list',
          estimatedMinutes: 15,
          isCompleted: false,
          tip: 'Paste links now so you do not lose them later.',
        },
      ],
    },
    {
      id: 'sample-task-2',
      title: 'Calculus Problem Set 4 (Optimization)',
      subject: 'Mathematics',
      deadline: mathDueStr,
      deadlineTime: '23:59',
      priority: 'medium',
      availableMinutes: 60,
      notes: 'Problems 12 through 18 from Chapter 4.2.',
      createdAt: new Date().toISOString(),
      isCompleted: false,
      subtasks: [
        {
          id: 'step-2-1',
          title: 'Clear desk and copy formulas onto a reference sheet',
          estimatedMinutes: 10,
          isCompleted: false,
          tip: 'A clean desk cuts mental fatigue significantly.',
        },
        {
          id: 'step-2-2',
          title: 'Solve problem 12 (the simplest one)',
          estimatedMinutes: 15,
          isCompleted: false,
          tip: 'Write out the constraint equation first.',
        },
        {
          id: 'step-2-3',
          title: 'Work on problems 13 and 14 with side notes',
          estimatedMinutes: 20,
          isCompleted: false,
          tip: 'Check your first derivative signs carefully.',
        },
        {
          id: 'step-2-4',
          title: 'Check answers and box final results with units',
          estimatedMinutes: 15,
          isCompleted: false,
          tip: 'Highlight any question to ask in recitation tomorrow.',
        },
      ],
    },
  ];
}

export function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) {
      const sample = getSampleTasks();
      saveTasksToStorage(sample);
      return sample;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return getSampleTasks();
  } catch (e) {
    console.error('Failed to load tasks from localStorage', e);
    return getSampleTasks();
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage', e);
  }
}

export function loadSettingsFromStorage(): AIServiceSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return {
        mode: 'demo-heuristic',
        endpointUrl: 'http://localhost:11434/api/generate',
        modelName: 'llama3.2',
      };
    }
    return JSON.parse(raw);
  } catch (e) {
    return {
      mode: 'demo-heuristic',
      endpointUrl: 'http://localhost:11434/api/generate',
      modelName: 'llama3.2',
    };
  }
}

export function saveSettingsToStorage(settings: AIServiceSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage', e);
  }
}

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Play,
  ListTodo,
  Sparkles,
  RotateCcw,
  Plus,
  Flame,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { SubTask, Task } from '../types';
import { TaskCard } from './TaskCard';

interface DashboardProps {
  tasks: Task[];
  onToggleTaskComplete: (taskId: string) => void;
  onToggleSubtaskComplete: (taskId: string, subtaskId: string) => void;
  onOpenBreakdown: (task: Task) => void;
  onStartTenMinutes: (task: Task, subtask?: SubTask) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenAddTask: () => void;
  onReloadSampleTasks: () => void;
}

type FilterOption = 'all' | 'today' | 'active' | 'completed';

export const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  onToggleTaskComplete,
  onToggleSubtaskComplete,
  onOpenBreakdown,
  onStartTenMinutes,
  onDeleteTask,
  onOpenAddTask,
  onReloadSampleTasks,
}) => {
  const [filter, setFilter] = useState<FilterOption>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const remainingTasks = totalTasks - completedTasks;

  // Subtasks statistics
  const totalSubtasks = tasks.reduce((acc, t) => acc + t.subtasks.length, 0);
  const completedSubtasks = tasks.reduce(
    (acc, t) => acc + t.subtasks.filter((s) => s.isCompleted).length,
    0
  );
  const overallProgress =
    totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.isCompleted;
    if (filter === 'active') return !task.isCompleted;
    if (filter === 'today') {
      return !task.isCompleted && task.deadline <= todayStr;
    }
    return true;
  });

  // Find the single highest-priority next step for the "Start with 10 minutes" hero card
  // Sort priority: high > medium > low, then earliest deadline
  const activeTasks = [...tasks].filter((t) => !t.isCompleted);
  activeTasks.sort((a, b) => {
    const pWeight = { high: 3, medium: 2, low: 1 };
    if (pWeight[b.priority] !== pWeight[a.priority]) {
      return pWeight[b.priority] - pWeight[a.priority];
    }
    return a.deadline.localeCompare(b.deadline);
  });

  const nextFocusTask = activeTasks[0];
  const nextFocusStep = nextFocusTask?.subtasks.find((s) => !s.isCompleted);

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* Welcome & Motivational Anchor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Today's Focus
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 mt-0.5">
            Break big assignments into tiny steps. Just start with 10 minutes.
          </p>
        </div>

        <button
          onClick={onOpenAddTask}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Assignment</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Metric 1: Remaining Tasks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Remaining
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {remainingTasks}
          </p>
          <p className="text-[11px] text-slate-700 mt-0.5 font-medium">
            tasks pending
          </p>
        </div>

        {/* Metric 2: Completed Tasks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Completed
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1 tabular-nums">
            {completedTasks}
          </p>
          <p className="text-[11px] text-slate-700 mt-0.5 font-medium">
            of {totalTasks} finished
          </p>
        </div>

        {/* Metric 3: Micro-Steps Completed */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Steps Done
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {completedSubtasks}
          </p>
          <p className="text-[11px] text-slate-700 mt-0.5 font-medium">
            {totalSubtasks} total steps
          </p>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2 tabular-nums">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            Overall Progress
          </span>
          <span className="text-blue-600 font-bold">{overallProgress}% Done</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* "Start with 10 minutes" Hero Starter Card (Feature 7) */}
      {nextFocusTask && nextFocusStep && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 sm:p-5 shadow-xs relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-md">
                  <Flame className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                  Momentum Starter
                </span>
                <span className="text-xs text-slate-700 font-medium">
                  {nextFocusTask.title}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                "{nextFocusStep.title}"
              </h3>
              {nextFocusStep.tip && (
                <p className="text-xs text-blue-900 italic max-w-lg">
                  💡 {nextFocusStep.tip}
                </p>
              )}
            </div>

            <button
              onClick={() => onStartTenMinutes(nextFocusTask, nextFocusStep)}
              className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start with 10 minutes</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filter === 'today'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Due Today
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filter === 'active'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            In Progress ({remainingTasks})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              filter === 'completed'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Completed ({completedTasks})
          </button>
        </div>

        <button
          onClick={onReloadSampleTasks}
          className="text-xs text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer"
          title="Reload sample student tasks"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Sample Tasks</span>
        </button>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-200 bg-white">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <ListTodo className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900">
            {filter === 'completed'
              ? 'No completed tasks yet'
              : filter === 'today'
              ? 'Nothing due today! Enjoy your breathing room.'
              : 'No tasks found'}
          </h4>
          <p className="text-xs text-slate-600 max-w-xs mx-auto mt-1 mb-4">
            {filter === 'completed'
              ? 'Check off steps and finish assignments to build your completed streak.'
              : 'Add your first overwhelming assignment and let LazyTask AI decompose it into small steps.'}
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={onOpenAddTask}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
            >
              Add New Task
            </button>
            <button
              onClick={onReloadSampleTasks}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Load Sample Tasks
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleTaskComplete={onToggleTaskComplete}
              onToggleSubtaskComplete={onToggleSubtaskComplete}
              onOpenBreakdown={onOpenBreakdown}
              onStartTenMinutes={onStartTenMinutes}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};

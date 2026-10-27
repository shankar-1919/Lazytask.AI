import React from 'react';
import {
  CalendarClock,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Play,
  ListTodo,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { SubTask, Task } from '../types';

interface DailyPlannerViewProps {
  tasks: Task[];
  onToggleTaskComplete: (taskId: string) => void;
  onToggleSubtaskComplete: (taskId: string, subtaskId: string) => void;
  onOpenBreakdown: (task: Task) => void;
  onStartTenMinutes: (task: Task, subtask?: SubTask) => void;
  onOpenAddTask: () => void;
}

export const DailyPlannerView: React.FC<DailyPlannerViewProps> = ({
  tasks,
  onToggleTaskComplete,
  onToggleSubtaskComplete,
  onOpenBreakdown,
  onStartTenMinutes,
  onOpenAddTask,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to calculate total remaining estimated minutes for a task
  const getRemainingMinutes = (task: Task) => {
    const incompleteSteps = task.subtasks.filter((s) => !s.isCompleted);
    if (incompleteSteps.length > 0) {
      return incompleteSteps.reduce((acc, s) => acc + s.estimatedMinutes, 0);
    }
    return task.availableMinutes || 30;
  };

  // Intelligent sorting algorithm:
  // 1. Completion status (incomplete first)
  // 2. Deadline urgency (overdue/today first)
  // 3. Priority weight (High=3, Medium=2, Low=1)
  // 4. Estimated duration (shorter first for quick wins)
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }

    // Compare deadlines
    if (a.deadline !== b.deadline) {
      return a.deadline.localeCompare(b.deadline);
    }

    // Compare priority
    const pWeight = { high: 3, medium: 2, low: 1 };
    if (pWeight[b.priority] !== pWeight[a.priority]) {
      return pWeight[b.priority] - pWeight[a.priority];
    }

    // Compare remaining duration
    return getRemainingMinutes(a) - getRemainingMinutes(b);
  });

  const activeTasks = sortedTasks.filter((t) => !t.isCompleted);
  const completedTasks = sortedTasks.filter((t) => t.isCompleted);

  // Group into: Today's Priorities, Upcoming, Completed
  const todayTasks = activeTasks.filter((t) => t.deadline <= todayStr);
  const upcomingTasks = activeTasks.filter((t) => t.deadline > todayStr);

  const totalTodayMinutes = todayTasks.reduce((acc, t) => acc + getRemainingMinutes(t), 0);
  const totalUpcomingMinutes = upcomingTasks.reduce((acc, t) => acc + getRemainingMinutes(t), 0);

  const formatHoursMins = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Smart Daily Planner
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 mt-0.5">
          Ordered by deadline, priority, and estimated duration to prevent overwhelm.
        </p>
      </div>

      {/* Daily Workload Analysis Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CalendarClock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Planned Focus Time Today
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {formatHoursMins(totalTodayMinutes)}
                </span>
                <span className="text-xs text-slate-700 font-medium">
                  across {todayTasks.length} urgent tasks
                </span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <p className="text-xs text-slate-700 font-medium">
              Upcoming Backlog: <span className="font-bold text-slate-900">{formatHoursMins(totalUpcomingMinutes)}</span>
            </p>
            <p className="text-[11px] text-blue-700 mt-0.5">
              💡 Work on the 1st step of item #1 to build flow.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1: Today's High Priority Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-600" />
            <span>Today's Focus Queue ({todayTasks.length})</span>
          </h3>
          <span className="text-xs text-slate-700 font-medium tabular-nums">
            {formatHoursMins(totalTodayMinutes)} estimated
          </span>
        </div>

        {todayTasks.length === 0 ? (
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/60 text-center">
            <p className="text-xs font-medium text-slate-700">
              No tasks due today. Check out upcoming assignments below or add one!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayTasks.map((task, idx) => {
              const nextStep = task.subtasks.find((s) => !s.isCompleted);
              const estMins = getRemainingMinutes(task);

              return (
                <div
                  key={task.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {task.subject && (
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              {task.subject}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              task.priority === 'high'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-slate-600" />
                      {formatHoursMins(estMins)}
                    </span>
                  </div>

                  {/* Immediate Next Step */}
                  {nextStep && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          onClick={() => onToggleSubtaskComplete(task.id, nextStep.id)}
                          className="w-4 h-4 rounded-full border border-slate-400 hover:border-blue-600 shrink-0 cursor-pointer"
                          aria-label="Complete step"
                        />
                        <p className="text-xs font-medium text-slate-800 truncate">
                          <span className="text-blue-700 font-semibold mr-1">Next:</span>
                          {nextStep.title}
                        </p>
                      </div>

                      <button
                        onClick={() => onStartTenMinutes(task, nextStep)}
                        className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>10m</span>
                      </button>
                    </div>
                  )}

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => onOpenBreakdown(task)}
                      className="text-blue-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ListTodo className="w-3.5 h-3.5" />
                      <span>
                        {task.subtasks.filter((s) => s.isCompleted).length} of {task.subtasks.length} steps done
                      </span>
                    </button>

                    <button
                      onClick={() => onToggleTaskComplete(task.id)}
                      className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                    >
                      Mark Finished
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Upcoming Deadlines */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-blue-600" />
          <span>Upcoming Assignments ({upcomingTasks.length})</span>
        </h3>

        {upcomingTasks.length === 0 ? (
          <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-center">
            <p className="text-xs text-slate-600">No upcoming tasks scheduled.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingTasks.map((task) => {
              const estMins = getRemainingMinutes(task);
              const nextStep = task.subtasks.find((s) => !s.isCompleted);

              return (
                <div
                  key={task.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-medium text-slate-700">
                          Due {task.deadline}
                        </span>
                        <span className="text-[10px] font-semibold uppercase text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                          {task.priority}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                    </div>

                    <button
                      onClick={() => onOpenBreakdown(task)}
                      className="text-xs text-blue-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>{task.subtasks.length} steps</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Completed */}
      {completedTasks.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Completed Tasks ({completedTasks.length})</span>
          </h3>
          <div className="space-y-2 opacity-75">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="line-through text-slate-700 font-medium">
                    {task.title}
                  </span>
                </div>
                <button
                  onClick={() => onToggleTaskComplete(task.id)}
                  className="text-slate-600 hover:text-slate-900 text-[11px] font-medium cursor-pointer"
                >
                  Undo
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

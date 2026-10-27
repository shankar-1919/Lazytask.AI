import React from 'react';
import { Clock, Play, ListTodo, Trash2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { SubTask, Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggleTaskComplete: (taskId: string) => void;
  onToggleSubtaskComplete: (taskId: string, subtaskId: string) => void;
  onOpenBreakdown: (task: Task) => void;
  onStartTenMinutes: (task: Task, subtask?: SubTask) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleTaskComplete,
  onToggleSubtaskComplete,
  onOpenBreakdown,
  onStartTenMinutes,
  onDeleteTask,
}) => {
  const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;
  const totalSubtasks = task.subtasks.length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  
  // Find the next incomplete subtask
  const nextStep = task.subtasks.find((s) => !s.isCompleted);

  // Format deadline friendly
  const formatDeadline = (dateStr: string) => {
    if (!dateStr) return { text: 'No deadline', isUrgent: false, isOverdue: false };
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)}d`, isUrgent: true, isOverdue: true };
    } else if (diffDays === 0) {
      return { text: 'Due Today', isUrgent: true, isOverdue: false };
    } else if (diffDays === 1) {
      return { text: 'Due Tomorrow', isUrgent: false, isOverdue: false };
    } else {
      return {
        text: `Due in ${diffDays} days (${target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
        isUrgent: false,
        isOverdue: false,
      };
    }
  };

  const deadlineInfo = formatDeadline(task.deadline);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'medium':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'low':
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all bg-white p-4 sm:p-5 shadow-xs ${
        task.isCompleted ? 'border-slate-200 opacity-75' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top row: Subject, Priority, Deadline */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 text-xs">
          {task.subject && (
            <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
              {task.subject}
            </span>
          )}
          <span
            className={`font-semibold uppercase tracking-wider text-[11px] px-2 py-0.5 rounded-md border ${getPriorityStyle(
              task.priority
            )}`}
          >
            {task.priority}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {deadlineInfo.isOverdue && <AlertCircle className="w-3.5 h-3.5 text-rose-600" />}
          <span
            className={`font-medium ${
              deadlineInfo.isOverdue
                ? 'text-rose-600 font-semibold'
                : deadlineInfo.isUrgent
                ? 'text-amber-700 font-semibold'
                : 'text-slate-700'
            }`}
          >
            {deadlineInfo.text}
          </span>
        </div>
      </div>

      {/* Title & Task Checkbox */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggleTaskComplete(task.id)}
          className="mt-0.5 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-blue-600 active:scale-95 transition-all"
          aria-label={task.isCompleted ? 'Mark as incomplete' : 'Mark task complete'}
        >
          {task.isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-50" />
          ) : (
            <Circle className="w-5 h-5 text-slate-400 hover:text-blue-600" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3
            className={`text-base font-semibold leading-snug break-words ${
              task.isCompleted ? 'line-through text-slate-600' : 'text-slate-900'
            }`}
          >
            {task.title}
          </h3>

          {task.notes && (
            <p className="text-xs text-slate-700 mt-1 line-clamp-2">{task.notes}</p>
          )}

          {/* Progress bar and step count */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-700 mb-1.5 font-medium tabular-nums">
              <span>
                {completedSubtasks} of {totalSubtasks} steps done
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Next step highlight box (Anti-inertia feature) */}
      {!task.isCompleted && nextStep && (
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            <span>Next Small Step</span>
            <span className="flex items-center gap-1 font-normal text-slate-700 lowercase">
              <Clock className="w-3 h-3" />
              {nextStep.estimatedMinutes} min
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onToggleSubtaskComplete(task.id, nextStep.id)}
              className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors"
              aria-label={`Mark step "${nextStep.title}" complete`}
            >
              <Circle className="w-4 h-4 text-slate-400 hover:text-blue-600" />
            </button>
            <p className="text-xs font-medium text-slate-800 flex-1 line-clamp-2">
              {nextStep.title}
            </p>
          </div>

          {nextStep.tip && (
            <p className="text-[11px] text-blue-700 mt-1.5 pl-9 italic">
              💡 {nextStep.tip}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenBreakdown(task)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <ListTodo className="w-3.5 h-3.5 text-blue-600" />
            <span>Steps ({task.subtasks.length})</span>
          </button>

          {!task.isCompleted && nextStep && (
            <button
              onClick={() => onStartTenMinutes(task, nextStep)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
              <span>Start 10m</span>
            </button>
          )}
        </div>

        <button
          onClick={() => onDeleteTask(task.id)}
          className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
          aria-label="Delete Task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

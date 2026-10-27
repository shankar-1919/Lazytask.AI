import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Play,
  CheckCircle2,
  Circle,
  HelpCircle,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { Granularity, SubTask, Task } from '../types';
import { generateTaskBreakdown } from '../services/aiBreakdownService';

interface TaskBreakdownModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onStartTenMinutes: (task: Task, subtask?: SubTask) => void;
}

export const TaskBreakdownModal: React.FC<TaskBreakdownModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onStartTenMinutes,
}) => {
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepMinutes, setNewStepMinutes] = useState(15);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [granularity, setGranularity] = useState<Granularity>('standard');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen || !task) return null;

  const completedCount = task.subtasks.filter((s) => s.isCompleted).length;
  const totalCount = task.subtasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const totalMinutes = task.subtasks.reduce((acc, s) => acc + s.estimatedMinutes, 0);

  const handleToggleStep = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
    );
    const allDone = updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.isCompleted);
    onUpdateTask({
      ...task,
      subtasks: updatedSubtasks,
      isCompleted: allDone,
      completedAt: allDone ? new Date().toISOString() : undefined,
    });
  };

  const handleDeleteStep = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.filter((s) => s.id !== subtaskId);
    onUpdateTask({
      ...task,
      subtasks: updatedSubtasks,
    });
  };

  const handleAddCustomStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepTitle.trim()) return;

    const newSubtask: SubTask = {
      id: `custom-step-${Date.now()}`,
      title: newStepTitle.trim(),
      estimatedMinutes: Number(newStepMinutes) || 10,
      isCompleted: false,
      tip: 'Do the smallest possible action to get started.',
    };

    onUpdateTask({
      ...task,
      subtasks: [...task.subtasks, newSubtask],
    });

    setNewStepTitle('');
    setNewStepMinutes(15);
  };

  const handleRegenerateWithAI = async () => {
    setIsRegenerating(true);
    setFeedbackMsg(null);
    try {
      const breakdown = await generateTaskBreakdown(
        task.title,
        task.priority,
        task.availableMinutes,
        granularity,
        task.subject,
        task.notes
      );

      const generatedSubtasks: SubTask[] = breakdown.subtasks.map((item, idx) => ({
        id: `ai-step-${Date.now()}-${idx}`,
        title: item.title,
        estimatedMinutes: item.estimatedMinutes,
        isCompleted: false,
        tip: item.tip,
      }));

      onUpdateTask({
        ...task,
        subtasks: generatedSubtasks,
        isCompleted: false,
      });

      setFeedbackMsg(`Generated ${generatedSubtasks.length} realistic steps! ${breakdown.encouragement}`);
    } catch (err) {
      console.error('Failed to regenerate breakdown', err);
      setFeedbackMsg('Could not re-generate steps. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-xl max-h-[90vh] rounded-t-3xl sm:rounded-2xl flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                Task Breakdown
              </span>
              <span className="text-xs text-slate-700">
                {task.subject || 'Assignment'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug">
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Progress Banner */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2 tabular-nums">
              <span>
                Progress: {completedCount} / {totalCount} Steps Completed
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-700 mt-2 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Est. Total: {totalMinutes} minutes
              </span>
              <span>
                {completedCount === totalCount && totalCount > 0
                  ? '🎉 All steps finished!'
                  : `${totalCount - completedCount} steps remaining`}
              </span>
            </div>
          </div>

          {feedbackMsg && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Subtasks List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Actionable Steps (3–8 steps)
            </h3>

            {task.subtasks.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl p-4">
                <p className="text-sm text-slate-600">No steps defined yet for this task.</p>
                <button
                  onClick={handleRegenerateWithAI}
                  disabled={isRegenerating}
                  className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all inline-flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Steps with AI</span>
                </button>
              </div>
            ) : (
              task.subtasks.map((step, index) => (
                <div
                  key={step.id}
                  className={`p-3 rounded-xl border transition-all ${
                    step.isCompleted
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleStep(step.id)}
                      className="mt-0.5 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      aria-label={step.isCompleted ? 'Mark step incomplete' : 'Mark step complete'}
                    >
                      {step.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-600 fill-blue-50" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400 hover:text-blue-600" />
                      )}
                    </button>

                    {/* Step Title & Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-sm font-medium leading-snug break-words ${
                            step.isCompleted ? 'line-through text-slate-600' : 'text-slate-900'
                          }`}
                        >
                          <span className="text-xs text-slate-600 font-bold mr-1.5">
                            {index + 1}.
                          </span>
                          {step.title}
                        </span>

                        <span className="shrink-0 text-xs text-slate-700 bg-slate-100 font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {step.estimatedMinutes}m
                        </span>
                      </div>

                      {step.tip && (
                        <p className="text-xs text-blue-800 mt-1.5 flex items-start gap-1">
                          <span className="font-semibold text-blue-700">Tip:</span>
                          <span>{step.tip}</span>
                        </p>
                      )}

                      {/* Step bottom actions */}
                      <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-slate-100">
                        {!step.isCompleted ? (
                          <button
                            onClick={() => {
                              onClose();
                              onStartTenMinutes(task, step);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 hover:underline cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-blue-600 text-blue-600" />
                            <span>Start 10 minutes on this</span>
                          </button>
                        ) : (
                          <span className="text-xs text-blue-800 font-medium">Completed</span>
                        )}

                        <button
                          onClick={() => handleDeleteStep(step.id)}
                          className="min-h-[32px] min-w-[32px] flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          aria-label="Remove step"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add a Custom Step form */}
          <form
            onSubmit={handleAddCustomStep}
            className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              placeholder="Add another small step..."
              value={newStepTitle}
              onChange={(e) => setNewStepTitle(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 text-slate-900 placeholder-slate-400"
            />
            <div className="flex items-center gap-2">
              <select
                value={newStepMinutes}
                onChange={(e) => setNewStepMinutes(Number(e.target.value))}
                className="px-2.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-blue-600"
              >
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
                <option value={20}>20 min</option>
                <option value={25}>25 min</option>
                <option value={30}>30 min</option>
              </select>
              <button
                type="submit"
                disabled={!newStepTitle.trim()}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-xl transition-all inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </form>

          {/* AI Re-generation controls */}
          <div className="p-3.5 rounded-2xl border border-blue-100 bg-blue-50/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>AI Decomposition Mode</span>
              </div>
              <span className="text-[10px] text-slate-700">Demo Heuristic / Local LLM</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGranularity('micro')}
                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  granularity === 'micro'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Micro Steps (5-10m)
              </button>
              <button
                type="button"
                onClick={() => setGranularity('standard')}
                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  granularity === 'standard'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Standard (15-25m)
              </button>
            </div>

            <button
              type="button"
              onClick={handleRegenerateWithAI}
              disabled={isRegenerating}
              className="w-full py-2.5 px-3 text-xs font-semibold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
              <span>{isRegenerating ? 'Decomposing task...' : 'Regenerate Steps with AI'}</span>
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

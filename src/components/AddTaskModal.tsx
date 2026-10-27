import React, { useState } from 'react';
import { X, Sparkles, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Granularity, Priority, SubTask, Task } from '../types';
import { generateTaskBreakdown } from '../services/aiBreakdownService';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Task) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [deadline, setDeadline] = useState(() => {
    // Default to tomorrow's date
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [priority, setPriority] = useState<Priority>('medium');
  const [availableMinutes, setAvailableMinutes] = useState(60);
  const [notes, setNotes] = useState('');
  const [autoBreakdown, setAutoBreakdown] = useState(true);
  const [granularity, setGranularity] = useState<Granularity>('standard');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const subjectSuggestions = ['Essay', 'Math', 'Science', 'Exam Prep', 'Reading', 'Project'];

  const setDeadlinePreset = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    setDeadline(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Please enter a task title to continue.');
      return;
    }
    if (!deadline) {
      setErrorMessage('Please select a deadline.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      let subtasks: SubTask[] = [];

      if (autoBreakdown) {
        const breakdown = await generateTaskBreakdown(
          title.trim(),
          priority,
          availableMinutes,
          granularity,
          subject.trim() || undefined,
          notes.trim() || undefined
        );

        subtasks = breakdown.subtasks.map((item, idx) => ({
          id: `step-${Date.now()}-${idx}`,
          title: item.title,
          estimatedMinutes: item.estimatedMinutes,
          isCompleted: false,
          tip: item.tip,
        }));
      } else {
        // Fallback default initial step so student still has an easy entry point
        subtasks = [
          {
            id: `step-${Date.now()}-0`,
            title: `Open workspace and gather notes for ${title.trim()}`,
            estimatedMinutes: 10,
            isCompleted: false,
            tip: 'Just opening the app or book is the biggest hurdle.',
          },
        ];
      }

      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: title.trim(),
        subject: subject.trim() || undefined,
        deadline,
        deadlineTime: deadlineTime || undefined,
        priority,
        availableMinutes,
        notes: notes.trim() || undefined,
        subtasks,
        createdAt: new Date().toISOString(),
        isCompleted: false,
      };

      onAddTask(newTask);
      onClose();
      // Reset form
      setTitle('');
      setSubject('');
      setNotes('');
      setAvailableMinutes(60);
      setPriority('medium');
    } catch (err) {
      console.error('Error creating task', err);
      setErrorMessage('Failed to decompose task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg max-h-[92vh] rounded-t-3xl sm:rounded-2xl flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add New Assignment</h2>
            <p className="text-xs text-slate-700">We'll help break it into small, realistic steps.</p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Assignment / Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chapter 4 Chemistry Problem Set, English Literature Essay"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Subject with Quick chips */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject / Topic (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Biology, History, Computer Science"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 text-slate-900 placeholder-slate-400 mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {subjectSuggestions.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setSubject(item)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
                    subject === item
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline & Time */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Deadline *
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="relative">
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 text-slate-900"
                />
              </div>
              <div>
                <input
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 text-slate-900"
                />
              </div>
            </div>

            {/* Quick date presets */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setDeadlinePreset(0)}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDeadlinePreset(1)}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setDeadlinePreset(3)}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
              >
                In 3 Days
              </button>
              <button
                type="button"
                onClick={() => setDeadlinePreset(7)}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
              >
                Next Week
              </button>
            </div>
          </div>

          {/* Priority & Available Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`py-2 text-xs font-semibold capitalize rounded-xl border transition-all cursor-pointer ${
                      priority === p
                        ? p === 'high'
                          ? 'bg-rose-50 border-rose-400 text-rose-700 ring-1 ring-rose-300'
                          : p === 'medium'
                          ? 'bg-amber-50 border-amber-400 text-amber-700 ring-1 ring-amber-300'
                          : 'bg-blue-50 border-blue-400 text-blue-700 ring-1 ring-blue-300'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Available Time
              </label>
              <select
                value={availableMinutes}
                onChange={(e) => setAvailableMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-blue-600"
              >
                <option value={15}>15 minutes (Quick micro session)</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
                <option value={180}>3+ hours</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Notes or Requirements (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 5 pages, citation style, specific rubric details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* Auto-Breakdown Toggle */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoBreakdown}
                onChange={(e) => setAutoBreakdown(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Auto-breakdown into 3–8 smaller actionable steps
                </span>
                <p className="text-[11px] text-slate-700 mt-0.5">
                  Generates realistic subtasks with time estimates and anti-procrastination tips.
                </p>
              </div>
            </label>

            {autoBreakdown && (
              <div className="pt-2 pl-6 flex items-center gap-2 border-t border-blue-200/50">
                <span className="text-[11px] text-slate-700 font-medium">Granularity:</span>
                <button
                  type="button"
                  onClick={() => setGranularity('micro')}
                  className={`px-2 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                    granularity === 'micro'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-white text-slate-600 hover:bg-blue-100'
                  }`}
                >
                  Micro Steps (5-10m)
                </button>
                <button
                  type="button"
                  onClick={() => setGranularity('standard')}
                  className={`px-2 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                    granularity === 'standard'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-white text-slate-600 hover:bg-blue-100'
                  }`}
                >
                  Standard (15-25m)
                </button>
              </div>
            )}
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Breaking down task...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Create & Breakdown Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

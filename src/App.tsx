import React, { useState, useEffect } from 'react';
import { AIServiceSettings, NavigationTab, SubTask, Task } from './types';
import {
  getSampleTasks,
  loadSettingsFromStorage,
  loadTasksFromStorage,
  saveSettingsToStorage,
  saveTasksToStorage,
} from './utils/storage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { DailyPlannerView } from './components/DailyPlannerView';
import { SettingsModal } from './components/SettingsModal';
import { AddTaskModal } from './components/AddTaskModal';
import { TaskBreakdownModal } from './components/TaskBreakdownModal';
import { TenMinuteSessionModal } from './components/TenMinuteSessionModal';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [settings, setSettings] = useState<AIServiceSettings>(() => loadSettingsFromStorage());
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  // Modals state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [breakdownTask, setBreakdownTask] = useState<Task | null>(null);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  // 10-minute session state
  const [sessionTask, setSessionTask] = useState<Task | null>(null);
  const [sessionSubtask, setSessionSubtask] = useState<SubTask | null>(null);
  const [isSessionOpen, setIsSessionOpen] = useState(false);

  // Synchronize tasks to local storage
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  // Synchronize settings to local storage
  useEffect(() => {
    saveSettingsToStorage(settings);
  }, [settings]);

  // Task Actions
  const handleAddTask = (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    if (breakdownTask?.id === updatedTask.id) {
      setBreakdownTask(updatedTask);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Delete this task and all its subtasks?')) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  const handleToggleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextComplete = !t.isCompleted;
          return {
            ...t,
            isCompleted: nextComplete,
            completedAt: nextComplete ? new Date().toISOString() : undefined,
            subtasks: t.subtasks.map((s) => ({ ...s, isCompleted: nextComplete })),
          };
        }
        return t;
      })
    );
  };

  const handleToggleSubtaskComplete = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
          );
          const allCompleted =
            updatedSubtasks.length > 0 && updatedSubtasks.every((s) => s.isCompleted);
          return {
            ...t,
            subtasks: updatedSubtasks,
            isCompleted: allCompleted,
            completedAt: allCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  // Open breakdown screen
  const handleOpenBreakdown = (task: Task) => {
    setBreakdownTask(task);
    setIsBreakdownOpen(true);
  };

  // Launch "Start with 10 minutes"
  const handleStartTenMinutes = (task: Task, subtask?: SubTask) => {
    setSessionTask(task);
    setSessionSubtask(subtask || null);
    setIsSessionOpen(true);
  };

  // Complete step inside 10-minute session
  const handleCompleteStepInSession = (taskId: string, subtaskId: string) => {
    handleToggleSubtaskComplete(taskId, subtaskId);
  };

  // Reset tasks to initial sample
  const handleReloadSampleTasks = () => {
    const samples = getSampleTasks();
    setTasks(samples);
  };

  // Clear all tasks
  const handleClearAllTasks = () => {
    setTasks([]);
  };

  // Import JSON backup
  const handleImportTasks = (importedTasks: Task[]) => {
    setTasks(importedTasks);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddTask={() => setIsAddTaskOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-4 sm:pt-6">
        {currentTab === 'dashboard' && (
          <Dashboard
            tasks={tasks}
            onToggleTaskComplete={handleToggleTaskComplete}
            onToggleSubtaskComplete={handleToggleSubtaskComplete}
            onOpenBreakdown={handleOpenBreakdown}
            onStartTenMinutes={handleStartTenMinutes}
            onDeleteTask={handleDeleteTask}
            onOpenAddTask={() => setIsAddTaskOpen(true)}
            onReloadSampleTasks={handleReloadSampleTasks}
          />
        )}

        {currentTab === 'planner' && (
          <DailyPlannerView
            tasks={tasks}
            onToggleTaskComplete={handleToggleTaskComplete}
            onToggleSubtaskComplete={handleToggleSubtaskComplete}
            onOpenBreakdown={handleOpenBreakdown}
            onStartTenMinutes={handleStartTenMinutes}
            onOpenAddTask={() => setIsAddTaskOpen(true)}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsModal
            settings={settings}
            onUpdateSettings={setSettings}
            onReloadSampleTasks={handleReloadSampleTasks}
            onClearAllTasks={handleClearAllTasks}
            tasks={tasks}
            onImportTasks={handleImportTasks}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddTask={() => setIsAddTaskOpen(true)}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onAddTask={handleAddTask}
      />

      {/* Task Breakdown Screen Modal */}
      <TaskBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        task={breakdownTask}
        onUpdateTask={handleUpdateTask}
        onStartTenMinutes={handleStartTenMinutes}
      />

      {/* 10-Minute Momentum Session Modal */}
      <TenMinuteSessionModal
        isOpen={isSessionOpen}
        onClose={() => setIsSessionOpen(false)}
        task={sessionTask}
        subtask={sessionSubtask}
        onCompleteStep={handleCompleteStepInSession}
      />
    </div>
  );
}

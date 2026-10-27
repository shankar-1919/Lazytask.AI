import React from 'react';
import { Plus, Sparkles, BookOpen } from 'lucide-react';
import { NavigationTab } from '../types';

interface HeaderProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAddTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab, onOpenAddTask }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand & Subtitle */}
        <div 
          onClick={() => onSelectTab('dashboard')} 
          className="cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
              L
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
                  LazyTask AI
                </h1>
                <span className="text-[10px] font-semibold tracking-wide text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-sm">
                  DEMO AI
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-tight">
                Make your next step easy.
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onSelectTab('planner')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                currentTab === 'planner'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily Planner
            </button>
            <button
              onClick={() => onSelectTab('settings')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                currentTab === 'settings'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Settings
            </button>
          </nav>

          <button
            onClick={onOpenAddTask}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-xs cursor-pointer"
            aria-label="Add New Task"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Add Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};

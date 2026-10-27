import React from 'react';
import { LayoutDashboard, CalendarDays, PlusCircle, Settings } from 'lucide-react';
import { NavigationTab } from '../types';

interface BottomNavProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAddTask: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab, onOpenAddTask }) => {
  return (
    <nav 
      aria-label="Mobile Navigation" 
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xs border-t border-slate-200"
    >
      <div className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-2">
        {/* Dashboard Tab */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors ${
            currentTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[11px] font-medium tracking-tight mt-1">Dashboard</span>
        </button>

        {/* Daily Planner Tab */}
        <button
          onClick={() => onSelectTab('planner')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors ${
            currentTab === 'planner' ? 'text-blue-600 font-bold' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          <span className="text-[11px] font-medium tracking-tight mt-1">Planner</span>
        </button>

        {/* Add Task Button */}
        <button
          onClick={onOpenAddTask}
          className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 text-blue-600 hover:text-blue-700 active:scale-95 transition-transform"
        >
          <PlusCircle className="w-6 h-6 stroke-[2.2]" />
          <span className="text-[11px] font-semibold tracking-tight mt-0.5">Add Task</span>
        </button>

        {/* Settings Tab */}
        <button
          onClick={() => onSelectTab('settings')}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors ${
            currentTab === 'settings' ? 'text-blue-600 font-bold' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[11px] font-medium tracking-tight mt-1">Settings</span>
        </button>
      </div>
    </nav>
  );
};

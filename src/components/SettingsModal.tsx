import React, { useState } from 'react';
import {
  Sparkles,
  Database,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Cpu,
} from 'lucide-react';
import { AIServiceSettings, Task } from '../types';

interface SettingsModalProps {
  settings: AIServiceSettings;
  onUpdateSettings: (newSettings: AIServiceSettings) => void;
  onReloadSampleTasks: () => void;
  onClearAllTasks: () => void;
  tasks: Task[];
  onImportTasks: (tasks: Task[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onReloadSampleTasks,
  onClearAllTasks,
  tasks,
  onImportTasks,
}) => {
  const [mode, setMode] = useState(settings.mode);
  const [endpointUrl, setEndpointUrl] = useState(settings.endpointUrl);
  const [modelName, setModelName] = useState(settings.modelName);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveAISettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      mode,
      endpointUrl,
      modelName,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus(null);
    try {
      const res = await fetch(endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelName,
          prompt: 'Respond with: {"status": "ok"}',
          stream: false,
          format: 'json',
        }),
      });

      if (res.ok) {
        setTestStatus('✅ Connection successful! Model responded.');
      } else {
        setTestStatus(`⚠️ Endpoint returned status: ${res.status}`);
      }
    } catch (err: any) {
      setTestStatus(`❌ Could not connect to ${endpointUrl}. Ensure your local server (Ollama/LM Studio) is running and CORS is enabled.`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `lazytask_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportTasks(parsed);
          alert('Tasks imported successfully!');
        } else {
          alert('Invalid JSON file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Settings & AI Configuration
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 mt-0.5">
          Configure task decomposition engine and manage your local data.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* AI Breakdown Architecture Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Task Breakdown Engine
              </h3>
              <p className="text-xs text-slate-700">
                How LazyTask turns big assignments into small steps
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
            {mode === 'demo-heuristic' ? 'Demo Mode' : 'Local LLM'}
          </span>
        </div>

        {/* Engine Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setMode('demo-heuristic')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              mode === 'demo-heuristic'
                ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900">
                Demo Heuristic Engine (Recommended)
              </span>
              {mode === 'demo-heuristic' && (
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Domain-tuned rules for student essays, problem sets, exam prep, and reading. Fast, private, and 100% offline.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setMode('open-weight-llm')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              mode === 'open-weight-llm'
                ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900">
                Local Open-Weight Model
              </span>
              {mode === 'open-weight-llm' && (
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Connect to your local Ollama, LM Studio, or vLLM server running Llama 3, Mistral, or Gemma.
            </p>
          </button>
        </div>

        {/* Local LLM Settings form (only when open-weight-llm selected) */}
        {mode === 'open-weight-llm' && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 mt-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Local Model API Endpoint
              </label>
              <input
                type="text"
                placeholder="http://localhost:11434/api/generate"
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600"
              />
              <p className="text-[11px] text-slate-600 mt-1">
                Default for Ollama is <code className="bg-slate-200 px-1 rounded">http://localhost:11434/api/generate</code>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Model Name
              </label>
              <input
                type="text"
                placeholder="llama3.2 or mistral or gemma2"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {testStatus && (
              <p className="text-xs p-2 rounded-lg bg-white border border-slate-200">
                {testStatus}
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleSaveAISettings}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
        >
          Save Engine Preferences
        </button>
      </div>

      {/* Local Storage & Data Management */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Data & Storage
            </h3>
            <p className="text-xs text-slate-700">
              Your tasks are stored locally in browser storage (offline first)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Reload Sample Tasks */}
          <button
            onClick={() => {
              if (confirm('Reload sample student tasks? This will restore the demo assignments.')) {
                onReloadSampleTasks();
              }
            }}
            className="p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-left transition-colors flex items-start gap-3 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-900">Reload Sample Tasks</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Restores the research paper and calculus problem set sample tasks.
              </p>
            </div>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-left transition-colors flex items-start gap-3 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-900">Export Backup</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Download your tasks and subtasks as a portable JSON file.
              </p>
            </div>
          </button>

          {/* Import JSON */}
          <label className="p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-left transition-colors flex items-start gap-3 cursor-pointer">
            <Upload className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-900">Import Tasks</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Upload a previously exported JSON task backup.
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </div>
          </label>

          {/* Clear All Tasks */}
          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear all tasks? This action cannot be undone.')) {
                onClearAllTasks();
              }
            }}
            className="p-3.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-left transition-colors flex items-start gap-3 cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-rose-700">Clear All Tasks</p>
              <p className="text-[11px] text-rose-600 mt-0.5">
                Permanently wipes all tasks from local browser storage.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Student Study Tips for Executive Dysfunction */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>The LazyTask Anti-Procrastination Philosophy</span>
        </h3>
        <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside leading-relaxed">
          <li>
            <strong>Lower the barrier to entry:</strong> If a task feels scary, break step 1 down until it feels embarrassingly easy (e.g. "open blank Google Doc").
          </li>
          <li>
            <strong>The 10-Minute Rule:</strong> Give yourself unconditional permission to stop after 10 minutes. 85% of task resistance disappears once you start.
          </li>
          <li>
            <strong>Don't edit while drafting:</strong> Perfectionism is procrastination in disguise. Make a terrible first draft, then refine it.
          </li>
        </ul>
      </div>
    </div>
  );
};

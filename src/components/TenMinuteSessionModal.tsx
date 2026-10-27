import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle2, Plus, Volume2, VolumeX } from 'lucide-react';
import { SubTask, Task } from '../types';

interface TenMinuteSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  subtask?: SubTask | null;
  onCompleteStep: (taskId: string, subtaskId: string) => void;
}

export const TenMinuteSessionModal: React.FC<TenMinuteSessionModalProps> = ({
  isOpen,
  onClose,
  task,
  subtask,
  onCompleteStep,
}) => {
  const INITIAL_SECONDS = 10 * 60; // 600s = 10 minutes
  const [secondsRemaining, setSecondsRemaining] = useState(INITIAL_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const playGentleChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      // AudioContext might be constrained before interaction
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining(INITIAL_SECONDS);
      setIsRunning(true);
      setIsFinished(false);
    } else {
      setIsRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [isOpen, task?.id, subtask?.id]);

  useEffect(() => {
    if (isRunning && secondsRemaining > 0) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            playGentleChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, secondsRemaining, soundEnabled]);

  if (!isOpen || !task) return null;

  const currentStep = subtask || task.subtasks.find((s) => !s.isCompleted) || task.subtasks[0];

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progress = ((INITIAL_SECONDS - secondsRemaining) / INITIAL_SECONDS) * 100;

  const handleAddMinutes = (mins: number) => {
    setSecondsRemaining((prev) => prev + mins * 60);
    if (!isRunning) setIsRunning(true);
    setIsFinished(false);
  };

  const handleStepDone = () => {
    if (currentStep) {
      onCompleteStep(task.id, currentStep.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-full transition-colors cursor-pointer"
          aria-label="Exit session"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sound toggle button */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="absolute top-4 left-4 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-full transition-colors cursor-pointer"
          aria-label={soundEnabled ? 'Mute chime' : 'Enable chime'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Badge & Title */}
        <span className="text-[11px] font-bold tracking-wider uppercase text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full mb-3 mt-1">
          10-Minute Momentum Session
        </span>

        <h3 className="text-sm font-semibold text-slate-600 line-clamp-1 mb-1">
          {task.title}
        </h3>

        {/* The single micro-step target */}
        <div className="w-full my-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left">
          <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-1">
            Focus strictly on this step:
          </p>
          <p className="text-sm font-semibold text-slate-900 leading-snug">
            {currentStep?.title || 'Open materials and write initial thoughts'}
          </p>
          {currentStep?.tip && (
            <p className="text-xs text-slate-600 mt-1 italic">
              💡 {currentStep.tip}
            </p>
          )}
        </div>

        {/* Big Clean Timer Display */}
        <div className="my-4">
          <div className="text-6xl font-extrabold text-slate-900 font-mono tracking-tighter tabular-nums">
            {timeFormatted}
          </div>
          <div className="w-48 h-1.5 bg-slate-100 rounded-full mx-auto mt-3 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Psychological Encouragement */}
        {!isFinished ? (
          <p className="text-xs text-slate-700 max-w-xs mb-6 leading-relaxed">
            Commit to just 10 minutes. If you want to stop when the timer rings, that is totally fine.
            Getting started breaks the friction!
          </p>
        ) : (
          <div className="mb-6 p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
            <p className="font-bold text-sm mb-1">🎉 10 Minutes Complete!</p>
            <p>You conquered the hardest part—starting! You have permission to stop, or keep riding the momentum.</p>
          </div>
        )}

        {/* Primary Controls */}
        <div className="flex items-center gap-3 w-full justify-center">
          <button
            onClick={() => setSecondsRemaining(INITIAL_SECONDS)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            aria-label="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex-1 max-w-[160px] h-12 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Resume</span>
              </>
            )}
          </button>

          <button
            onClick={() => handleAddMinutes(5)}
            className="min-h-[44px] px-3 flex items-center justify-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
            title="Add 5 minutes"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>5m</span>
          </button>
        </div>

        {/* Finish / Complete Step Button */}
        <div className="mt-5 pt-4 border-t border-slate-100 w-full flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
          >
            Pause & Return
          </button>

          <button
            onClick={handleStepDone}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Mark Step Complete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

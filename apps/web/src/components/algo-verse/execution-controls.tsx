'use client';

import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExecutionControlsProps {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  disabled?: boolean;
}

export function ExecutionControls({
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange,
  disabled = false,
}: ExecutionControlsProps) {
  const canStepForward = currentStep < totalSteps - 1;
  const canStepBackward = currentStep > 0;

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl border border-border bg-card">
      {/* Progress Info */}
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="font-semibold text-foreground">
            Step {currentStep + 1}
          </span>
          <span className="text-muted-foreground"> / {totalSteps}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Speed: {speed}x
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-border rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary"
          initial={{ width: 0 }}
          animate={{ 
            width: `${((currentStep + 1) / totalSteps) * 100}%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-2">
        {/* Step Backward */}
        <button
          onClick={onStepBackward}
          disabled={disabled || !canStepBackward}
          className="p-2 rounded-lg border border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Step Backward"
        >
          <SkipBack className="w-5 h-5 text-foreground" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={disabled || (!canStepForward && !isPlaying)}
          className="p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-primary-foreground" fill="white" />
          ) : (
            <Play className="w-6 h-6 text-primary-foreground" fill="white" />
          )}
        </button>

        {/* Step Forward */}
        <button
          onClick={onStepForward}
          disabled={disabled || !canStepForward}
          className="p-2 rounded-lg border border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Step Forward"
        >
          <SkipForward className="w-5 h-5 text-foreground" />
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          disabled={disabled || currentStep === 0}
          className="p-2 rounded-lg border border-input hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Speed Control */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Playback Speed
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-8">0.5x</span>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.25"
            value={speed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            disabled={disabled}
            className="flex-1 h-2 bg-border rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
          <span className="text-xs text-muted-foreground w-8">2x</span>
        </div>
      </div>
    </div>
  );
}

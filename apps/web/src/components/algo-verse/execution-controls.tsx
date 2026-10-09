'use client';

import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';
import { Panel } from '@/components/layout';
import { Button } from '@/components/ui/button';
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
    <Panel padding="sm" bodyClassName="flex flex-col gap-4">
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
        <Button variant="outline" size="icon" onClick={onStepBackward} disabled={disabled || !canStepBackward} aria-label="Step backward" title="Step backward">
          <SkipBack />
        </Button>

        {/* Play/Pause */}
        <Button
          size="icon-lg"
          onClick={isPlaying ? onPause : onPlay}
          disabled={disabled || (!canStepForward && !isPlaying)}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
        </Button>

        {/* Step Forward */}
        <Button variant="outline" size="icon" onClick={onStepForward} disabled={disabled || !canStepForward} aria-label="Step forward" title="Step forward">
          <SkipForward />
        </Button>

        {/* Reset */}
        <Button variant="outline" size="icon" onClick={onReset} disabled={disabled || currentStep === 0} aria-label="Reset" title="Reset">
          <RotateCcw />
        </Button>
      </div>

      {/* Speed Control */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Playback Speed
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-8">0.5x</span>
          <input /* layout-exempt: native range input, single use, no slider primitive */
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
    </Panel>
  );
}

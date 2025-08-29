import { TimerStatus } from '../types/timer';

interface TimerControlsProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function TimerControls({ status, onStart, onPause, onReset }: TimerControlsProps) {
  const isRunning = status === TimerStatus.RUNNING;
  const startPauseText = isRunning ? 'Pause' : 'Start';
  const startPauseHandler = isRunning ? onPause : onStart;

  return (
    <div className="timer-controls">
      <button 
        className="control-button start-pause" 
        onClick={startPauseHandler}
      >
        {startPauseText}
      </button>
      <button 
        className="control-button reset" 
        onClick={onReset}
      >
        Reset
      </button>
    </div>
  );
}
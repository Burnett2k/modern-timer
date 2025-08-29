export interface TimerState {
  hours: number;
  minutes: number;
  seconds: number;
  isRunning: boolean;
  isCompleted: boolean;
}

export interface TimerSettings {
  defaultHours: number;
  defaultMinutes: number;
  defaultSeconds: number;
}

export enum TimerStatus {
  STOPPED = 'stopped',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed'
}
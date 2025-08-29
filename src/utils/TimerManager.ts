import type { TimerState } from '../types/timer';
import { TimerStatus } from '../types/timer';

const MESSAGE_TYPES = {
  START_TIMER: 'START_TIMER',
  PAUSE_TIMER: 'PAUSE_TIMER',
  RESET_TIMER: 'RESET_TIMER',
  GET_STATUS: 'GET_STATUS',
  SET_TIME: 'SET_TIME',
  TIMER_TICK: 'TIMER_TICK',
  TIMER_STATUS: 'TIMER_STATUS',
  TIMER_COMPLETE: 'TIMER_COMPLETE'
} as const;

interface TimerSettings {
  hours?: number;
  minutes?: number;
  seconds?: number;
}

interface WorkerTimerPayload {
  hours: number;
  minutes: number;
  seconds: number;
  isRunning: boolean;
  isPaused?: boolean;
  isCompleted: boolean;
  remainingSeconds: number;
}

interface WorkerMessage {
  type: keyof typeof MESSAGE_TYPES;
  payload: WorkerTimerPayload;
}

export class TimerManager {
  private serviceWorker: Worker | null = null;
  private currentTimerState: TimerState = {
    hours: 0,
    minutes: 25,
    seconds: 0,
    isRunning: false,
    isCompleted: false
  };

  private onTickCallback?: (state: TimerState) => void;
  private onCompleteCallback?: () => void;
  private onStatusChangeCallback?: (status: TimerStatus) => void;

  constructor() {
    this.initializeServiceWorker();
  }

  private async initializeServiceWorker(): Promise<void> {
    try {
      // Use Vite's proper worker import syntax for TypeScript workers
      this.serviceWorker = new Worker(
        new URL('../workers/timer-worker.ts', import.meta.url),
        { type: 'module' }
      );
      
      this.serviceWorker.addEventListener('message', this.handleWorkerMessage.bind(this));
      this.serviceWorker.addEventListener('error', this.handleWorkerError.bind(this));
    } catch (error) {
      console.error('Failed to initialize timer service worker:', error);
      throw new Error('Timer service worker initialization failed');
    }
  }

  private handleWorkerMessage = (event: MessageEvent<WorkerMessage>): void => {
    const { type, payload } = event.data;

    switch (type) {
      case MESSAGE_TYPES.TIMER_TICK:
        this.updateTimerState(payload);
        if (this.onTickCallback) {
          this.onTickCallback(this.currentTimerState);
        }
        break;

      case MESSAGE_TYPES.TIMER_STATUS:
        this.updateTimerState(payload);
        if (this.onStatusChangeCallback) {
          this.onStatusChangeCallback(this.getTimerStatus());
        }
        break;

      case MESSAGE_TYPES.TIMER_COMPLETE:
        this.updateTimerState(payload);
        if (this.onCompleteCallback) {
          this.onCompleteCallback();
        }
        if (this.onStatusChangeCallback) {
          this.onStatusChangeCallback(TimerStatus.COMPLETED);
        }
        break;

      default:
        console.warn('Unknown worker message type:', type);
    }
  };

  private handleWorkerError = (error: ErrorEvent): void => {
    console.error('Timer service worker error:', error);
  };

  private updateTimerState(payload: WorkerTimerPayload): void {
    this.currentTimerState = {
      hours: payload.hours,
      minutes: payload.minutes,
      seconds: payload.seconds,
      isRunning: payload.isRunning,
      isCompleted: payload.isCompleted
    };
  }

  private sendMessageToWorker(type: keyof typeof MESSAGE_TYPES, payload?: TimerSettings): void {
    if (!this.serviceWorker) {
      throw new Error('Timer service worker not initialized');
    }
    this.serviceWorker.postMessage({ type, payload });
  }

  public startTimer(settings?: TimerSettings): void {
    this.sendMessageToWorker(MESSAGE_TYPES.START_TIMER, settings);
  }

  public pauseTimer(): void {
    this.sendMessageToWorker(MESSAGE_TYPES.PAUSE_TIMER);
  }

  public resetTimer(settings?: TimerSettings): void {
    this.sendMessageToWorker(MESSAGE_TYPES.RESET_TIMER, settings);
  }

  public setTimerDuration(settings: TimerSettings): void {
    this.sendMessageToWorker(MESSAGE_TYPES.SET_TIME, settings);
  }

  public getCurrentState(): TimerState {
    return { ...this.currentTimerState };
  }

  public getTimerStatus(): TimerStatus {
    if (this.currentTimerState.isCompleted) {
      return TimerStatus.COMPLETED;
    }
    if (this.currentTimerState.isRunning) {
      return TimerStatus.RUNNING;
    }
    // Check if we have paused time (this would need to be tracked)
    return TimerStatus.STOPPED;
  }

  public getFormattedTimeString(): string {
    const { hours, minutes, seconds } = this.currentTimerState;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  public onTick(callback: (state: TimerState) => void): void {
    this.onTickCallback = callback;
  }

  public onComplete(callback: () => void): void {
    this.onCompleteCallback = callback;
  }

  public onStatusChange(callback: (status: TimerStatus) => void): void {
    this.onStatusChangeCallback = callback;
  }

  public requestCurrentStatus(): void {
    this.sendMessageToWorker(MESSAGE_TYPES.GET_STATUS);
  }

  public destroy(): void {
    if (this.serviceWorker) {
      this.serviceWorker.terminate();
      this.serviceWorker = null;
    }
    this.onTickCallback = undefined;
    this.onCompleteCallback = undefined;
    this.onStatusChangeCallback = undefined;
  }
}
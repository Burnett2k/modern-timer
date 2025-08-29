// Timer Service Worker with TypeScript types and clear constants

// Message type constants
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

// Timer constants
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_MINUTE = 60;
const MILLISECONDS_IN_SECOND = 1000;
const TIMER_INTERVAL_MS = 1000;

// Default timer values
const DEFAULT_TIMER = {
  HOURS: 0,
  MINUTES: 25,
  SECONDS: 0
} as const;

// Types
interface TimerSettings {
  hours?: number;
  minutes?: number;
  seconds?: number;
}

interface TimerPayload {
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
  payload?: TimerSettings;
}

interface TimerState {
  timerStartTimestamp: number;
  totalDurationInSeconds: number;
  isCurrentlyRunning: boolean;
  isCurrentlyPaused: boolean;
  pausedTimeRemainingInSeconds: number;
}

interface TimeObject {
  hours: number;
  minutes: number;
  seconds: number;
}

let intervalTimerId: NodeJS.Timeout | null = null;
let timerState: TimerState = {
  timerStartTimestamp: 0,
  totalDurationInSeconds: 0,
  isCurrentlyRunning: false,
  isCurrentlyPaused: false,
  pausedTimeRemainingInSeconds: 0
};

// Listen for messages from the main thread
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case MESSAGE_TYPES.START_TIMER:
      startTimerWithSettings(payload || {});
      break;
    case MESSAGE_TYPES.PAUSE_TIMER:
      pauseCurrentTimer();
      break;
    case MESSAGE_TYPES.RESET_TIMER:
      resetTimerWithSettings(payload || {});
      break;
    case MESSAGE_TYPES.GET_STATUS:
      sendCurrentTimerStatus();
      break;
    case MESSAGE_TYPES.SET_TIME:
      setTimerDuration(payload || {});
      break;
    default:
      console.warn('Unknown message type:', type);
  }
});

function startTimerWithSettings({ 
  hours = DEFAULT_TIMER.HOURS, 
  minutes = DEFAULT_TIMER.MINUTES, 
  seconds = DEFAULT_TIMER.SECONDS 
}: TimerSettings): void {
  if (timerState.isCurrentlyRunning) return;
  
  const totalSecondsRequested: number = convertTimeToSeconds(hours, minutes, seconds);
  
  // Use paused time if available, otherwise use full duration
  const remainingSecondsToCount: number = timerState.pausedTimeRemainingInSeconds > 0 
    ? timerState.pausedTimeRemainingInSeconds 
    : totalSecondsRequested;
  
  if (remainingSecondsToCount <= 0) {
    sendTimerCompleteMessage();
    return;
  }
  
  timerState.timerStartTimestamp = Date.now();
  timerState.totalDurationInSeconds = remainingSecondsToCount;
  timerState.isCurrentlyRunning = true;
  timerState.isCurrentlyPaused = false;
  timerState.pausedTimeRemainingInSeconds = 0;
  
  // Clear any existing timer interval
  if (intervalTimerId) {
    clearInterval(intervalTimerId);
  }
  
  // Use setInterval for consistent timing
  intervalTimerId = setInterval(() => {
    const elapsedTimeInSeconds: number = Math.floor((Date.now() - timerState.timerStartTimestamp) / MILLISECONDS_IN_SECOND);
    const remainingSecondsOnTimer: number = Math.max(0, timerState.totalDurationInSeconds - elapsedTimeInSeconds);
    
    if (remainingSecondsOnTimer <= 0) {
      completeTimerAndStop();
      return;
    }
    
    // Send tick update to main thread
    sendTimerTickMessage(remainingSecondsOnTimer);
  }, TIMER_INTERVAL_MS);
  
  // Send initial status
  sendTimerTickMessage(remainingSecondsToCount);
}

function pauseCurrentTimer(): void {
  if (!timerState.isCurrentlyRunning) return;
  
  const elapsedTimeInSeconds: number = Math.floor((Date.now() - timerState.timerStartTimestamp) / MILLISECONDS_IN_SECOND);
  timerState.pausedTimeRemainingInSeconds = Math.max(0, timerState.totalDurationInSeconds - elapsedTimeInSeconds);
  timerState.isCurrentlyRunning = false;
  timerState.isCurrentlyPaused = true;
  
  if (intervalTimerId) {
    clearInterval(intervalTimerId);
    intervalTimerId = null;
  }
  
  sendCurrentTimerStatus();
}

function resetTimerWithSettings({ 
  hours = DEFAULT_TIMER.HOURS, 
  minutes = DEFAULT_TIMER.MINUTES, 
  seconds = DEFAULT_TIMER.SECONDS 
}: TimerSettings): void {
  if (intervalTimerId) {
    clearInterval(intervalTimerId);
    intervalTimerId = null;
  }
  
  timerState = {
    timerStartTimestamp: 0,
    totalDurationInSeconds: convertTimeToSeconds(hours, minutes, seconds),
    isCurrentlyRunning: false,
    isCurrentlyPaused: false,
    pausedTimeRemainingInSeconds: 0
  };
  
  sendCurrentTimerStatus();
}

function setTimerDuration({ 
  hours = DEFAULT_TIMER.HOURS, 
  minutes = DEFAULT_TIMER.MINUTES, 
  seconds = DEFAULT_TIMER.SECONDS 
}: TimerSettings): void {
  if (timerState.isCurrentlyRunning) return; // Cannot change time while running
  
  timerState.totalDurationInSeconds = convertTimeToSeconds(hours, minutes, seconds);
  timerState.pausedTimeRemainingInSeconds = 0;
  timerState.isCurrentlyPaused = false;
  
  sendCurrentTimerStatus();
}

function completeTimerAndStop(): void {
  if (intervalTimerId) {
    clearInterval(intervalTimerId);
    intervalTimerId = null;
  }
  
  timerState.isCurrentlyRunning = false;
  timerState.isCurrentlyPaused = false;
  timerState.pausedTimeRemainingInSeconds = 0;
  
  sendTimerCompleteMessage();
}

function getCurrentRemainingSeconds(): number {
  if (!timerState.isCurrentlyRunning && timerState.pausedTimeRemainingInSeconds > 0) {
    return timerState.pausedTimeRemainingInSeconds;
  }
  
  if (!timerState.isCurrentlyRunning) {
    return timerState.totalDurationInSeconds;
  }
  
  const elapsedTimeInSeconds: number = Math.floor((Date.now() - timerState.timerStartTimestamp) / MILLISECONDS_IN_SECOND);
  return Math.max(0, timerState.totalDurationInSeconds - elapsedTimeInSeconds);
}

function convertTimeToSeconds(hours: number, minutes: number, seconds: number): number {
  return hours * SECONDS_IN_HOUR + minutes * SECONDS_IN_MINUTE + seconds;
}

function convertSecondsToTimeObject(totalSecondsToConvert: number): TimeObject {
  const hours: number = Math.floor(totalSecondsToConvert / SECONDS_IN_HOUR);
  const minutes: number = Math.floor((totalSecondsToConvert % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE);
  const seconds: number = totalSecondsToConvert % SECONDS_IN_MINUTE;
  return { hours, minutes, seconds };
}

function sendTimerTickMessage(remainingSecondsOnTimer: number): void {
  const { hours, minutes, seconds }: TimeObject = convertSecondsToTimeObject(remainingSecondsOnTimer);
  
  self.postMessage({
    type: MESSAGE_TYPES.TIMER_TICK,
    payload: {
      hours,
      minutes,
      seconds,
      isRunning: timerState.isCurrentlyRunning,
      isCompleted: remainingSecondsOnTimer <= 0,
      remainingSeconds: remainingSecondsOnTimer
    }
  });
}

function sendCurrentTimerStatus(): void {
  const remainingSecondsOnTimer: number = getCurrentRemainingSeconds();
  const { hours, minutes, seconds }: TimeObject = convertSecondsToTimeObject(remainingSecondsOnTimer);
  
  self.postMessage({
    type: MESSAGE_TYPES.TIMER_STATUS,
    payload: {
      hours,
      minutes,
      seconds,
      isRunning: timerState.isCurrentlyRunning,
      isPaused: timerState.isCurrentlyPaused,
      isCompleted: remainingSecondsOnTimer <= 0,
      remainingSeconds: remainingSecondsOnTimer
    }
  });
}

function sendTimerCompleteMessage(): void {
  self.postMessage({
    type: MESSAGE_TYPES.TIMER_COMPLETE,
    payload: {
      hours: 0,
      minutes: 0,
      seconds: 0,
      isRunning: false,
      isPaused: false,
      isCompleted: true,
      remainingSeconds: 0
    }
  });
}
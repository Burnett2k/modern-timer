const STORAGE_KEYS = {
  TIMER_PREFERENCES: 'modern-timer-preferences',
  TIMER_STATE: 'modern-timer-state'
} as const;

export interface TimerPreferences {
  preferredDurationSeconds: number;
  sessionGoal: string;
  isMuted?: boolean;
}

export interface TimerState {
  timeRemaining: number;
  userSetDuration: number;
  isCompleted: boolean;
  status: string;
  sessionGoal: string;
  lastUpdated: number;
}

export const loadPreferences = (): TimerPreferences => {
  try {
    const storedPreferences = localStorage.getItem(STORAGE_KEYS.TIMER_PREFERENCES);
    if (storedPreferences) {
      return JSON.parse(storedPreferences);
    }
  } catch (error) {
    console.warn('Failed to load preferences from localStorage:', error);
  }
  
  // Return defaults
  return {
    preferredDurationSeconds: 25 * 60, // 25 minutes
    sessionGoal: '',
    isMuted: false
  };
};

export const savePreferences = (preferences: TimerPreferences): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TIMER_PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save preferences to localStorage:', error);
  }
};

export const loadTimerState = (): TimerState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TIMER_STATE);
    if (stored) {
      const state = JSON.parse(stored);
      // Check if state is recent (within last hour to avoid stale data)
      const oneHour = 60 * 60 * 1000;
      if (Date.now() - state.lastUpdated < oneHour) {
        return state;
      }
    }
  } catch (error) {
    console.warn('Failed to load timer state from localStorage:', error);
  }
  
  return null;
};

export const saveTimerState = (state: TimerState): void => {
  try {
    const stateWithTimestamp = {
      ...state,
      lastUpdated: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(stateWithTimestamp));
  } catch (error) {
    console.warn('Failed to save timer state to localStorage:', error);
  }
};

export const clearTimerState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
  } catch (error) {
    console.warn('Failed to clear timer state from localStorage:', error);
  }
};
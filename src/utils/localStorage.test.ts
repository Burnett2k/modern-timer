import { 
  loadPreferences, 
  savePreferences, 
  loadTimerState, 
  saveTimerState, 
  clearTimerState,
  TimerPreferences,
  TimerState
} from './localStorage';

// Simple localStorage mock - just verify methods are called
const mockGetItem = jest.fn();
const mockSetItem = jest.fn();
const mockRemoveItem = jest.fn();

Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: mockGetItem,
    setItem: mockSetItem,
    removeItem: mockRemoveItem
  },
  writable: true
});

describe('localStorage utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadPreferences', () => {
    test('calls localStorage.getItem with correct key', () => {
      mockGetItem.mockReturnValue(null);
      
      loadPreferences();
      
      expect(mockGetItem).toHaveBeenCalledWith('modern-timer-preferences');
    });

    test('returns default preferences when localStorage is empty', () => {
      mockGetItem.mockReturnValue(null);
      
      const preferences = loadPreferences();
      
      expect(preferences).toEqual({
        preferredDurationSeconds: 25 * 60,
        sessionGoal: '',
        isMuted: false
      });
    });

    test('returns parsed preferences when they exist', () => {
      const storedPrefs: TimerPreferences = {
        preferredDurationSeconds: 30 * 60,
        sessionGoal: 'Test session',
        isMuted: true
      };
      
      mockGetItem.mockReturnValue(JSON.stringify(storedPrefs));
      
      const preferences = loadPreferences();
      
      expect(preferences).toEqual(storedPrefs);
    });

    test('returns defaults when JSON parsing fails', () => {
      mockGetItem.mockReturnValue('invalid json');
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const preferences = loadPreferences();
      
      expect(preferences).toEqual({
        preferredDurationSeconds: 25 * 60,
        sessionGoal: '',
        isMuted: false
      });
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('savePreferences', () => {
    test('calls localStorage.setItem with correct key and value', () => {
      const preferences: TimerPreferences = {
        preferredDurationSeconds: 45 * 60,
        sessionGoal: 'Focus session',
        isMuted: false
      };
      
      savePreferences(preferences);
      
      expect(mockSetItem).toHaveBeenCalledWith(
        'modern-timer-preferences',
        JSON.stringify(preferences)
      );
    });
  });

  describe('loadTimerState', () => {
    test('calls localStorage.getItem with correct key', () => {
      mockGetItem.mockReturnValue(null);
      
      loadTimerState();
      
      expect(mockGetItem).toHaveBeenCalledWith('modern-timer-state');
    });

    test('returns null when no timer state is stored', () => {
      mockGetItem.mockReturnValue(null);
      
      const state = loadTimerState();
      
      expect(state).toBeNull();
    });

    test('returns parsed timer state when it exists and is recent', () => {
      const recentState: TimerState = {
        timeRemaining: 1200,
        userSetDuration: 1500,
        isCompleted: false,
        status: 'RUNNING',
        sessionGoal: 'Test session',
        lastUpdated: Date.now() - 30000 // 30 seconds ago
      };
      
      mockGetItem.mockReturnValue(JSON.stringify(recentState));
      
      const state = loadTimerState();
      
      expect(state).toEqual(recentState);
    });
  });

  describe('saveTimerState', () => {
    test('calls localStorage.setItem with correct key', () => {
      const state: TimerState = {
        timeRemaining: 900,
        userSetDuration: 1500,
        isCompleted: false,
        status: 'PAUSED',
        sessionGoal: 'Work session',
        lastUpdated: 0
      };
      
      saveTimerState(state);
      
      expect(mockSetItem).toHaveBeenCalledWith(
        'modern-timer-state',
        expect.any(String)
      );
    });
  });

  describe('clearTimerState', () => {
    test('calls localStorage.removeItem with correct key', () => {
      clearTimerState();
      
      expect(mockRemoveItem).toHaveBeenCalledWith('modern-timer-state');
    });
  });
});
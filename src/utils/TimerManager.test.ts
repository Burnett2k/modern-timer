import { TimerManager } from './TimerManager';
import { TimerStatus } from '../types/timer';

// Mock Worker class
class MockWorker {
  private messageHandlers: ((event: MessageEvent) => void)[] = [];
  private errorHandlers: ((event: ErrorEvent) => void)[] = [];

  constructor(public url: string) {}

  addEventListener(type: 'message' | 'error', handler: any): void {
    if (type === 'message') {
      this.messageHandlers.push(handler);
    } else if (type === 'error') {
      this.errorHandlers.push(handler);
    }
  }

  postMessage(data: any): void {
    // Store the last message for testing
    (this as any).lastMessage = data;
  }

  terminate(): void {
    this.messageHandlers = [];
    this.errorHandlers = [];
  }

  // Test helper methods
  simulateMessage(type: string, payload: any): void {
    const event = { data: { type, payload } } as MessageEvent;
    this.messageHandlers.forEach(handler => handler(event));
  }

  simulateError(error: string): void {
    const event = { message: error } as ErrorEvent;
    this.errorHandlers.forEach(handler => handler(event));
  }

  getLastMessage(): any {
    return (this as any).lastMessage;
  }
}

// Mock global Worker
const originalWorker = global.Worker;
beforeAll(() => {
  (global as any).Worker = MockWorker;
});

afterAll(() => {
  global.Worker = originalWorker;
});

describe('TimerManager', () => {
  let timerManager: TimerManager;
  let mockWorker: MockWorker;

  beforeEach(async () => {
    timerManager = new TimerManager();
    // Wait for initialization
    await new Promise(resolve => setTimeout(resolve, 0));
    mockWorker = (timerManager as any).serviceWorker as MockWorker;
  });

  afterEach(() => {
    timerManager.destroy();
  });

  describe('Initialization', () => {
    test('should initialize with default timer state', () => {
      const initialState = timerManager.getCurrentState();
      
      expect(initialState.hours).toBe(0);
      expect(initialState.minutes).toBe(25);
      expect(initialState.seconds).toBe(0);
      expect(initialState.isRunning).toBe(false);
      expect(initialState.isCompleted).toBe(false);
    });

    test('should create service worker with correct URL', () => {
      expect(mockWorker.url).toBe('/timer-worker.js');
    });
  });

  describe('Timer Controls', () => {
    test('should send START_TIMER message when starting timer', () => {
      timerManager.startTimer({ hours: 0, minutes: 30, seconds: 0 });
      
      const lastMessage = mockWorker.getLastMessage();
      expect(lastMessage.type).toBe('START_TIMER');
      expect(lastMessage.payload).toEqual({ hours: 0, minutes: 30, seconds: 0 });
    });

    test('should send START_TIMER message with no payload when starting with defaults', () => {
      timerManager.startTimer();
      
      const lastMessage = mockWorker.getLastMessage();
      expect(lastMessage.type).toBe('START_TIMER');
      expect(lastMessage.payload).toBeUndefined();
    });

    test('should send PAUSE_TIMER message when pausing timer', () => {
      timerManager.pauseTimer();
      
      const lastMessage = mockWorker.getLastMessage();
      expect(lastMessage.type).toBe('PAUSE_TIMER');
    });

    test('should send RESET_TIMER message when resetting timer', () => {
      timerManager.resetTimer({ hours: 1, minutes: 0, seconds: 0 });
      
      const lastMessage = mockWorker.getLastMessage();
      expect(lastMessage.type).toBe('RESET_TIMER');
      expect(lastMessage.payload).toEqual({ hours: 1, minutes: 0, seconds: 0 });
    });

    test('should send SET_TIME message when setting timer duration', () => {
      timerManager.setTimerDuration({ hours: 2, minutes: 30, seconds: 45 });
      
      const lastMessage = mockWorker.getLastMessage();
      expect(lastMessage.type).toBe('SET_TIME');
      expect(lastMessage.payload).toEqual({ hours: 2, minutes: 30, seconds: 45 });
    });
  });

  describe('Message Handling', () => {
    test('should update state when receiving TIMER_TICK message', () => {
      const mockPayload = {
        hours: 0,
        minutes: 24,
        seconds: 59,
        isRunning: true,
        isCompleted: false,
        remainingSeconds: 1499
      };

      mockWorker.simulateMessage('TIMER_TICK', mockPayload);
      
      const currentState = timerManager.getCurrentState();
      expect(currentState.hours).toBe(0);
      expect(currentState.minutes).toBe(24);
      expect(currentState.seconds).toBe(59);
      expect(currentState.isRunning).toBe(true);
      expect(currentState.isCompleted).toBe(false);
    });

    test('should call onTick callback when receiving TIMER_TICK message', (done) => {
      const mockPayload = {
        hours: 0,
        minutes: 10,
        seconds: 30,
        isRunning: true,
        isCompleted: false,
        remainingSeconds: 630
      };

      timerManager.onTick((state) => {
        expect(state.minutes).toBe(10);
        expect(state.seconds).toBe(30);
        done();
      });

      mockWorker.simulateMessage('TIMER_TICK', mockPayload);
    });

    test('should update state when receiving TIMER_STATUS message', () => {
      const mockPayload = {
        hours: 1,
        minutes: 0,
        seconds: 0,
        isRunning: false,
        isPaused: true,
        isCompleted: false,
        remainingSeconds: 3600
      };

      mockWorker.simulateMessage('TIMER_STATUS', mockPayload);
      
      const currentState = timerManager.getCurrentState();
      expect(currentState.hours).toBe(1);
      expect(currentState.isRunning).toBe(false);
    });

    test('should call onComplete callback when receiving TIMER_COMPLETE message', (done) => {
      const mockPayload = {
        hours: 0,
        minutes: 0,
        seconds: 0,
        isRunning: false,
        isPaused: false,
        isCompleted: true,
        remainingSeconds: 0
      };

      timerManager.onComplete(() => {
        done();
      });

      mockWorker.simulateMessage('TIMER_COMPLETE', mockPayload);
    });
  });

  describe('Status Management', () => {
    test('should return COMPLETED status when timer is completed', () => {
      const mockPayload = {
        hours: 0,
        minutes: 0,
        seconds: 0,
        isRunning: false,
        isCompleted: true,
        remainingSeconds: 0
      };

      mockWorker.simulateMessage('TIMER_COMPLETE', mockPayload);
      
      expect(timerManager.getTimerStatus()).toBe(TimerStatus.COMPLETED);
    });

    test('should return RUNNING status when timer is running', () => {
      const mockPayload = {
        hours: 0,
        minutes: 10,
        seconds: 0,
        isRunning: true,
        isCompleted: false,
        remainingSeconds: 600
      };

      mockWorker.simulateMessage('TIMER_TICK', mockPayload);
      
      expect(timerManager.getTimerStatus()).toBe(TimerStatus.RUNNING);
    });

    test('should return STOPPED status when timer is not running and not completed', () => {
      const mockPayload = {
        hours: 0,
        minutes: 25,
        seconds: 0,
        isRunning: false,
        isCompleted: false,
        remainingSeconds: 1500
      };

      mockWorker.simulateMessage('TIMER_STATUS', mockPayload);
      
      expect(timerManager.getTimerStatus()).toBe(TimerStatus.STOPPED);
    });
  });

  describe('Time Formatting', () => {
    test('should format time string correctly with padding', () => {
      const mockPayload = {
        hours: 1,
        minutes: 5,
        seconds: 3,
        isRunning: false,
        isCompleted: false,
        remainingSeconds: 3903
      };

      mockWorker.simulateMessage('TIMER_STATUS', mockPayload);
      
      expect(timerManager.getFormattedTimeString()).toBe('01:05:03');
    });

    test('should format time string correctly without padding needed', () => {
      const mockPayload = {
        hours: 12,
        minutes: 34,
        seconds: 56,
        isRunning: false,
        isCompleted: false,
        remainingSeconds: 45296
      };

      mockWorker.simulateMessage('TIMER_STATUS', mockPayload);
      
      expect(timerManager.getFormattedTimeString()).toBe('12:34:56');
    });
  });

  describe('Cleanup', () => {
    test('should terminate worker when destroy is called', () => {
      const terminateSpy = jest.spyOn(mockWorker, 'terminate');
      
      timerManager.destroy();
      
      expect(terminateSpy).toHaveBeenCalled();
    });

    test('should clear callbacks when destroy is called', () => {
      let callbackCalled = false;
      timerManager.onTick(() => { callbackCalled = true; });
      
      timerManager.destroy();
      
      // Simulate message after destroy
      const mockPayload = {
        hours: 0,
        minutes: 10,
        seconds: 0,
        isRunning: true,
        isCompleted: false,
        remainingSeconds: 600
      };

      mockWorker.simulateMessage('TIMER_TICK', mockPayload);
      
      expect(callbackCalled).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle worker errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockWorker.simulateError('Test worker error');
      
      expect(consoleSpy).toHaveBeenCalledWith('Timer service worker error:', expect.any(Object));
      
      consoleSpy.mockRestore();
    });
  });
});
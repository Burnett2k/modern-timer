// Utility for creating workers - extracted for easy mocking in tests
export function createTimerWorker(): Worker {
  return new Worker(
    new URL('../workers/timer-worker.ts', import.meta.url),
    { type: 'module' }
  );
}
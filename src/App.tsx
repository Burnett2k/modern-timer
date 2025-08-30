import { useState, useEffect, useRef, useCallback } from 'react'
import { TimerDisplay } from './components/TimerDisplay'
import { TimerControls } from './components/TimerControls'
import { SessionGoal } from './components/SessionGoal'
import { MuteControl } from './components/MuteControl'
import { TimerStatus } from './types/timer'
import { TimerManager } from './utils/TimerManager'
import { SoundManager } from './utils/soundUtils'
import { loadPreferences, savePreferences, loadTimerState, saveTimerState, clearTimerState } from './utils/localStorage'
import './App.css'

function App() {
  const [timeRemaining, setTimeRemaining] = useState(25 * 60)
  const [userSetDuration, setUserSetDuration] = useState(25 * 60)
  const [isCompleted, setIsCompleted] = useState(false)
  const [status, setStatus] = useState<TimerStatus>(TimerStatus.STOPPED)
  const [sessionGoal, setSessionGoal] = useState('')
  const [showTimeUp, setShowTimeUp] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isEditingGoal, setIsEditingGoal] = useState(false)
  const [isEditingTime, setIsEditingTime] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const timerManagerRef = useRef<TimerManager | null>(null)
  const soundManagerRef = useRef<SoundManager | null>(null)

  // Load preferences and timer state on app start
  useEffect(() => {
    const preferences = loadPreferences();
    const savedTimerState = loadTimerState();
    
    if (savedTimerState) {
      // Restore timer state from localStorage
      setTimeRemaining(savedTimerState.timeRemaining);
      setUserSetDuration(savedTimerState.userSetDuration);
      setIsCompleted(savedTimerState.isCompleted);
      setStatus(savedTimerState.status as TimerStatus);
      setSessionGoal(savedTimerState.sessionGoal);
    } else {
      // Use preferences for default values
      setTimeRemaining(preferences.preferredDurationSeconds);
      setUserSetDuration(preferences.preferredDurationSeconds);
      setSessionGoal(preferences.sessionGoal);
    }
    
    // Set mute state from preferences
    setIsMuted(preferences.isMuted || false);
    
    setIsInitialized(true);
    
    const timerManager = new TimerManager()
    const soundManager = new SoundManager()
    
    timerManager.onTick((state) => {
      const totalSeconds = state.hours * 3600 + state.minutes * 60 + state.seconds
      setTimeRemaining(totalSeconds)
    })
    
    timerManager.onComplete(() => {
      setIsCompleted(true)
      setStatus(TimerStatus.COMPLETED)
      // Play completion sound
      soundManager.playCompletionSound()
    })

    soundManagerRef.current = soundManager

    timerManagerRef.current = timerManager

    return () => {
      timerManager.destroy()
      soundManager.destroy()
    }
  }, [])

  // Restart timer if it was running when page was refreshed
  useEffect(() => {
    if (isInitialized && timerManagerRef.current && status === TimerStatus.RUNNING && timeRemaining > 0) {
      const hours = Math.floor(timeRemaining / 3600);
      const minutes = Math.floor((timeRemaining % 3600) / 60);
      const seconds = timeRemaining % 60;
      timerManagerRef.current.startTimer({ hours, minutes, seconds });
    }
  }, [isInitialized, status, timeRemaining])

  useEffect(() => {
    if (isCompleted) {
      const flashInterval = setInterval(() => {
        setShowTimeUp(prev => !prev);
      }, 1000);
      
      return () => {
        clearInterval(flashInterval);
      };
    } else {
      setShowTimeUp(false);
    }
  }, [isCompleted]);

  useEffect(() => {
    const formatTime = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (isCompleted) {
      document.title = showTimeUp ? 'Time is Up!' : '00:00:00';
    } else if (status === TimerStatus.RUNNING) {
      document.title = formatTime(timeRemaining);
    } else {
      document.title = 'Modern Timer';
    }
  }, [timeRemaining, isCompleted, status, showTimeUp])

  // Save timer state changes to localStorage
  useEffect(() => {
    if (isInitialized && (status === TimerStatus.RUNNING || status === TimerStatus.PAUSED)) {
      saveTimerState({
        timeRemaining,
        userSetDuration,
        isCompleted,
        status,
        sessionGoal,
        lastUpdated: Date.now()
      });
    } else if (isInitialized && status === TimerStatus.STOPPED && !isCompleted) {
      // Clear saved state when timer is stopped (not completed)
      clearTimerState();
    }
  }, [timeRemaining, userSetDuration, isCompleted, status, sessionGoal, isInitialized]);

  // Save preferences when they change (but not on initial load)
  useEffect(() => {
    if (isInitialized) {
      savePreferences({
        preferredDurationSeconds: userSetDuration,
        sessionGoal,
        isMuted
      });
    }
  }, [userSetDuration, sessionGoal, isMuted, isInitialized]);

  // Update sound manager when mute state changes
  useEffect(() => {
    if (soundManagerRef.current) {
      soundManagerRef.current.setMuted(isMuted);
    }
  }, [isMuted]);

  const handleStart = useCallback(() => {
    if (timerManagerRef.current) {
      // If completed, reset to user's set duration before starting
      const durationToUse = isCompleted ? userSetDuration : timeRemaining;
      const hours = Math.floor(durationToUse / 3600);
      const minutes = Math.floor((durationToUse % 3600) / 60);
      const seconds = durationToUse % 60;
      
      if (isCompleted) {
        setTimeRemaining(userSetDuration);
      }
      
      timerManagerRef.current.startTimer({ hours, minutes, seconds })
      setStatus(TimerStatus.RUNNING)
      setIsCompleted(false)
    }
  }, [isCompleted, userSetDuration, timeRemaining])

  const handlePause = useCallback(() => {
    if (timerManagerRef.current) {
      timerManagerRef.current.pauseTimer()
      setStatus(TimerStatus.PAUSED)
    }
  }, [])

  const handleReset = useCallback(() => {
    if (timerManagerRef.current) {
      const hours = Math.floor(userSetDuration / 3600);
      const minutes = Math.floor((userSetDuration % 3600) / 60);
      const seconds = userSetDuration % 60;
      timerManagerRef.current.resetTimer({ hours, minutes, seconds })
      setStatus(TimerStatus.STOPPED)
      setTimeRemaining(userSetDuration)
      setIsCompleted(false)
    }
  }, [userSetDuration])

  const handleTimeChange = (hours: number, minutes: number, seconds: number) => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    setTimeRemaining(totalSeconds);
    setUserSetDuration(totalSeconds);
    
    if (timerManagerRef.current) {
      timerManagerRef.current.setTimerDuration({ hours, minutes, seconds });
    }
  }

  const handleMuteToggle = () => {
    setIsMuted(prev => !prev);
  }

  // Basic keyboard shortcuts (F=start/pause, R=reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'f':
          e.preventDefault();
          if (status === TimerStatus.RUNNING) {
            handlePause();
          } else {
            handleStart();
          }
          break;
        case 'e':
          e.preventDefault();
          setIsEditingGoal(true);
          break;
        case 't':
          e.preventDefault();
          setIsEditingTime(true);
          break;
        case 'r':
          // Only handle 'r' if no modifier keys are pressed (allow Cmd+R for browser refresh)
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            handleReset();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [status, userSetDuration, timeRemaining, handleStart, handlePause, handleReset]);

  return (
    <>
      <div>
        <h1>Modern Timer</h1>
        <SessionGoal
          goal={sessionGoal}
          onGoalChange={setSessionGoal}
          isEditing={isEditingGoal}
          onEditingChange={setIsEditingGoal}
        />
        <TimerDisplay 
          timeRemaining={timeRemaining} 
          isCompleted={isCompleted}
          status={status}
          showTimeUp={showTimeUp}
          onTimeChange={handleTimeChange}
          onPause={handlePause}
          isEditing={isEditingTime}
          onEditingChange={setIsEditingTime}
        />
        <TimerControls
          status={status}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
        />
        <MuteControl
          isMuted={isMuted}
          onToggle={handleMuteToggle}
        />
      </div>
    </>
  )
}

export default App

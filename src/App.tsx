import { useState, useEffect, useRef } from 'react'
import { TimerDisplay } from './components/TimerDisplay'
import { TimerControls } from './components/TimerControls'
import { TimerStatus } from './types/timer'
import { TimerManager } from './utils/TimerManager'
import './App.css'

function App() {
  const [timeRemaining, setTimeRemaining] = useState(25 * 60)
  const [isCompleted, setIsCompleted] = useState(false)
  const [status, setStatus] = useState<TimerStatus>(TimerStatus.STOPPED)
  const timerManagerRef = useRef<TimerManager | null>(null)

  useEffect(() => {
    const timerManager = new TimerManager()
    
    timerManager.onTick((state) => {
      const totalSeconds = state.hours * 3600 + state.minutes * 60 + state.seconds
      setTimeRemaining(totalSeconds)
    })
    
    timerManager.onComplete(() => {
      setIsCompleted(true)
      setStatus(TimerStatus.COMPLETED)
    })

    timerManagerRef.current = timerManager

    return () => {
      timerManager.destroy()
    }
  }, [])

  const handleStart = () => {
    if (timerManagerRef.current) {
      timerManagerRef.current.startTimer()
      setStatus(TimerStatus.RUNNING)
      setIsCompleted(false)
    }
  }

  const handlePause = () => {
    if (timerManagerRef.current) {
      timerManagerRef.current.pauseTimer()
      setStatus(TimerStatus.PAUSED)
    }
  }

  const handleReset = () => {
    if (timerManagerRef.current) {
      timerManagerRef.current.resetTimer()
      setStatus(TimerStatus.STOPPED)
      setTimeRemaining(25 * 60)
      setIsCompleted(false)
    }
  }

  const handleToggleComplete = () => {
    setIsCompleted(!isCompleted)
  }

  const handleAdjustTime = () => {
    setTimeRemaining(prev => Math.max(0, prev - 60))
  }

  return (
    <>
      <div>
        <h1>Modern Timer</h1>
        <TimerDisplay 
          timeRemaining={timeRemaining} 
          isCompleted={isCompleted} 
        />
        <TimerControls
          status={status}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
        />
        <div style={{ marginTop: '20px' }}>
          <button onClick={handleToggleComplete}>
            {isCompleted ? 'Reset Timer' : 'Complete Timer'}
          </button>
          <button onClick={handleAdjustTime} style={{ marginLeft: '10px' }}>
            -1 Minute
          </button>
        </div>
      </div>
    </>
  )
}

export default App

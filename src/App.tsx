import { useState, useEffect, useRef } from 'react'
import { TimerDisplay } from './components/TimerDisplay'
import { TimerControls } from './components/TimerControls'
import { TimerStatus } from './types/timer'
import { TimerManager } from './utils/TimerManager'
import './App.css'

function App() {
  const [timeRemaining, setTimeRemaining] = useState(25 * 60)
  const [userSetDuration, setUserSetDuration] = useState(25 * 60)
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
      const hours = Math.floor(timeRemaining / 3600);
      const minutes = Math.floor((timeRemaining % 3600) / 60);
      const seconds = timeRemaining % 60;
      timerManagerRef.current.startTimer({ hours, minutes, seconds })
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
      const hours = Math.floor(userSetDuration / 3600);
      const minutes = Math.floor((userSetDuration % 3600) / 60);
      const seconds = userSetDuration % 60;
      timerManagerRef.current.resetTimer({ hours, minutes, seconds })
      setStatus(TimerStatus.STOPPED)
      setTimeRemaining(userSetDuration)
      setIsCompleted(false)
    }
  }

  const handleTimeChange = (hours: number, minutes: number, seconds: number) => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    setTimeRemaining(totalSeconds);
    setUserSetDuration(totalSeconds);
    
    if (timerManagerRef.current) {
      timerManagerRef.current.setTimerDuration({ hours, minutes, seconds });
    }
  }

  return (
    <>
      <div>
        <h1>Modern Timer</h1>
        <TimerDisplay 
          timeRemaining={timeRemaining} 
          isCompleted={isCompleted}
          status={status}
          onTimeChange={handleTimeChange}
        />
        <TimerControls
          status={status}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
        />
      </div>
    </>
  )
}

export default App

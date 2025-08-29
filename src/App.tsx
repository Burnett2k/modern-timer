import { useState } from 'react'
import { TimerDisplay } from './components/TimerDisplay'
import './App.css'

function App() {
  const [timeRemaining, setTimeRemaining] = useState(25 * 60)
  const [isCompleted, setIsCompleted] = useState(false)

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

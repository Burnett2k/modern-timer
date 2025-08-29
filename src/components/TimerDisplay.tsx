import { useEffect, useState } from 'react';

interface TimerDisplayProps {
  timeRemaining: number;
  isCompleted: boolean;
}

export function TimerDisplay({ timeRemaining, isCompleted }: TimerDisplayProps) {
  const [showTimeUp, setShowTimeUp] = useState(false);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isCompleted) {
      const interval = setInterval(() => {
        setShowTimeUp(prev => !prev);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setShowTimeUp(false);
    }
  }, [isCompleted]);

  const displayText = isCompleted 
    ? (showTimeUp ? "Time is Up!" : "00:00:00")
    : formatTime(timeRemaining);

  return (
    <div className="timer-display">
      <div className="time-text">
        {displayText}
      </div>
    </div>
  );
}
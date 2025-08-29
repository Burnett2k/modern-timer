import { useState, KeyboardEvent } from 'react';
import { TimerStatus } from '../types/timer';

interface TimerDisplayProps {
  timeRemaining: number;
  isCompleted: boolean;
  status: TimerStatus;
  showTimeUp: boolean;
  onTimeChange?: (hours: number, minutes: number, seconds: number) => void;
}

export function TimerDisplay({ timeRemaining, isCompleted, status, showTimeUp, onTimeChange }: TimerDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editHours, setEditHours] = useState('00');
  const [editMinutes, setEditMinutes] = useState('25');
  const [editSeconds, setEditSeconds] = useState('00');

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeComponents = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return { hours, minutes, secs };
  };


  const handleDisplayClick = () => {
    if (status === TimerStatus.STOPPED && !isCompleted) {
      const { hours, minutes, secs } = getTimeComponents(timeRemaining);
      setEditHours(hours.toString().padStart(2, '0'));
      setEditMinutes(minutes.toString().padStart(2, '0'));
      setEditSeconds(secs.toString().padStart(2, '0'));
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    const h = Math.max(0, Math.min(23, parseInt(editHours) || 0));
    const m = Math.max(0, Math.min(59, parseInt(editMinutes) || 0));
    const s = Math.max(0, Math.min(59, parseInt(editSeconds) || 0));
    
    if (onTimeChange) {
      onTimeChange(h, m, s);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const displayText = isCompleted 
    ? (showTimeUp ? "Time is Up!" : "00:00:00")
    : formatTime(timeRemaining);

  if (isEditing) {
    return (
      <div className="timer-display">
        <div className="time-edit">
          <input
            type="text"
            value={editHours}
            onChange={(e) => setEditHours(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
            onKeyDown={handleKeyDown}
            className="time-input"
            maxLength={2}
            autoFocus
          />
          <span>:</span>
          <input
            type="text"
            value={editMinutes}
            onChange={(e) => setEditMinutes(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
            onKeyDown={handleKeyDown}
            className="time-input"
            maxLength={2}
          />
          <span>:</span>
          <input
            type="text"
            value={editSeconds}
            onChange={(e) => setEditSeconds(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
            onKeyDown={handleKeyDown}
            className="time-input"
            maxLength={2}
          />
          <div className="edit-controls">
            <button onClick={handleSave}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  const isEditable = status === TimerStatus.STOPPED && !isCompleted;

  return (
    <div className="timer-display">
      <div 
        className="time-text" 
        onClick={handleDisplayClick}
        style={{ 
          cursor: isEditable ? 'pointer' : 'default',
          fontSize: '48px',
          fontFamily: 'monospace'
        }}
      >
        {displayText}
      </div>
    </div>
  );
}
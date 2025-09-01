import { useState, KeyboardEvent, useEffect } from 'react';

interface SessionGoalProps {
  goal: string;
  onGoalChange: (goal: string) => void;
  isEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
}

export function SessionGoal({ goal, onGoalChange, isEditing = false, onEditingChange }: SessionGoalProps) {
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (isEditing) {
      setEditText(goal);
    }
  }, [isEditing, goal]);

  const handleEditStart = () => {
    setEditText(goal);
    onEditingChange?.(true);
  };

  const handleSave = () => {
    onGoalChange(editText.trim());
    onEditingChange?.(false);
  };

  const handleCancel = () => {
    setEditText('');
    onEditingChange?.(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="session-goal">
        <div className="goal-edit">
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="goal-input"
            placeholder="Enter your session goal..."
            maxLength={100}
            autoFocus
          />
          <div className="goal-controls">
            <button onClick={handleSave}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="session-goal">
      {goal ? (
        <div 
          className="goal-display" 
          onClick={handleEditStart}
          style={{
            cursor: 'pointer',
            border: '1px dashed',
            borderRadius: '4px',
            padding: '8px 12px'
          }}
        >
          <p className="goal-text" style={{ margin: '0', fontSize: '14px' }}>
            Goal: {goal}
          </p>
        </div>
      ) : (
        <div 
          className="goal-placeholder" 
          onClick={handleEditStart}
          style={{
            cursor: 'pointer',
            border: '1px dashed',
            borderRadius: '4px',
            padding: '12px 16px',
            textAlign: 'center'
          }}
        >
          <span>Click to set session goal</span>
        </div>
      )}
    </div>
  );
}
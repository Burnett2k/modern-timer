import { useState, KeyboardEvent } from 'react';

interface SessionGoalProps {
  goal: string;
  onGoalChange: (goal: string) => void;
}

export function SessionGoal({ goal, onGoalChange }: SessionGoalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  const handleEditStart = () => {
    setEditText(goal);
    setIsEditing(true);
  };

  const handleSave = () => {
    onGoalChange(editText.trim());
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText('');
    setIsEditing(false);
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
            border: '1px dashed #ccc',
            borderRadius: '4px',
            padding: '8px 12px',
            backgroundColor: '#f9f9f9',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.borderColor = '#999';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9f9f9';
            e.currentTarget.style.borderColor = '#ccc';
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
            border: '1px dashed #bbb',
            borderRadius: '4px',
            padding: '12px 16px',
            backgroundColor: '#fafafa',
            textAlign: 'center',
            color: '#666',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.borderColor = '#999';
            e.currentTarget.style.color = '#333';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fafafa';
            e.currentTarget.style.borderColor = '#bbb';
            e.currentTarget.style.color = '#666';
          }}
        >
          <span>Click to set session goal</span>
        </div>
      )}
    </div>
  );
}
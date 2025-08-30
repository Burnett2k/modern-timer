interface MuteControlProps {
  isMuted: boolean;
  onToggle: () => void;
}

export function MuteControl({ isMuted, onToggle }: MuteControlProps) {
  return (
    <div className="mute-control">
      <button 
        onClick={onToggle}
        style={{
          padding: '8px 16px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: isMuted ? '#ffebee' : '#f5f5f5',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isMuted ? '#ffcdd2' : '#eeeeee';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isMuted ? '#ffebee' : '#f5f5f5';
        }}
        title={isMuted ? 'Click to unmute' : 'Click to mute'}
      >
        <span style={{ fontSize: '16px' }}>
          {isMuted ? '🔇' : '🔊'}
        </span>
        <span>
          {isMuted ? 'Muted' : 'Sound On'}
        </span>
      </button>
    </div>
  );
}
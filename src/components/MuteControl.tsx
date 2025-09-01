interface MuteControlProps {
  isMuted: boolean;
  onToggle: () => void;
}

export function MuteControl({ isMuted, onToggle }: MuteControlProps) {
  return (
    <div className="mute-control">
      <svg 
        onClick={onToggle}
        style={{
          width: '24px',
          height: '24px',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '4px',
          display: 'inline-block',
          userSelect: 'none'
        }}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
        aria-label={isMuted ? 'Click to unmute' : 'Click to mute'}
      >
        {isMuted ? (
          // Speaker X Mark (muted)
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.59-.79-1.59-1.78V9.67c0-.99.71-1.78 1.59-1.78h2.7Z" />
        ) : (
          // Speaker Wave (sound on)
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.59-.79-1.59-1.78V9.67c0-.99.71-1.78 1.59-1.78h2.24z" />
        )}
      </svg>
    </div>
  );
}
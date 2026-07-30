// src/components/DriveNavigator/DownloadBar.jsx

// Sticky bar at the bottom — appears only when files are selected
// Props:
//   selectedFiles   → array of selected file objects
//   onSelectAll     → function() — selects all files in current folder
//   onClearAll      → function() — deselects all
//   onSendToBackend → function() — triggers the backend API call
//   isSending       → boolean   — true while backend call is in progress

const DownloadBar = ({
  selectedFiles,
  onSelectAll,
  onClearAll,
  onSendToBackend,
  isSending = false,
}) => {
  // Don't render at all if nothing is selected
  if (selectedFiles.length === 0) return null

  const count = selectedFiles.length

  return (
    <div style={styles.bar} role="region" aria-label="Selected files actions">

      {/* Left: selection info + controls */}
      <div style={styles.left}>
        <span style={styles.countBadge}>{count}</span>
        <span style={styles.countLabel}>
          {count === 1 ? 'file selected' : 'files selected'}
        </span>
        <button style={styles.textButton} onClick={onSelectAll} disabled={isSending}>
          Select all
        </button>
        <span style={styles.divider} aria-hidden="true">·</span>
        <button style={styles.textButton} onClick={onClearAll} disabled={isSending}>
          Clear
        </button>
      </div>

      {/* Right: primary action */}
      <button
        style={{
          ...styles.sendButton,
          opacity: isSending ? 0.7 : 1,
          cursor: isSending ? 'not-allowed' : 'pointer',
        }}
        onClick={onSendToBackend}
        disabled={isSending}
        aria-busy={isSending}
      >
        {isSending ? 'Sending...' : `Process ${count} ${count === 1 ? 'file' : 'files'}`}
      </button>

    </div>
  )
}

const styles = {
  bar: {
    position: 'sticky',
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    backgroundColor: '#202124',
    borderTop: '1px solid #3c4043',
    boxShadow: '0 -2px 8px rgba(0,0,0,0.2)',
    zIndex: 100,
    gap: '12px',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  countBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '24px',
    height: '24px',
    padding: '0 6px',
    backgroundColor: '#1a73e8',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    borderRadius: '12px',
  },
  countLabel: {
    fontSize: '14px',
    color: '#e8eaed',
  },
  textButton: {
    background: 'none',
    border: 'none',
    padding: '2px 4px',
    cursor: 'pointer',
    color: '#8ab4f8',
    fontSize: '13px',
    borderRadius: '4px',
    transition: 'color 0.15s',
  },
  divider: {
    color: '#5f6368',
    fontSize: '14px',
    userSelect: 'none',
  },
  sendButton: {
    padding: '8px 20px',
    backgroundColor: '#1a73e8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
}

export default DownloadBar

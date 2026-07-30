// src/components/DriveNavigator/FileItem.jsx

import { formatFileSize } from '../../services/driveService'

// Represents a single file row inside the current folder
// Props:
//   file        → { id, name, mimeType, size, modifiedTime }
//   isSelected  → boolean — whether this file's checkbox is checked
//   onToggle    → function(file) called when checkbox is clicked

const FileItem = ({ file, isSelected, onToggle }) => {
  const isPDF = file.mimeType === 'application/pdf'
  const fileSize = formatFileSize(Number(file.size))
  const modifiedDate = file.modifiedTime
    ? new Date(file.modifiedTime).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—'

  return (
    <div
      style={{
        ...styles.row,
        backgroundColor: isSelected ? '#e8f0fe' : '#ffffff',
        borderColor: isSelected ? '#1a73e8' : '#e0e0e0',
      }}
      onClick={() => onToggle(file)}
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={0}
      onKeyDown={(e) => e.key === ' ' && onToggle(file)}  // keyboard accessible
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(file)}
        onClick={(e) => e.stopPropagation()} // prevent double-trigger with row click
        style={styles.checkbox}
        aria-label={`Select ${file.name}`}
      />

      {/* File type icon */}
      <span style={styles.icon} aria-hidden="true">
        {isPDF ? '📄' : '📎'}
      </span>

      {/* File name */}
      <span style={styles.name} title={file.name}>
        {file.name}
      </span>

      {/* File metadata */}
      <span style={styles.meta}>{fileSize}</span>
      <span style={styles.meta}>{modifiedDate}</span>
    </div>
  )
}

const styles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 16px',
    border: '1px solid',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.15s, border-color 0.15s',
    userSelect: 'none',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    flexShrink: 0,
    accentColor: '#1a73e8',
  },
  icon: {
    fontSize: '18px',
    flexShrink: 0,
  },
  name: {
    flex: 1,
    fontSize: '14px',
    color: '#202124',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  meta: {
    fontSize: '12px',
    color: '#9aa0a6',
    flexShrink: 0,
    minWidth: '80px',
    textAlign: 'right',
  },
}

export default FileItem

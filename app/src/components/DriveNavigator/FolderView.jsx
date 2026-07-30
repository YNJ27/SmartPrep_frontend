// src/components/DriveNavigator/FolderView.jsx

import FileItem from './FileItem'

// Main content area — renders folders and files for the current directory
// Props (all come from useDriveFolder hook):
//   folders          → array of folder objects
//   files            → array of file objects
//   loading          → boolean
//   error            → string or null
//   isFileSelected   → function(fileId) → boolean
//   onFolderClick    → function(folder) — navigate into folder
//   onFileToggle     → function(file)   — toggle file selection

const FolderView = ({
  folders,
  files,
  loading,
  error,
  showFiles = true,
  isFileSelected,
  onFolderClick,
  onFileToggle,
  isPatternView = false,
  isYearView = false,
  isBranchView = false,
}) => {
  // ── Loading state ──
  if (loading) {
    return (
      <div style={styles.centeredMessage}>
        <span style={styles.spinner} aria-label="Loading" />
        <p style={styles.messageText}>Loading folder contents...</p>
      </div>
    )
  }

  // ── Error state ──
  if (error) {
    return (
      <div style={styles.centeredMessage}>
        <span style={styles.errorIcon}>⚠️</span>
        <p style={styles.messageText}>{error}</p>
        <p style={styles.messageSubText}>Check your API key and folder permissions.</p>
      </div>
    )
  }

  // ── Empty state ──
  if (folders.length === 0 && showFiles && files.length === 0) {
    return (
      <div style={styles.centeredMessage}>
        <span style={styles.emptyIcon}>📂</span>
        <p style={styles.messageText}>This folder is empty.</p>
      </div>
    )
  }

  if (folders.length === 0 && !showFiles) {
    return null
  }

  const hasMEFolder = isYearView && folders.some(f => f.name === 'ME');
  const hasFirstYearFolder = isBranchView && folders.some(f => f.name === 'First Year');
  const hasMBAFolder = isBranchView && folders.some(f => f.name === 'M.B.A');

  return (
    <div style={styles.container}>
      <style>{`
        .folder-card-hover:hover:not(:disabled) {
          border-color: #1a73e8 !important;
        }
      `}</style>
      {folders.length > 0 && (
        <section style={styles.section}>

          <div style={styles.folderGrid}>
            {folders.map((folder) => {
              const isDisabledPattern = isPatternView && folder.name !== '2019 Pattern' && folder.name !== '2019 Pattren';
              const isDisabledME = isYearView && folder.name === 'ME';
              const isDisabledFirstYear = folder.name === 'First Year';
              const isDisabledMBA = folder.name === 'M.B.A';
              const isDisabled = isDisabledPattern || isDisabledME || isDisabledFirstYear || isDisabledMBA;
              
              return (
                <button
                  key={folder.id}
                  className="folder-card-hover"
                  style={{
                    ...styles.folderCard,
                    ...(isDisabled ? styles.folderCardDisabled : {}),
                  }}
                  onClick={() => !isDisabled && onFolderClick(folder)}
                  title={isDisabled ? 'Currently not supported' : `Open ${folder.name}`}
                  disabled={isDisabled}
                >
                  <img 
                    src="/folder.png" 
                    alt="Folder" 
                    style={{
                      width: '42px',
                      height: '42px',
                      objectFit: 'contain',
                      ...(isDisabled ? styles.folderIconDisabled : {}),
                    }} 
                    aria-hidden="true"
                  />
                  <span style={{
                    ...styles.folderName,
                    ...(isDisabled ? styles.folderNameDisabled : {}),
                  }}>{folder.name}</span>
                </button>
              )
            })}
          </div>
          {isPatternView && (
            <p style={{ color: '#c5221f', fontSize: '13px', marginTop: '16px', fontWeight: '500', textAlign: 'left' }}>
              Note: We currently only support 2019 Pattern
            </p>
          )}
          {hasMEFolder && (
            <p style={{ color: '#c5221f', fontSize: '13px', marginTop: '16px', fontWeight: '500', textAlign: 'left' }}>
              Note: We currently don't support ME
            </p>
          )}
          {(hasFirstYearFolder || hasMBAFolder) && (
            <p style={{ color: '#c5221f', fontSize: '13px', marginTop: '16px', fontWeight: '500', textAlign: 'left' }}>
              {(() => {
                const unsupported = [];
                if (hasFirstYearFolder) unsupported.push("First Year");
                if (hasMBAFolder) unsupported.push("M.B.A");
                return `Note: We currently don't support ${unsupported.join(" and ")}`;
              })()}
            </p>
          )}
        </section>
      )}

      {showFiles && files.length > 0 && (
        <section style={styles.section}>
          <p style={styles.sectionLabel}>Files</p>
          <div style={styles.fileList}>
            {files.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                isSelected={isFileSelected(file.id)}
                onToggle={onFileToggle}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  )
}

const styles = {
  container: {
    padding: '16px',
    overflowY: 'auto',
    flex: 1,
  },
  section: {
    marginBottom: '24px',
  },

  folderGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '12px',
  },
  folderCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px 12px',
    background: '#ffffff',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'box-shadow 0.15s, border-color 0.15s',
    textAlign: 'center',
    width: '100%',
    minHeight: '120px',
    boxSizing: 'border-box',
  },
  folderCardDisabled: {
    background: '#f8f9fa',
    borderColor: '#e8eaed',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  folderIcon: {
    fontSize: '32px',
  },
  folderIconDisabled: {
    opacity: 0.5,
    filter: 'grayscale(100%)',
  },
  folderName: {
    fontSize: '13px',
    color: '#202124',
    wordBreak: 'break-word',
    lineHeight: '1.3',
  },
  folderNameDisabled: {
    color: '#9aa0a6',
  },
  fileList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  centeredMessage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '12px',
  },
  spinner: {
    display: 'inline-block',
    width: '32px',
    height: '32px',
    border: '3px solid #e0e0e0',
    borderTop: '3px solid #1a73e8',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorIcon: {
    fontSize: '36px',
  },
  emptyIcon: {
    fontSize: '36px',
  },
  messageText: {
    fontSize: '15px',
    color: '#202124',
    margin: 0,
    textAlign: 'center',
  },
  messageSubText: {
    fontSize: '13px',
    color: '#9aa0a6',
    margin: 0,
    textAlign: 'center',
  },
}

export default FolderView

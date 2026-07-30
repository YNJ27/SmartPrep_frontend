// src/components/DriveNavigator/Breadcrumb.jsx

// Receives the breadcrumb trail array and callbacks from useDriveFolder hook
// Props:
//   breadcrumbs  → [{ id, name }, ...]  ordered root → current
//   onNavigate   → function(crumb) called when user clicks a crumb

const Breadcrumb = ({ breadcrumbs, onNavigate }) => {
  return (
    <nav style={styles.nav} aria-label="Folder navigation">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const displayName = (index === 0 && crumb.name === 'Home') ? 'All Branches' : crumb.name;

        return (
          <span key={crumb.id} style={styles.crumbWrapper}>

            {/* Clickable crumb — all except the current (last) one */}
            {isLast ? (
              <span style={styles.crumbActive} aria-current="page">
                {displayName}
              </span>
            ) : (
              <button
                style={styles.crumbButton}
                onClick={() => onNavigate(crumb)}
                title={`Go back to ${displayName}`}
              >
                {displayName}
              </button>
            )}

            {/* Separator — not shown after last crumb */}
            {!isLast && <span style={styles.separator} aria-hidden="true"> / </span>}

          </span>
        )
      })}
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '2px',
    padding: '12px 16px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e0e0e0',
    fontSize: '14px',
  },
  crumbWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  crumbButton: {
    background: 'none',
    border: 'none',
    padding: '2px 4px',
    cursor: 'pointer',
    color: '#1a73e8',
    fontSize: '14px',
    borderRadius: '4px',
    transition: 'background-color 0.15s',
  },
  crumbActive: {
    padding: '2px 4px',
    color: '#202124',
    fontWeight: '500',
    fontSize: '14px',
  },
  separator: {
    color: '#9aa0a6',
    margin: '0 2px',
    userSelect: 'none',
  },
}

export default Breadcrumb

// src/pages/HomePage.jsx

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import Suggestions from '../components/Suggestions'

const HomePage = () => {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [subjectToDelete, setSubjectToDelete] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch('/user/subjects')
        if (res.ok) {
          const data = await res.json()
          setSubjects(data)
        }
      } catch (err) {
        console.error("Failed to fetch subjects:", err)
      }
      setLoading(false)
    }

    fetchSubjects()
  }, [])

  const handleSubjectClick = (row) => {
    // Pass all 5 identity fields so OutputPage can query the DB
    const params = new URLSearchParams({
      subject: row.subject,
      examType: row.examType,
      Branch: row.Branch,
      Year: row.Year,
      Pattern: row.Pattern,
    })
    navigate(`/output?${params.toString()}`)
  }

  const handleDeleteSubject = (e, row) => {
    // Prevent the card click from firing
    e.stopPropagation()
    setSubjectToDelete(row)
  }

  const confirmDelete = async () => {
    if (!subjectToDelete) return

    try {
      const res = await fetch(`/user/subjects/${subjectToDelete.id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        setSubjects((prev) => prev.filter((s) => s.id !== subjectToDelete.id))
      }
    } catch (err) {
      console.error("Failed to delete subject:", err)
    }
    setSubjectToDelete(null)
  }



  return (
    <div style={styles.page}>
      <Sidebar currentPage="home" />


      <main style={styles.main}>
        <Suggestions />
        
        <h1 style={styles.pageTitle}>Your Subjects</h1>

        {loading ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>Loading your subjects...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyTitle}>No subjects yet</p>
            <p style={styles.emptyText}>
              Click "Add a new subject" button on the left sidebar to process your first subject's PYQs.
            </p>
          </div>
        ) : (
          <div style={styles.list}>
            {subjects.map((row) => (
              <div key={row.id} style={styles.rowWrapper}>
                <button
                  className="subject-card"
                  onClick={() => handleSubjectClick(row)}
                >
                  <span style={styles.subjectName}>{row.subject}</span>
                  <span style={styles.examTypeBadge}>{row.examType}</span>
                </button>
                <button
                  className="delete-btn"
                  onClick={(e) => handleDeleteSubject(e, row)}
                  title="Delete subject"
                >
                  <img src="/delete.png" alt="Delete" style={styles.deleteIcon} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        .subject-card {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          flex: 1;
          padding: 20px 24px;
          border: 2px solid #1a73e8;
          border-radius: 10px;
          background-color: #ffffff;
          cursor: pointer;
          text-align: left;
          transition: background-color 0.15s;
        }
        .subject-card:hover {
          background-color: #e8f0fe;
        }
        .delete-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 14px 16px;
          border: 2px solid #ff0000;
          border-radius: 10px;
          background-color: #ffffff;
          cursor: pointer;
          transition: background-color 0.15s;
          flex-shrink: 0;
        }
        .delete-btn:hover {
          background-color: #fff0f0;
        }
        .cancel-btn {
          flex: 1;
          padding: 12px;
          background-color: #f1f3f4;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          color: #3c4043;
          cursor: pointer;
          transition: background-color 0.15s;
        }
        .cancel-btn:hover {
          background-color: #e8eaed;
        }
        .confirm-btn {
          flex: 1;
          padding: 12px;
          background-color: #ff0000;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          color: #ffffff;
          cursor: pointer;
          transition: background-color 0.15s;
        }
        .confirm-btn:hover {
          background-color: #cc0000;
        }
      `}</style>

      {subjectToDelete && (
        <div style={styles.modalOverlay} onClick={() => setSubjectToDelete(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                Confirm deletion of {subjectToDelete.subject}({subjectToDelete.examType})
              </h2>
              <button style={styles.closeButton} onClick={() => setSubjectToDelete(null)}>
                ✕
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.warningBox}>
                <img src="/alert.png" alt="Warning" style={styles.warningIconImage} />
                <div style={styles.warningTextContainer}>
                  <p style={styles.warningTitle}>This action cannot be undone</p>
                  <p style={styles.warningText}>Are you sure you want to delete this subject?</p>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button className="cancel-btn" onClick={() => setSubjectToDelete(null)}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    marginLeft: '260px',
  },

  main: {
    flex: 1,
    padding: '32px 24px',
    marginLeft: '24px',
    marginRight: 'max(24px, calc((100vw - 1126px) / 2))',
    width: 'auto',
    boxSizing: 'border-box',
  },

  pageTitle: {
    margin: '0 0 24px',
    fontSize: '24px',
    fontWeight: '700',
    color: '#000000ff',
    textAlign: 'center',
    textTransform: 'uppercase',
    fontFamily: "'Montserrat', 'Inter', 'Outfit', sans-serif",
    letterSpacing: '1.5px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  rowWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: '12px',
  },
  deleteIcon: {
    width: '20px',
    height: '20px',
    objectFit: 'contain',
  },
  subjectName: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a73e8',
  },
  examTypeBadge: {
    padding: '8px 18px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
    backgroundColor: '#1a73e8',
  },
  emptyState: {
    marginTop: '60px',
    textAlign: 'center',
    padding: '40px',
    border: '1px dashed #d2d6dc',
    borderRadius: '16px',
    backgroundColor: '#ffffff',
  },
  emptyTitle: {
    margin: '0 0 8px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#202124',
  },
  emptyText: {
    margin: 0,
    fontSize: '14px',
    color: '#5f6368',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    border: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #ff0000',
  },
  modalTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '500',
    color: '#000000',
    textAlign: 'left',
    flex: 1,
    paddingRight: '12px',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#000000',
    padding: '4px 8px',
    flexShrink: 0,
    lineHeight: 1,
  },
  modalBody: {
    padding: '24px 20px',
    backgroundColor: '#fff0f0',
  },
  warningBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '20px',
  },
  warningIconImage: {
    width: '36px',
    height: '36px',
    objectFit: 'contain',
    marginTop: '2px',
  },
  warningTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    textAlign: 'left',
  },
  warningTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '500',
    color: '#000000',
    lineHeight: '1.4',
  },
  warningText: {
    margin: 0,
    fontSize: '16px',
    color: '#5f6368',
    lineHeight: '1.4',
  },
  modalFooter: {
    display: 'flex',
    padding: '16px 20px',
    gap: '12px',
    borderTop: '1px solid #ff0000',
  },
  logoutPopupContainer: {
    position: 'fixed',
    top: '160px',
    left: '240px',
    zIndex: 1000,
  },
  logoutPopup: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '350px',
    border: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  logoutHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #ff0000',
  },
  logoutTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '500',
    color: '#000000',
  },
  logoutClose: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#000000',
    padding: '4px',
  },
  logoutBody: {
    padding: '24px 16px',
    backgroundColor: '#fff0f0',
  },
  logoutText: {
    margin: 0,
    fontSize: '16px',
    color: '#000000',
  },
  logoutFooter: {
    display: 'flex',
    padding: '16px',
    gap: '12px',
    borderTop: '1px solid #ff0000',
  },
}

export default HomePage

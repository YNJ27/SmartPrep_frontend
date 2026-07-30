// src/pages/InputPage.jsx

import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useDriveFolder from '../hooks/useDriveFolder'
import Breadcrumb from '../components/DriveNavigator/Breadcrumb'
import FolderView from '../components/DriveNavigator/FolderView'

import Sidebar from '../components/Sidebar'
import Suggestions from '../components/Suggestions'
import { supabase } from '../supabaseClient'

const ENDSEM_FILE_PATTERN = /^[A-Za-z]{3}[\s\-_]+[A-Za-z]{3}[\s\-_]+\d{4}\.pdf$/i
const InputPage = () => {
  const [sendError, setSendError] = useState(null)
  const [previewPayload, setPreviewPayload] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('')
  const navigate = useNavigate()

  const {
    currentFolderId,
    folders,
    files,
    breadcrumbs,
    loading,
    error,
    currentFolderName,
    navigateTo,
    navigateToCrumb,
    goBack,
  } = useDriveFolder()

  // Clear selected exam type and action panel only when the user actually
  // navigates to a different folder. We watch `currentFolderId` instead of
  // `breadcrumbs` because breadcrumbs is updated twice per navigation
  // (optimistic update + async trail correction), which would wipe the
  // selection immediately after the user picks an exam type.
  useEffect(() => {
    setPreviewPayload(null)
    setSendError(null)
  }, [currentFolderId])

  const pdfFiles = useMemo(() => {
    return files.filter(
      (file) =>
        file.mimeType === 'application/pdf' ||
        file.name?.toLowerCase().endsWith('.pdf'),
    )
  }, [files])

  const endsemFiles = useMemo(
    () => pdfFiles.filter((file) => ENDSEM_FILE_PATTERN.test(file.name)),
    [pdfFiles],
  )

  const insemFiles = useMemo(
    () => pdfFiles.filter((file) => !ENDSEM_FILE_PATTERN.test(file.name)),
    [pdfFiles],
  )

  const subjectName = currentFolderName || breadcrumbs[breadcrumbs.length - 1]?.name || 'Unknown'
  const hasPdfFiles = pdfFiles.length > 0
  const hasFolders = folders.length > 0
  const showNoPdfMessage = !loading && !error && files.length > 0 && !hasPdfFiles

  // --- First Year Flow Handling (Currently Disabled) ---
  // const isFirstYearFlow = breadcrumbs[1]?.name === 'First Year';
  const isFirstYearFlow = false; 

  const isHonorsFlow = breadcrumbs[1]?.name === 'Honors Course';

  const isAIML = breadcrumbs[1]?.name === 'Artificial Intelligence and Machine Learning';
  const isECE = breadcrumbs[1]?.name === 'Electronics & Computer Engineering';

  // These specific branches and years skip the Pattern folder (defaults to 2019 Pattern)
  const isMissingPatternFlow = 
    (isAIML && (breadcrumbs[2]?.name === 'TE' || breadcrumbs[2]?.name === 'BE')) ||
    (isECE && breadcrumbs[2]?.name === 'TE');

  // Active view flags
  const isBranchView = breadcrumbs.length === 1;
  const isYearView = breadcrumbs.length === 2;
  const isPatternView = !isHonorsFlow && !isMissingPatternFlow && breadcrumbs.length === 3;

  const handleFolderClick = (folder) => {
    navigateTo(folder.id, folder.name)
  }

  const buildPayload = (examType, filesToSend) => {
    let branch = "Unknown";
    let year = "Unknown";
    let pattern = "Unknown";

    /* --- First Year Flow Payload Logic (Currently Disabled) ---
    if (isFirstYearFlow) {
      branch = "N/A";
      year = "First Year";
      pattern = breadcrumbs[2]?.name || "Unknown";
    } else 
    ----------------------------------------------------------- */
    
    if (isHonorsFlow) {
      branch = breadcrumbs[1]?.name || "Unknown"; // "Honors Course"
      year = breadcrumbs[2]?.name || "Unknown";
      pattern = "2019 Pattern"; // Hardcoded
    } else if (isMissingPatternFlow) {
      branch = breadcrumbs[1]?.name || "Unknown";
      year = breadcrumbs[2]?.name || "Unknown";
      pattern = "2019 Pattern"; // Hardcoded (because the pattern folder is skipped)
    } else {
      branch = breadcrumbs[1]?.name || "Unknown";
      year = breadcrumbs[2]?.name || "Unknown";
      pattern = breadcrumbs[3]?.name || "Unknown";
    }

    return {
      subject: subjectName,
      examType,
      metadata: {
        Branch: branch,
        Year: year,
        Pattern: pattern,
      },
      files: filesToSend.map((file) => ({
        id: file.id,
        name: file.name,
        downloadUrl: `https://drive.google.com/uc?export=download&id=${file.id}`,
      })),
    }
  }

  const showJsonPreview = (examType, filesToSend) => {
    if (filesToSend.length === 0) {
      setSendError(`No matching PDF files found for ${examType}.`)
      setPreviewPayload(null)
      return
    }

    setSendError(null)
    setPreviewPayload(buildPayload(examType, filesToSend))
  }

  const handleExamTypeSelect = (examType) => {
    if (examType === 'Endsem') {
      return showJsonPreview('Endsem', endsemFiles)
    }

    if (examType === 'Insem') {
      return showJsonPreview('Insem', insemFiles)
    }

    return null
  }
  const handleSubmit = async () => {
    if (!previewPayload) return;
    setIsProcessing(true);
    setProcessingStatus('Downloading PDFs...');
    setSendError(null);

    try {
      const subject = previewPayload.subject;
      const examType = previewPayload.examType || 'Unknown';
      const Branch = previewPayload.metadata?.Branch || 'Unknown';
      const Year = previewPayload.metadata?.Year || 'Unknown';
      const Pattern = previewPayload.metadata?.Pattern || 'Unknown';
      // Helper: save this subject to user_subjects via the backend
      const saveSubjectToDb = async () => {
        try {
          await fetch('/user/subjects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, examType, Branch, Year, Pattern })
          });
        } catch (error) {
          console.error("Error saving subject to DB:", error);
        }
      };

      // Helper: navigate to output with all 5 identity params
      const navigateToOutput = () => {
        const params = new URLSearchParams({ subject, examType, Branch, Year, Pattern });
        navigate(`/output?${params.toString()}`);
      };

      // Step 1: Trigger Upload
      const payloadToSend = previewPayload;
      const response = await fetch('/subjects/import-pdfs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadToSend)
      });

      if (!response.ok) throw new Error('Failed to start processing');

      const initData = await response.json();
      const fileHash = initData.file_hash;

      if (initData.status === 'completed') {
        setIsProcessing(false);
        await saveSubjectToDb();
        navigateToOutput();
        return;
      }

      setProcessingStatus('Processing PDFs...');

      // Step 2 & 3: Poll the Status
      const intervalId = setInterval(async () => {
        try {
          const statusRes = await fetch(`/subjects/status/${fileHash}`);
          if (statusRes.ok) {
            const data = await statusRes.json();
            if (data.status === 'completed') {
              clearInterval(intervalId);
              clearTimeout(timeoutId);
              setIsProcessing(false);
              await saveSubjectToDb();
              navigateToOutput();
            } else if (data.status === 'failed') {
              clearInterval(intervalId);
              clearTimeout(timeoutId);
              setIsProcessing(false);
              setSendError(data.error || 'Processing failed.');
            }
          }
        } catch (pollErr) {
          console.error('Polling error:', pollErr);
        }
      }, 3000);

      const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
        setIsProcessing(false);
        setSendError('Processing timed out. Please try again later.');
      }, 10 * 60 * 1000); // 10 minutes

    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setSendError(err.message || 'Failed to submit payload.');
    }
  };

  return (
    <div style={styles.page}>
      <Sidebar currentPage="input" />
      <Suggestions />
      <div style={styles.layout}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>SELECT YOUR SUBJECT</h1>
        </div>
      </header>

      <Breadcrumb breadcrumbs={breadcrumbs} onNavigate={navigateToCrumb} />

      {sendError && (
        <div style={styles.errorBanner} role="alert">
          <span>⚠️ {sendError}</span>
          <button style={styles.errorDismiss} onClick={() => setSendError(null)}>
            ✕
          </button>
        </div>
      )}

      <main style={styles.main}>
        {hasFolders && (
          <FolderView
            folders={folders}
            files={[]}
            loading={loading}
            error={error}
            showFiles={false}
            onFolderClick={handleFolderClick}
            isPatternView={isPatternView}
            isYearView={isYearView}
            isBranchView={isBranchView}
          />
        )}

        {!loading && !error && hasPdfFiles && (
          <section style={styles.examPanel}>
            <div style={styles.examHeader}>
              <h2 style={styles.examTitle}>Select exam type</h2>
              <p style={styles.examSubtitle}>{subjectName}</p>
            </div>

            <div style={styles.examButtons}>
              <button
                type="button"
                style={previewPayload?.examType === 'Endsem' ? { ...styles.examButton, ...styles.examButtonSelected } : styles.examButton}
                onClick={() => handleExamTypeSelect('Endsem')}
              >
                Endsem
              </button>
              <button
                type="button"
                style={previewPayload?.examType === 'Insem' ? { ...styles.examButton, ...styles.examButtonSelected } : styles.examButton}
                onClick={() => handleExamTypeSelect('Insem')}
              >
                Insem
              </button>
            </div>

          </section>
        )}

        {previewPayload && (
          <section style={styles.actionPanel}>
            <button 
              style={{ ...styles.examButton, backgroundColor: '#1a73e8', color: 'white', border: 'none', padding: '12px 24px', opacity: isProcessing ? 0.7 : 1, cursor: isProcessing ? 'not-allowed' : 'pointer' }}
              onClick={handleSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? processingStatus : 'Start Processing'}
            </button>
            <p style={styles.patientText}>It may take around 2-3 mins, be patient</p>
          </section>
        )}

        {showNoPdfMessage && (
          <section style={styles.emptyNote}>
            <p style={styles.emptyNoteTitle}>No PDF files found in this folder.</p>
            <p style={styles.emptyNoteText}>Open a subfolder that contains PDF files to see the exam options.</p>
          </section>
        )}
      </main>
      </div>
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
  layout: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '24px',
    marginRight: 'max(24px, calc((100vw - 1126px) / 2))',
    width: 'auto',
    flex: 1,
  },
  header: {
    padding: '16px 20px 12px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '4px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#000000ff', // Dark blue
    textAlign: 'center',
    textTransform: 'uppercase',
    fontFamily: "'Montserrat', 'Inter', 'Outfit', sans-serif",
    letterSpacing: '1.5px',
    flex: 1,
  },



  main: {
    flex: 1,
    overflow: 'auto',
  },
  examPanel: {
    margin: '20px 16px 24px',
    padding: '18px',
    border: '1px solid #e0e0e0',
    borderRadius: '14px',
    backgroundColor: '#ffffff',
    boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  },
  examHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '14px',
  },
  examTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#202124',
  },
  examSubtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#5f6368',
  },
  examButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '12px',
  },
  examButton: {
    border: '1px solid #d2d6dc',
    borderRadius: '12px',
    padding: '14px 16px',
    backgroundColor: '#f8f9fa',
    color: '#202124',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
  },
  examButtonSelected: {
    backgroundColor: '#1a73e8',
    color: '#ffffff',
    borderColor: '#1a73e8',
  },
  actionPanel: {
    margin: '0 16px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  patientText: {
    margin: 0,
    fontSize: '14px',
    color: '#5f6368',
    textAlign: 'center',
  },
  emptyNote: {
    margin: '20px 16px 24px',
    padding: '18px',
    border: '1px dashed #d2d6dc',
    borderRadius: '14px',
    backgroundColor: '#ffffff',
  },
  emptyNoteTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#202124',
  },
  emptyNoteText: {
    margin: '6px 0 0',
    fontSize: '13px',
    color: '#5f6368',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 16px',
    backgroundColor: '#fce8e6',
    borderBottom: '1px solid #f28b82',
    color: '#c5221f',
    fontSize: '14px',
  },
  errorDismiss: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#c5221f',
    fontSize: '16px',
    padding: '0 4px',
  },
}

export default InputPage

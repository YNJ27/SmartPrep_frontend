// src/hooks/useDriveFolder.js

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  listFolderContents,
  buildBreadcrumbTrail,
} from '../services/driveService'
import { ROOT_FOLDER_ID } from '../constants/api'

// ─────────────────────────────────────────────
// useDriveFolder
//
// Manages all state for navigating the Drive hierarchy:
//   - Current folder contents (folders + files)
//   - Breadcrumb trail
//   - Loading and error states
//   - Selected files (for sending to backend)
//
// Usage in a component:
//   const { folders, files, breadcrumbs, loading, error,
//           isPatternView, selectedFiles,
//           navigateTo, goBack, toggleFileSelection,
//           clearSelection } = useDriveFolder()
// ─────────────────────────────────────────────

const useDriveFolder = () => {
  const [currentFolderId, setCurrentFolderId] = useState(ROOT_FOLDER_ID)
  const [currentFolderName, setCurrentFolderName] = useState('')
  const [folders, setFolders] = useState([])
  const [files, setFiles] = useState([])
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: ROOT_FOLDER_ID, name: 'Home' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedFiles, setSelectedFiles] = useState([])

  // Track the latest navigation target to prevent race conditions
  const latestNavigationId = useRef(ROOT_FOLDER_ID)

  // ── Fetch contents whenever currentFolderId changes ──
  useEffect(() => {
    let cancelled = false

    const fetchContents = async () => {
      // Clear stale content immediately so the old folder's items are never
      // visible while the new folder is loading. This eliminates the flash
      // caused by stale folders/files remaining in state during the fetch.
      setFolders([])
      setFiles([])
      setLoading(true)
      setError(null)
      setSelectedFiles([])

      try {
        const { folders: fetchedFolders, files: fetchedFiles } = await listFolderContents(currentFolderId)
        // If the user navigated away before this fetch completed, discard the
        // result — writing stale data would cause a flash of the wrong content.
        if (cancelled) return
        setFolders(fetchedFolders)
        setFiles(fetchedFiles)
      } catch (err) {
        if (cancelled) return
        setError(err.message || 'Failed to load folder contents')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchContents()

    // Cleanup: mark this effect's fetch as stale when the folder changes again
    return () => { cancelled = true }
  }, [currentFolderId])

  // ── Navigate into a folder ──
  const navigateTo = useCallback(async (folderId, folderName) => {
    setCurrentFolderName(folderName)
    setCurrentFolderId(folderId)
    latestNavigationId.current = folderId

    // Optimistically append the new folder to breadcrumbs immediately so the
    // UI reflects the new level before the async buildBreadcrumbTrail resolves.
    // This prevents a flash of the previous folder's contents while the API call
    // is in-flight (race condition on first mount).
    setBreadcrumbs((prev) => [...prev, { id: folderId, name: folderName }])

    // Then fetch the authoritative trail and correct breadcrumbs if needed
    try {
      const trail = await buildBreadcrumbTrail(folderId)
      if (latestNavigationId.current === folderId) {
        setBreadcrumbs(trail)
      }
    } catch {
      // Fallback already applied above; nothing more to do
    }
  }, [])

  // ── Navigate to any breadcrumb (jump back) ──
  const navigateToCrumb = useCallback(async (crumb) => {
    setCurrentFolderName(crumb.name)
    setCurrentFolderId(crumb.id)
    latestNavigationId.current = crumb.id

    // Trim breadcrumbs back to the clicked crumb
    setBreadcrumbs((prev) => {
      const idx = prev.findIndex((c) => c.id === crumb.id)
      return idx >= 0 ? prev.slice(0, idx + 1) : prev
    })
  }, [])

  // ── Go back one level (uses last breadcrumb) ──
  const goBack = useCallback(() => {
    if (breadcrumbs.length <= 1) return // already at root
    const previous = breadcrumbs[breadcrumbs.length - 2]
    navigateToCrumb(previous)
  }, [breadcrumbs, navigateToCrumb])

  // ── File selection (for PDF download) ──
  const toggleFileSelection = useCallback((file) => {
    setSelectedFiles((prev) => {
      const alreadySelected = prev.some((f) => f.id === file.id)
      if (alreadySelected) {
        return prev.filter((f) => f.id !== file.id)
      } else {
        return [...prev, file]
      }
    })
  }, [])

  const selectAllFiles = useCallback(() => {
    setSelectedFiles([...files])
  }, [files])

  const clearSelection = useCallback(() => {
    setSelectedFiles([])
  }, [])

  const isFileSelected = useCallback(
    (fileId) => selectedFiles.some((f) => f.id === fileId),
    [selectedFiles]
  )

  return {
    // Navigation state
    currentFolderId,
    currentFolderName,
    breadcrumbs,

    // Contents
    folders,
    files,

    // Status
    loading,
    error,

    // File selection
    selectedFiles,
    isFileSelected,
    toggleFileSelection,
    selectAllFiles,
    clearSelection,

    // Navigation actions
    navigateTo,
    navigateToCrumb,
    goBack,
  }
}

export default useDriveFolder

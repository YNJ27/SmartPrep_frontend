// src/services/driveService.js

import {
  DRIVE_API_BASE,
  API_KEY,
  RESOURCE_KEY,
  ROOT_FOLDER_ID,
  FOLDER_MIME_TYPE,
  DRIVE_FILE_FIELDS,
} from '../constants/api'

// ─────────────────────────────────────────────
// Internal helper: builds auth query params
// with API key
// ─────────────────────────────────────────────
const authParams = () => {
  return `key=${API_KEY}`
}

// ─────────────────────────────────────────────
// Internal helper: adds Drive resource keys via header
// Required by Google Drive when accessing shared resources
// ─────────────────────────────────────────────
const buildHeaders = (resourceId) => {
  const headers = {}

  if (RESOURCE_KEY && resourceId) {
    headers['X-Goog-Drive-Resource-Keys'] = `${resourceId}/${RESOURCE_KEY}`
  }

  return headers
}

// ─────────────────────────────────────────────
// 1. Extract folder ID from a Google Drive URL
//    Input:  "https://drive.google.com/drive/folders/1ABC123?usp=sharing"
//    Output: "1ABC123"
// ─────────────────────────────────────────────
export const getFolderIdFromUrl = (url) => {
  try {
    const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/)
    if (match && match[1]) return match[1]
    throw new Error('Could not extract folder ID from URL')
  } catch {
    throw new Error('Invalid Google Drive URL format')
  }
}

// ─────────────────────────────────────────────
// 2. List contents of a folder (folders + files)
//    Returns: { folders: [...], files: [...] }
// ─────────────────────────────────────────────
export const listFolderContents = async (folderId = ROOT_FOLDER_ID) => {
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`)
  const url = `${DRIVE_API_BASE}/files?q=${query}&${authParams()}&supportsAllDrives=true&includeItemsFromAllDrives=true&fields=${encodeURIComponent(DRIVE_FILE_FIELDS)}&orderBy=name`

  const response = await fetch(url, {
    headers: buildHeaders(folderId),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error?.error?.message || 'Failed to fetch folder contents')
  }

  const data = await response.json()
  const allItems = data.files || []

  // Separate folders and files
  const folders = allItems.filter((item) => item.mimeType === FOLDER_MIME_TYPE)
  const files = allItems.filter((item) => item.mimeType !== FOLDER_MIME_TYPE)

  return { folders, files }
}

// ─────────────────────────────────────────────
// 3. Get folder metadata (name, id) by folder ID
//    Useful for building breadcrumbs
// ─────────────────────────────────────────────
export const getFolderMetadata = async (folderId) => {
  const url = `${DRIVE_API_BASE}/files/${folderId}?${authParams()}&supportsAllDrives=true&fields=id,name,parents`

  const response = await fetch(url, {
    headers: buildHeaders(folderId),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error?.error?.message || 'Failed to fetch folder metadata')
  }

  return await response.json()
}

// ─────────────────────────────────────────────
// 4. Get the direct download URL for a file
//    Used when sending file IDs to your backend
// ─────────────────────────────────────────────
export const getFileDownloadUrl = (fileId) => {
  return `https://drive.google.com/uc?export=download&id=${fileId}`
}

// ─────────────────────────────────────────────
// 5. Build full breadcrumb trail for a folder
//    Walks up the parent chain from current folder to root
//    Returns: [{ id, name }, { id, name }, ...]  root → current
// ─────────────────────────────────────────────
export const buildBreadcrumbTrail = async (currentFolderId, rootFolderId = ROOT_FOLDER_ID) => {
  const trail = []
  let folderId = currentFolderId

  // Walk up until we hit the root
  while (folderId && folderId !== rootFolderId) {
    try {
      const metadata = await getFolderMetadata(folderId)
      trail.unshift({ id: metadata.id, name: metadata.name })
      folderId = metadata.parents?.[0] ?? null
    } catch {
      break
    }
  }

  // Always prepend root as the first crumb
  trail.unshift({ id: rootFolderId, name: 'Home' })

  return trail
}

// ─────────────────────────────────────────────
// 6. Format file size from bytes to readable string
//    e.g. 2048000 → "2.0 MB"
// ─────────────────────────────────────────────
export const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown size'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}
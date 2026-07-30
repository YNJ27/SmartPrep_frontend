// src/constants/api.js

export const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3'

export const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY

export const ROOT_FOLDER_ID = import.meta.env.VITE_ROOT_FOLDER_ID

export const RESOURCE_KEY = import.meta.env.VITE_RESOURCE_KEY

// Google Drive folder MIME type — used to distinguish folders from files
export const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder'

// Fields to fetch for each file/folder from Drive API
// Keeping this minimal improves performance
export const DRIVE_FILE_FIELDS = 'files(id, name, mimeType, size, modifiedTime, parents)'

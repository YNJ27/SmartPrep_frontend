import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_API_KEY

const inMemoryStorage = (() => {
  const store = {}
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = value },
    removeItem: (key) => { delete store[key] },
  }
})()

// This client is used ONLY to perform the login/signup/OAuth handshake.
// It must never persist tokens to browser storage — the backend, via
// httpOnly cookies, is the sole source of truth for session state.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: inMemoryStorage,
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: true, // still needed so OAuth redirect fragments/PKCE code exchange work in-browser
  },
})

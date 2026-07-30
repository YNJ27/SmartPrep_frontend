// src/authBridge.js
const API_BASE = import.meta.env.VITE_API_BASE_URL // e.g. http://localhost:8000

export async function handOffSessionToBackend(session) {
  if (!session) return false
  const res = await fetch(`${API_BASE}/auth/session`, {
    method: "POST",
    credentials: "include", // required so the Set-Cookie response is stored
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    }),
  })
  if (!res.ok) {
    console.error("Failed to hand off session to backend", await res.text())
    return false
  }
  return true
}

export async function handleLogout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
  } catch (err) {
    console.error("Logout failed:", err)
  }
  sessionStorage.removeItem("apiKeysPresent")
  window.location.href = "/"
}

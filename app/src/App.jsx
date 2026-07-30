import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import InputPage from "./pages/InputPage";
import OutputPage from "./pages/OutputPage";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ApiKeyPage from "./pages/ApiKeyPage";
import ChangeGoogleApiKeyPage from "./pages/ChangeGoogleApiKeyPage";
import TutorialsPage from "./pages/TutorialsPage";
import { supabase } from "./supabaseClient";
import { handOffSessionToBackend } from "./authBridge";
function App() {
  const [session, setSession] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Initialize state from sessionStorage to avoid flickering on page reload
  const [apiKeysStatus, setApiKeysStatus] = useState(() => {
    return sessionStorage.getItem("apiKeysPresent") === "true" ? "present" : "loading";
  });
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    const checkApiKeys = async () => {
      try {
        const res = await fetch(`${API_BASE}/user/api-keys`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch API keys");
        const data = await res.json();
        
        const providers = data.providers || [];
        if (providers.includes("Mistral") && providers.includes("Google")) {
          sessionStorage.setItem("apiKeysPresent", "true");
          setApiKeysStatus("present");
          return;
        }
        
        sessionStorage.removeItem("apiKeysPresent");
        setApiKeysStatus("missing");
      } catch (err) {
        console.error(err);
        setApiKeysStatus("missing");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, authSession) => {
      if (event === 'SIGNED_IN' && authSession) {
        const ok = await handOffSessionToBackend(authSession);
        if (ok) window.location.href = '/home';
      }
    });

    if (window.location.hash.includes("access_token=")) {
      // We are in the middle of an OAuth redirect. Wait for onAuthStateChange to handle it.
      return () => subscription.unsubscribe();
    }

    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setSession({ user: { id: data.user_id, email: data.email } });
          if (sessionStorage.getItem("apiKeysPresent") !== "true") {
            await checkApiKeys();
          }
        } else {
          setSession(null);
          setApiKeysStatus("missing");
        }
      } catch (err) {
        console.error("Auth check failed", err);
        setSession(null);
        setApiKeysStatus("missing");
      }
      setInitialLoad(false);
    };

    checkAuth();
    return () => subscription.unsubscribe();
  }, []);

  // Only block the UI on initial mount or if we absolutely must wait for the API key check
  if (initialLoad || (session && apiKeysStatus === "loading")) {
    return <div>Loading...</div>;
  }

  const requiresApiKeys = session && apiKeysStatus === "missing";

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!session ? <LandingPage /> : <Navigate to={requiresApiKeys ? "/api-keys" : "/home"} replace />} />
        <Route path="/login" element={!session ? <LoginPage /> : <Navigate to={requiresApiKeys ? "/api-keys" : "/home"} replace />} />
        
        <Route path="/api-keys" element={requiresApiKeys ? <ApiKeyPage /> : <Navigate to="/home" replace />} />
        <Route path="/change-google-key" element={session ? <ChangeGoogleApiKeyPage /> : <Navigate to="/" replace />} />

        <Route path="/home" element={session ? (!requiresApiKeys ? <HomePage /> : <Navigate to="/api-keys" replace />) : <Navigate to="/" replace />} />
        <Route path="/input" element={session ? (!requiresApiKeys ? <InputPage /> : <Navigate to="/api-keys" replace />) : <Navigate to="/" replace />} />
        <Route path="/output" element={session ? (!requiresApiKeys ? <OutputPage /> : <Navigate to="/api-keys" replace />) : <Navigate to="/" replace />} />
        <Route path="/tutorials" element={session ? (!requiresApiKeys ? <TutorialsPage /> : <Navigate to="/api-keys" replace />) : <Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
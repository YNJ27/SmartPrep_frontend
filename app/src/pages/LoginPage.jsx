import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleEmailPasswordAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (isLoginMode) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // onAuthStateChange fires SIGNED_IN → handOffSessionToBackend → redirect to /home
        // Return early to keep loading=true while the handoff happens
        return;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data?.session) {
          // Supabase requires email confirmation — no session until confirmed
          setErrorMsg("Signed up! Please check your email to confirm, then log in.");
          setIsLoginMode(true);
        } else {
          // Auto-confirm is on, so session exists. 
          // Return early to keep loading=true while handoff happens
          return;
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "Authentication failed");
    }

    setLoading(false);
  };
  
  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`
        }
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message || "Google authentication failed");
    }
  };

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '40px 20px', fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      <div style={{ textAlign: 'left', position: 'relative', maxWidth: '500px', margin: '0 auto', border: '1.5px solid #1a1a1a', borderRadius: '12px', backgroundColor: '#ffffff', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)' }}>
        
        <style>{`
          .auth-input::placeholder {
            color: #b0b0b0;
          }
          .google-auth-btn {
            width: 100%;
            padding: 12px;
            background: white;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 16px;
            font-weight: 600;
            color: #202124;
            cursor: pointer;
            transition: background 0.2s, border-color 0.2s;
            font-family: inherit;
          }
          .google-auth-btn:hover {
            background: #f8f9fa;
            border-color: #d2d2d2;
          }
          .google-icon {
            width: 20px;
            height: 20px;
          }
          .toggle-link {
            color: #1a73e8;
            cursor: pointer;
            font-weight: 600;
            text-decoration: none;
          }
          .toggle-link:hover {
            text-decoration: underline;
          }
        `}</style>

        <div style={{ position: 'relative', padding: '24px 30px', borderBottom: '1.5px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
          <h1 style={{ 
            color: '#1a1a1a', 
            fontWeight: '700', 
            textTransform: 'uppercase', 
            fontSize: '24px', 
            margin: 0, 
            letterSpacing: '1.5px' 
          }}>
            {isLoginMode ? "LOGIN" : "SIGN UP"}
          </h1>
        </div>

        <div style={{ padding: '40px 30px' }}>
          {errorMsg && <p style={{ color: '#c5221f', fontSize: '15px', marginBottom: '20px', fontWeight: '500' }}>{errorMsg}</p>}

          <form onSubmit={handleEmailPasswordAuth} style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#202124', fontWeight: '600' }}>Email Address</p>
              <input 
                className="auth-input"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  boxSizing: 'border-box', 
                  border: '2px solid #e0e0e0', 
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#202124', fontWeight: '600' }}>Password</p>
              <input 
                className="auth-input"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ 
                  width: '100%', 
                  padding: '14px 16px', 
                  boxSizing: 'border-box', 
                  border: '2px solid #e0e0e0', 
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            <button 
              type="submit"
              disabled={!isFormValid || loading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: isFormValid && !loading ? '#1a73e8' : '#e8f0fe',
                color: isFormValid && !loading ? '#ffffff' : '#a8c7fa',
                border: 'none',
                borderRadius: '8px',
                cursor: isFormValid && !loading ? 'pointer' : 'not-allowed',
                fontSize: '17px',
                fontWeight: '600',
                display: 'block',
                transition: 'background-color 0.2s, transform 0.1s'
              }}
              onMouseDown={(e) => isFormValid && !loading && (e.target.style.transform = 'scale(0.98)')}
              onMouseUp={(e) => isFormValid && !loading && (e.target.style.transform = 'scale(1)')}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              {loading ? "Loading..." : isLoginMode ? "Log In" : "Sign up"}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
            <div style={{ flex: 1, borderBottom: '1px solid #e0e0e0' }}></div>
            <span style={{ padding: '0 12px', color: '#5f6368', fontSize: '14px', fontWeight: '500' }}>OR</span>
            <div style={{ flex: 1, borderBottom: '1px solid #e0e0e0' }}></div>
          </div>

          <button type="button" onClick={handleGoogleAuth} className="google-auth-btn">
            <svg className="google-icon" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '15px', color: '#5f6368' }}>
            {isLoginMode ? (
              <p style={{ margin: 0 }}>
                Don't have an account?{" "}
                <span onClick={() => setIsLoginMode(false)} className="toggle-link">
                  Sign up
                </span>
              </p>
            ) : (
              <p style={{ margin: 0 }}>
                Already have an account?{" "}
                <span onClick={() => setIsLoginMode(true)} className="toggle-link">
                  Log In
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

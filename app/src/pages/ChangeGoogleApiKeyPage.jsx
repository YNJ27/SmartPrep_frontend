import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChangeGoogleApiKeyPage = () => {
  const [googleKey, setGoogleKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVideoCardOpen, setIsVideoCardOpen] = useState(false);
  const navigate = useNavigate();

  const isFormValid = googleKey.trim() !== '';

  const handleSave = async () => {
    if (!isFormValid) return;
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      if (googleKey) {
        const res = await fetch('/user/api-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: 'Google',
            api_key: googleKey
          })
        });
        if (!res.ok) throw new Error('Failed to save Google API key');
        
        setSuccess('Google API Key updated successfully!');
        setGoogleKey('');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating the key');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '40px 20px', fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      <div style={{ textAlign: 'left', position: 'relative', maxWidth: '750px', margin: '0 auto', border: '1.5px solid #1a1a1a', borderRadius: '12px', backgroundColor: '#ffffff', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)' }}>
        
        <style>{`
          .back-button {
            position: absolute;
            left: 24px;
            background: #ffffff;
            border: 1.5px solid #e0e0e0;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14.5px;
            font-weight: 600;
            color: #5f6368;
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            transition: border-color 0.2s, color 0.2s;
          }
          .back-button:hover {
            border-color: #1a73e8;
            color: #1a73e8;
          }
          .api-key-input::placeholder {
            color: #b0b0b0;
          }
        `}</style>

        <div style={{ position: 'relative', padding: '24px 30px', borderBottom: '1.5px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <h1 style={{ 
            color: '#1a1a1a', 
            fontWeight: '700', 
            textTransform: 'uppercase', 
            fontSize: '24px', 
            margin: 0, 
            letterSpacing: '1.5px' 
          }}>
            GOOGLE API KEY
          </h1>
        </div>

        <div style={{ padding: '40px 30px' }}>
          <div style={{ marginBottom: '32px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#202124', fontWeight: '500' }}>
              Link to create a new Google API Key:
            </p>
            <a href="https://aistudio.google.com/app/api-keys" target="_blank" rel="noreferrer" style={{ color: '#1a73e8', textDecoration: 'none', fontSize: '17px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '500', padding: '8px 16px', backgroundColor: 'rgba(26, 115, 232, 0.08)', borderRadius: '8px' }}>
              google_api_key
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
          
          <div style={{ borderBottom: '1px solid #e0e0e0', marginBottom: '24px' }}></div>

          <div 
            onClick={() => setIsVideoCardOpen(!isVideoCardOpen)}
            style={{
              border: isVideoCardOpen ? '2px solid #1a73e8' : '2px solid #e0e0e0',
              borderRadius: '8px',
              padding: '16px 20px',
              cursor: 'pointer',
              marginBottom: '32px',
              transition: 'border-color 0.2s',
              backgroundColor: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{
                  transform: isVideoCardOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  color: '#202124'
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              <span style={{ fontSize: '18px', color: '#202124', fontWeight: '600' }}>How to change the Google API Key?</span>
            </div>
            {isVideoCardOpen && (
              <div style={{ marginTop: '20px' }}>
                <iframe 
                  width="100%" 
                  height="360" 
                  src="https://www.youtube.com/embed/WTh8RSiSeuc" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                  style={{ borderRadius: '8px' }}
                ></iframe>
              </div>
            )}
          </div>

          <div style={{ borderBottom: '1px solid #e0e0e0', marginBottom: '32px' }}></div>

          <div style={{ marginBottom: '24px' }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#202124', fontWeight: '500' }}>New Google API Key:</p>
            <input 
              className="api-key-input"
              type="password" 
              value={googleKey}
              onChange={(e) => setGoogleKey(e.target.value)}
              placeholder="••••••••••••••••••••••••••"
              style={{ 
                width: '100%', 
                padding: '16px 18px', 
                boxSizing: 'border-box', 
                border: '2px solid #e0e0e0', 
                borderRadius: '8px',
                fontSize: '18px',
                fontFamily: 'monospace',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#1a73e8'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            <p style={{ color: '#c5221f', fontSize: '14.5px', margin: '10px 0 0 0', fontWeight: '500' }}>Note: Don't keep any leading or trailing spaces</p>
          </div>

          {error && <p style={{ color: '#c5221f', fontSize: '15px', marginBottom: '20px', fontWeight: '500' }}>{error}</p>}
          {success && <p style={{ color: '#188038', fontSize: '15px', marginBottom: '20px', fontWeight: '600' }}>{success}</p>}

          <button 
            onClick={handleSave}
            disabled={!isFormValid || isSubmitting}
            style={{
              padding: '12px 28px',
              backgroundColor: isFormValid ? '#1a73e8' : '#e8f0fe',
              color: isFormValid ? '#ffffff' : '#a8c7fa',
              border: 'none',
              borderRadius: '8px',
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              fontSize: '17px',
              fontWeight: '600',
              display: 'block',
              transition: 'background-color 0.2s, transform 0.1s'
            }}
            onMouseDown={(e) => isFormValid && (e.target.style.transform = 'scale(0.97)')}
            onMouseUp={(e) => isFormValid && (e.target.style.transform = 'scale(1)')}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeGoogleApiKeyPage;

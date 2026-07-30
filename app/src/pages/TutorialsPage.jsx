import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

const TutorialsPage = () => {
  const [openCardId, setOpenCardId] = useState(null);

  const handleToggle = (id) => {
    setOpenCardId(openCardId === id ? null : id);
  };

  const tutorials = [
    {
      id: 1,
      title: 'How to use it?',
      videoUrl: 'https://www.youtube.com/embed/DvV0adRljBs'
    },
    {
      id: 2,
      title: 'How to create the API Keys?',
      videoUrl: 'https://www.youtube.com/embed/6QSkEYOPZ6I'
    },
    {
      id: 3,
      title: 'How to change the Google API Key?',
      videoUrl: 'https://www.youtube.com/embed/WTh8RSiSeuc' 
    }
  ];

  return (
    <div style={styles.page}>
      <Sidebar currentPage="tutorials" />

      <main style={styles.main}>
        <h1 style={styles.pageTitle}>TUTORIALS</h1>

        <div style={styles.list}>
          {tutorials.map((tutorial, index) => (
            <React.Fragment key={tutorial.id}>
              {index > 0 && (
                <div style={{ borderBottom: '1px solid #e0e0e0', marginBottom: '32px', marginTop: '0px' }}></div>
              )}
              <div 
                onClick={() => handleToggle(tutorial.id)}
                style={{
                  border: openCardId === tutorial.id ? '2px solid #1a73e8' : '2px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '16px 24px',
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
                      transform: openCardId === tutorial.id ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      color: '#202124'
                    }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                  <span style={{ fontSize: '18px', color: '#202124', fontWeight: '600' }}>{tutorial.title}</span>
                </div>
                {openCardId === tutorial.id && (
                  <div style={{ marginTop: '20px' }}>
                    <iframe 
                      width="100%" 
                      src={tutorial.videoUrl} 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowFullScreen
                      style={{ borderRadius: '8px', aspectRatio: '16/9', minHeight: '400px' }}
                    ></iframe>
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      </main>
    </div>
  );
};

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
    margin: '0 0 32px',
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
  },
};

export default TutorialsPage;

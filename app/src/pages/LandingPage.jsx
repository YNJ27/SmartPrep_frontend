import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <img src="/logo.png" alt="Logo" className="nav-logo" />
            <span className="nav-brand">SmartPrep</span>
          </div>
          <div className="nav-right">
            <span className="nav-link" onClick={() => document.getElementById("how-to-use").scrollIntoView({ behavior: "smooth" })}>How to Use</span>
            <span className="nav-link" onClick={() => navigate("/login")}>Login</span>
          </div>
        </div>
      </nav>
      <main className="landing-content">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="hero-title-main">Grouped PYQs</span>
              <br />
              <span className="hero-title-accent">Ready in Minutes</span>
            </h1>
            <p className="hero-description">
              Automatically group similar previous year questions, rank them by frequency, and identify the most important topics - so you can focus on what matters most.
            </p>
          </div>
          <div className="hero-visual">
            <div className="demo-container">
              <div className="tilted-window">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  preload="metadata"
                  className="demo-video"
                >
                  <source src="/demo-video.webm" type="video/webm" />
                  <source src="/demo-video.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section id="how-to-use" className="how-to-use-section">
        <h2 className="how-to-use-title">How to use?</h2>
        <div className="how-to-use-content">
          <div className="how-to-use-left">
            <h3 className="how-to-use-subtitle">Video</h3>
            <div className="iframe-container">
              <iframe 
                src="https://www.youtube.com/embed/DvV0adRljBs" 
                title="How to use SmartPrep"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="how-to-use-iframe"
              ></iframe>
            </div>
          </div>
          <div className="how-to-use-right">
            <h3 className="how-to-use-subtitle">Steps</h3>
            <div className="flow-container">
              <div className="flow-step arrow-right">Login</div>
              <div className="flow-step arrow-down">Create & add API Keys</div>
              <div className="flow-step arrow-left">On Home Page select "Add new subject"</div>
              <div className="flow-step arrow-down">Navigate to your desired subject</div>
              <div className="flow-step arrow-right">Select exam type and click "Start Processing"</div>
              <div className="flow-step">Grouped questions delivered in minutes</div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        * {
          box-sizing: border-box;
        }
        
        body, html {
          margin: 0;
          padding: 0;
        }

        .landing-page {
          min-height: 100vh;
          background-color: #f4f9fd; /* Light bluish theme */
          font-family: "Inter", "Space Grotesk", sans-serif;
          display: flex;
          flex-direction: column;
        }

        .navbar {
          width: 100%;
          background: #ffffff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: center;
        }

        .nav-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 1280px;
          padding: 16px 48px;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-logo {
          height: 36px;
          width: auto;
          border-radius: 8px;
        }

        .nav-brand {
          font-size: 22px;
          font-weight: 700;
          color: #000;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-link {
          font-size: 16px;
          font-weight: 600;
          color: #000;
          cursor: pointer;
          transition: color 0.2s ease;
        }

        .nav-link:hover {
          color: #007bff;
        }

        .landing-content {
          min-height: calc(100vh - 68px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 60px 48px;
        }

        .hero-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 1280px;
          gap: 60px;
        }

        .hero-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 40px;
          max-width: 600px;
        }

        .hero-title {
          font-size: 64px;
          line-height: 1.1;
          font-weight: 700;
          margin: 0;
          margin-top: -30px;
          letter-spacing: -1px;
          text-align: left;
        }

        .hero-title-main {
          color: #111827;
        }

        .hero-title-accent {
          color: #007bff;
        }

        .hero-visual {
          flex: 1;
        }

        .hero-description {
          font-size: 20px;
          line-height: 1.6;
          color: #4b5563;
          margin: 0;
          text-align: left;
        }

        .demo-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
          padding-top: 0;
          margin-top: -60px;
          perspective: 1200px;
          width: 100%;
        }

        .tilted-window {
          display: inline-block;
          border-radius: 12px;
          overflow: hidden;
          transform: rotateX(15deg) rotateY(-20deg) rotateZ(5deg);
          box-shadow: 
            -10px 20px 30px rgba(0, 0, 0, 0.15),
            inset 0 0 100px rgba(0, 0, 0, 0.05);
        }

        .demo-video {
          height: calc(100vh - 300px);
          width: 38vw;
          min-width: 500px;
          object-fit: cover;
          display: block;
          background-color: #000; /* Fallback color before video loads */
        }

        .how-to-use-section {
          width: 100%;
          padding: 40px 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          background-color: #ffffff;
        }

        .how-to-use-title {
          font-size: 40px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 20px;
          text-align: center;
        }

        .how-to-use-content {
          display: flex;
          width: 100%;
          max-width: 1300px;
          gap: 60px;
          align-items: flex-start;
          justify-content: space-between;
        }

        .how-to-use-left {
          flex: 1.6;
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .how-to-use-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .how-to-use-subtitle {
          font-size: 28px;
          font-weight: 700;
          color: #007bff;
          margin-bottom: 24px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
        }

        .iframe-container {
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .how-to-use-iframe {
          width: 100%;
          height: 100%;
        }

        .flow-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px 32px;
          position: relative;
        }

        .flow-step {
          background: #f0f8ff;
          padding: 16px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.1);
          border: 2px solid #cce5ff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 15px;
          font-weight: 600;
          color: #004085;
          position: relative;
          min-height: 80px;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .flow-step:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 123, 255, 0.2);
          border-color: #007bff;
        }

        .flow-step:nth-child(1) { grid-area: 1 / 1 / 2 / 2; }
        .flow-step:nth-child(2) { grid-area: 1 / 2 / 2 / 3; }
        .flow-step:nth-child(3) { grid-area: 2 / 2 / 3 / 3; }
        .flow-step:nth-child(4) { grid-area: 2 / 1 / 3 / 2; }
        .flow-step:nth-child(5) { grid-area: 3 / 1 / 4 / 2; }
        .flow-step:nth-child(6) { grid-area: 3 / 2 / 4 / 3; }

        .arrow-right::after, .arrow-left::after, .arrow-down::after {
          position: absolute;
          color: #007bff;
          font-size: 24px;
          font-weight: bold;
          z-index: 10;
        }

        .arrow-right::after {
          content: '➔';
          right: -16px;
          top: 50%;
          transform: translate(50%, -50%);
        }

        .arrow-left::after {
          content: '←';
          left: -16px;
          top: 50%;
          transform: translate(-50%, -50%);
        }

        .arrow-down::after {
          content: '↓';
          bottom: -16px;
          left: 50%;
          transform: translate(-50%, 50%);
        }

        @media (max-width: 850px) {
          .hero-container {
            flex-direction: column;
            align-items: flex-start;
          }
          .hero-title {
            font-size: 48px;
          }
          .how-to-use-content {
            flex-direction: column;
            gap: 40px;
          }
          .how-to-use-left, .how-to-use-right {
            flex: unset;
            width: 100%;
          }
          .flow-container {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .flow-step {
            grid-area: auto !important;
          }
          .arrow-right::after, .arrow-left::after, .arrow-down::after {
            content: '↓';
            position: absolute;
            bottom: -12px;
            left: 50%;
            top: auto;
            right: auto;
            transform: translate(-50%, 50%);
          }
          .flow-step:last-child::after {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

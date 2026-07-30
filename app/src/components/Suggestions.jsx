import React, { useState, useEffect, useRef } from 'react';
import './Suggestions.css';

const Suggestions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenSuggestions');
    if (!hasSeen) {
      setIsOpen(true);
      localStorage.setItem('hasSeenSuggestions', 'true');
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current && 
        !popupRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <div 
        className="suggestions-button"
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        title="Suggestions"
      >
        <img src="/info.png" alt="Info" className="suggestions-icon" />
      </div>

      {isOpen && (
        <div className="suggestions-popup" ref={popupRef}>
          <div className="suggestions-header">
            <h3 className="suggestions-title">Suggestions</h3>
            <button className="suggestions-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>
          <div className="suggestions-body">
            <div className="s-orange-box">
              <div className="s-icon-placeholder">
                <div className="s-icon-mask-orange" />
              </div>
              <p className="s-orange-text">
                Try not to add more than 5 subjects in a single day using one Google API Key. It is better to change the key. Check the sidebar for this option.
              </p>
            </div>
            <div className="s-orange-box">
              <div className="s-icon-placeholder">
                <div className="s-icon-mask-orange" />
              </div>
              <p className="s-orange-text">
                Once you added a subject, wait for atleast 2 mins before adding the next one
              </p>
            </div>
            <div className="s-purple-box">
              <div className="s-icon-placeholder">
                <div className="s-icon-mask-purple" />
              </div>
              <p className="s-purple-text">
                Once your exam is over, you can delete that subject to avoid clutter.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Suggestions;

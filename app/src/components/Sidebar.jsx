import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { handleLogout as backendLogout } from '../authBridge';

import './Sidebar.css';

const Sidebar = ({ currentPage }) => {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const handleLogout = async () => {
    await backendLogout();
  };

  const getOptions = () => {
    switch (currentPage) {
      case 'home':
        return [
          { label: 'Add a new subject', icon: '/add.png', action: () => navigate('/input') },
          { label: 'Change Google API Key', icon: '/key.png', action: () => navigate('/change-google-key') },
          { label: 'Tutorials', icon: '/tutorial.png', action: () => navigate('/tutorials') },
          { label: 'Log out', icon: '/logout.png', isLogout: true, action: () => setShowLogoutConfirm(true) },
        ];
      case 'input':
        return [
          { label: 'Home', icon: '/home.png', action: () => navigate('/home') },
          { label: 'Change Google API Key', icon: '/key.png', action: () => navigate('/change-google-key') },
          { label: 'Tutorials', icon: '/tutorial.png', action: () => navigate('/tutorials') },
          { label: 'Log out', icon: '/logout.png', isLogout: true, action: () => setShowLogoutConfirm(true) },
        ];
      case 'output':
        return [
          { label: 'Home', icon: '/home.png', action: () => navigate('/home') },
          { label: 'Add a new subject', icon: '/add.png', action: () => navigate('/input') },
          { label: 'Change Google API Key', icon: '/key.png', action: () => navigate('/change-google-key') },
          { label: 'Tutorials', icon: '/tutorial.png', action: () => navigate('/tutorials') },
          { label: 'Log out', icon: '/logout.png', isLogout: true, action: () => setShowLogoutConfirm(true) },
        ];
      case 'tutorials':
        return [
          { label: 'Home', icon: '/home.png', action: () => navigate('/home') },
          { label: 'Add a new subject', icon: '/add.png', action: () => navigate('/input') },
          { label: 'Change Google API Key', icon: '/key.png', action: () => navigate('/change-google-key') },
          { label: 'Log out', icon: '/logout.png', isLogout: true, action: () => setShowLogoutConfirm(true) },
        ];
      default:
        return [];
    }
  };

  return (
    <>
      <div className="global-sidebar">
        <div className="sidebar-header">
          Options
        </div>
        <div className="sidebar-menu">
          {getOptions().map((opt, idx) => (
            <div
              key={idx}
              className={`sidebar-item ${opt.isLogout ? 'logout-item' : ''}`}
              onClick={opt.action}
            >
              <img src={opt.icon} alt="" className="sidebar-item-icon" />
              <span className="sidebar-item-label">{opt.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Logout Confirmation Popup */}
      {showLogoutConfirm && (
        <div className="logout-popup-container" onClick={() => setShowLogoutConfirm(false)}>
          <div className="logout-popup" onClick={(e) => e.stopPropagation()}>
            <div className="logout-header">
              <h2 className="logout-title">Log Out Confirmation</h2>
              <button className="logout-close" onClick={() => setShowLogoutConfirm(false)}>✕</button>
            </div>
            <div className="logout-body">
              <p className="logout-text">Are you sure you want to log out?</p>
            </div>
            <div className="logout-footer">
              <button className="cancel-btn" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
              <button className="confirm-btn" onClick={handleLogout}>Log Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

// Sidebar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
  

    window.location.replace("/admin-login");
  };

  return (
    <div className={`sidebar-container ${isOpen ? 'open' : 'closed'}`}>
      
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isOpen ? '←' : '☰'}
      </button>

      {isOpen && (
        <div className="sidebar">
          <h2 className="sidebar-title">VNRVJIET</h2>

          <nav>
            <ul>

              <li className={location.pathname === '/admin' ? 'active' : ''}>
                <Link to="/admin">Dashboard</Link>
              </li>

              <li className={location.pathname === '/admin/students' ? 'active' : ''}>
                <Link to="/admin/students">Students</Link>
              </li>

              <li className={location.pathname === '/admin/internships' ? 'active' : ''}>
                <Link to="/admin/internships">Internships</Link>
              </li>

              <li className={location.pathname === '/admin/feedbacks' ? 'active' : ''}>
                <Link to="/admin/feedbacks">Feedbacks</Link>
              </li>

              <li className={location.pathname === '/admin/analytics' ? 'active' : ''}>
                <Link to="/admin/analytics">Analytics</Link>
              </li>

              <li className={location.pathname === '/admin/organizations' ? 'active' : ''}>
                <Link to="/admin/organizations">Organizations</Link>
              </li>

              {isLoggedIn && (
                <li>
                  <button
                    className="btn btn-danger mt-3 w-100"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              )}

            </ul>
          </nav>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
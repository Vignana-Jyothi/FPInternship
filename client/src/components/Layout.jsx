// src/components/Layout.js
import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/admin-login", { replace: true });
      }
    };

    // Normal mount check
    checkAuth();

    // 👇 THIS handles swipe back/forward cache
    window.addEventListener("pageshow", checkAuth);

    return () => {
      window.removeEventListener("pageshow", checkAuth);
    };
  }, [navigate]);

  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
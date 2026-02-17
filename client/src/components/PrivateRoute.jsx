// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');  // ✅ FIXED

  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

export default PrivateRoute;
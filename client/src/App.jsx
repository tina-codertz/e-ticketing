// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/layout';

// Pages
import AuthForm from './components/auth/AuthForm';
import UserDashboard from './components/user/UserDashboard';
import BookingFlow from './components/user/BookingFlow';
import MyTickets from './components/user/MyTickets';
import AdminDashboard from './components/admin/AdminDashboard';
import BookingManagement from './components/admin/BookingManagement';
import UserManagement from './components/admin/UserManagement';
import EventManagement from './components/admin/EventManagement';

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Optional: loading state while checking auth
  if (user === undefined) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        {/* Login - redirect if already logged in */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <AuthForm setUser={setUser} />}
        />

        {/* Protected routes - only shown when logged in */}
        <Route
          element={
            user ? (
              <Layout user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          {/* Admin-only routes */}
          {user?.role === 'admin' && (
            <>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/bookings" element={<BookingManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/events" element={<EventManagement />} />
            </>
          )}

          {/* User-only routes */}
          {user?.role === 'user' && (
            <>
              <Route path="/" element={<UserDashboard />} />
              <Route path="/booking" element={<BookingFlow />} />
              <Route path="/tickets" element={<MyTickets />} />
            </>
          )}

          {/* Optional: fallback for logged-in users with invalid role */}
          <Route path="*" element={<div>Access Denied or Page Not Found</div>} />
        </Route>

        {/* Catch-all for everyone else */}
        <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />
      </Routes>
    </Router>
  );
};

export default App;
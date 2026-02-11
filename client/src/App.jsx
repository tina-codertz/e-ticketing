// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/layout';
import { useApp } from './context/AppContext';

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
  const { currentUser } = useApp();

  return (
    <Router>
      <Routes>
        {/* Login - redirect to home if already logged in */}
        <Route
          path="/login"
          element={currentUser ? <Navigate to="/" replace /> : <AuthForm />}
        />

        {/* Protected Routes */}
        <Route
          element={
            currentUser ? (
              <Layout user={currentUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          {/* Admin Routes */}
          {currentUser?.role === 'admin' && (
            <>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/bookings" element={<BookingManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/events" element={<EventManagement />} />
            </>
          )}

          {/* User Routes */}
          {currentUser?.role === 'user' && (
            <>
              <Route path="/" element={<UserDashboard />} />
              <Route path="/booking" element={<BookingFlow />} />
              <Route path="/tickets" element={<MyTickets />} />
            </>
          )}

          {/* Fallback for unauthorized access or unhandled routes within protected area */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* Global Catch-all */}
        <Route path="*" element={<Navigate to={currentUser ? '/' : '/login'} replace />} />
      </Routes>
    </Router>
  );
};

export default App;
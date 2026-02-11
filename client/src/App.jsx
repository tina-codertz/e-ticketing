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
        {/* Login page - still redirects to home if already logged in */}
        <Route
          path="/login"
          element={currentUser ? <Navigate to="/" replace /> : <AuthForm />}
        />

        {/* All pages are now publicly accessible */}
        <Route element={<Layout user={currentUser} />}>
          {/* Admin Routes - visible to everyone now */}
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/bookings" element={<BookingManagement />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/events" element={<EventManagement />} />

          {/* User Routes - visible to everyone now */}
          <Route path="/booking" element={<BookingFlow />} />
          <Route path="/tickets" element={<MyTickets />} />

          {/* Optional: redirect unknown paths to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* Optional global catch-all (can be removed if you prefer 404 page later) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
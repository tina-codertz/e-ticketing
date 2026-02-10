import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/layout';

// Pages (adjust paths to match your project)
import AuthForm from './components/auth/AuthForm';
import EventCard from './components/user/EventCard';
import EventDetail from './components/user/EventDetail';
import MyTickets from './components/user/MyTickets';
import BookingFlow from './components/user/BookingFlow';
import AdminDashboard from './components/admin/AdminDashboard';
import  BookingManagement  from './components/admin/BookingManagement';
import  UserManagement  from './components/admin/UserManagement';
import EventManagement from './components/admin/EventManagement';
import UserDashboard from './components/user/UserDashboard';


const App = () => {
  const [user, setUser] = useState(null);

  // Restore user from token/localStorage on refresh
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <AuthForm setUser={setUser} />}
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            user ? (
              <Layout user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          {/* Admin Routes */}
          {user?.role === 'admin' && (
            <>
              <Route index element={<AdminDashboard />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="booking-management" element={<BookingManagement />} />
              <Route path="user-management" element={<UserManagement />} />
              <Route path="event-management" element={<EventManagement />} />
            </>
          )}

          {/* User Routes */}
          {user?.role === 'user' && (
            <>
              <Route index element={<UserDashboard />} />
              <Route path="booking" element={<BookingFlow />} />
              <Route path="tickets" element={<MyTickets />} />
            </>
          )}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;

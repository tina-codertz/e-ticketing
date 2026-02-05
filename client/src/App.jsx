import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthForm from './pages/AuthForm';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Home from './components/Home';

const API_URL = 'http://localhost:3000/api';

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get(`${API_URL}/user`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data);
          setError(null);
        })
        .catch((err) => {
          localStorage.removeItem('token');
          setError('Failed to fetch user data. Please log in again.');
        });
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-500">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthForm setUser={setUser} />} />
          <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard user={user} setUser={setUser} /> : <Navigate to="/login" replace />} />
          <Route path="/user" element={user ? <UserDashboard user={user} setUser={setUser} /> : <Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
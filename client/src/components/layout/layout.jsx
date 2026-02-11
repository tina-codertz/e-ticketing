// components/layout/Layout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import Sidebar from './sidebar';
import Header from './header';
import Footer from './footer';

const Layout = ({ user, setUser }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar user={user} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        <Header
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          user={user}
          onLogout={handleLogout}
        />

        <main className="p-6">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Layout;
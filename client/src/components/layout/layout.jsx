// components/layout/Layout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

import Sidebar from './sidebar';
import Header from './header';
import Footer from './footer';
import MobileNav from './Mobilenav';

const Layout = () => {
  const { currentUser } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-20 lg:pb-0">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar (desktop + mobile drawer) */}
      <Sidebar user={currentUser} onClose={closeSidebar} sidebarOpen={sidebarOpen} />

      {/* Main Content Area */}
      <div className="lg:pl-64">
        <Header
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          user={currentUser}
        />

        <main className="p-4 md:p-6 min-h-[calc(100vh-200px)]">
          <Outlet />
        </main>

        <Footer />

        {/* Mobile Bottom Navigation */}
        <MobileNav user={currentUser} />
      </div>
    </div>
  );
};

export default Layout;
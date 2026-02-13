// components/layout/Header.jsx
import React from 'react';
import { Menu, X, Search } from 'lucide-react';

const Header = ({ sidebarOpen, toggleSidebar, user }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-colors lg:hidden"
          >
            {sidebarOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
          </button>

          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events, tickets..."
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 ml-4">
          {/* User Info */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'user'}`}
              alt={user?.name || 'User'}
              className="h-9 w-9 rounded-full border-2 border-white shadow-sm"
            />
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'user'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
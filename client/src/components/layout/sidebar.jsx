// components/layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Users, Ticket, LogOut, Home
} from 'lucide-react';

const Sidebar = ({ user, onClose }) => {
  const location = useLocation();

  const adminNavItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/events',     icon: <Calendar size={20} />,       label: 'Events' },
    { path: '/bookings',   icon: <Ticket size={20} />,         label: 'Bookings' },
    { path: '/users',      icon: <Users size={20} />,          label: 'Users' },
  ];

  const userNavItems = [
    { path: '/',        icon: <Home size={20} />,    label: 'Home' },
    { path: '/booking', icon: <Ticket size={20} />,  label: 'Book Tickets' },
    { path: '/tickets', icon: <Calendar size={20} />,label: 'My Tickets' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 lg:translate-x-0 -translate-x-full">
      <div className="h-full flex flex-col">
        {/* Sidebar Header / Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Ticket className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                e-ticket
              </h1>
              <p className="text-xs text-gray-500">
                {user?.role === 'admin' ? 'Admin Panel' : 'User Portal'}
              </p>
            </div>
          </div>
        </div>

    

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer - Logout */}
        <div className="p-4 border-t">
          <button
            onClick={onClose} // optional – can close sidebar after logout
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
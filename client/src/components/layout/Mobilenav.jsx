import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Ticket,
  Home,
} from 'lucide-react';

const MobileNav = ({ user }) => {
  const adminNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/events', icon: Calendar, label: 'Events' },
    { path: '/bookings', icon: Ticket, label: 'Bookings' },
    { path: '/users', icon: Users, label: 'Users' },
  ];

  const userNavItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/booking', icon: Ticket, label: 'Book' },
    { path: '/tickets', icon: Calendar, label: 'Tickets' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

  
  const mobileItems = navItems.slice(0, 4);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-blue-600 bg-gradient-to-br from-blue-50 to-purple-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`
            }
          >
            <item.icon size={22} />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
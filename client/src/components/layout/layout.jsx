import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Ticket, Calendar, Receipt, Users, LogOut, Menu, X } from 'lucide-react';

const Layout = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const renderNavButtons = () => {
    if (user?.role === 'admin') {
      return (
        <>
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
            onClick={() => navigate('/admin')}
          >
            <Calendar className="h-4 w-4" /> Dashboard
          </button>
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
            onClick={() => navigate('/admin/events')}
          >
            <Calendar className="h-4 w-4" /> Events
          </button>
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
            onClick={() => navigate('/admin/bookings')}
          >
            <Receipt className="h-4 w-4" /> Bookings
          </button>
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
            onClick={() => navigate('/admin/users')}
          >
            <Users className="h-4 w-4" /> Users
          </button>
        </>
      );
    } else {
      return (
        <>
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
            onClick={() => navigate('/user')}
          >
            <Calendar className="h-4 w-4" /> Events
          </button>
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
            onClick={() => navigate('/user/tickets')}
          >
            <Ticket className="h-4 w-4" /> My Tickets
          </button>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r p-4">
        <div
          className="flex items-center gap-3 mb-6 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="h-10 w-10 bg-blue-600 flex items-center justify-center rounded-lg">
            <Ticket className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Ticketify</h1>
            <p className="text-xs text-gray-600">Event Ticketing</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">{renderNavButtons()}</nav>

        <div className="mt-auto">
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded bg-red-500 text-white hover:bg-red-600"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-white w-64 h-full p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Menu</h3>
              <button
                className="p-1 rounded hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex flex-col gap-2">{renderNavButtons()}</nav>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 mt-4 rounded bg-red-500 text-white hover:bg-red-600"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 p-6">
        <button
          className="lg:hidden flex items-center gap-2 mb-4 px-3 py-2 rounded border border-gray-300 hover:bg-gray-100"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-4 w-4" /> Menu
        </button>

        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

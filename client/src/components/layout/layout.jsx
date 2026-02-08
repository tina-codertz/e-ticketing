import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Ticket, Calendar, Receipt, Users, LogOut, Menu, X } from 'lucide-react';

const Layout = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r p-4">
        <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => navigate('/')}>
          <div className="h-10 w-10 bg-blue-600 flex items-center justify-center rounded-lg">
            <Ticket className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Ticketify</h1>
            <p className="text-xs text-gray-600">Event Ticketing</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {user?.role === 'admin' ? (
            <>
              <Button className="w-full justify-start" variant="ghost" onClick={() => navigate('/admin')}>
                <Calendar className="mr-2 h-4 w-4" /> Dashboard
              </Button>
              <Button className="w-full justify-start" variant="ghost" onClick={() => navigate('/admin')}>
                <Calendar className="mr-2 h-4 w-4" /> Events
              </Button>
              <Button className="w-full justify-start" variant="ghost" onClick={() => navigate('/admin')}>
                <Receipt className="mr-2 h-4 w-4" /> Bookings
              </Button>
              <Button className="w-full justify-start" variant="ghost" onClick={() => navigate('/admin')}>
                <Users className="mr-2 h-4 w-4" /> Users
              </Button>
            </>
          ) : (
            <>
              <Button className="w-full justify-start" variant="ghost" onClick={() => navigate('/user')}>
                <Calendar className="mr-2 h-4 w-4" /> Events
              </Button>
              <Button className="w-full justify-start" variant="ghost" onClick={() => navigate('/user')}>
                <Ticket className="mr-2 h-4 w-4" /> My Tickets
              </Button>
            </>
          )}
        </nav>

        <div className="mt-auto">
          <Button className="w-full justify-start" variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Menu</h3>
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {/* Render the same nav buttons as sidebar */}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 p-6">
        <Button className="lg:hidden mb-4" variant="outline" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="h-4 w-4 mr-2" /> Menu
        </Button>

        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

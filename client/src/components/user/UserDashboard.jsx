import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaSearch, FaFilter } from 'react-icons/fa';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';
import EventCard from './EventCard';
import EventDetail from './EventDetail';

function UserDashboard() {
  const {
    currentUser: user,
    bookings: allBookings,
    events,
    addBooking,
    loadDataFromAPI,
    generateTickets
  } = useApp();

  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('events'); // 'events' or 'bookings'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedBookingItems, setSelectedBookingItems] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadDataFromAPI();
    }
  }, [user]);

  // Filter bookings for current user - handle both string and numeric IDs
  const userBookings = useMemo(() => {
    if (!user || !allBookings.length) return [];
    
    const currentUserId = String(user.id || user.user_id);
    const filtered = allBookings.filter(b => {
      const bookingUserId = String(b.userId || b.user_id);
      return bookingUserId === currentUserId;
    });
    
    // Debug log (remove in production)
    if (filtered.length === 0 && allBookings.length > 0) {
      console.log('No bookings matched:', {
        currentUserId,
        allBookings: allBookings.map(b => ({
          id: b.id,
          userId: b.userId,
          user_id: b.user_id
        }))
      });
    }
    
    return filtered;
  }, [allBookings, user]);

  // Filter events based on search and category
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === 'all' || event.category?.toLowerCase() === categoryFilter.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(events.map(e => e.category).filter(Boolean))];

  const handleViewEventDetails = (event) => {
    setSelectedEvent(event);
  };

  const handleBackToEvents = () => {
    setSelectedEvent(null);
  };

  const handleBooking = (items) => {
    if (!selectedEvent) {
      toast.error('Event not found');
      return;
    }
    
    // Navigate to booking flow page with event and items
    navigate('/booking', { 
      state: { 
        event: selectedEvent, 
        items: items || []
      } 
    });
  };

  const handleBookingComplete = () => {
    setSelectedEvent(null);
    setSelectedBookingItems(null);
    setViewMode('bookings');
    loadDataFromAPI();
  };

  // If event detail is selected, show EventDetail component
  if (selectedEvent) {
    return (
      <EventDetail 
        event={selectedEvent}
        onBack={handleBackToEvents}
        onBooking={handleBooking}
      />
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Please log in to view your dashboard</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 bg-blue-900 rounded-xl flex items-center justify-center">
            <FaTicketAlt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-blue-600 bg-clip-text text-transparent">
              Welcome, {user.name}
            </h2>
            <p className="text-gray-600 text-sm">Browse and book your favorite events</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setViewMode('events')}
          className={`px-6 py-3 font-semibold transition-colors ${
            viewMode === 'events'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Available Events
        </button>
        <button
          onClick={() => setViewMode('bookings')}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            viewMode === 'bookings'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Bookings
          {userBookings.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
              {userBookings.length}
            </span>
          )}
        </button>
      </div>

      {/* Events View */}
      {viewMode === 'events' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events by name, venue, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Available Events</h3>
              <span className="text-sm text-gray-500">({filteredEvents.length} events)</span>
            </div>
            
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <FaCalendarAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                  {searchTerm || categoryFilter !== 'all' 
                    ? 'No events match your search criteria.' 
                    : 'No events available at the moment.'}
                </p>
                {(searchTerm || categoryFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('all');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onViewDetails={handleViewEventDetails}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bookings View */}
      {viewMode === 'bookings' && (
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <FaTicketAlt className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Your Bookings</h3>
              <span className="text-sm text-gray-500">({userBookings.length} bookings)</span>
            </div>

            {userBookings.length === 0 ? (
              <div className="text-center py-12">
                <FaTicketAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No bookings yet.</p>
                <p className="text-gray-400 text-sm mb-4">Start booking events to see them here!</p>
                <button
                  onClick={() => setViewMode('events')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                >
                  <FaCalendarAlt className="w-4 h-4" />
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <FaTicketAlt className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800 block">{booking.eventTitle}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(booking.eventDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          <FaMoneyBillWave className="inline w-4 h-4 mr-1 text-green-600" />
                          ${booking.totalAmount?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {booking.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                      <FaMapMarkerAlt className="w-4 h-4" />
                      <span className="line-clamp-1">{booking.eventVenue || 'Venue TBA'}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-medium">
                        {booking.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} ticket(s)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;

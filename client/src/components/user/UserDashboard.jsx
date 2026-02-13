import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave } from 'react-icons/fa';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';

function UserDashboard() {
  const {
    currentUser: user,
    bookings: allBookings,
    events,
    addBooking,
    loadDataFromAPI
  } = useApp();

  const [ticketQuantities, setTicketQuantities] = useState({});
  const navigate = useNavigate();

  // Filter bookings for current user
  const userBookings = allBookings.filter(b => b.userId === user?.id);

  const handleQuantityChange = (eventId, categoryId, value, max) => {
    const qty = Math.max(1, Math.min(parseInt(value) || 1, max || 1));
    setTicketQuantities((prev) => ({
      ...prev,
      [`${eventId}-${categoryId}`]: qty
    }));
  };

  const handleBook = async (event, category) => {
    const qtyKey = `${event.id}-${category.id}`;
    const ticketCount = ticketQuantities[qtyKey] || 1;

    try {
      // Create booking item structure expected by AppContext
      const BookingData = {
        userId: user.id,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventVenue: event.venue,
        items: [{
          categoryId: category.id,
          categoryName: category.name,
          quantity: ticketCount,
          price: category.price
        }],
        totalAmount: category.price * ticketCount,
        status: 'confirmed',
        paymentMethod: 'Credit Card',
      };

      await addBooking(BookingData);

      // Reload events to get updated availability
      await loadDataFromAPI();

      toast.success('Booking successful!');
      setTicketQuantities((prev) => ({ ...prev, [qtyKey]: 1 }));

    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Booking failed');
      console.error(err);
    }
  };

  const EventCard = ({ event }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h4>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <FaCalendarAlt className="text-blue-500" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
              {event.venue && (
                <div className="flex items-center gap-1">
                  <FaMapMarkerAlt className="text-purple-500" />
                  <span>{event.venue}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {event.ticketCategories?.map(cat => (
            <div key={cat.id} className="border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-gray-800">{cat.name}</span>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ${cat.price?.toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mb-3">
                <span className="text-gray-600">Available: <span className="font-semibold text-gray-800">{cat.availableSeats}</span></span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max={cat.availableSeats}
                  value={ticketQuantities[`${event.id}-${cat.id}`] || 1}
                  onChange={(e) => handleQuantityChange(event.id, cat.id, e.target.value, cat.availableSeats)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={cat.availableSeats === 0}
                />
                <button
                  onClick={() => handleBook(event, cat)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-shadow"
                  disabled={cat.availableSeats === 0}
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const BookingCard = ({ booking }) => (
    <div className="p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
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
    </div>
  );

  if (!user) return <div>Please log in</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <FaTicketAlt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome, {user.name}
            </h2>
            <p className="text-gray-600 text-sm">Browse and book your favorite events</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Available Events Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <FaCalendarAlt className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Available Events</h3>
          </div>
          {events.length === 0 ? (
            <div className="text-center py-12">
              <FaCalendarAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No events available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          )}
        </div>

        {/* Bookings Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <FaTicketAlt className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Your Bookings</h3>
          </div>
          {userBookings.length === 0 ? (
            <div className="text-center py-12">
              <FaTicketAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No bookings yet.</p>
              <p className="text-gray-400 text-sm">Start booking events to see them here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
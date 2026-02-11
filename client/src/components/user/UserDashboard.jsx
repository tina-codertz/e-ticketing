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
    updateTicketAvailability,
    generateTickets
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
        paymentMethod: 'Credit Card', // Mock
      };

      const newBooking = addBooking(BookingData);

      // Update availability
      updateTicketAvailability(event.id, category.id, -ticketCount);

      // Generate tickets
      generateTickets(newBooking);

      toast.success('Booking successful!');
      setTicketQuantities((prev) => ({ ...prev, [qtyKey]: 1 }));

    } catch (err) {
      toast.error('Booking failed');
      console.error(err);
    }
  };

  const EventCard = ({ event }) => (
    <div className="card bg-white rounded-xl shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xl font-bold text-gray-800">{event.title}</h4>
        <div className="text-sm text-gray-500">
          <FaCalendarAlt className="inline mr-1" />
          {new Date(event.date).toLocaleDateString()}
        </div>
      </div>

      <div className="space-y-4">
        {event.ticketCategories.map(cat => (
          <div key={cat.id} className="border-t pt-2">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{cat.name}</span>
              <span className="text-green-600 font-bold">TZS {cat.price}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
              <span>Available: {cat.availableSeats}</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={cat.availableSeats}
                value={ticketQuantities[`${event.id}-${cat.id}`] || 1}
                onChange={(e) => handleQuantityChange(event.id, cat.id, e.target.value, cat.availableSeats)}
                className="w-20 px-2 py-1 border rounded"
                disabled={cat.availableSeats === 0}
              />
              <button
                onClick={() => handleBook(event, cat)}
                className="flex-1 bg-blue-500 text-white py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={cat.availableSeats === 0}
              >
                Book
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const BookingCard = ({ booking }) => (
    <div className="p-4 border-b last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FaTicketAlt className="w-5 h-5 text-blue-500" />
          <span className="font-semibold text-gray-800">{booking.eventTitle}</span>
        </div>
        <div className="text-green-500 font-semibold">
          <FaMoneyBillWave className="inline w-4 h-4 mr-1" />
          TZS {booking.totalAmount}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
        <span>Status: {booking.status}</span>
        <span>Booked on: {new Date(booking.bookingDate).toLocaleString()}</span>
      </div>
    </div>
  );

  if (!user) return <div>Please log in</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-2">
          <h2 className="text-3xl font-bold text-gray-800">Welcome, {user.name}</h2>
          <FaTicketAlt className="w-6 h-6 text-gray-800" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Available Events</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.length === 0 ? (
              <p>No events available.</p>
            ) : (
              events.map((event) => <EventCard key={event.id} event={event} />)
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Bookings</h3>
          {userBookings.length === 0 ? (
            <p>No bookings yet.</p>
          ) : (
            <ul className="space-y-2">
              {userBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
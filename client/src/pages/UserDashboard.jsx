import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave } from 'react-icons/fa';

const API_URL = 'http://localhost:3000/api';

function UserDashboard({ user, setUser }) {
  const [tickets, setTickets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [ticketQuantities, setTicketQuantities] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    // Fetch tickets and bookings concurrently
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ticketsRes, bookingsRes] = await Promise.all([
          axios.get(`${API_URL}/tickets`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(`${API_URL}/user/bookings`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);
        setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
        setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
        setError('');
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          setUser(null);
          navigate('/login');
        } else {
          setError('Failed to load data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Real-time ticket updates
    socket.on('ticketUpdate', (updatedTicket) => {
      setTickets((prev) =>
        prev.map((t) => (t.event_id === updatedTicket.event_id ? updatedTicket : t))
      );
    });

    // Handle socket connection errors
    socket.on('connect_error', () => {
      setError('Failed to connect to real-time updates');
    });

    return () => {
      socket.off('ticketUpdate');
      socket.off('connect_error');
      socket.disconnect();
    };
  }, [navigate, setUser]);

  const handleQuantityChange = (eventId, value) => {
    const qty = Math.max(1, Math.min(parseInt(value) || 1, tickets.find((t) => t.event_id === eventId)?.available_tickets || 1));
    setTicketQuantities((prev) => ({ ...prev, [eventId]: qty }));
  };

  const handleBook = async (eventId) => {
    const ticketCount = ticketQuantities[eventId] || 1;
    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/book`,
        { event_id: eventId, ticket_count: ticketCount },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const res = await axios.get(`${API_URL}/user/bookings`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setBookings(Array.isArray(res.data) ? res.data : []);
      setError('');
      setTicketQuantities((prev) => ({ ...prev, [eventId]: 1 }));
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Booking failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const TicketCard = ({ ticket }) => (
    <div className="card bg-white rounded-xl shadow-md6 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FaTicketAlt className="w-5 h-5 text-blue-500" />
          <h4 className="text-xl font-bold text-gray-800">{ticket.name}</h4>
        </div>
        <div className="text-green-500">
          <FaMoneyBillWave className="inline w-4 h-4 mr-1" />
          TZS {ticket.price}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <FaCalendarAlt className="w-4 h-4 text-yellow-500" />
          <span>{new Date(ticket.date).toLocaleString()}</span>
        </div>
        <div className="flex items-center space-x-2">
          <FaMapMarkerAlt className="w-4 h-4 text-red-500" />
          <span>{ticket.location}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Available:</span>
          <span
            className={`px-2 py-1 rounded-full text-sm ${
              ticket.available_tickets > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {ticket.available_tickets}
          </span>
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor={`qty-${ticket.event_id}`} className="sr-only">
          Quantity
        </label>
        <input
          type="number"
          id={`qty-${ticket.event_id}`}
          min="1"
          max={ticket.available_tickets}
          value={ticketQuantities[ticket.event_id] || 1}
          onChange={(e) => handleQuantityChange(ticket.event_id, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          aria-label="Select ticket quantity"
          disabled={ticket.available_tickets === 0}
        />
      </div>
      <button
        onClick={() => handleBook(ticket.event_id)}
        className="w-full bg-blue-500 text-white rounded-lg py-2 mt-4 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={ticket.available_tickets === 0 || loading}
        aria-label={`Book ${ticket.name} tickets`}
      >
        <FaTicketAlt className="inline w-5 h-5 mr-2" />
        Book Now
      </button>
    </div>
  );

  const BookingCard = ({ booking }) => (
    <div className="p-4 border-b last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FaTicketAlt className="w-5 h-5 text-blue-500" />
          <span className="font-semibold text-gray-800">{booking.event_name}</span>
        </div>
        <div className="text-green-500 font-semibold">
          <FaMoneyBillWave className="inline w-4 h-4 mr-1" />
          TZS {booking.price}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
        <span>Tickets: {booking.ticket_count}</span>
        <span>Booked on: {new Date(booking.booking_time).toLocaleString()}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="absolute top-4 left-4">
        <Link to="/" className="flex items-center text-white hover:text-blue-200">
          <FaHome className="w-5 h-5 mr-2" />
          Back to Home
        </Link>
      </div>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <h2 className="text-3xl font-bold text-white">Welcome, {user.name}</h2>
            <FaTicketAlt className="w-6 h-6 text-white" />
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              setUser(null);
              navigate('/login');
            }}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading ? (
          <p className="text-white">Loading...</p>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Available Tickets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tickets.length === 0 ? (
                  <p>No tickets available.</p>
                ) : (
                  tickets.map((ticket) => <TicketCard key={ticket.event_id} ticket={ticket} />)
                )}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Bookings</h3>
              {bookings.length === 0 ? (
                <p>No bookings yet.</p>
              ) : (
                <ul className="space-y-2">
                  {bookings.map((booking) => (
                    <BookingCard key={booking.booking_id} booking={booking} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
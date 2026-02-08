import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Eye, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const BookingManagement = () => {
  const { bookings, users, cancelBooking } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCancelBooking = id => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBooking(id);
      toast.success('Booking cancelled successfully');
      setSelectedBooking(null);
    }
  };

  const getUser = id => users.find(u => u.id === id);

  const statusStyles = {
    confirmed: 'bg-green-100 text-green-700',
    paid: 'bg-blue-100 text-blue-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Booking Management</h1>
        <p className="text-gray-500">View and manage all bookings</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="Search by booking ID, event, or transaction..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full md:w-48"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Booking ID</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Event</th>
                <th className="px-4 py-2 text-left">Tickets</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-8 text-gray-500"
                  >
                    No bookings found
                  </td>
                </tr>
              ) : (
                filteredBookings.map(booking => {
                  const user = getUser(booking.userId);
                  const tickets = booking.items.reduce(
                    (s, i) => s + i.quantity,
                    0
                  );

                  return (
                    <tr key={booking.id} className="border-t">
                      <td className="px-4 py-2 font-mono text-xs">
                        {booking.id.slice(-8)}
                      </td>

                      <td className="px-4 py-2">
                        <p className="font-medium">{user?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">
                          {user?.email || 'N/A'}
                        </p>
                      </td>

                      <td className="px-4 py-2">
                        <p className="font-medium">{booking.eventTitle}</p>
                        <p className="text-xs text-gray-500">
                          {format(booking.eventDate, 'MMM d, yyyy')}
                        </p>
                      </td>

                      <td className="px-4 py-2">{tickets}</td>

                      <td className="px-4 py-2 font-medium">
                        ${booking.totalAmount.toFixed(2)}
                      </td>

                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[booking.status]}`}
                        >
                          {booking.status}
                        </span>
                      </td>

                      <td className="px-4 py-2">
                        {format(booking.bookingDate, 'MMM d, yyyy')}
                      </td>

                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="p-2 rounded hover:bg-gray-100"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-gray-500 mt-2">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </p>
      </div>

      {/* Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Booking Details</h2>
              <button onClick={() => setSelectedBooking(null)}>
                <X />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Booking</p>
                <p>ID: {selectedBooking.id}</p>
                <p>Status: {selectedBooking.status}</p>
                <p>
                  Date:{' '}
                  {format(
                    selectedBooking.bookingDate,
                    'MMM d, yyyy HH:mm'
                  )}
                </p>
              </div>

              <div>
                <p className="text-gray-500 mb-1">Customer</p>
                <p>{getUser(selectedBooking.userId)?.name}</p>
                <p>{getUser(selectedBooking.userId)?.email}</p>
              </div>
            </div>

            <div>
              <p className="text-gray-500 mb-2">Tickets</p>
              <div className="space-y-2">
                {selectedBooking.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between border rounded p-3"
                  >
                    <div>
                      <p className="font-medium">{item.categoryName}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-green-600">
                ${selectedBooking.totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-end gap-2">
              {selectedBooking.status !== 'cancelled' && (
                <button
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Cancel Booking
                </button>
              )}
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

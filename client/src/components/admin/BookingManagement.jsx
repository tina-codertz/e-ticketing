// BookingManagement.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Eye, X, Filter, Download, MoreVertical, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function BookingManagement() {
  const { bookings, users, cancelBooking, updateBookingStatus, loadDataFromAPI } = useApp();

  // Load data on mount
  useEffect(() => {
    loadDataFromAPI();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredBookings = useMemo(() => 
    bookings.filter(booking => {
      const matchesSearch =
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.eventTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        users.find(u => u.id === booking.userId)?.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

      const bookingDate = new Date(booking.bookingDate);
      const matchesDateRange = 
        (!dateRange.start || bookingDate >= new Date(dateRange.start)) &&
        (!dateRange.end || bookingDate <= new Date(dateRange.end));

      return matchesSearch && matchesStatus && matchesDateRange;
    }).sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)),
    [bookings, users, searchTerm, statusFilter, dateRange]
  );

  const getUser = id => users.find(u => u.id === id);

  const statusStyles = {
    confirmed: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    paid: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' }
  };

  const handleCancelBooking = id => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBooking(id);
      toast.success('Booking cancelled successfully');
      setSelectedBooking(null);
    }
  };

  const handleStatusChange = (bookingId, newStatus) => {
    updateBookingStatus(bookingId, newStatus);
    toast.success(`Booking status updated to ${newStatus}`);
  };

  const exportBookings = () => {
    // Export logic here
    toast.success('Bookings exported successfully');
  };

  const getStatusOptions = (currentStatus) => {
    const options = {
      pending: ['paid', 'confirmed', 'cancelled'],
      paid: ['confirmed', 'cancelled'],
      confirmed: ['cancelled'],
      cancelled: []
    };
    return options[currentStatus] || [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Booking Management</h1>
            <p className="text-gray-300">View and manage all bookings</p>
          </div>
          <button
            onClick={exportBookings}
            className="flex items-center gap-2 bg-white text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="w-full border border-gray-300 rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by booking ID, event, customer, or transaction..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3 w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl border flex items-center gap-2 ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'border-gray-300'}`}
            >
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-xl bg-gray-50">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(statusStyles).map(([status, style]) => {
            const count = bookings.filter(b => b.status === status).length;
            const revenue = bookings
              .filter(b => b.status === status)
              .reduce((sum, b) => sum + b.totalAmount, 0);

            return (
              <div
                key={status}
                className={`border rounded-xl p-4 ${style.bg} ${style.border}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{status}</p>
                    <p className={`text-2xl font-bold ${style.text}`}>{count}</p>
                  </div>
                  {revenue > 0 && (
                    <p className="text-sm font-semibold text-gray-700">
                      ${revenue.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tickets & Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="flex flex-col items-center">
                      <Search className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500">No bookings found</p>
                      {searchTerm && (
                        <p className="text-sm text-gray-400 mt-1">
                          Try adjusting your search or filters
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map(booking => {
                  const user = getUser(booking.userId);
                  const tickets = booking.items.reduce((s, i) => s + i.quantity, 0);
                  const status = statusStyles[booking.status];

                  return (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-mono text-sm font-semibold text-gray-900">
                            {String(booking.id).slice(-8)}
                          </p>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {booking.eventTitle}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {booking.eventDate ? (() => {
                              try {
                                const date = new Date(booking.eventDate);
                                return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM d, yyyy');
                              } catch {
                                return 'N/A';
                              }
                            })() : 'N/A'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {booking.bookingDate ? (() => {
                              try {
                                const date = new Date(booking.bookingDate);
                                return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM d, yyyy h:mm a');
                              } catch {
                                return 'N/A';
                              }
                            })() : 'N/A'}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{user?.name || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">{user?.email || 'N/A'}</p>
                          <p className="text-xs text-gray-400">{user?.phone || 'No phone'}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{tickets} tickets</span>
                          </div>
                          <p className="text-lg font-bold text-gray-900">
                            ${booking.totalAmount.toFixed(2)}
                          </p>
                          {booking.transactionId && (
                            <p className="text-xs font-mono text-gray-500">
                              TXN: {booking.transactionId.slice(-12)}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text} ${status.border}`}
                          >
                            {booking.status}
                          </span>
                          {getStatusOptions(booking.status).length > 0 && (
                            <div className="relative group">
                              <button className="text-xs text-gray-500 hover:text-gray-700">
                                Update status →
                              </button>
                              <div className="absolute left-0 mt-1 w-32 bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                {getStatusOptions(booking.status).map(option => (
                                  <button
                                    key={option}
                                    onClick={() => handleStatusChange(booking.id, option)}
                                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                  >
                                    Mark as {option}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4 text-gray-600" />
                          </button>
                          {booking.status !== 'cancelled' && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Cancel booking"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-between items-center text-sm">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredBookings.length}</span> of{' '}
            <span className="font-semibold">{bookings.length}</span> bookings
          </p>
          <div className="text-gray-600">
            Total revenue: <span className="font-bold text-green-600">
              ${filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
                <p className="text-sm text-gray-500">ID: {selectedBooking.id}</p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">CUSTOMER INFORMATION</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold">{getUser(selectedBooking.userId)?.name}</p>
                    <p className="text-sm text-gray-600">{getUser(selectedBooking.userId)?.email}</p>
                    <p className="text-sm text-gray-600">{getUser(selectedBooking.userId)?.phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">BOOKING INFORMATION</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Date</span>
                      <span className="font-medium">
                        {selectedBooking.bookingDate ? (() => {
                          try {
                            const date = new Date(selectedBooking.bookingDate);
                            return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM d, yyyy h:mm a');
                          } catch {
                            return 'N/A';
                          }
                        })() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Event Date</span>
                      <span className="font-medium">
                        {selectedBooking.eventDate ? (() => {
                          try {
                            const date = new Date(selectedBooking.eventDate);
                            return isNaN(date.getTime()) ? 'N/A' : format(date, 'MMM d, yyyy');
                          } catch {
                            return 'N/A';
                          }
                        })() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID</span>
                      <span className="font-mono text-sm">
                        {selectedBooking.transactionId || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">TICKET DETAILS</h3>
                  <div className="space-y-3">
                    {selectedBooking.items.map((item, i) => (
                      <div key={i} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.categoryName}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${selectedBooking.totalAmount.toFixed(2)}
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg font-medium ${statusStyles[selectedBooking.status].bg} ${statusStyles[selectedBooking.status].text}`}>
                      {selectedBooking.status.toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              {selectedBooking.status !== 'cancelled' && (
                <button
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Cancel Booking
                </button>
              )}
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
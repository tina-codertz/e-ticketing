import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar,
  MapPin,
  Download,
  Ticket as TicketIcon,
  Receipt,
  X
} from 'lucide-react';
import { format } from 'date-fns';

const MyTickets = () => {
  const { currentUser, getUserTickets, getUserBookings, cancelBooking } = useApp();

  const [activeTab, setActiveTab] = useState('tickets');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const tickets = getUserTickets(currentUser.id);
  const bookings = getUserBookings(currentUser.id);

  const handleDownloadTicket = ticket => {
    alert(`Downloading ticket ${ticket.id}`);
  };

  const handleCancelBooking = bookingId => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBooking(bookingId);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">My Bookings</h1>
        <p className="text-gray-600">View and manage your tickets</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex max-w-md rounded-lg border bg-gray-50 p-1">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${
            activeTab === 'tickets'
              ? 'bg-white shadow'
              : 'text-gray-600'
          }`}
        >
          <TicketIcon className="h-4 w-4" />
          My Tickets
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium ${
            activeTab === 'bookings'
              ? 'bg-white shadow'
              : 'text-gray-600'
          }`}
        >
          <Receipt className="h-4 w-4" />
          Booking History
        </button>
      </div>

      {/* Tickets Tab */}
      {activeTab === 'tickets' && (
        <>
          {tickets.length === 0 ? (
            <div className="rounded-xl border bg-white py-12 text-center">
              <TicketIcon className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-lg font-semibold">No Tickets Yet</h3>
              <p className="text-gray-600">Book an event to get started</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="cursor-pointer rounded-xl border bg-white p-4 hover:shadow-lg"
                >
                  <div className="mb-3 flex justify-between">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        ticket.status === 'valid'
                          ? 'bg-green-100 text-green-700'
                          : ticket.status === 'used'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {ticket.status}
                    </span>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDownloadTicket(ticket);
                      }}
                    >
                      <Download className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>

                  <h3 className="mb-1 font-semibold line-clamp-1">
                    {ticket.eventTitle}
                  </h3>
                  <p className="mb-3 text-sm text-gray-600">
                    {ticket.categoryName}
                  </p>

                  <div className="space-y-1 text-sm text-gray-700">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-3 w-3" />
                      {format(ticket.eventDate, 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-3 w-3" />
                      <span className="line-clamp-1">
                        {ticket.eventVenue}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between text-xs text-gray-500">
                    <span>Ticket ID</span>
                    <span className="font-mono">
                      {ticket.id.slice(-8)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <>
          {bookings.length === 0 ? (
            <div className="rounded-xl border bg-white py-12 text-center">
              <Receipt className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="mb-2 text-lg font-semibold">
                No Bookings Yet
              </h3>
              <p className="text-gray-600">
                Your booking history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map(booking => (
                <div
                  key={booking.id}
                  className="rounded-xl border bg-white p-6"
                >
                  <div className="mb-4 flex justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {booking.eventTitle}
                      </h3>
                      <p className="text-sm text-gray-600 font-mono">
                        {booking.id}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        ${booking.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(booking.bookingDate, 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      View Details
                    </button>

                    {booking.status !== 'cancelled' && (
                      <button
                        onClick={() =>
                          handleCancelBooking(booking.id)
                        }
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-md rounded-xl bg-white p-6">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute right-4 top-4"
            >
              <X />
            </button>

            <h2 className="mb-4 text-xl font-bold">E-Ticket</h2>

            <div className="mb-4 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-4 text-white">
              <h3 className="font-semibold">
                {selectedTicket.eventTitle}
              </h3>
              <p className="text-sm">{selectedTicket.categoryName}</p>
            </div>

            <div className="flex justify-center">
              <QRCodeSVG value={selectedTicket.qrCode} size={200} />
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-lg rounded-xl bg-white p-6">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute right-4 top-4"
            >
              <X />
            </button>

            <h2 className="mb-4 text-xl font-bold">
              Booking Details
            </h2>

            <p className="font-semibold">
              {selectedBooking.eventTitle}
            </p>
            <p className="text-sm text-gray-600">
              {format(
                selectedBooking.eventDate,
                'EEEE, MMMM d, yyyy'
              )}
            </p>

            <div className="mt-4 space-y-2">
              {selectedBooking.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {item.quantity}× {item.categoryName}
                  </span>
                  <span>
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between font-bold">
              <span>Total Paid</span>
              <span className="text-green-600">
                ${selectedBooking.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MyTickets;
import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  ArrowLeft,
  ShoppingCart,
  Minus,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';

const EventDetail = ({ event, onBack, onBooking }) => {
  const [selectedTickets, setSelectedTickets] = useState({});

  const handleQuantityChange = (categoryId, change) => {
    const category = event.ticketCategories.find(c => c.id === categoryId);
    if (!category) return;

    const current = selectedTickets[categoryId] || 0;
    const next = Math.max(
      0,
      Math.min(current + change, category.availableSeats)
    );

    setSelectedTickets(prev => ({
      ...prev,
      [categoryId]: next
    }));
  };

  const totalTickets = Object.values(selectedTickets).reduce(
    (sum, qty) => sum + qty,
    0
  );

  const totalAmount = Object.entries(selectedTickets).reduce(
    (sum, [categoryId, qty]) => {
      const category = event.ticketCategories.find(c => c.id === categoryId);
      return sum + (category ? category.price * qty : 0);
    },
    0
  );

  const handleProceed = () => {
    const items = Object.entries(selectedTickets)
      .filter(([_, qty]) => qty > 0)
      .map(([categoryId, qty]) => {
        const category = event.ticketCategories.find(c => c.id === categoryId);
        return {
          categoryId,
          categoryName: category.name,
          quantity: qty,
          price: category.price
        };
      });

    if (items.length) {
      onBooking(items);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Back */}
      <button
        onClick={onBack}
        className="mb-4 flex items-center text-sm font-medium text-gray-600 hover:text-blue-600"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Events
      </button>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Event Info */}
        <div>
          <img
            src={event.imageUrl}
            alt={event.title}
            className="mb-4 aspect-video w-full rounded-lg object-cover shadow"
          />

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-start justify-between">
                <h1 className="text-3xl font-bold">{event.title}</h1>
                {event.featured && (
                  <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-white">
                    Featured
                  </span>
                )}
              </div>

              <span className="inline-block rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                {event.category}
              </span>
            </div>

            <p className="text-gray-700">{event.description}</p>

            <div className="space-y-3">
              <div className="flex items-center text-gray-700">
                <Calendar className="mr-3 h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-sm">
                    {format(event.date, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <Clock className="mr-3 h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Time</p>
                  <p className="text-sm">{event.time}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <MapPin className="mr-3 h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Venue</p>
                  <p className="text-sm">{event.venue}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Selection */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Select Tickets</h2>

          <div className="space-y-4">
            {event.ticketCategories.map(category => (
              <div
                key={category.id}
                className="rounded-lg border p-4"
              >
                <div className="mb-2 flex justify-between">
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-gray-600">
                      {category.description}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {category.availableSeats} seats available
                    </p>
                  </div>

                  <p className="text-lg font-bold text-blue-600">
                    ${category.price.toFixed(2)}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(category.id, -1)
                      }
                      disabled={(selectedTickets[category.id] || 0) === 0}
                      className="rounded-md border p-2 disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>

                    <span className="w-10 text-center font-medium">
                      {selectedTickets[category.id] || 0}
                    </span>

                    <button
                      onClick={() =>
                        handleQuantityChange(category.id, 1)
                      }
                      disabled={
                        (selectedTickets[category.id] || 0) >=
                        category.availableSeats
                      }
                      className="rounded-md border p-2 disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="text-sm font-medium">
                    $
                    {(
                      (selectedTickets[category.id] || 0) *
                      category.price
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}

            <div className="border-t pt-4">
              <div className="mb-2 flex justify-between text-sm">
                <span>Total Tickets</span>
                <span className="font-medium">{totalTickets}</span>
              </div>

              <div className="mb-4 flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-blue-600">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleProceed}
                disabled={totalTickets === 0}
                className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Proceed to Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 export default EventDetail;
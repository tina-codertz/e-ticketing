import React from 'react';
import { Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import { format } from 'date-fns';

const EventCard = ({ event, onViewDetails }) => {
  const totalAvailable = event.ticketCategories.reduce(
    (sum, cat) => sum + cat.availableSeats,
    0
  );

  const minPrice = Math.min(...event.ticketCategories.map(cat => cat.price));

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold line-clamp-1">{event.title}</h3>
            <span className="mt-1 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
              {event.category}
            </span>
          </div>

          {event.featured && (
            <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-semibold text-white">
              Featured
            </span>
          )}
        </div>

        <p className="mb-3 text-sm text-gray-600 line-clamp-2">{event.description}</p>

        <div className="space-y-1.5 text-sm text-gray-700">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-gray-500" />
            {format(new Date(event.date), 'EEEE, MMMM d, yyyy')}
          </div>

          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-gray-500" />
            {event.time}
          </div>

          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 text-gray-500" />
            {event.venue}
          </div>

          <div className="flex items-center">
            <Ticket className="mr-2 h-4 w-4 text-gray-500" />
            {totalAvailable} tickets available
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 pt-0">
        <div>
          <p className="text-xs text-gray-500">Starting from</p>
          <p className="text-xl font-bold text-blue-600">${minPrice.toFixed(2)}</p>
        </div>

        <button
          onClick={() => onViewDetails(event)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default EventCard;

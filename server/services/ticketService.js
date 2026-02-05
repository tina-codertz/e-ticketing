const pool = require('../database/db');
const EventModel = require('../models/eventModel');
const BookingModel = require('../models/bookingModel');
const LogModel = require('../models/logModel');

const TicketService = {
  getAvailableTickets: async () => {
    return await EventModel.getAvailableTickets();
  },

  bookTickets: async (userId, eventId, ticketCount, io) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const event = await EventModel.findEventById(eventId);
      if (!event) throw new Error('Event not found');
      if (event.available_tickets < ticketCount) throw new Error('Not enough tickets available');

      await EventModel.updateAvailableTickets(client, eventId, ticketCount);
      await BookingModel.createBooking(client, userId, eventId, ticketCount);
      await client.query('COMMIT');

      const updatedEvent = await EventModel.findEventById(eventId);
      io.emit('ticketUpdate', updatedEvent);
      await LogModel.createLog(userId, `Booked ${ticketCount} tickets for event ${eventId}`);
      return { message: 'Booking successful' };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  getUserBookings: async (userId) => {
    return await BookingModel.getUserBookings(userId);
  }
};

module.exports = TicketService;
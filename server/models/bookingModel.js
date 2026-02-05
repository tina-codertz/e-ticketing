const pool = require('../database/db');

const BookingModel = {
  createBooking: async (client, userId, eventId, ticketCount) => {
    await client.query(
      'INSERT INTO bookings (user_id, event_id, ticket_count, booking_time, status) VALUES ($1, $2, $3, NOW(), $4)',
      [userId, eventId, ticketCount, 'confirmed']
    );
  },

  getUserBookings: async (userId) => {
    const result = await pool.query(
      'SELECT b.booking_id, b.ticket_count, b.booking_time, e.name as event_name FROM bookings b JOIN events e ON b.event_id = e.event_id WHERE b.user_id = $1',
      [userId]
    );
    return result.rows;
  }
};

module.exports = BookingModel;
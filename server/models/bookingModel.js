
import pool from '../database/db.js';

export const BookingModel = {
  createBooking: async (client, userId, eventId, ticketCount) => {
    await client.query(
      'INSERT INTO bookings (user_id, event_id, ticket_count, booking_time, status) VALUES ($1, $2, $3, NOW(), $4)',
      [userId, eventId, ticketCount, 'confirmed']
    );
  },

  getUserBookings: async (userId) => {
    const result = await pool.query(
      `SELECT 
        b.booking_id, 
        b.user_id,
        b.event_id,
        b.ticket_count, 
        b.booking_time,
        b.status,
        e.name as event_name,
        e.date as event_date,
        e.location as event_location,
        e.price
      FROM bookings b 
      JOIN events e ON b.event_id = e.event_id 
      WHERE b.user_id = $1
      ORDER BY b.booking_time DESC`,
      [userId]
    );
    return result.rows;
  }
};


const pool = require('../database/db');

const EventModel = {
  getAvailableTickets: async () => {
    const result = await pool.query('SELECT * FROM events WHERE available_tickets > 0');
    return result.rows;
  },

  getAllEvents: async () => {
    const result = await pool.query('SELECT * FROM events');
    return result.rows;
  },

  createEvent: async (name, date, location, totalTickets, price) => {
    const result = await pool.query(
      'INSERT INTO events (name, date, location, total_tickets, available_tickets, price) VALUES ($1, $2, $3, $4, $4, $5) RETURNING *',
      [name, date, location, totalTickets, price]
    );
    return result.rows[0];
  },

  findEventById: async (eventId) => {
    const result = await pool.query('SELECT * FROM events WHERE event_id = $1', [eventId]);
    return result.rows[0];
  },

  deleteEvent: async (eventId) => {
    // Check if there are any bookings for this event
    const bookingsCheck = await pool.query(
      'SELECT COUNT(*) FROM bookings WHERE event_id = $1',
      [eventId]
    );
    
    if (parseInt(bookingsCheck.rows[0].count) > 0) {
      throw new Error('Cannot delete event with existing bookings. Please cancel all bookings first.');
    }
    
    // Delete the event
    const result = await pool.query('DELETE FROM events WHERE event_id = $1 RETURNING *', [eventId]);
    
    if (result.rows.length === 0) {
      throw new Error(`Event with ID ${eventId} not found`);
    }
    
    return result.rows[0];
  },

  updateAvailableTickets: async (client, eventId, ticketCount) => {
    await client.query(
      'UPDATE events SET available_tickets = available_tickets - $1 WHERE event_id = $2',
      [ticketCount, eventId]
    );
  }
};

module.exports = EventModel;
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
    await pool.query('DELETE FROM events WHERE event_id = $1', [eventId]);
  },

  updateAvailableTickets: async (client, eventId, ticketCount) => {
    await client.query(
      'UPDATE events SET available_tickets = available_tickets - $1 WHERE event_id = $2',
      [ticketCount, eventId]
    );
  }
};

module.exports = EventModel;
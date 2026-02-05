const TicketService = require('../services/ticketService');

const TicketController = {
  getAvailableTickets: async (req, res) => {
    try {
      const tickets = await TicketService.getAvailableTickets();
      res.json(tickets);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  bookTickets: async (req, res) => {
    try {
      const { event_id, ticket_count } = req.body;
      const result = await TicketService.bookTickets(req.user.user_id, event_id, ticket_count, req.app.get('io'));
      res.json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  getUserBookings: async (req, res) => {
    try {
      const bookings = await TicketService.getUserBookings(req.user.user_id);
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = TicketController;
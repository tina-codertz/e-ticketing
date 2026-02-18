import TicketService from '../services/ticketService.js';
import { validatePositiveNumber, validateRequired } from '../utils/validation.js';

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
      
      // Validate inputs
      if (!validateRequired(event_id)) {
        return res.status(400).json({ message: 'Event ID is required' });
      }
      if (!validatePositiveNumber(ticket_count)) {
        return res.status(400).json({ message: 'Ticket count must be a positive number' });
      }
      
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

export default TicketController;
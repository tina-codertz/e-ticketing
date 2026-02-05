const AdminService = require('./../services/adminServices');

const AdminController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await AdminService.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await AdminService.getUserById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getAllTickets: async (req, res) => {
    try {
      const tickets = await AdminService.getAllTickets();
      res.json(tickets);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getTicketById: async (req, res) => {
    try {
      const { id } = req.params;
      const ticket = await AdminService.getTicketById(id);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      res.json(ticket);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getEventById: async (req, res) => {
    try {
      const { id } = req.params;
      const event = await AdminService.getEventById(id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.json(event);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  addEvent: async (req, res) => {
    try {
      const { name, date, location, total_tickets, price } = req.body;
      const result = await AdminService.addEvent(name, date, location, total_tickets, price, req.user.user_id, req.app.get('io'));
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  deleteTicket: async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'Ticket ID is required' });
      }

      const result = await AdminService.deleteTicket(id);
      res.status(200).json(result);
    } catch (err) {
      console.error('Error in deleteTicket controller:', err);
      
      if (err.message.includes('not found')) {
        return res.status(404).json({ message: err.message });
      }
      
      return res.status(500).json({ 
        message: 'Failed to delete ticket', 
        error: err.message 
      });
    }
  },

  getAllLogs: async (req, res) => {
    try {
      const logs = await AdminService.getAllLogs();
      res.json(logs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = AdminController;
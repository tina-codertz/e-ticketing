const EventModel = require('../models/eventModel');
const UserModel = require('../models/userModels');
const LogModel = require('../models/logModel');

const AdminService = {
  getAllUsers: async () => {
    return await UserModel.getAllUsers();
  },

  getUserById: async (id) => {
    return await UserModel.findUserById(id);
  },

  getAllTickets: async () => {
    return await EventModel.getAllEvents();
  },

  getTicketById: async (id) => {
    return await EventModel.findEventById(id);
  },

  getEventById: async (id) => {
    return await EventModel.findEventById(id);
  },

  addEvent: async (name, date, location, totalTickets, price, userId, io) => {
    const event = await EventModel.createEvent(name, date, location, totalTickets, price);
    io.emit('ticketUpdate', event);
    await LogModel.createLog(userId, `Added event ${name}`);
    return { message: 'Event added' };
  },

  deleteTicket: async (id) => {
    try {
      // First check if the ticket exists
      const ticket = await EventModel.findEventById(id);
      if (!ticket) {
        throw new Error(`Ticket with ID ${id} not found`);
      }

      // Delete the ticket
      await EventModel.deleteEvent(id);
      return { message: 'Ticket deleted successfully', data: ticket };
    } catch (err) {
      console.error('Error deleting ticket:', err);
      throw new Error(`Failed to delete ticket: ${err.message}`);
    }
  },

  getAllLogs: async () => {
    return await LogModel.getAllLogs();
  }
};

module.exports = AdminService;
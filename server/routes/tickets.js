const express = require('express');
const TicketController = require('../controllers/ticketControllers');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/tickets', authenticateToken, TicketController.getAvailableTickets);
router.post('/book', authenticateToken, TicketController.bookTickets);
router.get('/user/bookings', authenticateToken, TicketController.getUserBookings);

module.exports = router;
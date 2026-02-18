import express from 'express';
import TicketController from '../controllers/ticketControllers.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/tickets', authenticateToken, TicketController.getAvailableTickets);
router.post('/book', authenticateToken, TicketController.bookTickets);
router.get('/user/bookings', authenticateToken, TicketController.getUserBookings);

export default router;
const express = require('express');
const AdminController = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/users', authenticateToken, isAdmin, AdminController.getAllUsers);
router.get('/users/:id', authenticateToken, isAdmin, AdminController.getUserById);
router.get('/tickets', authenticateToken, isAdmin, AdminController.getAllTickets);
router.get('/tickets/:id', authenticateToken, isAdmin, AdminController.getTicketById);
router.get('/events/:id', authenticateToken, isAdmin, AdminController.getEventById);
router.post('/tickets', authenticateToken, isAdmin, AdminController.addEvent);
router.delete('/events/:id', authenticateToken, isAdmin, AdminController.deleteTicket);
router.get('/logs', authenticateToken, isAdmin, AdminController.getAllLogs);

module.exports = router;
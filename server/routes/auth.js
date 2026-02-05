const express = require('express');
const AuthController = require('../controllers/authControllers');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/user', authenticateToken, AuthController.getUser);

module.exports = router;
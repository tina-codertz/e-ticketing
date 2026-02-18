import express from 'express';
import AuthController from '../controllers/authControllers.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/user', authenticateToken, AuthController.getUser);

export default router;
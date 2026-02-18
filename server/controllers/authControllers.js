import AuthService from '../services/authServices.js';
import { validateEmail, validatePassword, validateRequired } from '../utils/validation.js';

const AuthController = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      // Validate inputs
      if (!validateRequired(name)) {
        return res.status(400).json({ message: 'Name is required' });
      }
      if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Valid email is required' });
      }
      if (!validatePassword(password)) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      
      const result = await AuthService.register(name, email, password);
      res.json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validate inputs
      if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Valid email is required' });
      }
      // For login, we only need to verify password exists (not strength requirements)
      if (!validateRequired(password)) {
        return res.status(400).json({ message: 'Password is required' });
      }
      
      const result = await AuthService.login(email, password);
      res.json(result);
    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  },

  getUser: async (req, res) => {
    try {
      const user = await AuthService.getUser(req.user.user_id);
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

export default AuthController;
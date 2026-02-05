const AuthService = require('../services/authServices');

const AuthController = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const result = await AuthService.register(name, email, password);
      res.json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
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

module.exports = AuthController;
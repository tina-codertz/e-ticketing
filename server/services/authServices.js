const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModels');
const LogModel = require('../models/logModel');

const AuthService = {
  register: async (name, email, password) => {
    const existingUser = await UserModel.findUserByEmail(email);
    if (existingUser) throw new Error('Email already exists');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.createUser(name, email, passwordHash);
    const token = jwt.sign({ user_id: user.user_id, email: user.email, role: user.role }, process.env.JWT_SECRET);
    await LogModel.createLog(user.user_id, 'User registered');
    return { token, user };
  },

  login: async (email, password) => {
    const user = await UserModel.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ user_id: user.user_id, email: user.email, role: user.role }, process.env.JWT_SECRET);
    await LogModel.createLog(user.user_id, 'User logged in');
    return { token, user };
  },

  getUser: async (userId) => {
    const user = await UserModel.findUserById(userId);
    if (!user) throw new Error('User not found');
    return user;
  }
};

module.exports = AuthService;